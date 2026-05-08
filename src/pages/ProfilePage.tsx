import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Bell, 
  Moon, 
  Edit3, 
  ShieldAlert,
  Heart,
  Sparkles,
  Package,
  Check,
  X,
  Camera
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    const { data: trader } = await supabase.from('traders').select('*').eq('id', user?.id).single();
    if (trader) {
      setProfile(trader);
      setUsername(trader.username || '');
      setBio(trader.bio || '');
      setAvatarUrl(trader.avatar_url || '');
    }
    setLoading(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Update Database immediately so it saves
      const { error: updateError } = await supabase
        .from('traders')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert("Avatar updated!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setUploading(true);
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
    setUploading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1]" />
    </div>
  );

  return (
    <div className={`min-h-screen pb-24 transition-colors ${isDark ? 'bg-[#2E2A28] text-white' : 'bg-[#FDF8F7]'}`}>
      <div className="p-6 flex justify-between items-center">
        <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>My Profile</h1>
        <div className="flex gap-4">
          <button onClick={() => setIsDark(!isDark)} className="text-gray-400"><Moon size={22} /></button>
          <button onClick={() => navigate('/notifications')} className="text-gray-400"><Bell size={22} /></button>
        </div>
      </div>

      <main className="px-5 space-y-6">
        <div className={`${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'} rounded-[40px] p-6 shadow-sm border relative`}>
          
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400"
          >
            {isEditing ? <X size={18} /> : <Edit3 size={18} />}
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            {/* --- AVATAR UPLOAD SECTION --- */}
            <div 
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`w-20 h-20 bg-[#F8F9FB] rounded-[30px] flex items-center justify-center border-2 border-white shadow-inner relative overflow-hidden ${isEditing ? 'cursor-pointer group' : ''}`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span className="text-3xl font-black text-gray-300">{username?.charAt(0).toUpperCase()}</span>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              )}
              {uploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Sparkles className="animate-spin text-[#7ED7C1]" size={20} /></div>}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={uploadAvatar} 
              className="hidden" 
              accept="image/*" 
            />
            
            <div className="flex-1">
              {isEditing ? (
                <input 
                  className="w-full bg-[#F8F9FB] border-none rounded-xl px-3 py-2 text-sm font-bold"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <>
                  <h2 className="text-2xl font-black">{profile?.username || 'kawaii'}</h2>
                  <p className="text-xs font-bold text-gray-300 italic">@{profile?.username || 'kawaii'}</p>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            {isEditing ? (
              <textarea 
                className="w-full bg-[#F8F9FB] border-none rounded-2xl px-4 py-3 text-xs font-bold min-h-[80px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            ) : (
              <p className="text-xs font-bold text-gray-400 leading-relaxed">{profile?.bio || "No bio yet."}</p>
            )}
          </div>

          {isEditing ? (
            <button onClick={handleSave} className="w-full bg-[#7ED7C1] text-white py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
              <Check size={16} /> Save Profile
            </button>
          ) : (
            <button onClick={handleLogout} className="w-full flex items-center justify-between pt-4 border-t border-[#F8F9FB]">
              <div className="flex items-center gap-3 text-red-300"><LogOut size={18} /><span className="text-sm font-bold">Sign Out</span></div>
            </button>
          )}
        </div>

        {!isEditing && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Trades</p>
              <p className="text-2xl font-black text-[#2E2A28]">0</p>
            </div>
            <div className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dream Mints</p>
              <p className="text-2xl font-black text-[#2E2A28]">10</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
