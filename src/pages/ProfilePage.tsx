import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Bell, 
  Moon, 
  Edit3, 
  ChevronRight,
  ShieldAlert,
  Heart,
  Package,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- TOP BAR --- */}
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-[#2E2A28]">My Profile</h1>
        <div className="flex gap-4">
          <button className="text-gray-400"><Moon size={22} /></button>
          <button className="text-gray-400 relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white" />
          </button>
          {/* --- ADDED LOGOUT BUTTON --- */}
          <button 
            onClick={handleLogout}
            className="text-red-300 hover:text-red-500 transition-colors"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <main className="px-5 space-y-6">
        {/* --- USER CARD --- */}
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
              <div className="flex gap-2 mt-2">
                <span className="bg-[#EBE5FF] text-[#A389F4] text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <Moon size={10} className="fill-[#A389F4]" /> Dreaming
                </span>
                <span className="bg-[#F8F9FB] text-gray-300 text-[10px] font-black px-3 py-1 rounded-full">
                  Tickets + Gifts
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-[#F8F9FB] px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-400">
              <ShieldAlert size={14} /> Not Verified
            </div>
            <div className="flex items-center gap-1.5 bg-[#F8F9FB] px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-400">
              <Heart size={14} className="fill-red-200 text-red-300" /> 0 likes
            </div>
          </div>

          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            {profile?.bio || "Add a short bio so other traders know your style."}
          </p>
          <p className="text-[10px] text-gray-300 font-bold uppercase mt-4 tracking-widest">
            Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* --- STATS GRID --- */}
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

        {/* --- INVENTORY PREVIEW --- */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-[#2E2A28]">Inventory Preview</h3>
            <button onClick={() => navigate('/wardrobe')} className="text-[10px] font-bold text-[#4E927E] uppercase tracking-widest">Open Wardrobe</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="min-w-[140px] aspect-square bg-white rounded-[32px] border border-[#F0E6E4] p-2 flex flex-col shadow-sm">
                <div className="flex-1 bg-gradient-to-br from-[#F5EAFF] to-[#E5D4FF] rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <Package size={32} className="text-white opacity-40" />
                  <div className="absolute top-2 left-2 bg-white/40 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">SUPER</div>
                  <div className="absolute bottom-2 left-2 bg-black/10 text-white text-[8px] font-black px-2 py-1 rounded-full">x9</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- LOG OUT FOOTER (Optional Alternative) --- */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 text-xs font-black text-red-300 uppercase tracking-[0.2em] border-t border-[#F0E6E4] mt-8 opacity-50 hover:opacity-100 transition-opacity"
        >
          Sign Out of Kumomint
        </button>
      </main>
    </div>
  );
}
