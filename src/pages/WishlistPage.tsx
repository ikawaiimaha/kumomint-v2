import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  ChevronLeft, 
  Heart, 
  Package, 
  Settings 
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
}

interface WishlistEntry {
  id: string;
  intensity: number;
  items: Item;
}

// Configuration for neon heart glows based on intensity
const HEART_CONFIG = {
  1: { color: "#00F3FF", glow: "0 0 12px #00F3FF" },      // Aqua Neon
  2: { color: "#9D00FF", glow: "0 0 15px #9D00FF" },      // Bright Purple
  3: { color: "#FFD600", glow: "0 0 18px #FFD600" },      // Star Gold
  4: { color: "#FF007A", glow: "0 0 30px #FF007A" },      // Intense Pink
};

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch wishlist data from Supabase
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id, intensity, items(id, name, image_url, rarity)')
        .eq('trader_id', user.id)
        .order('intensity', { ascending: false });
      
      if (error) throw error;
      if (data) setWishlist(data as unknown as WishlistEntry[]);
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchWishlist();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, fetchWishlist]);

  // Filter wishlist items based on search input
  const filteredWishlist = wishlist.filter(entry => 
    entry.items?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] pb-32 transition-colors duration-1000 ${resolvedTheme}`}>
      
      {/* Sticky Header */}
      <header className="p-6 bg-[var(--bg-card)] rounded-b-[40px] shadow-2xl sticky top-0 z-30 border-b border-[var(--border-subtle)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-[var(--bg-app)] rounded-full text-[var(--text-muted)] hover:scale-110 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tighter">My Wishlist</h1>
          </div>
          <button className="p-2.5 bg-[var(--bg-app)] rounded-full text-[var(--text-muted)]">
            <Settings size={18} />
          </button>
        </div>

        {/* Search Bar within header */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-app)] rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]/50"
          />
        </div>
      </header>

      {/* Wishlist Grid */}
      <main className="px-6 mt-8 grid grid-cols-2 gap-4">
        {filteredWishlist.length > 0 ? (
          filteredWishlist.map((entry) => {
            const config = HEART_CONFIG[entry.intensity as keyof typeof HEART_CONFIG];
            
            return (
              <div key={entry.id} className="glass-panel p-4 relative flex flex-col items-center bg-[var(--bg-card)] border-[var(--border-subtle)] group">
                
                {/* 💖 Intensity Hearts (No Text Labels) */}
                <div className="absolute top-3 right-3 flex gap-0.5">
                  {Array.from({ length: entry.intensity }).map((_, i) => (
                    <Heart 
                      key={i} 
                      size={10} 
                      fill={config?.color} 
                      stroke={config?.color} 
                      style={{ filter: `drop-shadow(${config?.glow})` }}
                      className={entry.intensity === 4 ? "animate-pulse" : ""}
                    />
                  ))}
                </div>

                {/* Item Rarity Badge */}
                <div className="absolute top-3 left-4 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  {entry.items?.rarity}
                </div>

                {/* Item Image Container */}
                <div className="aspect-square w-full bg-[#0C0F21]/40 rounded-2xl mb-4 mt-2 flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]">
                  {entry.items?.image_url ? (
                    <img 
                      src={entry.items.image_url} 
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110" 
                      alt={entry.items.name} 
                    />
                  ) : (
                    <Package size={24} className="text-[var(--border-subtle)]" />
                  )}
                </div>
                
                {/* Item Name */}
                <h3 className="text-[10px] font-black truncate w-full text-center uppercase tracking-tighter text-[var(--text-main)]">
                  {entry.items?.name}
                </h3>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="col-span-2 text-center py-32 opacity-30 flex flex-col items-center">
            <Package size={48} className="mb-4 text-[var(--text-muted)]" />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No items found in orbit</p>
          </div>
        )}
      </main>
    </div>
  );
}
