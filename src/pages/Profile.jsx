import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InputField from '../components/ui/InputField';
import NeonButton from '../components/ui/NeonButton';
import { UserPlus, UserCheck, Share2, LogOut, Users } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Profile = ({ currentUser, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]); // اللي أتابعهم
  const [followersCount, setFollowersCount] = useState(0); // اللي يتابعوني

  // نجلب الأصدقاء والمتابعين من السيرفر أول ما تفتح الشاشة
  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    // جلب اللي أتابعهم
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id);
      
    if (followingData) {
      // جلب أسماء اللي أتابعهم
      const ids = followingData.map(f => f.following_id);
      const { data: friendsData } = await supabase.from('profiles').select('*').in('id', ids);
      setFollowing(friendsData || []);
    }

    // جلب عدد اللي يتابعوني
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact' })
      .eq('following_id', currentUser.id);
    setFollowersCount(count || 0);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // البحث عن مستخدمين حقيقيين في السيرفر (ما عدا أنا)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .neq('id', currentUser.id);
      
    setSearchResults(data || []);
  };

  const handleFollow = async (friendId) => {
    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: currentUser.id, following_id: friendId }]);

    if (!error) {
      alert('تمت الإضافة بنجاح! 🤝');
      setSearchQuery('');
      setSearchResults([]);
      fetchNetwork(); // تحديث القائمة
    } else {
      alert('مضاف عندك مسبقاً أو صار خطأ!');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 px-6 pb-32 pt-4">
      
      {/* الكرت الشخصي (حقيقي بالكامل) */}
      <div className="bg-qattah-glass border border-qattah-neonGreen/30 rounded-3xl p-6 shadow-lg text-center relative">
        <button onClick={onLogout} className="absolute top-4 left-4 text-gray-500 hover:text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
        <div className="bg-qattah-neonGreen/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-qattah-neonGreen/50">
          <span className="text-3xl">😎</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{currentUser.name}</h2>
        
        {/* إحصائيات حقيقية */}
        <div className="flex justify-center gap-8 border-t border-white/10 pt-4">
          <div>
            <p className="text-white font-bold text-xl">{following.length}</p>
            <p className="text-gray-400 text-xs">أتابعهم</p>
          </div>
          <div>
            <p className="text-white font-bold text-xl">{followersCount}</p>
            <p className="text-gray-400 text-xs">يتابعوني</p>
          </div>
        </div>
      </div>

      {/* بحث وإضافة أصدقاء من السيرفر */}
      <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5"/> بحث عن أصدقاء</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputField placeholder="اكتب اسم خويك..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={handleSearch} className="bg-qattah-neonGreen text-black font-bold px-4 rounded-xl mt-1 h-[60px]">
            ابحث
          </button>
        </div>

        {/* نتائج البحث */}
        {searchResults.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {searchResults.map(user => (
              <div key={user.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-qattah-neonGreen/30">
                <span className="text-white font-bold">{user.name}</span>
                <button onClick={() => handleFollow(user.id)} className="bg-white/10 text-qattah-neonGreen text-xs px-3 py-1.5 rounded-lg hover:bg-white/20">
                  إضافة +
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* قائمة اللي أتابعهم (حقيقية) */}
      <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> الشلة المضافة</h3>
        {following.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">لسه ما ضفت أحد.. ابحث عن أخوياك فوق!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {following.map((friend) => (
              <div key={friend.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-gray-300 font-bold">{friend.name}</span>
                <UserCheck className="w-5 h-5 text-qattah-neonGreen" />
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Profile;