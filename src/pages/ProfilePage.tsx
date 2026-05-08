import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Moon, Edit3, Sparkles, 
  Check, X, Camera, Info, Clock, Package 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user) setLoading(false);
    }, 3000);

    if (user) {
      fetchProfileData();
    }
    
    return () => clearTimeout(timeout);
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data: trader } = await supabase.from('traders').select('*').eq('id', user?.id).single();
      if (trader) {
        setProfile(trader);
        setUsername(trader.username || '');
        setBio(trader.bio || '');
        setAvatarUrl(trader.avatar_url || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${user?.id}-${Math.random()}.${file.name.split('.').pop()}`;
      
      await supabase.storage.from('avatars').upload(fileName, file);
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      await supabase.from('traders').update({ avatar_url: data.publicUrl, avatar_status: 'pending' }).eq('id', user?.id);
      setAvatarUrl(data.publicUrl);
      setProfile((prev: any) => ({ ...prev, avatar_status: 'pending' }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- THE FIXED HANDLE SAVE FUNCTION ---
  const handleSave = async () => {
    try {
      setIsUploading(true);
      const { error } = await supabase
        .from('traders')
        .update({ username, bio })
        .eq('id', user?.id);

      if (error) {
        alert(error.message);
      } else {
        setProfile({ ...profile, username, bio, avatar_url: avatarUrl });
        setIsEditing(false);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1]" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#FDF8F7]">
        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-sm mb-6">
           <Package size={32} className="text-[#7ED7C1]" />
        </div>
        <h2 className="font-black text-xl mb-4 text-[#2E2A28]">Not Logged In</h2>
        <button onClick={() => navigate('/login')} className="bg-[#2E2A28] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Go to Login</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 transition-colors ${isDark ? 'bg-[#2E2A28] text-white' : 'bg-[#FDF8F7]'}`}>
      <div className="p-6 flex justify-between items-center">
        <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>My Profile</h1>
        <div className="flex gap-4">
          <button onClick={() => setIsDark(!isDark)} className="text-gray-400">
            <Moon size={22} className={isDark ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          <button onClick={() => navigate('/notifications')} className="text-gray-400 relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      <main className="px-5 space-y-6">
        <div className={`${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'} rounded-[40px] p-6 shadow-sm border relative`}>
          <button onClick={() => setIsEditing(!isEditing)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 active:scale-90 transition-transform">
            {isEditing ? <X size={18} /> : <Edit3 size={18} />}
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div 
              onClick={() => isEditing && fileInputRef.current?.click()} 
              className={`w-20 h-20 bg-[#F8F9FB] rounded-[30px] flex items-center justify-center border-2 border-white relative overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
            >
              {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl font-black text-gray-300">{username?.charAt(0).toUpperCase() || 'K'}</span>}
              {isEditing && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Camera size={20} className="text-white" /></div>}
              {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Sparkles className="animate-spin text-[#7ED7C1]" size={20} /></div>}
            </div>
            
            <input type="file" ref={fileInputRef} onChange={uploadAvatar} className="hidden" accept="image/*" />
            
            <div className="flex-1">
              {isEditing ? (
                <input 
                  className="w-full bg-[#F8F9FB] rounded-xl px-3 py-2 text-sm font-bold text-[#2E2A28]" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black">{profile?.username || 'kawaii'}</h2>
                    {profile?.avatar_status === 'pending' && <Clock size={14} className="text-yellow-500" />}
                  </div>
                  <p className="text-xs font-bold text-gray-300 italic">@{profile?.username || 'user'}</p>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                className="w-full bg-[#F8F9FB] rounded-2xl p-4 text-xs font-bold min-h-[80px] text-gray-500" 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Write your bio..."
              />
              <div className="bg-[#FEF9C3] p-4 rounded-2xl flex gap-3">
                <Info size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-yellow-800">Only HKDV avatars are allowed. Manual approval required.</p>
              </div>
              <button onClick={handleSave} className="w-full bg-[#7ED7C1] text-white py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
                <Check size={16} /> {isUploading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-400 mb-4">{profile?.bio || "No bio yet."}</p>
              <button onClick={handleLogout} className="w-full flex items-center justify-between pt-4 border-t border-[#F8F9FB] text-red-300 active:scale-95 transition-transform">
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span className="text-sm font-bold">Sign Out</span>
                </div>
              </button>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-5 rounded-[32px] border shadow-sm text-center ${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'}`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Trades</p>
              <p className="text-2xl font-black">0</p>
            </div>
            <div className={`p-5 rounded-[32px] border shadow-sm text-center ${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'}`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Mints</p>
              <p className="text-2xl font-black">10</p>
            </div>
          </div>
        )}

        {!isEditing && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>Inventory Preview</h3>
              <button onClick={() => navigate('/wardrobe')} className="text-[10px] font-black text-[#4E927E] uppercase">Open</button>
            </div>
            <div className={`rounded-[32px] border p-6 flex flex-col items-center opacity-30 ${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'}`}>
              <Package size={32} className="text-gray-300 mb-2" />
              <p className="text-[8px] font-black">No Items</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
