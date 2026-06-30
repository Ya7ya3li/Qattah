import React, { useState } from 'react';
import { Wallet, RefreshCcw, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ totalAmount = 0, onClear, notifications = [], onClearNotifications }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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

        <div className="flex items-center gap-2 relative">
          
          {/* 🔔 جرس الإشعارات الحي */}
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative bg-white/5 p-2.5 rounded-xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5 text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

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

      {/* 📜 قائمة الإشعارات المنسدلة الزجاجية السينمائية */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-24 left-6 right-6 bg-qattah-dark/95 border border-white/10 rounded-3xl p-4 shadow-2xl max-h-80 overflow-y-auto z-50 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-qattah-neonGreen" /> رادار الطقطقة لايف 👀
              </h4>
              {notifications.length > 0 && (
                <button 
                  onClick={() => { onClearNotifications(); setShowDropdown(false); }}
                  className="text-gray-500 hover:text-red-400 text-xs font-bold transition-colors"
                >
                  مسح الكل
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-6">الوضع هادي.. ما فيه هياط جديد لسه 😂</p>
            ) : (
              <div className="flex flex-col gap-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="bg-white/5 p-3 rounded-xl border border-white/5 text-right text-xs text-gray-300 font-medium leading-relaxed">
                    {notif.message}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Header;