import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, AlertOctagon, CheckCircle2, Image as ImageIcon, Trash2, Edit3, FileText, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Home = ({ expenses, currentUser, onEdit }) => {
  const [selectedExpense, setSelectedExpense] = useState(null); 

  const toggleAlert = async (id, currentAlertStatus) => {
    const { error } = await supabase.from('expenses').update({ is_alert: !currentAlertStatus }).eq('id', id);
    if (error) alert('حدث خطأ في تسجيل الاعتراض!');
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('بتحذف هذي الفاتورة نهائياً، متأكد؟');
    if (confirmDelete) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 px-6 pb-32 pt-4">
      {expenses.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 font-medium flex flex-col items-center justify-center gap-3">
          <Receipt className="w-12 h-12 opacity-50" />
          ما فيه فواتير للآن.. الوضع سليم 🏃‍♂️
        </div>
      ) : (
        expenses.map((expense) => {
          const isOwner = currentUser && expense.user_id === currentUser.id;

          return (
            <motion.div key={expense.id} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`relative p-5 rounded-3xl border transition-all duration-300 ${expense.is_alert ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-qattah-glass border-white/10'}`}
            >
              {expense.title.includes('سداد دين') && <CheckCircle2 className="absolute top-4 left-4 w-8 h-8 text-qattah-neonGreen opacity-80" />}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">دفعها <span className="font-bold text-white">{expense.payer}</span></p>
                  <h3 className={`text-xl font-bold ${expense.is_alert ? 'text-red-400' : 'text-white'}`}>{expense.title}</h3>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${expense.is_alert ? 'text-red-500' : 'text-qattah-neonGreen'}`}>
                    {Number(expense.amount).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-[10px]">ريال سعودي</p>
                </div>
              </div>

              {expense.image_url && (
                <div className="my-3 rounded-xl overflow-hidden border border-white/10 max-h-40 relative group">
                  <img src={expense.image_url} alt="إيصال" className="w-full object-cover object-center" />
                  <a href={expense.image_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                    <span className="bg-black/60 px-4 py-2 rounded-lg flex items-center gap-2"><ImageIcon className="w-4 h-4"/> عرض الصورة</span>
                  </a>
                </div>
              )}

              {/* 🕹️ الأزرار (تفاصيل - تعديل - حذف) */}
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <button onClick={() => setSelectedExpense(expense)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                    <FileText className="w-4 h-4" /> التفاصيل
                  </button>
                  
                  {/* 🚀 هذا هو زر التعديل اللي ربطناه بالدالة */}
                  {isOwner && (
                    <button onClick={() => onEdit(expense)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all">
                      <Edit3 className="w-4 h-4" /> تعديل
                    </button>
                  )}
                </div>

                {!expense.title.includes('سداد دين') && (
                  isOwner ? (
                    <button onClick={() => handleDelete(expense.id)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" /> حذف
                    </button>
                  ) : (
                    <button onClick={() => toggleAlert(expense.id, expense.is_alert)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${expense.is_alert ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-400'}`}>
                      <AlertOctagon className="w-4 h-4" /> {expense.is_alert ? 'تم الاعتراض' : 'صادوه!'}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          );
        })
      )}

      {/* 📄 نافذة التفاصيل */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-qattah-dark border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
              <button onClick={() => setSelectedExpense(null)} className="absolute top-4 left-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              <h4 className="text-white font-bold mb-4">تفاصيل فاتورة: {selectedExpense.title}</h4>
              
              {selectedExpense.splits && selectedExpense.splits.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedExpense.splits.map((split, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-white font-bold text-sm">{split.name}</span>
                      <div className="text-right">
                        <span className="text-qattah-neonGreen font-black block">{split.amount.toFixed(2)} ريال</span>
                        <span className={`text-[10px] font-bold ${split.status === 'paid' ? 'text-green-400' : split.status === 'awaiting_confirmation' ? 'text-yellow-400' : 'text-red-400'}`}>
                          {split.status === 'paid' ? 'مسدد ✅' : split.status === 'awaiting_confirmation' ? 'انتظار التأكيد ⏳' : 'مطلوب ❌'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">هذي فاتورة قديمة قبل نظام التقسيم الذكي.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;