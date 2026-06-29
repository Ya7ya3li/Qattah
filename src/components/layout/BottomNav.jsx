import React from 'react';
import { Home, PlusCircle, Flame, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6">
      <div className="bg-qattah-dark/90 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
        
        <NavButton icon={Home} label="القطات" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={PlusCircle} label="أضف" isActive={activeTab === 'add'} onClick={() => setActiveTab('add')} isCenter />
        <NavButton icon={Flame} label="الفضايح" isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
        
        {/* زر البروفايل الجديد */}
        <NavButton icon={User} label="بروفايلي" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      
      </div>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, isActive, onClick, isCenter }) => {
  if (isCenter) {
    return (
      <button onClick={onClick} className="relative group px-2">
        <div className="absolute -inset-2 bg-qattah-neonGreen opacity-20 group-hover:opacity-40 blur-lg rounded-full transition-all duration-300"></div>
        <div className="relative bg-qattah-neonGreen text-black p-4 rounded-2xl shadow-[0_0_15px_rgba(57,255,20,0.5)] transform transition-transform active:scale-95">
          <Icon className="w-6 h-6" />
        </div>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 p-2 w-16 transition-all active:scale-95">
      <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-qattah-neonGreen drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]' : 'text-gray-500'}`} />
      <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-qattah-neonGreen' : 'text-gray-500'}`}>
        {label}
      </span>
      {isActive && (
        <motion.div layoutId="navIndicator" className="w-1 h-1 bg-qattah-neonGreen rounded-full mt-1 shadow-[0_0_5px_rgba(57,255,20,1)]" />
      )}
    </button>
  );
};

export default BottomNav;