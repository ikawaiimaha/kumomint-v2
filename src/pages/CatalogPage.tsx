import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Heart, Sparkles, ChevronLeft, Package } from 'lucide-react';

// --- PRO PATTERN: Define Interfaces to avoid 'any' ---
interface Collection {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  image_url: string;
  collection_id: string;
  rarity?: string;
}

export default function CatalogPage() {
  const { user } = useAuth();
  
  // State for raw data
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for UI filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState<string>("all");

  // --- PRO PATTERN: Stable Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const [itemsRes, collsRes] = await Promise.all([
      supabase.from('items').select('*').order('name'),
      supabase.from('collections').select('id, name')
    ]);

    if (itemsRes.data) setItems(itemsRes.data);
    if (collsRes.data) setCollections(collsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- BETTER ALTERNATIVE: Derived State Filtering ---
  // This calculates the list instantly without needing a second 'useEffect'
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCollection === "all" || item.collection_id === activeCollection;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCollection]);

  const handleWishlist = async (itemId: string) => {
    if (!user) return alert("Sign in to save items!");
    await supabase.from('wishlist').upsert({ trader_id: user.id, item_id: itemId });
    alert("Added to stars! ✨");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 transition-colors">
      <header className="p-6 sticky top-0 bg-[var(--bg-app)] z-40">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="p-2 glass-panel text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest">Explore Orbit</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <input 
            type="text" 
            placeholder="Search the galaxy..." 
            className="w-full pl-12 pr-4 py-4 glass-panel border-none text-sm font-bold placeholder:opacity-30 focus:ring-2 focus:ring-[var(--accent)] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Collection Filter Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveCollection("all")}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeCollection === "all" ? 'bg-[var(--accent)] text-white shadow-lg' : 'glass-panel opacity-50'
            }`}
          >
            All
          </button>
          {collections.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveCollection(c.id)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCollection === c.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'glass-panel opacity-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="glass-panel p-3 group animate-in fade-in duration-500">
                <div className="aspect-square bg-[var(--bg-app)] rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                  <img src={item.image_url} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" alt="" />
                  <button 
                    onClick={() => handleWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white/10 backdrop-blur-md rounded-full text-pink-400 border border-white/10 active:scale-90"
                  >
                    <Heart size={14} />
                  </button>
                </div>
                <h3 className="text-[11px] font-black opacity-80 truncate px-1">{item.name}</h3>
                <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest px-1">
                  {item.rarity || 'Common'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center opacity-20">
            <Package size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No signals found in this sector</p>
          </div>
        )}
      </main>
    </div>
  );
}
