import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, 
  Settings, 
  Sun, 
  Moon, 
  Heart, 
  LogOut, 
  Calendar, 
  ChevronRight, 
  Edit2
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  image_url: string;
}

interface WishlistEntry {
  id: string;
  items: Item;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  
  const [topWishlist, setTopWishlist] = useState<WishlistEntry[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (!user) return;
      try {
        // Fetching "Dreamy" items (Intensity 4) for the Top Wishlist
        const { data: wishData } = await supabase
          .from('wishlists')
          .select('id, items(id, name, image_url)')
          .eq('trader_id', user.id)
          .eq('intensity', 4)
          .limit(5);

        // Fetching real inventory count to avoid TypeScript unused errors
        const { count } = await supabase
          .from('inventory')
          .select('*', { count: 'exact', head: true })
          .eq('trader_id', user.id);

        if (wishData) setTopWishlist(wishData as unknown as WishlistEntry[]);
        if (count !== null) setInventoryCount(count);
      } catch (err) {
        console.error("Error loading profile details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      
      {/* Header Area */}
      <header className="flex justify-between items-center mb-8 px-1">
        <h1 className="text-xl font-black uppercase tracking-tighter">My Orbit</h1>
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2.5 glass-panel bg-[#1A0B2E]/60 border-[#2D1B4E] shadow-lg hover:scale-110 transition-transform"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-[#FDEB6F]" />}
          </button>
          <button className="p-2.5 glass-panel bg-[#1A0B2E]/60 border-[#2D1B4E] shadow-lg">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Profile Card */}
      <section className="glass-panel p-8 mb-8 bg-[#1A0B2E]/80 border-[#2D1B4E] relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full border-2 border-[var(--accent)] p-1.5 shadow-[0_0_25px_rgba(163,137,244,0.4)]">
             <div className="w-full h-full bg-[#0C0F21] rounded-full flex items-center justify-center text-4xl font-black text-[var(--accent)]">
               {user?.email?.[0].toUpperCase()}
             </div>
          </div>
          <button className="absolute bottom-1 right-1 p-1.5 bg-[var(--accent)] rounded-full text-white shadow-lg border-2 border-[#1A0B2E]">
            <Edit2 size={12} />
          </button>
        </div>

        <h2 className="text-2xl font-black mb-1 italic tracking-tight">kawaiimahaa</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-black uppercase bg-[var(--accent)]/20 px-3 py-1 rounded-full text-[var(--accent)] tracking-[0.2em]">He/She</span>
        </div>
        
        <p className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-2 uppercase tracking-widest mb-6">
          <Sparkles size={14} className="text-[var(--accent)]" /> Syncing with Stars
        </p>

        <div className="bg-[#0C0F21]/60 px-4 py-2 rounded-full border border-[#2D1B4E] flex items-center gap-2">
           <Heart size={12} className="fill-[var(--accent-pink)] text-[var(--accent-pink)]" />
           <span className="text-[9px] font-black uppercase tracking-widest">Buddy: Pochacco</span>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E]">
          <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Mints</span>
          <span className="text-xl font-black italic">{inventoryCount}</span>
        </div>
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E]">
          <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Trades</span>
          <span className="text-xl font-black italic">0</span>
        </div>
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E]">
          <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Trade Vibe</span>
          <span className="text-[10px] font-black text-[var(--accent-pink)] uppercase tracking-tight">Gift Friendly</span>
        </div>
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E]">
          <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Birthday</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar size={12} className="text-[var(--accent-pink)]" />
            <span className="text-[10px] font-black tracking-widest">05/16</span>
          </div>
        </div>
      </div>

      {/* Top Wishlist Section */}
      <section className="mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 px-1">
          <Heart size={14} className="fill-[var(--accent-pink)] text-[var(--accent-pink)]" /> My Top Wishlist
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
          {topWishlist.map((entry) => (
            <div key={entry.id} className="min-w-[110px] flex flex-col items-center group">
              <div className="w-24 h-28 glass-panel bg-[#1A0B2E]/60 border-[#2D1B4E] flex items-center justify-center p-3 mb-3 shadow-xl transition-transform duration-500 group-hover:scale-105">
                <img src={entry.items.image_url} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-[8px] font-black text-center truncate w-full uppercase tracking-tighter px-1">
                {entry.items.name}
              </span>
            </div>
          ))}
          {topWishlist.length === 0 && (
            <div className="w-full py-10 glass-panel border-dashed border-[#2D1B4E] flex items-center justify-center">
               <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No Dreamies Yet</p>
            </div>
          )}
        </div>
      </section>

      <button 
        onClick={() => signOut()}
        className="w-full py-5 glass-panel bg-red-500/5 border-red-500/20 text-red-400 font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
      >
        <LogOut size={16} /> Logout <ChevronRight size={14} className="opacity-50" />
      </button>
    </div>
  );
}
