import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from '../components/ui/InputField';
import { UserPlus, UserCheck, LogOut, Users, Camera, Loader2, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Profile = ({ currentUser, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]); 
  const [followers, setFollowers] = useState([]); 
  
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const [activeModal, setActiveModal] = useState(null); 

  useEffect(() => {
    if (currentUser) fetchNetwork();
  }, [currentUser]);

  const fetchNetwork = async () => {
    try {
      const { data: followingData } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
      if (followingData && followingData.length > 0) {
        const ids = followingData.map(f => f.following_id);
        const { data: friends } = await supabase.from('profiles').select('*').in('id', ids);
        setFollowing(friends || []);
      } else {
        setFollowing([]);
      }

      const { data: followersData } = await supabase.from('follows').select('follower_id').eq('following_id', currentUser.id);
      if (followersData && followersData.length > 0) {
        const ids = followersData.map(f => f.follower_id);
        const { data: fans } = await supabase.from('profiles').select('*').in('id', ids);
        setFollowers(fans || []);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المتابعين:', error);
    }
  };

  const handleAvatarChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', currentUser.id);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      currentUser.avatar_url = publicUrl; 
      alert('تم تحديث صورة العرض بنجاح 📸');
    } catch (error) {
      alert('ما قدرنا نرفع الصورة، تأكد من حجمها!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const { data, error } = await supabase.from('profiles').select('*').ilike('name', `%${searchQuery}%`).neq('id', currentUser.id); 
    if (!error) setSearchResults(data || []);
  };

  const handleFollow = async (friendId) => {
    const isAlreadyFollowing = following.some(f => f.id === friendId);
    if (isAlreadyFollowing) {
      alert('مضاف عندك من أول!');
      return;
    }
    const { error } = await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: friendId }]);
    if (!error) {
      alert('تمت الإضافة بنجاح!');
      setSearchQuery('');
      setSearchResults([]);
      fetchNetwork(); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 px-6 pb-32 pt-4">
      
      <div className="bg-qattah-glass border border-white/10 rounded-3xl p-6 shadow-xl text-center relative overflow-hidden">
        <button onClick={onLogout} className="absolute top-4 left-4 text-gray-500 hover:text-red-400 active:scale-90 transition-all">
          <LogOut className="w-5 h-5" />
        </button>

        <div className="relative w-24 h-24 mx-auto mb-4 group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-qattah-neonGreen/50 bg-black/40 flex items-center justify-center">
            {isUploading ? <Loader2 className="w-8 h-8 text-qattah-neonGreen animate-spin" /> : avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-4xl">😎</span>}
          </div>
          <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
            <Camera className="w-5 h-5 text-qattah-neonGreen" />
          </label>
          <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isUploading} />
        </div>

        <h2 className="text-2xl font-bold text-white">{currentUser?.name}</h2>
        <p className="text-gray-500 text-xs mb-4">{currentUser?.email}</p>
        
        <div className="flex justify-center gap-12 border-t border-white/5 pt-4">
          <button onClick={() => following.length > 0 && setActiveModal('following')} className="hover:opacity-80 active:scale-95 transition-all text-center">
            <p className="text-qattah-neonGreen font-black text-2xl">{following.length}</p>
            <p className="text-gray-400 text-xs font-medium">أتابعهم 📂</p>
          </button>
          <button onClick={() => followers.length > 0 && setActiveModal('followers')} className="hover:opacity-80 active:scale-95 transition-all text-center">
            <p className="text-qattah-neonGreen font-black text-2xl">{followers.length}</p>
            <p className="text-gray-400 text-xs font-medium">يتابعوني 👥</p>
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm"><UserPlus className="w-4 h-4 text-qattah-neonGreen"/> ضيف خويك للشلة</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputField placeholder="اكتب الإسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={handleSearch} className="bg-qattah-neonGreen text-black font-extrabold px-5 rounded-2xl mt-1 h-[56px] hover:bg-qattah-neonGreen/80 active:scale-95 transition-all text-sm">ابحث</button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {searchResults.map(user => (
              <div key={user.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-xs">
                    {user.avatar_url ? <img src={user.avatar_url} alt="pic" className="w-full h-full object-cover" /> : '👤'}
                  </div>
                  <span className="text-white font-bold text-sm">{user.name}</span>
                </div>
                <button onClick={() => handleFollow(user.id)} className="bg-qattah-neonGreen/20 text-qattah-neonGreen text-xs font-bold px-3 py-2 rounded-xl hover:bg-qattah-neonGreen/30 active:scale-95 transition-all">إضافة +</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-qattah-dark border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 left-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-qattah-neonGreen" />
                {activeModal === 'following' ? 'قائمة اللي تتابعهم' : 'شلتك اللي تتابعك'}
              </h4>
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {(activeModal === 'following' ? following : followers).map((person) => {
                  const isFollowedByMe = following.some(f => f.id === person.id);
                  return (
                    <div key={person.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-xs">{person.avatar_url ? <img src={person.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : '👤'}</div>
                        <span className="text-gray-300 font-bold text-sm">{person.name}</span>
                      </div>
                      {isFollowedByMe ? (
                        <span className="text-qattah-neonGreen text-[10px] font-bold flex items-center gap-1 bg-qattah-neonGreen/10 px-2 py-1 rounded-lg"><UserCheck className="w-3 h-3" /> تتابعه</span>
                      ) : (
                        <button onClick={() => handleFollow(person.id)} className="bg-qattah-neonGreen/20 text-qattah-neonGreen text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-qattah-neonGreen/30 active:scale-95 transition-all">رد المتابعة +</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;