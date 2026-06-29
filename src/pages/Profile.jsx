import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InputField from '../components/ui/InputField';
import NeonButton from '../components/ui/NeonButton';
import { UserPlus, UserCheck, Share2, LogOut } from 'lucide-react';

const Profile = ({ currentUser, onLogout }) => {
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState(['أحمد الدوسري', 'عبدالله فهد']); // أصدقاء تجريبيين

  const handleAddFriend = () => {
    if (!friendName) return;
    setFriends([...friends, friendName]);
    setFriendName('');
    alert('تم إرسال طلب الإضافة بنجاح! 🔥');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="flex flex-col gap-6 px-6 pb-32 pt-4"
    >
      {/* الكرت الشخصي */}
      <div className="bg-qattah-glass border border-qattah-neonGreen/30 rounded-3xl p-6 shadow-[0_0_20px_rgba(57,255,20,0.05)] text-center relative">
        <button onClick={onLogout} className="absolute top-4 left-4 text-gray-500 hover:text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
        <div className="bg-qattah-neonGreen/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-qattah-neonGreen/50">
          <span className="text-3xl">😎</span>
        </div>
        <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
        <p className="text-qattah-neonGreen text-sm mt-1 font-bold">عضو موثق 👑</p>
      </div>

      {/* إضافة صديق جديد */}
      <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
        <h3 className="text-white font-bold mb-4">ضيف أخوياك للشلة 🤝</h3>
        <InputField 
          placeholder="ابحث عن صديق (اكتب اسمه)..." 
          value={friendName} 
          onChange={(e) => setFriendName(e.target.value)} 
          icon={UserPlus} 
        />
        <div className="mt-4">
          <NeonButton color="green" fullWidth onClick={handleAddFriend}>
            إضافة للقائمة
          </NeonButton>
        </div>
        
        <button className="flex items-center justify-center gap-2 w-full mt-4 py-3 border border-gray-600 rounded-xl text-gray-400 hover:text-white transition-all text-sm">
          <Share2 className="w-4 h-4" /> انسخ رابط بروفايلك وارسله بالواتس
        </button>
      </div>

      {/* قائمة الأصدقاء الحاليين */}
      <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
        <h3 className="text-white font-bold mb-4">أصدقائي ({friends.length})</h3>
        <div className="flex flex-col gap-3">
          {friends.map((friend, index) => (
            <div key={index} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-gray-300 font-bold">{friend}</span>
              <UserCheck className="w-5 h-5 text-qattah-neonGreen" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;