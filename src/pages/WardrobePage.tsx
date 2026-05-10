import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type InventoryItem = {
  id: string;
  item_id: string;
  items: {
    name: string;
    rarity: string;
    image_url: string;
  };
};

export default function WardrobePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch items owned by the user from the user_items table
      const { data, error } = await supabase
        .from('user_items')
        .select(`
          id,
          item_id,
          items (
            name,
            rarity,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setInventory((data as unknown as InventoryItem[]) || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Visual Helpers for HKDV Rarities
  const getRarityStyles = (rarity: string) => {
    if (resolvedTheme === 'light') return ''; 
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'shadow-[0_0_24px_rgba(232,107,179,0.4)] border-[#FF6BB3]/50'; 
      case 'SR': return 'shadow-[0_0_16px_rgba(155,89,182,0.3)] border-[#C175E6]/50'; 
      case 'R': return 'shadow-[0_0_12px_rgba(255,215,0,0.2)] border-[#FFE44D]/50'; 
      case 'N': return 'shadow-[0_0_8px_rgba(192,192,192,0.1)] border-[#A0A0A0]/30'; 
      default: return '';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'SR': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      case 'N': return 'text-[var(--text-muted)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.items?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      
      <header className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
            <ChevronLeft size={20} className="text-[var(--text-muted)]" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            My Wardrobe <Package size={18} className="text-[var(--accent)]" />
          </h1>
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="glass-panel flex items-center p-4 gap-3 mb-6">
          <Search size={20} className="text-[var(--text-muted)] shrink-0" />
          <input 
            type="text"
            placeholder="Search your items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm placeholder:text-[var(--text-muted)] w-full text-[var(--text-main)]"
          />
          <button className="p-2 bg-[var(--bg-app)]/50 rounded-xl text-[var(--text-muted)]">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </header>

      <main>
        {filteredInventory.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {filteredInventory.map((item) => (
              <div 
                key={item.id} 
                className={`glass-panel p-4 flex flex-col items-center text-center relative group transition-all duration-300 ${getRarityStyles(item.items.rarity)}`}
              >
                <div className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest ${getRarityColor(item.items.rarity)}`}>
                  {item.items.rarity || 'N'}
                </div>

                <div className="w-full aspect-square rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] flex items-center justify-center mb-3 mt-6 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {item.items.image_url ? (
                     <img src={item.items.image_url} alt={item.items.name} className="w-full h-full object-cover" />
                  ) : (
                     <Package size={32} className="text-[var(--text-muted)]/50" />
                  )}
                </div>

                <h3 className="font-black text-xs leading-snug mb-1 line-clamp-2 min-h-[2rem] flex items-center">
                  {item.items.name}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <img src="/kumo-sad.png" alt="Empty" className="w-24 h-24 mb-4 drop-shadow-lg opacity-60 grayscale" />
            <p className="font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">Your wardrobe is empty.</p>
            <button onClick={() => navigate('/catalog')} className="mt-4 text-[10px] font-bold text-[var(--accent)] hover:underline uppercase tracking-widest">
              Go Find Some Items
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
