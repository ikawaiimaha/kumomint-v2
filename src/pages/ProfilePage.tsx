import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Moon, Sun, Edit3, Sparkles, 
  Check, X, Camera, Info, Clock, Package 
} from 'lucide-react';

// Define what a Trader looks like
interface TraderProfile {
  username?: string;
  bio?: string;
  avatar_url?: string;
  avatar_status?: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 1. Move function ABOVE useEffect and wrap in useCallback
  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('traders').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false); // Only set if not already handled
    }
  }, [user, fetchProfileData]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0 || !user) return;
      const file = event.target.files[0];
      const fileName = `${user.id}-${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('avatars').upload(fileName, file);
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('traders').update({ avatar_url: data.publicUrl, avatar_status: 'pending' }).eq('id', user.id);
      setAvatarUrl(data.publicUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsUploading(true);
    await supabase.from('traders').update({ username, bio }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, username, bio } : null);
    setIsEditing(false);
    setIsUploading(false);
  };

  if (loading) return <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] flex items-center justify-center"><Sparkles className="animate-spin text-[#7ED7C1]" /></div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F7] dark:bg-[#1A0B2E] p-10 text-center">
      <Package size={48} className="text-gray-200 dark:text-[#2D1B4E] mb-4" />
      <button onClick={() => navigate('/login')} className="bg-[#2E2A28] dark:bg-[#A389F4] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Sign In</button>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 transition-colors bg-[#FDF8F7] dark:bg-[#1A0B2E]">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-[#2E2A28] dark:text-[#FFF9E3]">My Profile</h1>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="text-gray-400 dark:text-[#A389F4]">
            {theme === 'dark' ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} />}
          </button>
          <button onClick={() => navigate('/notifications')} className="text-gray-400 relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white dark:border-[#1A0B2E]" />
          </button>
        </div>
      </div>

      <main className="px-5 space-y-6">
        <div className="bg-white dark:bg-[#2D1B4E] rounded-[40px] p-6 shadow-sm border border-[#F0E6E4] dark:border-[#483475] relative">
          <button onClick={() => setIsEditing(!isEditing)} className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-[#1A0B2E] rounded-full text-gray-400">
            {isEditing ? <X size={18} /> : <Edit3 size={18} />}
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div onClick={() => isEditing && fileInputRef.current?.click()} className="w-20 h-20 bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-[30px] flex items-center justify-center border-2 border-white dark:border-[#483475] relative overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Profile" /> : <span className="text-3xl font-black text-gray-300 dark:text-[#483475]">{username?.charAt(0).toUpperCase() || 'K'}</span>}
              {isEditing && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Camera size={20} className="text-white" /></div>}
              {isUploading && <div className="absolute inset-0 bg-white/50 dark:bg-[#1A0B2E]/50 flex items-center justify-center"><Sparkles className="animate-spin text-[#7ED7C1] dark:text-[#A389F4]" size={20} /></div>}
            </div>
            
            <input type="file" ref={fileInputRef} onChange={uploadAvatar} className="hidden" accept="image/*" />
            
            <div className="flex-1">
              {isEditing ? (
                <input 
                  className="w-full bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-xl px-3 py-2 text-sm font-bold text-[#2E2A28] dark:text-[#E0D7FF] border-none" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-[#2E2A28] dark:text-[#FFF9E3]">{profile?.username || 'kawaii'}</h2>
                    {profile?.avatar_status === 'pending' && <Clock size={14} className="text-yellow-500" />}
                  </div>
                  <p className="text-xs font-bold text-gray-300 dark:text-[#A389F4] italic">@{profile?.username || 'user'}</p>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                className="w-full bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-2xl p-4 text-xs font-bold min-h-[80px] text-[#2E2A28] dark:text-[#E0D7FF] border-none" 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Write your bio..."
              />
              <div className="bg-[#FEF9C3] dark:bg-[#FFF9E3]/10 p-4 rounded-2xl flex gap-3 items-start border border-[#FEF08A] dark:border-[#483475]">
                <Info size={18} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-yellow-800 dark:text-[#FFF9E3]">HKDV avatars only. Manual approval required.</p>
              </div>
              <button onClick={handleSave} className="w-full bg-[#7ED7C1] dark:bg-[#A389F4] text-white py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
                <Check size={16} /> {isUploading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-400 dark:text-[#A389F4] mb-4">{profile?.bio || "No bio yet."}</p>
              <button onClick={async () => { await signOut(); navigate('/login'); }} className="w-full flex items-center justify-between pt-4 border-t border-[#F8F9FB] dark:border-[#483475] text-red-300">
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span className="text-sm font-bold">Sign Out</span>
                </div>
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-5 rounded-[32px] border shadow-sm text-center bg-white dark:bg-[#2D1B4E] border-[#F0E6E4] dark:border-[#483475]">
            <p className="text-[10px] font-bold text-gray-400 dark:text-[#A389F4] uppercase">Trades</p>
            <p className="text-2xl font-black dark:text-[#FFF9E3]">0</p>
          </div>
          <div className="p-5 rounded-[32px] border shadow-sm text-center bg-white dark:bg-[#2D1B4E] border-[#F0E6E4] dark:border-[#483475]">
            <p className="text-[10px] font-bold text-gray-400 dark:text-[#A389F4] uppercase">Mints</p>
            <p className="text-2xl font-black dark:text-[#FFF9E3]">10</p>
          </div>
        </div>

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-[#2E2A28] dark:text-[#FFF9E3]">Inventory Preview</h3>
            <button onClick={() => navigate('/wardrobe')} className="text-[10px] font-black text-[#4E927E] dark:text-[#A389F4] uppercase">Open</button>
          </div>
          <div className="rounded-[32px] border p-6 flex flex-col items-center opacity-30 bg-white dark:bg-[#2D1B4E] border-[#F0E6E4] dark:border-[#483475]">
            <Package size={32} className="text-gray-300 dark:text-[#483475] mb-2" />
            <p className="text-[8px] font-black uppercase dark:text-[#A389F4]">No Items</p>
          </div>
        </section>
      </main>
    </div>
  );
}