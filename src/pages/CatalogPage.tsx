import { useState, useEffect, useCallback } from 'react';
import { Search, Heart, Sparkles, Package, CheckCircle2, Box } from 'lucide-react'; 
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
}

const HEART_CONFIG = {
  1: { color: "#00F3FF", glow: "0 0 12px #00F3FF" },
  2: { color: "#9D00FF", glow: "0 0 15px #9D00FF" },
  3: { color: "#FFD600", glow: "0 0 18px #FFD600" },
  4: { color: "#FF007A", glow: "0 0 30px #FF007A" },
};

// HKDV Rarity Palette
const RARITY_CONFIG: Record<string, { color: string; bg: string }> = {
  'SSR': { color: '#FFD600', bg: 'rgba(255, 214, 0, 0.15)' }, // Star Gold
  'SR':  { color: '#9D00FF', bg: 'rgba(157, 0, 255, 0.15)' },  // Bright Purple
  'R':   { color: '#00F3FF', bg: 'rgba(0, 243, 255, 0.15)' },  // Aqua
  'N':   { color: '#8E8A88', bg: 'rgba(142, 138, 136, 0.15)' } // Muted Silver
};

export default function CatalogPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("ALL");
  const [activeRarity, setActiveRarity] = useState("ALL"); // New State for Rarity Filter
  
  const [catalogItems, setCatalogItems] = useState<DbItem[]>([]);
  const [collectionTabs, setCollectionTabs] = useState<string[]>(["ALL"]);
  const [wishlist, setWishlist] = useState<Record<string, number>>({});
  const [inventory, setInventory] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: itemsData } = await supabase.from('items').select('*');
      const uniqueCollections = new Set<string>();
      itemsData?.forEach(item => { if (item.collection_type) uniqueCollections.add(item.collection_type); });
      setCollectionTabs(["ALL", ...Array.from(uniqueCollections)]);
      setCatalogItems((itemsData as DbItem[]) || []);

      if (user) {
        const { data: wishData } = await supabase.from('wishlists').select('item_id, intensity').eq('trader_id', user.id);
        if (wishData) {
          const wishRecord: Record<string, number> = {};
          wishData.forEach(w => wishRecord[w.item_id] = w.intensity || 1);
          setWishlist(wishRecord);
        }
        const { data: invData } = await supabase.from('inventory').select('item_id').eq('trader_id', user.id);
        if (invData) setInventory(new Set(invData.map(i => i.item_id)));
      }
    } catch (error) {
      console.error("Error loading galaxy data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    } catch (err) { console.error("Wishlist sync failed:", err); }
  };

  const toggleInventory = async (itemId: string) => {
    if (!user) return;
    const isOwned = inventory.has(itemId);
    try {
      if (isOwned) {
        setInventory(prev => { const next = new Set(prev); next.delete(itemId); return next; });
        await supabase.from('inventory').delete().match({ trader_id: user.id, item_id: itemId });
      } else {
        setInventory(prev => new Set(prev).add(itemId));
        await supabase.from('inventory').upsert({ trader_id: user.id, item_id: itemId, quantity: 1 });
      }
    } catch (err) { console.error("Inventory sync failed:", err); }
  };

  // Improved Filtering Logic
  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "ALL" || item.collection_type === activeTab;
    const matchesRarity = activeRarity === "ALL" || item.rarity === activeRarity;
    return matchesSearch && matchesTab && matchesRarity;
  });

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-6 relative z-10">
        <div className="flex justify-between items-center mb-6 px-1">
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            Explore Orbit <Sparkles size={18} className="text-[var(--accent)]" />
          </h1>
          <div className="text-[8px] font-black uppercase opacity-40 tracking-[0.2em]">
            {filteredItems.length} Items Found
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center p-4 gap-3 mb-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl">
          <Search size={18} className="text-[var(--accent)]" />
          <input 
            type="text"
            placeholder="Search the galaxy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* 💎 HKDV RARITY FILTER [New Feature] */}
        <div className="flex justify-between gap-2 mb-6">
          {["ALL", "SSR", "SR", "R", "N"].map((r) => (
            <button
              key={r}
              onClick={() => setActiveRarity(r)}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black transition-all duration-300 border uppercase tracking-widest ${
                activeRarity === r 
                  ? 'bg-[var(--text-main)] text-[var(--bg-app)] border-transparent scale-105 shadow-lg' 
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
              }`}
              style={activeRarity === r ? { color: RARITY_CONFIG[r]?.color } : {}}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Collection Type Tabs */}
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
          const isOwned = inventory.has(item.id);
          const config = HEART_CONFIG[intensity as keyof typeof HEART_CONFIG];
          const rarityStyle = RARITY_CONFIG[item.rarity] || RARITY_CONFIG['N'];
          
          return (
            <div key={item.id} className={`glass-panel p-4 flex flex-col items-center relative transition-all duration-300 ${isOwned ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/5' : ''} ${intensity === 4 ? 'border-[var(--accent-pink)] shadow-[0_0_15px_rgba(214,114,161,0.2)]' : ''}`}>
              
              {/* Rarity Tag */}
              <div 
                className="absolute top-3 left-4 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter"
                style={{ backgroundColor: rarityStyle.bg, color: rarityStyle.color }}
              >
                {item.rarity}
              </div>

              {/* Inventory Check */}
              <div className="absolute top-2 right-10">
                <button 
                  onClick={() => toggleInventory(item.id)} 
                  className={`p-1 transition-all ${isOwned ? 'text-[var(--accent-blue)] scale-110' : 'text-[var(--text-muted)] opacity-30'}`}
                >
                  {isOwned ? <CheckCircle2 size={16} fill="currentColor" className="text-[var(--bg-app)]" /> : <Box size={16} />}
                </button>
              </div>

              {/* Wishlist Hearts */}
              <div className="absolute top-2 right-2 flex flex-col items-end">
                <button onClick={() => cycleWishlist(item.id)} className="flex gap-0.5 p-1 transition-all duration-300">
                  {intensity > 0 ? (
                    Array.from({ length: intensity }).map((_, i) => (
                      <Heart key={i} size={10} fill={config.color} stroke={config.color} style={{ filter: `drop-shadow(${config.glow})` }} className={intensity === 4 ? "animate-pulse" : ""} />
                    ))
                  ) : (
                    <Heart size={14} className="text-[var(--border-subtle)]" />
                  )}
                </button>
              </div>

              <div className={`w-full aspect-square rounded-2xl bg-[#080808] border border-[var(--border-subtle)] flex items-center justify-center mb-3 mt-4 overflow-hidden group ${item.is_retired ? 'grayscale-[0.4]' : ''}`}>
                <img src={item.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>

              <h3 className="font-black text-[9px] text-[var(--text-main)] text-center h-8 flex items-center line-clamp-2 mb-2 leading-tight uppercase px-1">
                {item.name}
              </h3>

              <button className={`w-full py-2 mt-auto rounded-xl border text-[7px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-colors ${isOwned ? 'bg-[var(--accent-blue)] text-white border-transparent' : 'bg-[var(--bg-app)] border-[var(--border-subtle)]'}`}>
                <Package size={10} />
                <span className="truncate max-w-[65px]">{item.collection_type}</span>
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}
