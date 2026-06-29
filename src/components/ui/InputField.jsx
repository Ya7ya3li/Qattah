// هذا الكود مخصص لحقول إدخال النصوص والأرقام في كامل المنصة
// ويستخدم في شاشات إضافة المبالغ، كتابة أسماء الأشخاص، وإضافة تفاصيل الرحلة

import React from 'react';

const InputField = ({ label, type = 'text', placeholder, value, onChange, icon: Icon }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      
      {/* هذا الجزء مخصص لعنوان الحقل */}
      {label && (
        <label className="text-gray-400 text-sm font-tajawal pr-1">
          {label}
        </label>
      )}

      {/* هذا الجزء مخصص لتصميم الحقل نفسه */}
      <div className="relative flex items-center">
        
        {/* هذا الكود مخصص للأيقونة التي تظهر داخل الحقل */}
        {Icon && (
          <div className="absolute right-4 text-gray-500 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* هذا الكود مخصص لحقل الإدخال الفعلي والتفاعلات */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          dir="rtl"
          className={`
            w-full bg-qattah-glass backdrop-blur-md border border-white/10 
            text-white placeholder-gray-600 rounded-2xl py-4 
            focus:outline-none focus:border-qattah-neonGreen/50 focus:shadow-[0_0_15px_rgba(57,255,20,0.15)]
            transition-all duration-300 font-tajawal text-lg
            ${Icon ? 'pr-12 pl-4' : 'px-4'}
          `}
        />
      </div>
    </div>
  );
};

export default InputField;