import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, Package, Heart, ChevronRight, 
  Plus, Search, Moon, Sun, Bell 
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('trader');

  // Clock Logic
  const hour = new Date().getHours();
  const isNightTime = hour >= 18 || hour < 6;
  
  useEffect(() => {
    async function fetchHomeData() {
      if (!user) return;
      
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('traders')
          .select('username')
          .eq('id', user.id)
          .single();
        if (profile) setUsername(profile.username);

        // Fetch recent items from the global catalog
        const { data: itemData } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        if (itemData) setItems(itemData);
      } catch (err) {
        console.error("Home load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, [user]);

  // Mascot & Greeting Logic
  let kumoAsset = "/kumo-happy.png";
  let greeting = "Welcome back,";

  if (isNightTime) {
    kumoAsset = "/kumo-sleepy.png"; 
    greeting = "Good evening,";
  } else if (items.length === 0) {
    kumoAsset = "/kumo-sad.png";
    greeting = "Welcome back,";
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex justify-between items-start mb-12 relative z-10">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-pink)] mb-1 opacity-80">
            {greeting}
          </p>
          <h1 className="text-4xl font-black tracking-tighter lowercase leading-none">
            {username}
          </h1>
        </div>

        {/* MASCOT */}
        <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
           <img 
             src={kumoAsset} 
             alt="Kumoru" 
             className="w-20 h-20 drop-shadow-[0_10px_20px_rgba(163,137,244,0.3)] group-hover:scale-110 transition-transform duration-500" 
           />
           {isNightTime && (
             <div className="absolute -top-1 -right-1 text-xs animate-bounce opacity-70 flex gap-1">
               <span>z</span><span className="delay-100">z</span><span className="delay-200">z</span>
             </div>
           )}
        </div>
      </header>

      <main className="space-y-8">
        
        {/* TIER STATUS CARD */}
        <div className="glass-panel p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent)]/20 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-3">Current Tier</span>
          <h2 className="text-4xl font-black text-[var(--accent)] mb-6 flex items-center gap-3">
            Daydream <Sparkles size={24} className="text-[var(--accent-pink)]" />
          </h2>
          <div className="w-full h-2 bg-[var(--bg-app)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-pink)] w-1/3 shadow-[0_0_10px_rgba(163,137,244,0.5)]" />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/wardrobe')} className="glass-panel p-6 flex flex-col items-center gap-4 hover:bg-[var(--bg-card)] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-sky)]">
              <Package size={24} />
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest">Wardrobe</span>
          </button>

          <button onClick={() => navigate('/catalog')} className="glass-panel p-6 flex flex-col items-center gap-4 hover:bg-[var(--bg-card)] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-pink)]">
              <Heart size={24} />
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest">Wishlist</span>
          </button>
        </div>

        {/* RECENT ORBIT SECTION */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black tracking-tight">In Orbit Now</h3>
            <button onClick={() => navigate('/catalog')} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <ChevronRight size={18} />
            </button>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="glass-panel p-4 flex flex-col items-center text-center">
                  <div className="w-full aspect-square rounded-xl bg-[var(--bg-app)] mb-3 overflow-hidden border border-[var(--border-subtle)]">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black text-[10px] tracking-tight truncate w-full">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel py-12 flex flex-col items-center justify-center border-dashed">
              <img src="/kumo-sad.png" alt="Sad" className="w-20 h-20 mb-4 opacity-50 grayscale" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-center px-8">
                The galaxy is quiet today.<br/>Go mint some new items!
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
