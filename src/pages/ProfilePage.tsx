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
  Sparkles,
  Package,
  Clock
} from 'lucide-react';

interface ProfileStats {
  trades: number;
  completed: number;
  streak: number;
  mints: number;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({ trades: 0, completed: 0, streak: 1, mints: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    // 1. Fetch Profile
    const { data: trader } = await supabase.from('traders').select('*').eq('id', user?.id).single();
    if (trader) setProfile(trader);

    // 2. Fetch Real Stats (Example counts)
    const { count: totalTrades } = await supabase.from('trades').select('*', { count: 'exact', head: true }).eq('sender_id', user?.id);
    const { count: completedTrades } = await supabase.from('trades').select('*', { count: 'exact', head: true }).eq('sender_id', user?.id).eq('status', 'completed');
    
    setStats(prev => ({
      ...prev,
      trades: totalTrades || 0,
      completed: completedTrades || 0
    }));

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center">
        <Sparkles className="animate-spin text-[#7ED7C1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- TOP BAR --- */}
      <div className="p-6 flex justify-between items-center text-gray-400">
        <h1 className="text-xl font-black text-[#2E2A28]">My Profile</h1>
        <div className="flex gap-4">
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

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between pt-4 group"
          >
            <div className="flex items-center gap-3 text-red-300">
              <LogOut size={18} />
              <span className="text-sm font-bold">Sign Out</span>
            </div>
            <Sparkles size={16} className="text-red-100" />
          </button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Total Trades</p>
            <p className="text-2xl font-black text-[#2E2A28]">{stats.trades}</p>
          </div>
          <div className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Completed Trades</p>
            <p className="text-2xl font-black text-[#2E2A28]">{stats.completed}</p>
          </div>
          <div className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Login Streak</p>
            <p className="text-2xl font-black text-[#2E2A28]">{stats.streak}</p>
          </div>
          <div className="bg-white p-5 rounded-[32px] border border-[#F0E6E4] shadow-sm">
            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Dream Mints</p>
            <p className="text-2xl font-black text-[#2E2A28]">{stats.mints}</p>
          </div>
        </div>

        {/* --- INVENTORY PREVIEW --- */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-[#2E2A28]">Inventory Preview</h3>
            <button onClick={() => navigate('/wardrobe')} className="text-[10px] font-black text-[#4E927E] uppercase tracking-widest">Open Wardrobe</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[140px] aspect-square bg-white rounded-[32px] border border-[#F0E6E4] p-2 flex flex-col shadow-sm">
                <div className="flex-1 bg-gradient-to-br from-[#F5EAFF] to-[#E5D4FF] rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <Package size={32} className="text-white opacity-40" />
                  <div className="absolute top-2 left-2 bg-white/40 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">SUPER</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- WISHLIST PREVIEW --- */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-[#2E2A28]">Wishlist Preview</h3>
            <button onClick={() => navigate('/wishlist')} className="text-[10px] font-black text-[#4E927E] uppercase tracking-widest">Manage Wishlist</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[1, 2].map((i) => (
              <div key={i} className="min-w-[140px] aspect-square bg-white rounded-[32px] border border-[#F0E6E4] p-2 flex flex-col shadow-sm">
                <div className="flex-1 bg-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                   <Clock size={24} className="text-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
