import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Package, Heart, ChevronRight, Sparkles, LogIn } from 'lucide-react';

const TIER_NAMES = ["Daydream", "Reverie", "Lucid", "Ethereal", "Celestial"];

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [xp] = useState(25); 

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]"><Sparkles className="animate-spin text-[var(--accent)]" /></div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 glass-panel flex items-center justify-center mb-8 shadow-xl">
        <Package size={32} className="text-[var(--accent)]" />
      </div>
      <h2 className="text-2xl font-black mb-2">Kumomint</h2>
      <p className="text-xs font-bold opacity-50 mb-10">Building your collection among the stars.</p>
      <button onClick={() => navigate('/login')} className="w-full py-4 moonie-btn text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
        <LogIn size={16} /> Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black tracking-tighter">KUMOMINT</h1>
        <button onClick={() => navigate('/notifications')} className="w-12 h-12 glass-panel flex items-center justify-center relative text-gray-400">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-pink-400 rounded-full border-2 border-[var(--bg-app)]"></span>
        </button>
      </header>

      {/* Hero Card */}
      <div className="glass-panel p-8 relative overflow-hidden mb-8 border-none shadow-2xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)] opacity-20 blur-3xl"></div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-2">Current Tier</h2>
        <p className="text-3xl font-black mb-6">{TIER_NAMES[0]}</p>
        <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] transition-all duration-1000 shadow-[0_0_10px_var(--accent-glow)]" style={{ width: `${xp}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button onClick={() => navigate('/wardrobe')} className="glass-panel p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl"><Package size={24} className="text-blue-400" /></div>
          <span className="font-black text-[10px] uppercase tracking-widest">Wardrobe</span>
        </button>
        <button onClick={() => navigate('/wishlist')} className="glass-panel p-6 flex flex-col items-center gap-4 active:scale-95 transition-transform">
          <div className="p-3 bg-pink-50 dark:bg-pink-900/30 rounded-2xl"><Heart size={24} className="text-pink-400" /></div>
          <span className="font-black text-[10px] uppercase tracking-widest">Wishlist</span>
        </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="font-black text-lg">In Orbit Now</h3>
        <ChevronRight size={20} className="opacity-20" />
      </div>
    </div>
  );
}
