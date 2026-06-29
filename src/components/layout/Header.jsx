import React from 'react';
// سحبنا أيقونة التحديث (التصفير) من المكتبة
import { Wallet, RefreshCcw } from 'lucide-react'; 
import { motion } from 'framer-motion';

const Header = ({ totalAmount = 0, onClear }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 p-6 pb-2"
    >
      <div className="bg-qattah-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        <div>
          <h1 className="text-white text-2xl font-extrabold tracking-wide">Qattah</h1>
          <span className="text-qattah-neonGreen text-xs font-bold">صفي النية وسدد 💸</span>
        </div>

        <div className="flex items-center gap-2">
          
          {/* زر تصفير القطة */}
          <button 
            onClick={onClear}
            className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/30 hover:bg-red-500/20 active:scale-95 transition-all"
            title="تصفير القطة"
          >
            <RefreshCcw className="w-5 h-5 text-red-400" />
          </button>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="text-left">
              <p className="text-gray-400 text-[10px]">إجمالي القطة</p>
              <p className="text-white font-bold">{totalAmount.toLocaleString()} <span className="text-gray-500 text-xs font-normal">ريال</span></p>
            </div>
            <div className="bg-qattah-neonGreen/20 p-2 rounded-xl">
              <Wallet className="w-5 h-5 text-qattah-neonGreen" />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Header;