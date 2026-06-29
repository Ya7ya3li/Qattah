// هذا الكود مخصص للأزرار التفاعلية ذات الألوان المشعة (النيون) في كامل المنصة
// ويستخدم في أزرار الحفظ، الإضافة، والاعتراض، مع حركات سينمائية عند الضغط

import React from 'react';
import { motion } from 'framer-motion';

const NeonButton = ({ children, onClick, color = 'green', icon: Icon, fullWidth = false }) => {
  
  // هذا الجزء مخصص لتحديد لون الزر بناءً على نوع العملية (أخضر للحفظ، أحمر للاعتراض)
  const colorStyles = {
    green: 'bg-qattah-neonGreen/10 text-qattah-neonGreen border-qattah-neonGreen/50 shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:bg-qattah-neonGreen/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:bg-red-500/20',
  };

  return (
    // هذا الكود مخصص لحركة الزر (ينضغط للداخل عند النقر)
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl 
        border backdrop-blur-sm font-bold text-lg transition-all duration-300
        ${colorStyles[color]}
        ${fullWidth ? 'w-full' : 'w-auto'}
      `}
    >
      {/* هذا الكود مخصص لعرض الأيقونة (SVG) إذا تم تمريرها للزر */}
      {Icon && <Icon className="w-6 h-6" />}
      
      {/* هذا الكود مخصص للنص المكتوب داخل الزر */}
      <span>{children}</span>
    </motion.button>
  );
};

export default NeonButton;