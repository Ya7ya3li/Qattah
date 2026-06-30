import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import AddExpense from './pages/AddExpense';
import RoastSummary from './pages/RoastSummary';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { supabase } from './utils/supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]); // ذاكرة الإشعارات
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('qattah_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    fetchExpenses();
    fetchNotifications();

    // 🚀 التزامن اللحظي 1: مراقبة جدول الفواتير
    const expenseSub = supabase
      .channel('live-expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenses();
      })
      .subscribe();

    // 🚀 التزامن اللحظي 2: مراقبة رادار الإشعارات وبثها لايف للجرس
    const notifSub = supabase
      .channel('live-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]); // دفع الإشعار الجديد فوراً لأعلى القائمة
      })
      .subscribe();

    return () => {
      supabase.removeChannel(expenseSub);
      supabase.removeChannel(notifSub);
    };
  }, []);

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    setExpenses(data || []);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    setNotifications(data || []);
  };

  const handleAddExpense = async (newExpense) => {
    const { error } = await supabase.from('expenses').insert([{
      title: newExpense.title,
      payer: newExpense.payer,
      amount: newExpense.amount,
      involved: newExpense.involved,
      user_id: newExpense.userId
    }]);
    if (!error) setActiveTab('home');
  };

  const handleSettleDebt = async (from, to, amount) => {
    await supabase.from('expenses').insert([{
      title: 'سداد دين 🤝',
      payer: from,
      amount: Number(amount),
      involved: [to],
      user_id: currentUser ? currentUser.id : 'system'
    }]);
  };

  // دالة مسح الإشعارات من السيرفر
  const handleClearNotifications = async () => {
    const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // مسح الكل أمنياً
    if (!error) setNotifications([]);
  };

  const handleClearAll = () => {
    alert('تصفير القطة الحين يحتاج تمسحها من قاعدة البيانات في Supabase مباشرة لضمان الأمان.');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('qattah_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('qattah_user');
    setActiveTab('home');
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="min-h-screen bg-qattah-dark font-tajawal relative overflow-hidden">
      {/* مررنا الإشعارات ودالة مسحها للترويسة */}
      <Header 
        totalAmount={totalAmount} 
        onClear={handleClearAll} 
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />
      
      <main className="w-full max-w-lg mx-auto">
        {activeTab === 'home' && <Home expenses={expenses} />}
        {activeTab === 'summary' && <RoastSummary expenses={expenses} onSettle={handleSettleDebt} />}
        {activeTab === 'add' && (
          currentUser ? <AddExpense onAdd={handleAddExpense} currentUser={currentUser} /> : <Login onLogin={handleLogin} />
        )}
        {activeTab === 'profile' && (
          currentUser ? <Profile currentUser={currentUser} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;