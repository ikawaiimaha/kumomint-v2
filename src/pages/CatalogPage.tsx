import { useState, useEffect, useCallback } from 'react';
import { Search, Heart, Sparkles, SlidersHorizontal, Package, AlertCircle } from 'lucide-react';
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
}

export default function CatalogPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("ALL");
  const [catalogItems, setCatalogItems] = useState<DbItem[]>([]);
  const [collectionTabs, setCollectionTabs] = useState<string[]>(["ALL"]);
  
  const [wishlist, setWishlist] = useState<string[]>([]); // Array of item IDs
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  // Fetch items and wishlist
  const fetchCatalogData = useCallback(async () => {
    try {
      // 1. Fetch all available items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, collections(name)');
      
      if (itemsError) throw itemsError;

      // 2. Extract unique collection names for the filter tabs
      const uniqueCollections = new Set<string>();
      itemsData?.forEach(item => {
        if (item.collections?.name) uniqueCollections.add(item.collections.name);
      });
      
      setCollectionTabs(["ALL", ...Array.from(uniqueCollections)]);
      setCatalogItems((itemsData as unknown as DbItem[]) || []);

      // 3. Fetch current user's wishlist
      if (user) {
        const { data: wishData, error: wishError } = await supabase
          .from('wishlists')
          .select('item_id')
          .eq('trader_id', user.id);
          
        if (wishError) throw wishError;
        if (wishData) setWishlist(wishData.map(w => w.item_id));
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

  // Handle the 3-Heart Wishlist Toggle
  const toggleWishlist = async (itemId: string) => {
    if (!user) return;
    setWarning(null);

    const isWished = wishlist.includes(itemId);

    if (isWished) {
      // Remove from wishlist
      setWishlist(prev => prev.filter(id => id !== itemId));
      await supabase
        .from('wishlists')
        .delete()
        .match({ trader_id: user.id, item_id: itemId });
    } else {
      // Enforce 3-Heart Limit
      if (wishlist.length >= 3) {
        setWarning("Your 3-Heart Wishlist is full! Un-heart an item first.");
        setTimeout(() => setWarning(null), 3000);
        return;
      }

      // Add to wishlist
      setWishlist(prev => [...prev, itemId]);
      await supabase
        .from('wishlists')
        .insert([{ trader_id: user.id, item_id: itemId }]);
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

  // Filter Logic
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "ALL" || item.collections?.name?.toUpperCase() === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center transition-colors duration-500">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      
      {/* Top Warning Toast for 3-Heart Limit */}
      {warning && (
        <div className="fixed top-4 left-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-red-500/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest border border-red-400">
            <AlertCircle size={18} />
            {warning}
          </div>
        </div>
      )}

      <header className="mb-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            Explore Orbit <Sparkles size={18} className="text-[var(--accent)]" />
          </h1>
          
          {/* 3-Heart Counter */}
          <div className="glass-panel px-3 py-1.5 flex items-center gap-1.5 rounded-full border-[var(--border-subtle)]">
            <Heart size={12} className={wishlist.length === 3 ? "text-[var(--accent-pink)] fill-[var(--accent-pink)]" : "text-[var(--text-muted)]"} />
            <span className={`text-[10px] font-black tracking-widest ${wishlist.length === 3 ? "text-[var(--accent-pink)]" : "text-[var(--text-muted)]"}`}>
              {wishlist.length}/3
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
              const isWished = wishlist.includes(item.id);
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
                    onClick={() => toggleWishlist(item.id)}
                    className="absolute top-3 right-3 z-10 p-1 hover:scale-110 transition-transform"
                  >
                    <Heart 
                      size={18} 
                      className={isWished 
                        ? "text-[var(--accent-pink)] fill-[var(--accent-pink)] drop-shadow-[0_0_8px_rgba(255,184,208,0.8)]" 
                        : "text-[var(--border-subtle)]"
                      } 
                    />
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
