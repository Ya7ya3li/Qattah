import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InputField from '../components/ui/InputField';
import NeonButton from '../components/ui/NeonButton';
import { Camera, Receipt, Send, Users, Plus } from 'lucide-react';

const AddExpense = ({ onAdd, currentUser }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  
  // قائمة المشاركين في الفاتورة (افتراضياً أنت موجود فيها)
  const [involved, setInvolved] = useState([currentUser.name]);
  const [newPerson, setNewPerson] = useState('');

  const handleAddPerson = () => {
    if (newPerson && !involved.includes(newPerson)) {
      setInvolved([...involved, newPerson]);
      setNewPerson('');
    }
  };

  const handleSubmit = () => {
    if (!title || !amount || involved.length === 0) {
      alert('عبي بيانات الفاتورة وتأكد إن فيه أحد مشارك فيها!');
      return;
    }

    const newExpense = {
      id: Date.now(),
      title: title, // شلنا الاسم من هنا لأننا فصلناه
      payer: currentUser.name, // اللي دفع الفلوس
      amount: Number(amount),
      involved: involved, // اللي يتشاركون في الدفع
      role: 'اللي شايل الشلة 🦅',
      isAlert: false,
      userId: currentUser.id
    };

    onAdd(newExpense);
    setTitle('');
    setAmount('');
    setInvolved([currentUser.name]);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 px-6 pb-32 pt-4">
      <div className="mb-2">
        <h2 className="text-gray-300 text-xl font-bold">مرحباً {currentUser.name} 👋</h2>
        <p className="text-gray-500 text-sm">سجل الفاتورة، واختار مين اللي أكل/شرب معك عشان نحاسبه.</p>
      </div>
      
      <InputField label="وش الدفعية؟ (مثلاً: عشاء)" placeholder="اكتب هنا..." value={title} onChange={(e) => setTitle(e.target.value)} icon={Receipt} />
      <InputField label="كم دفعت؟" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />

      {/* قسم اختيار المشاركين في الفاتورة */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
        <label className="block text-gray-400 text-sm font-bold mb-3">مين يشاركك هذي الفاتورة؟</label>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {involved.map((person, idx) => (
            <span key={idx} className="bg-qattah-neonGreen/20 text-qattah-neonGreen px-3 py-1 rounded-full text-sm font-bold border border-qattah-neonGreen/30">
              {person}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="اكتب اسم خويك..." 
            value={newPerson} 
            onChange={(e) => setNewPerson(e.target.value)}
            className="flex-1 bg-black/50 text-white rounded-xl px-4 border border-gray-700 focus:outline-none focus:border-qattah-neonGreen"
          />
          <button onClick={handleAddPerson} className="bg-gray-700 p-3 rounded-xl text-white hover:bg-gray-600">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <NeonButton color="green" fullWidth icon={Send} onClick={handleSubmit}>
        سجل الفاتورة
      </NeonButton>
    </motion.div>
  );
};

export default AddExpense;