import React from 'react';
import { motion } from 'framer-motion';
import NeonButton from '../components/ui/NeonButton';
import { Share2, Flame, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { calculateDebts } from '../utils/splitMath';

// الشاشة صارت تستقبل onSettle (دالة السداد)
const RoastSummary = ({ expenses, onSettle }) => {
  const stats = calculateDebts(expenses);

  if (!stats || stats.isSingle) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 px-6 pt-32 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-2" />
        <h2 className="text-xl font-bold text-white">الوضع هادي جداً!</h2>
        <p className="text-gray-400 text-sm">ضيف فواتير وأشخاص عشان الخوارزمية تبدأ شغلها 😂</p>
      </motion.div>
    );
  }

  // شاشة "صافية لبن" تظهر آلياً إذا تصافوا
  if (stats.transactions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-4 px-6 pt-32 text-center">
        <div className="bg-qattah-neonGreen/20 p-5 rounded-full mb-2 border border-qattah-neonGreen/30 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
          <CheckCircle className="w-16 h-16 text-qattah-neonGreen" />
        </div>
        <h2 className="text-2xl font-bold text-white">صافية لبن 🥛</h2>
        <p className="text-gray-400 text-sm">ما أحد يطلب أحد، الشلة كلها كفو وكلهم مسددين اللي عليهم!</p>
        <p className="text-qattah-neonGreen font-bold mt-2">إجمالي القطية: {stats.totalSpent.toFixed(2)} ريال</p>
      </motion.div>
    );
  }

  const handlePaymentClick = (from, to, amount) => {
    alert(`💳 توجيه ${from} لسداد مبلغ ${amount} ريال لـ ${to} عبر STC Pay أو التحويل البنكي... (تم نسخ الآيبان)`);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-6 px-6 pb-32 pt-4">
      <div className="text-center mb-2">
        <h2 className="text-qattah-neonGreen text-2xl font-extrabold flex justify-center items-center gap-2">
          <Flame className="w-7 h-7 text-red-500" /> الفضايح وتصفية الحسابات
        </h2>
      </div>

      <div className="bg-qattah-glass border border-yellow-500/30 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-500/20 px-4 py-1 rounded-bl-2xl text-yellow-500 text-sm font-bold">الشيخ 👑</div>
        <h3 className="text-white text-xl font-bold mt-2">{stats.sheikh.name}</h3>
        <p className="text-gray-400 text-sm">شايل الشلة ويطلبهم ({stats.sheikh.amount.toFixed(2)} ريال)، بيض الله وجهه.</p>
      </div>

      {stats.mutaffir.amount < -0.01 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500/20 px-4 py-1 rounded-bl-2xl text-red-400 text-sm font-bold">المطفر 🏃‍♂️</div>
          <h3 className="text-white text-xl font-bold mt-2">{stats.mutaffir.name}</h3>
          <p className="text-gray-400 text-sm">أكثر واحد مديون للشلة ({Math.abs(stats.mutaffir.amount).toFixed(2)} ريال).. افضحوه!</p>
        </div>
      )}

      <div className="bg-white/5 rounded-3xl p-5 border border-white/10 mt-2">
        <h4 className="text-white font-bold mb-4 text-lg">الزبدة.. مين يحول لمين؟ 💸</h4>
        <div className="flex flex-col gap-4">
          {stats.transactions.map((trx, index) => (
            <div key={index} className="flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
              
              <div className="flex justify-between items-center">
                <span className="text-red-400 flex items-center gap-2 font-bold"><TrendingDown className="w-5 h-5"/> {trx.from}</span>
                <span className="text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">يحول {trx.amount} ➡️</span>
                <span className="text-qattah-neonGreen flex items-center gap-2 font-bold"><TrendingUp className="w-5 h-5"/> {trx.to}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => handlePaymentClick(trx.from, trx.to, trx.amount)}
                  className="flex items-center justify-center gap-2 bg-[#4c185e] hover:bg-[#3b1248] text-white text-xs py-2.5 rounded-lg transition-all"
                >
                  <Smartphone className="w-4 h-4" /> STC Pay
                </button>
                {/* 🚀 ربطنا الزر بالدالة اللي تعدل الخوارزمية */}
                <button 
                  onClick={() => onSettle(trx.from, trx.to, trx.amount)}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs py-2.5 rounded-lg transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> تم السداد
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      <NeonButton color="green" fullWidth icon={Share2}>
        افضحهم في السناب 📸
      </NeonButton>
    </motion.div>
  );
};

export default RoastSummary;