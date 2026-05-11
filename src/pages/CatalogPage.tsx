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

// Colors derived directly from your nebula and character images
const HEART_CONFIG = {
  1: { label: "Nice", color: "#7ED7C1", glow: "0 0 10px #7ED7C1" },      // Level 1: Aqua Sparkle
  2: { label: "Want", color: "#A389F4", glow: "0 0 12px #A389F4" },      // Level 2: Lavender Nebula
  3: { label: "Need", color: "#FDEB6F", glow: "0 0 15px #FDEB6F" },      // Level 3: Star Gold
  4: { label: "DREAMY!", color: "#FF007A", glow: "0 0 25px #FF007A" },   // Level 4: Intense Pink Aura
};

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
      // 1. Fetch items
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

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'text-[#FF007A]';
      case 'SR': return 'text-[#A389F4]';
      case 'R': return 'text-[#FDEB6F]';
      default: return 'text-gray-500';
    }
  };

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemTabName = item.collection_type || item.collections?.name;
    const matchesTab = activeTab === "ALL" || itemTabName?.toUpperCase() === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#0C0F21] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#A389F4]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-[#0C0F21] text-[#E0D7FF] relative">
      
      <header className="mb-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            Explore Orbit <Sparkles size={18} className="text-[#A389F4]" />
          </h1>
          <div className="px-3 py-1.5 rounded-full border border-[#2D1B4E] bg-[#1A0B2E] text-[#FFF9E3] text-[10px] font-black tracking-widest">
            {Object.keys(wishlist).length} SAVED
          </div>
        </div>

        <div className="flex items-center p-4 gap-3 mb-6 bg-[#1A0B2E]/80 rounded-2xl border border-[#483475] shadow-xl">
          <Search size={20} className="text-[#A389F4]" />
          <input 
            type="text"
            placeholder="Search the galaxy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-[#FFF9E3] placeholder:text-[#A389F4]/50"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {collectionTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab ? 'bg-[#FF007A] text-white shadow-[0_0_15px_#FF007A]' : 'bg-[#1A0B2E] text-[#A389F4] border border-[#483475]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="grid grid-cols-2 gap-4 relative z-10">
        {filteredItems.map((item) => {
          const intensity = wishlist[item.id] || 0;
          const config = HEART_CONFIG[intensity as keyof typeof HEART_CONFIG];
          const bagName = item.collection_type || item.collections?.name || "Unknown Bag";
          
          return (
            <div key={item.id} 
                 className={`bg-[#1A0B2E] p-4 rounded-[32px] border flex flex-col items-center relative transition-all duration-300 ${intensity === 4 ? 'border-[#FF007A] shadow-[0_0_20px_rgba(255,0,122,0.2)]' : 'border-[#2D1B4E]'}`}
            >
              
              {/* Rarity */}
              <div className={`absolute top-3 left-4 text-[9px] font-black uppercase tracking-widest ${getRarityColor(item.rarity)}`}>
                {item.rarity || 'N'}
              </div>

              {/* Heart Rating Button */}
              <div className="absolute top-2 right-2 flex flex-col items-end">
                <button 
                  onClick={() => cycleWishlist(item.id)}
                  className="flex gap-0.5 p-1 active:scale-90 transition-transform"
                >
                  {intensity > 0 ? (
                    Array.from({ length: intensity }).map((_, i) => (
                      <Heart 
                        key={i} 
                        size={intensity === 4 ? 14 : 12} 
                        fill={config.color} 
                        color={config.color} 
                        style={{ filter: `drop-shadow(${config.glow})` }}
                        className={intensity === 4 ? "animate-pulse" : ""}
                      />
                    ))
                  ) : (
                    <Heart size={16} className="text-[#2D1B4E]" />
                  )}
                </button>
                {intensity > 0 && (
                  <span 
                    className="text-[7px] font-black uppercase tracking-tighter mr-1"
                    style={{ color: config.color, textShadow: intensity === 4 ? config.glow : 'none' }}
                  >
                    {config.label}
                  </span>
                )}
              </div>

              {/* Item Image */}
              <div className="w-full aspect-square rounded-2xl bg-[#0C0F21] border border-[#2D1B4E] flex items-center justify-center mb-3 mt-4 overflow-hidden">
                {item.image_url ? (
                   <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                   <Package size={24} className="text-[#2D1B4E]" />
                )}
              </div>

              {/* Item Name */}
              <h3 className="font-black text-[10px] text-[#FFF9E3] text-center h-8 flex items-center line-clamp-2 mb-2 leading-tight">
                {item.name}
              </h3>

              {/* Bag Link */}
              <button 
                onClick={() => setActiveTab(bagName)}
                className="w-full py-1.5 mt-auto rounded-lg bg-[#2D1B4E] border border-[#483475] hover:bg-[#A389F4] text-[8px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
              >
                <Package size={10} />
                <span className="truncate max-w-[70px]">{bagName}</span>
              </button>

              {/* Category */}
              {item.main_category && (
                <div className="mt-1.5 flex items-center gap-1 text-[7px] text-[#A389F4]/70 font-bold uppercase">
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
