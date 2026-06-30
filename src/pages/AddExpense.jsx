import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from '../components/ui/InputField';
import NeonButton from '../components/ui/NeonButton';
import { Receipt, Send, Plus, Camera, Loader2, PieChart, Users, X, CreditCard, ChevronDown } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const AddExpense = ({ onAdd, currentUser }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [involved, setInvolved] = useState([currentUser.name]);
  const [newPerson, setNewPerson] = useState('');
  
  const [splitType, setSplitType] = useState('equal');
  const [customAmounts, setCustomAmounts] = useState({ [currentUser.name]: '' });

  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [stcPay, setStcPay] = useState(currentUser?.stc_pay || '');
  const [iban, setIban] = useState(currentUser?.iban || '');

  // 👥 حالات الشلة (الأصدقاء)
  const [friends, setFriends] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(false);

  // جلب قائمة الأصدقاء (اللي تتابعهم) من قاعدة البيانات
  useEffect(() => {
    const fetchFriends = async () => {
      const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
      if (follows && follows.length > 0) {
        const ids = follows.map(f => f.following_id);
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
        setFriends(profiles || []);
      }
    };
    if (currentUser) fetchFriends();
  }, [currentUser]);

  // دالة زر (+) الذكي
  const handleAddPerson = () => {
    // إذا الخانة فاضية، نفتح أو نقفل قائمة الشلة
    if (!newPerson.trim()) {
      setShowFriendsList(!showFriendsList);
      return;
    }
    
    // إذا كاتب اسم يدوي، نضيفه
    if (!involved.includes(newPerson)) {
      setInvolved([...involved, newPerson]);
      setCustomAmounts(prev => ({ ...prev, [newPerson]: '' }));
      setNewPerson('');
      setShowFriendsList(false);
    }
  };

  // دالة اختيار صديق من القائمة
  const handleSelectFriend = (friendName) => {
    if (!involved.includes(friendName)) {
      setInvolved([...involved, friendName]);
      setCustomAmounts(prev => ({ ...prev, [friendName]: '' }));
    }
    setShowFriendsList(false); // نقفل القائمة بعد الاختيار
  };

  const handleRemovePerson = (person) => {
    if (person === currentUser.name) return;
    setInvolved(involved.filter(p => p !== person));
    const newAmounts = { ...customAmounts };
    delete newAmounts[person];
    setCustomAmounts(newAmounts);
  };

  const handleCustomAmountChange = (person, value) => {
    setCustomAmounts(prev => ({ ...prev, [person]: value }));
  };

  const handleSubmit = async () => {
    if (!title || !amount || involved.length === 0) {
      alert('عبي بيانات الفاتورة وتأكد إن فيه أحد مشارك فيها!');
      return;
    }

    const totalAmount = Number(amount);
    let finalSplits = [];

    if (splitType === 'custom') {
      const sum = involved.reduce((acc, person) => acc + Number(customAmounts[person] || 0), 0);
      if (Math.abs(sum - totalAmount) > 0.1) {
        alert(`مجموع التقسيم (${sum}) ما يساوي إجمالي الفاتورة (${totalAmount})! عدلها يا مدير.`);
        return;
      }
      finalSplits = involved.map(person => ({
        name: person,
        amount: Number(customAmounts[person] || 0),
        status: person === currentUser.name ? 'paid' : 'pending'
      }));
    } else {
      const equalShare = totalAmount / involved.length;
      finalSplits = involved.map(person => ({
        name: person,
        amount: equalShare,
        status: person === currentUser.name ? 'paid' : 'pending'
      }));
    }

    setIsUploading(true);
    let imageUrl = null;

    try {
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const newExpense = {
        title: title,
        payer: currentUser.name,
        amount: totalAmount,
        involved: involved,
        userId: currentUser.id,
        image_url: imageUrl,
        splits: finalSplits,
        stc_pay: stcPay,
        iban: iban       
      };

      if (stcPay || iban) {
        await supabase.from('profiles').update({ stc_pay: stcPay, iban: iban }).eq('id', currentUser.id);
      }

      await onAdd(newExpense);
      
      setTitle(''); setAmount(''); setInvolved([currentUser.name]); setReceiptFile(null); setSplitType('equal');
    } catch (error) {
      console.error('خطأ:', error);
      alert('صارت مشكلة في الحفظ!');
    } finally {
      setIsUploading(false);
    }
  };

  const currentSum = involved.reduce((acc, person) => acc + Number(customAmounts[person] || 0), 0);
  const remainingToSplit = Number(amount) - currentSum;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 px-6 pb-32 pt-4">
      <div className="mb-2">
        <h2 className="text-gray-300 text-xl font-bold">مرحباً {currentUser.name} 👋</h2>
        <p className="text-gray-500 text-sm">سجل الفاتورة، وقسمها على كيفك.</p>
      </div>
      
      <InputField label="وش الدفعية؟" placeholder="مثلاً: عشاء، شاليه..." value={title} onChange={(e) => setTitle(e.target.value)} icon={Receipt} />
      <InputField label="كم دفعت كاش؟" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />

      <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex gap-2">
        <button onClick={() => setSplitType('equal')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${splitType === 'equal' ? 'bg-qattah-neonGreen text-black shadow-lg shadow-qattah-neonGreen/20' : 'text-gray-400 hover:bg-white/5'}`}>
          <Users className="w-4 h-4" /> بالتساوي
        </button>
        <button onClick={() => setSplitType('custom')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${splitType === 'custom' ? 'bg-qattah-neonGreen text-black shadow-lg shadow-qattah-neonGreen/20' : 'text-gray-400 hover:bg-white/5'}`}>
          <PieChart className="w-4 h-4" /> تخصيص
        </button>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-gray-400 text-sm font-bold">المشاركين في القطة</label>
          {splitType === 'custom' && amount > 0 && (
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${remainingToSplit === 0 ? 'bg-qattah-neonGreen/20 text-qattah-neonGreen' : 'bg-red-500/20 text-red-400'}`}>
              المتبقي: {remainingToSplit.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {involved.map((person) => (
            <div key={person} className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
              <span className="text-white text-sm font-bold flex-1 pl-2">{person} {person === currentUser.name && '(أنت)'}</span>
              {splitType === 'custom' && (
                <div className="w-24">
                  <input type="number" placeholder="0.00" value={customAmounts[person]} onChange={(e) => handleCustomAmountChange(person, e.target.value)} className="w-full bg-qattah-dark text-qattah-neonGreen font-bold rounded-lg px-3 py-2 text-center text-sm border border-gray-700 focus:outline-none focus:border-qattah-neonGreen" />
                </div>
              )}
              {person !== currentUser.name && (
                <button onClick={() => handleRemovePerson(person)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><X className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>

        {/* 🌟 مربع إضافة صديق الجديد الذكي */}
        <div className="relative">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="اكتب اسم، أو اضغط + لاختيار خويك" 
              value={newPerson} 
              onChange={(e) => {
                setNewPerson(e.target.value);
                setShowFriendsList(false); // نقفل القائمة إذا بدأ يكتب
              }} 
              className="flex-1 bg-black/50 text-white rounded-xl px-4 border border-gray-700 focus:outline-none focus:border-qattah-neonGreen text-sm" 
            />
            <button onClick={handleAddPerson} className="bg-gray-700 p-3 rounded-xl text-white hover:bg-qattah-neonGreen hover:text-black transition-colors flex items-center justify-center gap-1 min-w-[50px]">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 📜 قائمة الأصدقاء المنسدلة */}
          <AnimatePresence>
            {showFriendsList && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-qattah-dark border border-white/10 rounded-2xl p-2 shadow-2xl z-10 max-h-48 overflow-y-auto"
              >
                {friends.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-4">ما عندك أحد في الشلة للحين 😅<br/>روح لبروفايلك وضيفهم!</p>
                ) : (
                  friends.map(friend => (
                    <button 
                      key={friend.id} 
                      onClick={() => handleSelectFriend(friend.name)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-black/50 overflow-hidden flex items-center justify-center">
                        {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover"/> : '👤'}
                      </div>
                      <span className="text-white font-bold text-sm">{friend.name}</span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-qattah-neonGreen"/> طريقة الدفع لهذي الفاتورة
        </h3>
        <div className="flex flex-col gap-3">
          <InputField placeholder="STC Pay (مثال: 05...)" value={stcPay} onChange={(e) => setStcPay(e.target.value)} />
          <InputField placeholder="الآيبان IBAN (اختياري)" value={iban} onChange={(e) => setIban(e.target.value)} />
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-3 relative overflow-hidden">
        <label className="block text-gray-400 text-sm font-bold">إثبات الدفع (اختياري 📸)</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files && setReceiptFile(e.target.files[0])} className="hidden" id="receipt-upload" />
        <label htmlFor="receipt-upload" className="flex items-center justify-center gap-2 bg-black/50 text-white rounded-xl py-3 border border-gray-700 hover:border-qattah-neonGreen cursor-pointer transition-all">
          <Camera className="w-5 h-5 text-qattah-neonGreen" />
          {receiptFile ? `مرفق: ${receiptFile.name.substring(0,15)}...` : 'اضغط لتصوير الفاتورة'}
        </label>
      </div>

      <NeonButton color="green" fullWidth icon={isUploading ? Loader2 : Send} onClick={handleSubmit} disabled={isUploading}>
        {isUploading ? 'جاري الرفع...' : 'سجل الفاتورة'}
      </NeonButton>
    </motion.div>
  );
};

export default AddExpense;