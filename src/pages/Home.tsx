import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, ArrowRight, Heart, Zap, Bell, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        const { data: items } = await supabase.from('items').select('*').order('created_at', { ascending: false }).limit(4);
        const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
        if (items) setRecentItems(items);
        if (count !== null) setNotifCount(count);
      } catch (err) {
        console.error("Dashboard sync failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
            Your Orbit <br/>
            <span className="text-[var(--accent)] text-lg not-italic lowercase tracking-normal font-bold opacity-80">
              {user?.email?.split('@')[0] || "Voyager"}
            </span>
          </h1>
          <div className="flex items-center gap-1.5 mt-2 opacity-50">
            <ShieldCheck size={12} className="text-[var(--accent-blue)]" />
            <span className="text-[8px] font-black uppercase tracking-widest">Active Voyager</span>
          </div>
        </div>
        <div className="p-3 glass-panel bg-[var(--bg-card)] border-[var(--border-subtle)]">
          <Sparkles size={18} className="text-[var(--accent)] animate-pulse" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link to="/notifications" className="relative glass-panel p-6 bg-[var(--accent)]/10 border-[var(--accent)]/30 group active:scale-95 transition-all">
          {notifCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-pink)] rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_15px_rgba(255,0,122,0.5)] border-2 border-[var(--bg-app)] animate-bounce">
              {notifCount}
            </div>
          )}
          <Bell size={24} className={`mb-3 transition-colors ${notifCount > 0 ? 'text-[var(--accent-pink)]' : 'text-[var(--accent)]'}`} />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Signals</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">
            {notifCount > 0 ? `${notifCount} New Transmissions` : 'Galaxy is Quiet'}
          </p>
        </Link>

        <Link to="/trades" className="glass-panel p-6 bg-[var(--accent-pink)]/10 border-[var(--accent-pink)]/30 group active:scale-95 transition-all">
          <Zap size={24} className="text-[var(--accent-pink)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Matches</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">Mutual Trades</p>
        </Link>

        <Link to="/wishlist" className="glass-panel p-6 bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/30 group active:scale-95 transition-all">
          <Heart size={24} className="text-[var(--accent-blue)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Wishlist</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">Saved Dreamies</p>
        </Link>

        <Link to="/catalog" className="glass-panel p-6 bg-[var(--bg-card)] border-[var(--border-subtle)] group active:scale-95 transition-all">
          <ArrowRight size={24} className="text-[var(--text-main)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Explore</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">Full Catalog</p>
        </Link>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--accent)]" /> New Arrivals
          </h2>
          <Link to="/catalog" className="text-[8px] font-black uppercase text-[var(--accent)] flex items-center gap-1">
            Browse All <ArrowRight size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recentItems.map((item) => (
            <div key={item.id} className="glass-panel p-4 bg-[#1A0B2E]/40 border-[#2D1B4E] hover:border-[var(--accent-blue)]/50 transition-all group">
              <div className="aspect-square bg-[#0C0F21] rounded-2xl mb-3 flex items-center justify-center overflow-hidden border border-[#2D1B4E]">
                <img src={item.image_url} alt="" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="text-[8px] font-black uppercase truncate text-[var(--text-main)]">{item.name}</h4>
              <span className="text-[7px] font-bold text-[var(--accent-blue)] uppercase">{item.rarity}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
