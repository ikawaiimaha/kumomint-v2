import { useState, useEffect } from 'react';
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
  Settings,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('traders')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- TOP BAR --- */}
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-[#2E2A28]">My Profile</h1>
        <div className="flex gap-4 text-gray-400">
          <Moon size={22} />
          <Bell size={22} />
        </div>
      </div>

      <main className="px-5 space-y-6">
        {/* --- MAIN PROFILE CARD --- */}
        <div className="bg-white rounded-[40px] p-6 shadow-sm border border-[#F0E6E4] relative">
          <button className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400">
            <Edit3 size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-[#F8F9FB] rounded-[30px] flex items-center justify-center text-3xl font-black text-gray-300 border-2 border-white shadow-inner relative">
              {profile?.username?.charAt(0).toUpperCase() || 'K'}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#A389F4] rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#2E2A28]">{profile?.username || 'kawaii'}</h2>
              <p className="text-xs font-bold text-gray-300 italic">@{profile?.username || 'kawaii'}</p>
            </div>
          </div>

          {/* Social Stats */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-[#F8F9FB] px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-400">
              <ShieldAlert size={14} /> Not Verified
            </div>
            <div className="flex items-center gap-1.5 bg-[#F8F9FB] px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-400">
              <Heart size={14} className="fill-red-200 text-red-300" /> 0 likes
            </div>
          </div>

          <p className="text-xs text-gray-400 font-medium leading-relaxed border-b border-[#F8F9FB] pb-4">
            {profile?.bio || "Add a short bio so other traders know your style."}
          </p>

          {/* --- LOGOUT SECTION (BOTTOM OF CARD) --- */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between pt-4 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-xl text-red-300 group-hover:bg-red-100 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-bold text-red-300">Sign Out</span>
            </div>
            <Sparkles size={16} className="text-red-100" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Trades', val: 0 },
            { label: 'Completed Trades', val: 0 },
            { label: 'Login Streak', val: 1 },
            { label: 'Dream Mints', val: 10 },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
              <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">{s.label}</p>
              <p className="text-2xl font-black text-[#2E2A28]">{s.val}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
