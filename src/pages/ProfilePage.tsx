import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  LogOut, 
  Package, 
  Heart, 
  Award, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TIER_NAMES = ["Sticker", "Charm", "Treasure", "Dream", "Legendary"];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ inventory: 0, wishlist: 0, trades: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    
    // 1. Fetch Trader Details
    const { data: trader } = await supabase
      .from('traders')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (trader) setProfile(trader);

    // 2. Fetch Collection Stats
    const [invCount, wishCount, tradeCount] = await Promise.all([
      supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('trader_id', user?.id),
      supabase.from('wishlist').select('*', { count: 'exact', head: true }).eq('trader_id', user?.id),
      supabase.from('trades').select('*', { count: 'exact', head: true }).eq('sender_id', user?.id).eq('status', 'completed')
    ]);

    setStats({
      inventory: invCount.count || 0,
      wishlist: wishCount.count || 0,
      trades: tradeCount.count || 0
    });

    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- PROFILE HEADER --- */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[50px] shadow-sm relative overflow-hidden">
        {/* Decorative Background Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7ED7C1]/10 rounded-full" />
        <div className="absolute top-20 -left-10 w-20 h-20 bg-[#FFB5C5]/10 rounded-full" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <button onClick={() => navigate('/settings')} className="p-2 bg-[#F8F9FB] rounded-full">
            <Settings size={20} className="text-[#2E2A28]" />
          </button>
          <button onClick={() => signOut()} className="p-2 bg-[#FFF5F7] rounded-full text-red-400">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 rounded-[35px] bg-[#F8F9FB] border-4 border-white shadow-xl mb-4 overflow-hidden">
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black text-[#2E2A28] mb-1">{profile?.username || 'Trader'}</h1>
          <div className="flex items-center gap-1.5 bg-[#E8F4F1] px-3 py-1 rounded-full">
            <ShieldCheck size={14} className="text-[#4E927E]" />
            <span className="text-[10px] font-black text-[#4E927E] uppercase tracking-widest">Clean Record</span>
          </div>
        </div>
      </div>

      <main className="px-6 -mt-6">
        {/* --- TIER PROGRESS CARD --- */}
        <section className="bg-gradient-to-br from-[#2E2A28] to-[#45403E] rounded-[32px] p-6 text-white shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Status</p>
              <h2 className="text-xl font-black italic tracking-tighter">
                {TIER_NAMES[profile?.tier - 1] || 'Sticker'}
              </h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Star size={24} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white/10 h-3 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(profile?.xp / 18000) * 100}%` }}
              className="h-full bg-[#7ED7C1] rounded-full shadow-[0_0_15px_rgba(126,215,193,0.6)]"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold opacity-60 uppercase">{profile?.xp} XP EARNED</span>
            <span className="text-[9px] font-black text-[#7ED7C1] uppercase tracking-widest">NEXT TIER: {TIER_NAMES[profile?.tier] || 'MAX'}</span>
          </div>
        </section>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Items', value: stats.inventory, icon: <Package size={16} />, color: 'bg-blue-50 text-blue-500' },
            { label: 'Wishes', value: stats.wishlist, icon: <Heart size={16} />, color: 'bg-pink-50 text-pink-500' },
            { label: 'Swaps', value: stats.trades, icon: <Award size={16} />, color: 'bg-purple-50 text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-[28px] border border-[#F0E6E4] text-center shadow-sm">
              <div className={cn("w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center", stat.color)}>
                {stat.icon}
              </div>
              <p className="text-lg font-black text-[#2E2A28] leading-none">{stat.value}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* --- MENU LINKS --- */}
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/wardrobe')}
            className="w-full bg-white p-5 rounded-[28px] flex items-center justify-between border border-[#F0E6E4] active:scale-[0.98] transition-transform shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><Package size={20} /></div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#2E2A28]">My Collection</p>
                <p className="text-[10px] text-gray-400 font-medium">Manage your items and padlocks</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button 
            onClick={() => navigate('/wishlist')}
            className="w-full bg-white p-5 rounded-[28px] flex items-center justify-between border border-[#F0E6E4] active:scale-[0.98] transition-transform shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-pink-50 rounded-xl text-[#FFB5C5]"><Heart size={20} /></div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#2E2A28]">Dreamy Wishlist</p>
                <p className="text-[10px] text-gray-400 font-medium">Adjust 4-heart priority</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>
      </main>
    </div>
  );
}
