import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, Heart, Zap, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const { data } = await supabase
        .from('items')
        .select('*')
        .limit(4)
        .order('created_at', { ascending: false });
      
      if (data) setRecentItems(data);
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className="pb-32 px-6 pt-16 min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]">
      
      {/* 🌌 Cosmic Header */}
      <header className="mb-10">
        <h1 className="text-4xl heading-italic leading-none">
          Your <span className="text-[var(--accent)]">Orbit</span>
        </h1>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 italic">
          Status: Active Voyager
        </p>
      </header>

      {/* 🛰️ Action Grid (All 4 cards restored to use all icons) */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        
        <Link to="/notifications" className="glass-panel p-6 flex flex-col items-center text-center group active:scale-95 transition-all">
          <Bell className="text-[var(--accent)] mb-2" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Signals</span>
        </Link>

        <Link to="/trades" className="glass-panel p-6 flex flex-col items-center text-center group active:scale-95 transition-all">
          <Zap className="text-[var(--accent-pink)] mb-2" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Matches</span>
        </Link>

        <Link to="/wishlist" className="glass-panel p-6 flex flex-col items-center text-center group active:scale-95 transition-all">
          <Heart className="text-[var(--accent-blue)] mb-2" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Wishlist</span>
        </Link>

        <Link to="/catalog" className="glass-panel p-6 flex flex-col items-center text-center group active:scale-95 transition-all">
          <ArrowRight className="text-[var(--text-muted)] mb-2 opacity-50" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
        </Link>

      </div>

      {/* ✨ New In Orbit Section */}
      <section>
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--accent)]" /> New Arrivals
          </h2>
          <Link to="/catalog" className="text-[8px] font-black uppercase text-[var(--accent)] flex items-center gap-1">
            Browse All <ArrowRight size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recentItems.map(item => (
            <div key={item.id} className="glass-panel p-4 flex flex-col items-center group">
              <div className="w-full aspect-square bg-black/5 dark:bg-white/5 rounded-2xl mb-3 flex items-center justify-center border border-white/5 overflow-hidden">
                <img 
                  src={item.image_url} 
                  className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform duration-500" 
                  alt="" 
                />
              </div>
              <h4 className="text-[8px] font-black uppercase truncate w-full text-center">{item.name}</h4>
              <p className="text-[6px] font-bold opacity-30 mt-1 uppercase tracking-widest">{item.rarity}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
