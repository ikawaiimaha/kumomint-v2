import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sparkles, 
  ChevronLeft, 
  Heart, 
  Package, 
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';

interface PublicProfile {
  id: string;
  username: string;
  buddy: string;
  vibe: string;
}

interface WishlistEntry {
  id: string;
  intensity: number;
  items: {
    id: string;
    name: string;
    image_url: string;
    rarity: string;
  };
}

const HEART_CONFIG = {
  1: { color: "#00F3FF", glow: "0 0 12px #00F3FF" },
  2: { color: "#9D00FF", glow: "0 0 15px #9D00FF" },
  3: { color: "#FFD600", glow: "0 0 18px #FFD600" },
  4: { color: "#FF007A", glow: "0 0 30px #FF007A" },
};

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicData() {
      if (!id) return;
      try {
        // 1. Fetch Basic Profile Info
        const { data: profileData } = await supabase
          .from('traders')
          .select('*')
          .eq('id', id)
          .single();

        // 2. Fetch their Wishlist
        const { data: wishData } = await supabase
          .from('wishlists')
          .select('id, intensity, items(id, name, image_url, rarity)')
          .eq('trader_id', id)
          .order('intensity', { ascending: false });

        // 3. Fetch their Inventory Count
        const { count } = await supabase
          .from('inventory')
          .select('*', { count: 'exact', head: true })
          .eq('trader_id', id);

        if (profileData) setProfile(profileData);
        if (wishData) setWishlist(wishData as any);
        if (count !== null) setInventoryCount(count);
      } catch (err) {
        console.error("Error loading public orbit:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      
      {/* Navigation Header */}
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 glass-panel bg-[#1A0B2E]/60 border-[#2D1B4E] text-[var(--text-muted)]"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Orbital View</h1>
      </header>

      {/* User Hero Card */}
      <section className="glass-panel p-8 mb-8 bg-[#1A0B2E]/80 border-[#2D1B4E] flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="w-24 h-24 rounded-full border-2 border-[var(--accent-blue)] p-1.5 mb-4 shadow-[0_0_20px_rgba(128,192,228,0.3)]">
           <div className="w-full h-full bg-[#0C0F21] rounded-full flex items-center justify-center text-3xl font-black text-[var(--accent-blue)]">
             {profile?.username?.[0]?.toUpperCase() || "?"}
           </div>
        </div>

        <h2 className="text-2xl font-black mb-1 italic tracking-tight">{profile?.username || "Space Traveler"}</h2>
        <div className="flex items-center gap-1 mb-4 opacity-60">
          <ShieldCheck size={12} className="text-[var(--accent-blue)]" />
          <span className="text-[8px] font-black uppercase tracking-widest">Verified Trader</span>
        </div>

        <div className="bg-[#0C0F21]/60 px-4 py-2 rounded-full border border-[#2D1B4E] flex items-center gap-2 mb-6">
           <Heart size={12} className="fill-[var(--accent-pink)] text-[var(--accent-pink)]" />
           <span className="text-[9px] font-black uppercase tracking-widest">Buddy: {profile?.buddy || "Pochacco"}</span>
        </div>

        <button 
          onClick={() => navigate(`/propose-trade/${id}`)}
          className="w-full py-4 bg-[var(--accent)] text-[var(--bg-app)] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,137,244,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeftRight size={16} /> Propose Trade
        </button>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E]">
          <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Items Owned</span>
          <span className="text-xl font-black italic">{inventoryCount}</span>
        </div>
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E]">
          <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Trade Vibe</span>
          <span className="text-[10px] font-black text-[var(--accent-pink)] uppercase tracking-tight">{profile?.vibe || "Friendly"}</span>
        </div>
      </div>

      {/* Public Wishlist Grid */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 px-1">
          <Package size={14} className="text-[var(--accent)]" /> Current Wishlist
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {wishlist.map((entry) => {
            const config = HEART_CONFIG[entry.intensity as keyof typeof HEART_CONFIG];
            return (
              <div key={entry.id} className="glass-panel p-4 bg-[#1A0B2E]/40 border-[#2D1B4E] relative flex flex-col items-center">
                <div className="absolute top-3 right-3 flex gap-0.5">
                  {Array.from({ length: entry.intensity }).map((_, i) => (
                    <Heart 
                      key={i} 
                      size={10} 
                      fill={config?.color} 
                      stroke={config?.color} 
                      style={{ filter: `drop-shadow(${config?.glow})` }}
                    />
                  ))}
                </div>
                
                <div className="w-full aspect-square bg-[#0C0F21]/40 rounded-xl mb-3 mt-4 flex items-center justify-center border border-[#2D1B4E]">
                  <img src={entry.items.image_url} className="w-full h-full object-contain p-2" alt="" />
                </div>
                
                <h4 className="text-[9px] font-black uppercase text-center truncate w-full">{entry.items.name}</h4>
                <span className="text-[7px] font-bold text-[var(--accent-blue)] uppercase mt-1">{entry.items.rarity}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
