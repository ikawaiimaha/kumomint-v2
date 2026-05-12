import { useState, useEffect, useCallback } from 'react';
import { Search, Heart, Sparkles, Package } from 'lucide-react'; // FIXED: Removed unused 'Tag'
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface DbItem {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
  collection_type: string;
  bag_type?: string;
  is_animated?: boolean;
  is_retired?: boolean;
  main_category?: string;
}

const HEART_CONFIG = {
  1: { color: "#00F3FF", glow: "0 0 12px #00F3FF" },
  2: { color: "#9D00FF", glow: "0 0 15px #9D00FF" },
  3: { color: "#FFD600", glow: "0 0 18px #FFD600" },
  4: { color: "#FF007A", glow: "0 0 30px #FF007A" },
};

const BAG_TYPE_CONFIG = {
  'Petite Collection': { color: '#FF007A', label: 'Petite' },
  'Custom Happy Bag': { color: '#A389F4', label: 'Custom' },
  'Lucky Bag': { color: '#00F3FF', label: 'Lucky' },
  'Happy Bag': { color: '#80c0e4', label: '' }
};

export default function CatalogPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("ALL");
  const [catalogItems, setCatalogItems] = useState<DbItem[]>([]);
  const [collectionTabs, setCollectionTabs] = useState<string[]>(["ALL"]);
  const [wishlist, setWishlist] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCatalogData = useCallback(async () => {
    try {
      const { data: itemsData } = await supabase.from('items').select('*');
      
      const uniqueCollections = new Set<string>();
      itemsData?.forEach(item => {
        if (item.collection_type) uniqueCollections.add(item.collection_type);
      });
      
      setCollectionTabs(["ALL", ...Array.from(uniqueCollections)]);
      setCatalogItems((itemsData as DbItem[]) || []);

      if (user) {
        const { data: wishData } = await supabase
          .from('wishlists')
          .select('item_id, intensity')
          .eq('trader_id', user.id);
        
        if (wishData) {
          const wishRecord: Record<string, number> = {};
          wishData.forEach(w => wishRecord[w.item_id] = w.intensity || 1);
          setWishlist(wishRecord);
        }
      }
    } catch (error) {
      console.error("Error loading galaxy data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCatalogData(); }, [fetchCatalogData]);

  const cycleWishlist = async (itemId: string) => {
    if (!user) return;
    const currentLevel = wishlist[itemId] || 0;
    const nextLevel = currentLevel === 4 ? 0 : currentLevel + 1;

    try {
      if (nextLevel === 0) {
        setWishlist(prev => { const n = {...prev}; delete n[itemId]; return n; });
        await supabase.from('wishlists').delete().match({ trader_id: user.id, item_id: itemId });
      } else {
        setWishlist(prev => ({ ...prev, [itemId]: nextLevel }));
        await supabase.from('wishlists').upsert({ trader_id: user.id, item_id: itemId, intensity: nextLevel });
      }
    } catch (err) { console.error("Save failed:", err); }
  };

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "ALL" || item.collection_type === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            Explore Orbit <Sparkles size={18} className="text-[var(--accent)] animate-pulse" />
          </h1>
          <div className="px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-main)] text-[10px] font-black shadow-lg">
            {Object.keys(wishlist).length} SAVED
          </div>
        </div>

        <div className="flex items-center p-4 gap-3 mb-6 bg-[var(--bg-card)]/90 rounded-2xl border border-[var(--border-subtle)] shadow-xl">
          <Search size={20} className="text-[var(--accent)]" />
          <input 
            type="text"
            placeholder="Search the galaxy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {collectionTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab ? 'bg-[var(--accent-pink)] text-white shadow-lg' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
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
          const bagConfig = BAG_TYPE_CONFIG[item.bag_type as keyof typeof BAG_TYPE_CONFIG] || BAG_TYPE_CONFIG['Happy Bag'];
          
          return (
            <div key={item.id} className={`glass-panel p-4 flex flex-col items-center relative transition-all duration-300 ${intensity === 4 ? 'border-[var(--accent-pink)] shadow-[0_0_15px_rgba(214,114,161,0.2)]' : ''}`}>
              
              {bagConfig.label && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-widest z-20" style={{ backgroundColor: bagConfig.color }}>
                  {bagConfig.label}
                </div>
              )}

              <div className="absolute top-3 left-4 flex items-center gap-1">
                <div className="text-[9px] font-black uppercase text-[var(--text-muted)]">{item.rarity}</div>
                {item.is_animated && <Sparkles size={10} className="text-[var(--accent-blue)] animate-pulse" />}
              </div>

              <div className="absolute top-2 right-2 flex flex-col items-end">
                <button onClick={() => cycleWishlist(item.id)} className="flex gap-0.5 p-1 transition-all duration-300 active:scale-75">
                  {intensity > 0 ? (
                    Array.from({ length: intensity }).map((_, i) => (
                      <Heart key={i} size={12} fill={config.color} stroke={config.color} style={{ filter: `drop-shadow(${config.glow})` }} className={intensity === 4 ? "animate-pulse" : ""} />
                    ))
                  ) : (
                    <Heart size={16} className="text-[var(--border-subtle)]" />
                  )}
                </button>
              </div>

              <div className={`w-full aspect-square rounded-2xl bg-[#080808] border border-[var(--border-subtle)] flex items-center justify-center mb-3 mt-4 overflow-hidden group ${item.is_retired ? 'grayscale-[0.3]' : ''}`}>
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>

              <h3 className="font-black text-[10px] text-[var(--text-main)] text-center h-8 flex items-center line-clamp-2 mb-2 leading-tight uppercase px-1">
                {item.name}
              </h3>

              <button className="w-full py-2 mt-auto rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Package size={10} />
                <span className="truncate max-w-[70px]">{item.collection_type}</span>
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}
