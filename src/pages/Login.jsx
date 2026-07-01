import logo from '../assets/logo.png';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InputField from '../components/ui/InputField';
import NeonButton from '../components/ui/NeonButton';
import { LogIn, User, Mail, Lock, UserPlus } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false); // حالة التبديل بين الدخول والتسجيل
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !username)) {
      alert('عبي كل الخانات يا وحش!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // --- تسجيل حساب جديد ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (authError) throw authError;

        if (authData.user) {
          // إنشاء بروفايل للمستخدم الجديد في قاعدة البيانات
          const newUserProfile = {
            id: authData.user.id,
            name: username,
            email: email,
            avatar_url: null
          };
          
          const { error: profileError } = await supabase.from('profiles').insert([newUserProfile]);
          if (profileError) throw profileError;
          
          onLogin(newUserProfile);
        }
      } else {
        // --- تسجيل الدخول لحساب موجود ---
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw authError;

        // جلب بيانات البروفايل
        if (authData.user) {
          const { data: userProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (fetchError) throw fetchError;
          onLogin(userProfile);
        }
      }
    } catch (error) {
      console.error('خطأ Auth:', error);
      alert(error.message.includes('Invalid login') ? 'الإيميل أو كلمة السر غلط!' : 'صارت مشكلة، جرب إيميل ثاني أو تأكد من بياناتك.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 px-6 pt-16 text-center">
      <div className="bg-qattah-glass border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* 🌟 اللوجو الجديد الفخم مع تأثير التوهج */}
        <div className="mx-auto mb-6 w-36 h-36 flex items-center justify-center group cursor-pointer">
          <img 
            src={logo} 
            alt="شعار قطة" 
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(182,255,22,0.4)] group-hover:scale-110 group-hover:drop-shadow-[0_0_30px_rgba(182,255,22,0.6)] transition-all duration-500" 
          />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{isSignUp ? 'حياك في الشلة' : 'سجل دخولك'}</h2>
        <p className="text-gray-400 text-sm mb-6">
          {isSignUp ? 'سجل حسابك عشان تحفظ حقوقك وفواتيرك' : 'عشان تحفظ فواتيرك وتضيف أخوياك 💸'}
        </p>

        <div className="flex flex-col gap-3 mb-6 text-right">
          {isSignUp && (
            <InputField placeholder="اسمك (اللي بيطلع لأخوياك)" value={username} onChange={(e) => setUsername(e.target.value)} icon={User} />
          )}
          <InputField type="email" placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} />
          <InputField type="password" placeholder="كلمة السر (6 أحرف أو أكثر)" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} />
        </div>
        
        <NeonButton color="green" fullWidth icon={isSignUp ? UserPlus : LogIn} onClick={handleAuth} disabled={isLoading}>
          {isLoading ? 'جاري الاتصال...' : (isSignUp ? 'إنشاء حساب جديد' : 'دخول')}
        </NeonButton>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {isSignUp ? 'عندك حساب؟ سجل دخول من هنا' : 'جديد معنا؟ سوي لك حساب'}
        </button>
      </div>
    </motion.div>
  );
};

export default Login;