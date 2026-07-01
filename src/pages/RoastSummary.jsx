import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, ShieldCheck, ShieldAlert, CreditCard, Banknote, Copy, Check } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const RoastSummary = ({ expenses, currentUser }) => {
  // حالة ذكية عشان نتبع أي زر تم نسخه ونطلع له "تم النسخ ✅" لثانيتين
  const [copiedMap, setCopiedMap] = useState({});

  const handleCopy = (text, idKey) => {
    navigator.clipboard.writeText(text); // أمر النسخ في الخلفية
    setCopiedMap(prev => ({ ...prev, [idKey]: true }));
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [idKey]: false }));
    }, 2000); // يرجع الزر لشكله الطبيعي بعد ثانيتين
  };

  const updateSplitStatus = async (expenseId, currentSplits, personName, newStatus) => {
    const updatedSplits = currentSplits.map(split => 
      split.name === personName ? { ...split, status: newStatus } : split
    );

    const { error } = await supabase
      .from('expenses')
      .update({ splits: updatedSplits })
      .eq('id', expenseId);

    if (error) alert('حدث خطأ في تحديث الحالة!');
  };

  const activeExpenses = expenses.filter(exp => 
    exp.splits && 
    exp.splits.length > 0 && 
    exp.splits.some(s => s.status !== 'paid') 
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 px-6 pb-32 pt-4">
      
      <div className="text-center mb-2">
        <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <Flame className="w-8 h-8 text-red-500" /> ملخص الفضايح
        </h2>
        <p className="text-gray-400 text-sm mt-2">الكشف الواضح.. الأخضر كفو، والأحمر مطلوب 💸</p>
      </div>

      {activeExpenses.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center mt-10">
          <CheckCircle2 className="w-16 h-16 text-qattah-neonGreen mx-auto mb-4 opacity-80" />
          <h3 className="text-white font-bold text-xl mb-2">الكل مصفّي ومسدد!</h3>
          <p className="text-gray-500 text-sm">شلتك ما شاء الله عليهم ما يحتاجون فضايح 🕊️</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {activeExpenses.map((expense) => {
            const isOwner = currentUser?.name === expense.payer;
            
            return (
              <div key={expense.id} className="bg-qattah-glass border border-white/10 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="border-b border-white/10 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-xs">فاتورة: <span className="text-white font-bold text-sm">{expense.title}</span></p>
                    <p className="text-gray-400 text-xs">الدائن: <span className="text-qattah-neonGreen font-bold">{expense.payer}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-lg">{Number(expense.amount).toFixed(2)}</p>
                    <p className="text-gray-500 text-[10px]">إجمالي الفاتورة</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {expense.splits.map((split, idx) => {
                    const isMe = currentUser?.name === split.name;

                    return (
                      <React.Fragment key={idx}>
                        
                        {split.status === 'paid' && (
                          <div className="flex justify-between items-center bg-black/40 border border-green-500/20 p-3 rounded-xl">
                            <span className="text-gray-300 font-bold text-sm">{split.name} {isMe && '(أنت)'}</span>
                            <span className="text-green-400 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-lg">تم السداد ✅</span>
                          </div>
                        )}

                        {split.status === 'pending' && (
                          <div className="bg-black/40 border border-red-500/20 p-3 rounded-xl flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-bold text-sm">{split.name} {isMe && '(أنت)'}</span>
                              
                              {isMe ? (
                                <span className="text-red-400 font-black">{split.amount.toFixed(2)} ريال</span>
                              ) : (
                                <span className="text-red-400 font-bold text-xs bg-red-500/10 px-2 py-1 rounded-lg">انتظار السداد ❌</span>
                              )}
                            </div>

                            {/* 🚀 قسم الدفع الجديد بعد التحديث السري للأرقام */}
                            {isMe && (
                              <div className="flex flex-col gap-3 mt-1 border-t border-red-500/10 pt-3">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-2">
                                  <p className="text-gray-400 text-[10px] font-bold mb-1">بيانات التحويل لصاحب الفاتورة:</p>
                                  
                                  {expense.stc_pay && (
                                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-white/5">
                                      <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-qattah-neonGreen" />
                                        <span className="text-white text-sm font-bold tracking-wider">STC Pay</span>
                                      </div>
                                      <button 
                                        onClick={() => handleCopy(expense.stc_pay, `${expense.id}-stc`)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copiedMap[`${expense.id}-stc`] ? 'bg-qattah-neonGreen/20 text-qattah-neonGreen' : 'bg-white/10 text-gray-300 hover:bg-qattah-neonGreen hover:text-black'}`}
                                      >
                                        {copiedMap[`${expense.id}-stc`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedMap[`${expense.id}-stc`] ? 'تم النسخ' : 'نسخ الرقم'}
                                      </button>
                                    </div>
                                  )}

                                  {expense.iban && (
                                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-white/5">
                                      <div className="flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-qattah-neonGreen" />
                                        <span className="text-white text-sm font-bold tracking-wider">IBAN</span>
                                      </div>
                                      <button 
                                        onClick={() => handleCopy(expense.iban, `${expense.id}-iban`)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copiedMap[`${expense.id}-iban`] ? 'bg-qattah-neonGreen/20 text-qattah-neonGreen' : 'bg-white/10 text-gray-300 hover:bg-qattah-neonGreen hover:text-black'}`}
                                      >
                                        {copiedMap[`${expense.id}-iban`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedMap[`${expense.id}-iban`] ? 'تم النسخ' : 'نسخ الآيبان'}
                                      </button>
                                    </div>
                                  )}

                                  {!expense.stc_pay && !expense.iban && (
                                    <p className="text-gray-500 text-xs text-center py-2">صاحب الفاتورة ما سجل بيانات دفع، حولها له كاش!</p>
                                  )}
                                </div>

                                <button 
                                  onClick={() => updateSplitStatus(expense.id, expense.splits, split.name, 'awaiting_confirmation')}
                                  className="w-full bg-qattah-neonGreen text-black font-bold py-2.5 rounded-xl text-sm hover:bg-qattah-neonGreen/80 transition-all active:scale-95 shadow-[0_0_15px_rgba(182,255,22,0.3)]"
                                >
                                  سدد المبلغ 💸
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {split.status === 'awaiting_confirmation' && (
                          <div className="bg-black/40 border border-yellow-500/30 p-3 rounded-xl flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-bold text-sm">{split.name} {isMe && '(أنت)'}</span>
                              {!isOwner && (
                                <span className="text-yellow-400 font-bold text-xs bg-yellow-500/10 px-2 py-1 rounded-lg">انتظار التأكيد ⏳</span>
                              )}
                            </div>

                            {isOwner && (
                              <div className="mt-1 border-t border-yellow-500/10 pt-3">
                                <p className="text-yellow-400 text-xs text-center mb-3 font-bold">يقول إنه سدد المبلغ ({split.amount.toFixed(2)} ريال).. وصلك شيء؟</p>
                                <div className="flex gap-2">
                                  <button onClick={() => updateSplitStatus(expense.id, expense.splits, split.name, 'paid')} className="flex-1 flex justify-center items-center gap-1 bg-green-500/20 text-green-400 text-xs font-bold py-2.5 rounded-xl border border-green-500/30 hover:bg-green-500/30 transition-all active:scale-95">
                                    <ShieldCheck className="w-4 h-4" /> ما قصرت 🤝
                                  </button>
                                  <button onClick={() => updateSplitStatus(expense.id, expense.splits, split.name, 'pending')} className="flex-1 flex justify-center items-center gap-1 bg-red-500/20 text-red-400 text-xs font-bold py-2.5 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-all active:scale-95">
                                    <ShieldAlert className="w-4 h-4" /> ما وصلني شي 🤨
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RoastSummary;