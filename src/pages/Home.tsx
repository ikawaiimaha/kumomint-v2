import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, Heart, Zap, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard'; // Ensure this import is here

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
    <div className="pb-32 px-6 pt-12 min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]">
      {/* 🚀 Brand Identity Header */}
      <div className="flex justify-between items-center mb-10">
        <span className="brand-title text-xl tracking-tighter">KUMOMINT</span>
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20">
          <Sparkles size={14} className="text-[var(--accent)]" />
        </div>
      </div>

      <header className="mb-10">
        <h1 className="text-5xl heading-italic leading-[0.85] mb-2">
          Your <br/>
          <span className="text-[var(--text-main)] opacity-90">Orbit</span>
        </h1>
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--accent-blue)]">
          TRANSMITTING FROM SHARJAH
        </p>
      </header>

      {/* 🛰️ Action Grid */}
      <div className="grid grid-cols-2 gap-3 mb-12">
        <Link to="/notifications" className="glass-panel p-5 flex flex-col items-start gap-4 active:scale-95 transition-all">
          <Bell className="text-[var(--accent)]" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Signals</p>
            <p className="text-[7px] font-bold opacity-40 uppercase">Quiet Space</p>
          </div>
        </Link>
        <Link to="/trades" className="glass-panel p-5 flex flex-col items-start gap-4 active:scale-95 transition-all">
          <Zap className="text-[var(--accent-pink)]" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Matches</p>
            <p className="text-[7px] font-bold opacity-40 uppercase">Perfect Align</p>
          </div>
        </Link>
        <Link to="/wishlist" className="glass-panel p-5 flex flex-col items-start gap-4 active:scale-95 transition-all">
          <Heart className="text-[var(--accent-blue)]" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Wishlist</p>
            <p className="text-[7px] font-bold opacity-40 uppercase">3-Heart system</p>
          </div>
        </Link>
        <Link to="/catalog" className="glass-panel p-5 flex flex-col items-start gap-4 active:scale-95 transition-all">
          <ArrowRight className="text-[var(--text-muted)]" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Catalog</p>
            <p className="text-[7px] font-bold opacity-40 uppercase">Explore All</p>
          </div>
        </Link>
      </div>

      {/* ✨ New In Orbit Section (This uses the 'recentItems' variable) */}
      <section>
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-pink)]" /> New Arrivals
          </h2>
          <Link to="/catalog" className="text-[8px] font-black uppercase text-[var(--accent)] flex items-center gap-1">
            Browse All <ArrowRight size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recentItems.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              variant="catalog" 
            />
          ))}
        </div>
      </section>
    </div>
  );
}
