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
  
  // 🌟 حالة جديدة لحفظ الفاتورة المراد تعديلها
  const [editingExpense, setEditingExpense] = useState(null);

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

  // 🚀 دالة الحفظ المحدثة (تفرق بين إضافة فاتورة جديدة أو تعديل قديمة)
  const handleAddExpense = async (newExpense, isEdit = false, expenseId = null) => {
    if (isEdit && expenseId) {
      const { error } = await supabase.from('expenses').update({
        title: newExpense.title,
        amount: newExpense.amount,
        involved: newExpense.involved,
        splits: newExpense.splits,
        stc_pay: newExpense.stc_pay,
        iban: newExpense.iban,
        image_url: newExpense.image_url
      }).eq('id', expenseId);

      if (!error) {
        setEditingExpense(null);
        setActiveTab('home');
      } else {
        alert('حدث خطأ أثناء التعديل!');
      }
    } else {
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
    }
  };

  const handleClearNotifications = async () => {
    const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    if (!error) setNotifications([]);
  };

  const handleClearMyExpenses = async () => {
    if (!currentUser) return;
    const confirmClear = window.confirm('متأكد تبي تحذف كل الفواتير اللي أنت سجلتها؟');
    if (confirmClear) {
      const { error } = await supabase.from('expenses').delete().eq('user_id', currentUser.id); 
      if (error) alert('حدث خطأ أثناء مسح فواتيرك!');
    }
  };

  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('home');
  };

  // تفريغ وضع "التعديل" إذا انتقل المستخدم لأي شاشة ثانية
  const handleTabChange = (tab) => {
    if (tab !== 'add') setEditingExpense(null);
    setActiveTab(tab);
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
        {activeTab === 'home' && (
          <Home 
            expenses={expenses} 
            currentUser={currentUser} 
            onEdit={(exp) => {
              setEditingExpense(exp); // تجهيز الفاتورة للتعديل
              setActiveTab('add');    // نقله لشاشة الإضافة
            }} 
          />
        )}
        
        {activeTab === 'summary' && <RoastSummary expenses={expenses} currentUser={currentUser} />}
        
        {activeTab === 'add' && (
          currentUser ? <AddExpense onAdd={handleAddExpense} currentUser={currentUser} editingExpense={editingExpense} /> : <Login onLogin={handleLogin} />
        )}
        
        {activeTab === 'profile' && (
          currentUser ? <Profile currentUser={currentUser} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
}

export default App;