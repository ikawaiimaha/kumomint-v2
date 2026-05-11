import { useState, useEffect, useCallback } from 'react';
import { Search, Heart, Sparkles, SlidersHorizontal, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DbItem {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
  collection_id: string;
  collections?: { name: string };
  collection_type?: string; // Added for V3 compatibility
}

export default function CatalogPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("ALL");
  const [catalogItems, setCatalogItems] = useState<DbItem[]>([]);
  const [collectionTabs, setCollectionTabs] = useState<string[]>(["ALL"]);
  
  // Maps item_id to heart intensity (1-4)
  const [wishlist, setWishlist] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch items and wishlist
  const fetchCatalogData = useCallback(async () => {
    try {
      // 1. Fetch all available items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, collections(name)');
      
      if (itemsError) throw itemsError;

      // 2. Extract unique collection names for the filter tabs using V3 architecture
      const uniqueCollections = new Set<string>();
      itemsData?.forEach(item => {
        // Fallback to the old collection logic if V3 is null, otherwise use V3
        const tabName = item.collection_type || item.collections?.name;
        if (tabName) uniqueCollections.add(tabName);
      });
      
      setCollectionTabs(["ALL", ...Array.from(uniqueCollections)]);
      setCatalogItems((itemsData as unknown as DbItem[]) || []);

      // 3. Fetch current user's wishlist with intensity
      if (user) {
        const { data: wishData, error: wishError } = await supabase
          .from('wishlists')
          .select('item_id, intensity')
          .eq('trader_id', user.id);
          
        if (wishError) throw wishError;
        if (wishData) {
          const wishRecord: Record<string, number> = {};
          wishData.forEach(w => {
            wishRecord[w.item_id] = w.intensity || 1;
          });
          setWishlist(wishRecord);
        }
      }
    } catch (error) {
      console.error("Error fetching catalog:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // Handle cycling through 1-4 hearts
  const cycleWishlist = async (itemId: string) => {
    if (!user) return;
    
    const currentLevel = wishlist[itemId] || 0;
    const nextLevel = currentLevel === 4 ? 0 : currentLevel + 1;

    if (nextLevel === 0) {
      // Remove from wishlist completely
      setWishlist(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      await supabase.from('wishlists').delete().match({ trader_id: user.id, item_id: itemId });
    } else {
      // Add or Update wishlist level
      setWishlist(prev => ({ ...prev, [itemId]: nextLevel }));
      await supabase.from('wishlists').upsert({ 
        trader_id: user.id, 
        item_id: itemId, 
        intensity: nextLevel 
      }, { onConflict: 'trader_id, item_id' });
    }
  };

  // UI Helpers for HKDV Rarities
  const getRarityStyles = (rarity: string) => {
    if (resolvedTheme === 'light') return '';
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'hover:shadow-[0_0_24px_rgba(232,107,179,0.4)] hover:border-[#FF6BB3]/50';
      case 'SR': return 'hover:shadow-[0_0_16px_rgba(155,89,182,0.3)] hover:border-[#C175E6]/50';
      case 'R': return 'hover:shadow-[0_0_12px_rgba(255,215,0,0.2)] hover:border-[#FFE44D]/50';
      case 'N': return 'hover:shadow-[0_0_8px_rgba(192,192,192,0.1)] hover:border-[#A0A0A0]/30';
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

  // Filter Logic updated to match V3 tabs
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemTabName = item.collection_type || item.collections?.name;
    const matchesTab = activeTab === "ALL" || itemTabName?.toUpperCase() === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  });

  const totalWishlistedItems = Object.keys(wishlist).length;

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center transition-colors duration-500">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      
      <header className="mb-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            Explore Orbit <Sparkles size={18} className="text-[var(--accent)]" />
          </h1>
          
          {/* Infinite Wishlist Counter */}
          <div className="glass-panel px-3 py-1.5 flex items-center gap-1.5 rounded-full border-[var(--border-subtle)]">
            <Heart size={12} className={totalWishlistedItems > 0 ? "text-[var(--accent-pink)] fill-[var(--accent-pink)]" : "text-[var(--text-muted)]"} />
            <span className={`text-[10px] font-black tracking-widest ${totalWishlistedItems > 0 ? "text-[var(--accent-pink)]" : "text-[var(--text-muted)]"}`}>
              {totalWishlistedItems} SAVED
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-panel flex items-center p-4 gap-3 shadow-lg shadow-[var(--shadow-card)] mb-6">
          <Search size={20} className="text-[var(--text-muted)] shrink-0" />
          <input 
            type="text"
            placeholder="Search the galaxy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm placeholder:text-[var(--text-muted)] w-full text-[var(--text-main)]"
          />
          <button className="p-2 bg-[var(--bg-app)]/50 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors shrink-0">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Horizontal Scrolling Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {collectionTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_rgba(163,137,244,0.4)]' 
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Catalog Grid */}
      <main>
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {filteredItems.map((item) => {
              const heartLevel = wishlist[item.id] || 0;
              
              return (
                <div 
                  key={item.id} 
                  className={`glass-panel p-4 flex flex-col items-center text-center relative group transition-all duration-300 ${getRarityStyles(item.rarity)}`}
                >
                  <div className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest ${getRarityColor(item.rarity)}`}>
                    {item.rarity || 'N'}
                  </div>

                  {/* Interactive Wishlist Button */}
                  <button 
                    onClick={() => cycleWishlist(item.id)}
                    className="absolute top-3 right-3 z-10 p-1 hover:scale-110 transition-transform flex gap-0.5"
                  >
                    {/* Render 1 to 4 hearts based on intensity */}
                    {heartLevel > 0 ? (
                      Array.from({ length: heartLevel }).map((_, i) => (
                        <Heart 
                          key={i}
                          size={14} 
                          className={`${
                            heartLevel === 4 ? "text-[var(--accent-pink)] fill-[var(--accent-pink)] drop-shadow-[0_0_8px_rgba(255,184,208,0.8)]" : 
                            heartLevel === 3 ? "text-orange-400 fill-orange-400" :
                            heartLevel === 2 ? "text-yellow-400 fill-yellow-400" :
                            "text-green-400 fill-green-400"
                          }`} 
                        />
                      ))
                    ) : (
                      <Heart size={18} className="text-[var(--border-subtle)]" />
                    )}
                  </button>

                  <div className="w-full aspect-square rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] flex items-center justify-center mb-3 mt-6 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {item.image_url ? (
                       <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                       <Package size={32} className="text-[var(--text-muted)]/50" />
                    )}
                  </div>

                  <h3 className="font-black text-xs leading-snug mb-1 line-clamp-2 min-h-[2rem] flex items-center">{item.name}</h3>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <Package size={48} className="text-[var(--border-subtle)] mb-4" />
            <p className="font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">No items found in orbit.</p>
          </div>
        )}
      </main>

    </div>
  );
}
