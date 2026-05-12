
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
      const { data } = await supabase.from('items').select('*').limit(4).order('created_at', { ascending: false });
      if (data) setRecentItems(data);
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Sparkles className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="pb-32 px-6 pt-16">
      <header className="mb-10">
        <h1 className="text-4xl heading-italic">Your <span className="text-[var(--accent)]">Orbit</span></h1>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Status: Active Voyager</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link to="/notifications" className="glass-panel p-6 flex flex-col items-center text-center">
          <Bell className="text-[var(--accent)] mb-2" size={24} />
          <span className="text-[10px] font-black uppercase">Signals</span>
        </Link>
        <Link to="/trades" className="glass-panel p-6 flex flex-col items-center text-center">
          <Zap className="text-[var(--accent-pink)] mb-2" size={24} />
          <span className="text-[10px] font-black uppercase">Matches</span>
        </Link>
      </div>

      <section>
        <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent)]" /> New Arrivals
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {recentItems.map(item => (
            <div key={item.id} className="glass-panel p-4 flex flex-col items-center">
              <div className="w-full aspect-square bg-black/5 dark:bg-white/5 rounded-2xl mb-3 flex items-center justify-center">
                <img src={item.image_url} className="w-[80%] h-[80%] object-contain" alt="" />
              </div>
              <h4 className="text-[8px] font-black uppercase truncate w-full text-center">{item.name}</h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
