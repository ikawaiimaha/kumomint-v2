import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Zap, 
  Bell, 
  ShieldCheck 
} from 'lucide-react';
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
        const { data: items } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        if (items) setRecentItems(items);
        if (count !== null) setNotifCount(count);
      } catch (err) {
        console.error("Orbit sync failed:", err);
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
      
      {/* 🌌 Cosmic Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
          Your <span className="text-[var(--accent)]">Orbit</span>
        </h1>
        <div className="flex items-center gap-2 mt-2 opacity-50">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Active Voyager</span>
        </div>
      </header>

      {/* 🛰️ Signals & Transmissions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        
        <Link to="/notifications" className="relative glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent group active:scale-95 transition-all">
          {notifCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-pink)] rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_15px_rgba(255,0,122,0.5)] border-2 border-[var(--bg-app)]">
              {notifCount}
            </div>
          )}
          <Bell size={24} className="text-[var(--accent)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Signals</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">
            {notifCount > 0 ? `${notifCount} New Transmissions` : 'Galaxy is Quiet'}
          </p>
        </Link>

        <Link to="/trades" className="glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent group active:scale-95 transition-all">
          <Zap size={24} className="text-[var(--accent-pink)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Matches</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">Perfect Alignments</p>
        </Link>

        <Link to="/wishlist" className="glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent group active:scale-95 transition-all">
          <Heart size={24} className="text-[var(--accent-blue)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Wishlist</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">3-Heart Dreamies</p>
        </Link>

        <Link to="/catalog" className="glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent group active:scale-95 transition-all">
          <ArrowRight size={24} className="text-[var(--text-main)] mb-3 opacity-40" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Explore</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">Full Catalog</p>
        </Link>
      </div>

      {/* ✨ New In Orbit Section */}
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
            <div key={item.id} className="glass-panel p-4 bg-white/5 border-white/5 hover:border-[var(--accent)]/30 transition-all group">
              <div className="aspect-square bg-black/20 rounded-2xl mb-3 flex items-center justify-center overflow-hidden border border-white/5">
                <img 
                  src={item.image_url} 
                  alt="" 
                  className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <h4 className="text-[8px] font-black uppercase truncate text-[var(--text-main)] mb-1">{item.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-[7px] font-bold text-[var(--accent-blue)] uppercase tracking-widest opacity-60">{item.rarity}</span>
                <ShieldCheck size={10} className="text-[var(--accent)] opacity-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
