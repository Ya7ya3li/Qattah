import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InputField from '../components/ui/InputField';
import NeonButton from '../components/ui/NeonButton';
import { LogIn, User } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      alert('اكتب اسمك يا طيب!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. نبحث إذا المستخدم مسجل من قبل
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', username)
        .single();

      if (existingUser) {
        onLogin(existingUser); // إذا موجود، دخله
      } else {
        // 2. إذا مو موجود، نسجل له بروفايل جديد في السيرفر
        const newUser = { id: String(Date.now()), name: username };
        const { error } = await supabase.from('profiles').insert([newUser]);
        
        if (error) throw error;
        onLogin(newUser);
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      alert('صارت مشكلة في الاتصال بالسيرفر!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 px-6 pt-20 text-center">
      <div className="bg-qattah-glass border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="bg-qattah-neonGreen/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-qattah-neonGreen" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">سجل دخولك</h2>
        <p className="text-gray-400 text-sm mb-8">عشان تحفظ فواتيرك وتضيف أخوياك للشلة الحقيقية 💸</p>

        <InputField placeholder="اكتب اسمك (مثلاً: خالد)" value={username} onChange={(e) => setUsername(e.target.value)} icon={User} />
        
        <div className="mt-6">
          <NeonButton color="green" fullWidth icon={LogIn} onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'جاري الاتصال بالسيرفر...' : 'دخول'}
          </NeonButton>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;