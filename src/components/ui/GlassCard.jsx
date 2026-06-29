import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const GlassCard = ({ title, amount, role, isAlert }) => {
  return (
    <div className={`relative p-5 rounded-3xl border backdrop-blur-xl shadow-lg mt-2 ${
      isAlert ? 'bg-red-900/20 border-red-500/30' : 'bg-qattah-glass border-white/10'
    }`}>
      
      {/* ختم الكفو يظهر على الفاتورة السليمة */}
      {!isAlert && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-qattah-neonGreen/20 to-transparent px-4 py-1.5 rounded-br-2xl border-b border-r border-qattah-neonGreen/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
          <CheckCircle className="w-4 h-4 text-qattah-neonGreen" />
          <span className="text-qattah-neonGreen text-xs font-extrabold tracking-wider">الكفو 👑</span>
        </div>
      )}

      {/* تحذير الفضايح (صادوه) */}
      {isAlert && (
        <div className="absolute top-0 left-0 bg-red-500/20 px-4 py-1.5 rounded-br-2xl border-b border-r border-red-500/30 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-bold">صادوه 🛑</span>
        </div>
      )}

      <div className="flex justify-between items-end mt-4">
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{role}</p>
        </div>
        <div className="text-left">
          <p className={`font-extrabold text-xl ${isAlert ? 'text-red-400' : 'text-qattah-neonGreen'}`}>
            {amount} <span className="text-xs font-normal text-gray-500">ريال</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlassCard;