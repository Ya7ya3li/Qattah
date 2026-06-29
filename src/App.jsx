import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import AddExpense from './pages/AddExpense';
import RoastSummary from './pages/RoastSummary';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('qattah_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('qattah_expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  useEffect(() => {
    localStorage.setItem('qattah_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
    setActiveTab('home');
  };

  const handleClearAll = () => {
    if(window.confirm('متأكد تبي تصفر القطة وتمسح كل الفواتير؟')) {
      setExpenses([]);
      localStorage.removeItem('qattah_expenses');
      setActiveTab('home');
    }
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

  // 🚀 السحر هنا: دالة سداد الدين
  const handleSettleDebt = (from, to, amount) => {
    // ننشئ فاتورة سداد ذكية تعادل الكفة في الخوارزمية
    const settlementExpense = {
      id: Date.now(),
      title: 'سداد دين 🤝',
      payer: from, // اللي سدد
      amount: Number(amount),
      involved: [to], // اللي استلم الفلوس
      role: 'مسدد ديونه 💳',
      isAlert: false,
      userId: currentUser ? currentUser.id : 'system'
    };

    setExpenses([settlementExpense, ...expenses]);
    alert(`كفو! تم تسجيل سداد ${amount} ريال من ${from} إلى ${to}. الخوارزمية بتخصمها الحين 🚀`);
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-qattah-dark font-tajawal relative overflow-hidden">
      <Header totalAmount={totalAmount} onClear={handleClearAll} />
      
      <main className="w-full max-w-lg mx-auto">
        {activeTab === 'home' && <Home expenses={expenses} />}
        
        {/* مررنا دالة السداد لشاشة الفضايح */}
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