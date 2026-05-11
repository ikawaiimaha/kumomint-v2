import { useState, useEffect, useCallback } from 'react';
import { Search, Heart, Sparkles, Package, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DbItem {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
  collection_id: string;
  collections?: { name: string };
  collection_type?: string; 
  main_category?: string;
  sub_category?: string;
}

export default function CatalogPage() {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("ALL");
  const [catalogItems, setCatalogItems] = useState<DbItem[]>([]);
  const [collectionTabs, setCollectionTabs] = useState<string[]>(["ALL"]);
  
  // Maps item_id to heart intensity (1-4)
  const [wishlist, setWishlist] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCatalogData = useCallback(async () => {
    try {
      // 1. Fetch items with all V3 category data
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, collections(name)');
      
      if (itemsError) throw itemsError;

      // 2. Build filter tabs
      const uniqueCollections = new Set<string>();
      itemsData?.forEach(item => {
        const tabName = item.collection_type || item.collections?.name;
        if (tabName) uniqueCollections.add(tabName);
      });
      
      setCollectionTabs(["ALL", ...Array.from(uniqueCollections)]);
      setCatalogItems((itemsData as unknown as DbItem[]) || []);

      // 3. Load saved heart ratings
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
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // The 1-4 Heart Rating Cycle
  const cycleWishlist = async (itemId: string) => {
    if (!user) return;
    
    const currentLevel = wishlist[itemId] || 0;
    const nextLevel = currentLevel === 4 ? 0 : currentLevel + 1;

    try {
        if (nextLevel === 0) {
          setWishlist(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });
          await supabase.from('wishlists').delete().match({ trader_id: user.id, item_id: itemId });
        } else {
          setWishlist(prev => ({ ...prev, [itemId]: nextLevel }));
          await supabase.from('wishlists').upsert({ 
            trader_id: user.id, 
            item_id: itemId, 
            intensity: nextLevel 
          }, { onConflict: 'trader_id, item_id' });
        }
    } catch (err) {
        console.error("Save failed:", err);
        fetchCatalogData(); 
    }
  };

  const getHeartLabel = (level: number) => {
    switch (level) {
      case 1: return "Nice";
      case 2: return "Want";
      case 3: return "Need";
      case 4: return "DREAMY!";
      default: return "";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'text-[#E84393]';
      case 'SR': return 'text-[#9B59B6]';
      case 'R': return 'text-[#F39C12]';
      default: return 'text-gray-400';
    }
  };

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemTabName = item.collection_type || item.collections?.name;
    const matchesTab = activeTab === "ALL" || itemTabName?.toUpperCase() === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-[var(--bg-app)] text-[var(--text-main)]">
      
      <header className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            Explore Orbit <Sparkles size={18} className="text-[var(--accent)]" />
          </h1>
          <div className="glass-panel px-3 py-1.5 rounded-full border-[var(--border-subtle)] text-[10px] font-black">
            {Object.keys(wishlist).length} SAVED
          </div>
        </div>

        <div className="glass-panel flex items-center p-4 gap-3 mb-6">
          <Search size={20} className="text-[var(--text-muted)]" />
          <input 
            type="text"
            placeholder="Search the galaxy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-[var(--text-main)]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {collectionTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all ${
                activeTab === tab ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="grid grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const heartLevel = wishlist[item.id] || 0;
          const bagName = item.collection_type || item.collections?.name || "Unknown Bag";
          
          return (
            <div key={item.id} className="glass-panel p-4 flex flex-col items-center relative group transition-all">
              
              {/* Rarity Label */}
              <div className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest ${getRarityColor(item.rarity)}`}>
                {item.rarity || 'N'}
              </div>

              {/* Heart Rating Button */}
              <div className="absolute top-2 right-2 flex flex-col items-end">
                <button 
                  onClick={() => cycleWishlist(item.id)}
                  className="p-1 hover:scale-110 transition-transform flex gap-0.5"
                >
                  {heartLevel > 0 ? (
                    Array.from({ length: heartLevel }).map((_, i) => (
                      <Heart key={i} size={12} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]" />
                    ))
                  ) : (
                    <Heart size={16} className="text-[var(--border-subtle)]" />
                  )}
                </button>
                {heartLevel > 0 && (
                  <span className="text-[7px] font-black uppercase text-[var(--accent-pink)] tracking-tighter mr-1">
                    {getHeartLabel(heartLevel)}
                  </span>
                )}
              </div>

              {/* Item Image */}
              <div className="w-full aspect-square rounded-xl bg-black/5 border border-[var(--border-subtle)] flex items-center justify-center mb-3 mt-6 overflow-hidden">
                {item.image_url ? (
                   <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                   <Package size={24} className="text-[var(--text-muted)]" />
                )}
              </div>

              {/* Item Name */}
              <h3 className="font-black text-[10px] leading-tight mb-2 line-clamp-2 text-center h-8 flex items-center justify-center">
                {item.name}
              </h3>

              {/* Clickable Bag/Collection Link */}
              <button 
                onClick={() => setActiveTab(bagName)}
                className="w-full py-1.5 mt-auto rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Package size={10} />
                <span className="text-[8px] font-bold uppercase tracking-widest truncate max-w-[80px]">
                  {bagName}
                </span>
              </button>

              {/* Category Tag */}
              {item.main_category && (
                <div className="mt-1 flex items-center gap-1 text-[7px] text-[var(--text-muted)] font-bold uppercase">
                  <Tag size={8} />
                  {item.main_category}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
