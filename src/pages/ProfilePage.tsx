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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    const { data: trader } = await supabase.from('traders').select('*').eq('id', user?.id).single();
    if (trader) setProfile(trader);

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
    <div className={`min-h-screen pb-24 transition-colors ${isDark ? 'bg-[#2E2A28] text-white' : 'bg-[#FDF8F7]'}`}>
      {/* --- TOP BAR --- */}
      <div className="p-6 flex justify-between items-center">
        <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>My Profile</h1>
        <div className="flex gap-4">
          <button onClick={() => setIsDark(!isDark)} className="text-gray-400 active:scale-90 transition-transform">
            <Moon size={22} className={isDark ? 'fill-yellow-400 text-yellow-400' : ''} />
          </button>
          <button onClick={() => navigate('/notifications')} className="text-gray-400 active:scale-90 transition-transform relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      <main className="px-5 space-y-6">
        <div className={`${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'} rounded-[40px] p-6 shadow-sm border relative`}>
          <button 
            onClick={() => navigate('/creator')} 
            className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 active:scale-90 transition-transform"
          >
            <Edit3 size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-[#F8F9FB] rounded-[30px] flex items-center justify-center text-3xl font-black text-gray-300 border-2 border-white shadow-inner relative">
              {profile?.username?.charAt(0).toUpperCase() || 'K'}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#A389F4] rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>{profile?.username || 'kawaii'}</h2>
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

          <button onClick={handleLogout} className="w-full flex items-center justify-between pt-4 group border-t border-[#F8F9FB]">
            <div className="flex items-center gap-3 text-red-300">
              <LogOut size={18} />
              <span className="text-sm font-bold">Sign Out</span>
            </div>
            <Sparkles size={16} className="text-red-100" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Trades', val: stats.trades },
            { label: 'Completed Trades', val: stats.completed },
            { label: 'Login Streak', val: stats.streak },
            { label: 'Dream Mints', val: stats.mints },
          ].map((s, i) => (
            <div key={i} className={`${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'} p-5 rounded-[32px] border shadow-sm`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className={`font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>Inventory Preview</h3>
            <button onClick={() => navigate('/wardrobe')} className="text-[10px] font-black text-[#4E927E] uppercase tracking-widest">Open Wardrobe</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <div className={`min-w-[140px] aspect-square rounded-[32px] border ${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'} p-2 flex flex-col items-center justify-center opacity-30`}>
              <Package size={32} className="text-gray-300 mb-2" />
              <p className="text-[8px] font-black uppercase">No Items</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className={`font-black ${isDark ? 'text-white' : 'text-[#2E2A28]'}`}>Wishlist Preview</h3>
            <button onClick={() => navigate('/wishlist')} className="text-[10px] font-black text-[#4E927E] uppercase tracking-widest">Manage Wishlist</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <div className={`min-w-[140px] aspect-square rounded-[32px] border ${isDark ? 'bg-[#3E3A38] border-none' : 'bg-white border-[#F0E6E4]'} p-2 flex flex-col items-center justify-center opacity-30`}>
              <Heart size={32} className="text-gray-300 mb-2" />
              <p className="text-[8px] font-black uppercase">No Wishes</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
