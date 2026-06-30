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
  const [notifications, setNotifications] = useState([]); 
  
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setCurrentUser(data);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchNotifications();

    const expenseSub = supabase
      .channel('live-expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenses();
      })
      .subscribe();

    const notifSub = supabase
      .channel('live-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]); 
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

  // 🚀 التحديث الأهم: هنا نرسل كل البيانات الجديدة للسيرفر (التقسيم + STC + IBAN)
  const handleAddExpense = async (newExpense) => {
    const { error } = await supabase.from('expenses').insert([{
      title: newExpense.title,
      payer: newExpense.payer,
      amount: newExpense.amount,
      involved: newExpense.involved,
      user_id: newExpense.userId,
      image_url: newExpense.image_url,
      is_alert: false,
      splits: newExpense.splits,
      stc_pay: newExpense.stc_pay,
      iban: newExpense.iban
    }]);
    if (!error) setActiveTab('home');
  };

  const handleClearNotifications = async () => {
    const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    if (!error) setNotifications([]);
  };

  const handleClearMyExpenses = async () => {
    if (!currentUser) {
      alert('لازم تسجل دخول عشان تصفر فواتيرك!');
      return;
    }
    
    const confirmClear = window.confirm('متأكد تبي تحذف كل الفواتير اللي أنت سجلتها؟ (هذا الإجراء ما يمسح فواتير أخوياك)');
    
    if (confirmClear) {
      const { error } = await supabase.from('expenses').delete().eq('user_id', currentUser.id); 
      if (error) alert('حدث خطأ أثناء مسح فواتيرك!');
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('home');
  };

  const myTotalAmount = expenses
    .filter(exp => currentUser && exp.user_id === currentUser.id)
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="min-h-screen bg-qattah-dark font-tajawal relative overflow-hidden">
      <Header 
        myTotalAmount={myTotalAmount} 
        onClearMyExpenses={handleClearMyExpenses} 
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />
      
      <main className="w-full max-w-lg mx-auto">
        {activeTab === 'home' && <Home expenses={expenses} currentUser={currentUser} />}
        
        {/* 🚀 السطر السحري: مررنا هوية المستخدم لشاشة الفضايح عشان تعرف مين اللي يطالعها */}
        {activeTab === 'summary' && <RoastSummary expenses={expenses} currentUser={currentUser} />}
        
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