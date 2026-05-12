import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, ArrowRight, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        // Get the newest items added to the galaxy
        const { data } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (data) setRecentItems(data);
      } catch (err) {
        console.error("Error loading orbit hub:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // FIXED: Using the loading state to satisfy TypeScript
  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      
      <header className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
          Your Orbit <br/>
          <span className="text-[var(--accent)] text-lg not-italic lowercase tracking-normal font-bold opacity-80">
            {user?.email?.split('@')[0]}
          </span>
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link to="/trades" className="glass-panel p-6 bg-[var(--accent-pink)]/10 border-[var(--accent-pink)]/30">
          <Zap size={24} className="text-[var(--accent-pink)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Matches</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">Start Trading</p>
        </Link>
        <Link to="/wishlist" className="glass-panel p-6 bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/30">
          <Heart size={24} className="text-[var(--accent-blue)] mb-3" />
          <h3 className="font-black uppercase text-[10px] tracking-widest">Wishlist</h3>
          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase mt-1">View Saves</p>
        </Link>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--accent)]" /> New In Orbit
          </h2>
          <Link to="/catalog" className="text-[8px] font-black uppercase text-[var(--accent)] flex items-center gap-1">
            Explore All <ArrowRight size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recentItems.map((item) => (
            <div key={item.id} className="glass-panel p-4 bg-[#1A0B2E]/40 border-[#2D1B4E]">
              <div className="aspect-square bg-black/20 rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                <img src={item.image_url} alt="" className="w-full h-full object-contain p-2" />
              </div>
              <h4 className="text-[8px] font-black uppercase truncate">{item.name}</h4>
              <span className="text-[7px] font-bold text-[var(--accent-blue)] uppercase">{item.rarity}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
