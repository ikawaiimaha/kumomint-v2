import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Heart, 
  Sparkles, 
  Clock, 
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Item {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  collection_id: string;
  is_sweet_collection: boolean;
  release_date: string;
}

export default function CatalogPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [selectedRarity]);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from('items').select('*');
    
    if (selectedRarity) {
      query = query.eq('rarity', selectedRarity);
    }

    const { data } = await query.order('release_date', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const addToWishlist = async (itemId: string) => {
    if (!user) return alert("Login to add to wishlist!");
    
    // Default to 1 heart on initial add
    const { error } = await supabase
      .from('wishlist')
      .insert([{ trader_id: user.id, item_id: itemId, priority: 1 }]);

    if (error) {
      if (error.code === '23505') alert("Already in your wishlist!");
      else alert("Error adding to wishlist");
    } else {
      alert("Added to wishlist! Go to Wishlist to set priority.");
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'SR': return 'SUPER';
      case 'S': return 'SPARK';
      case 'R': return 'STAR';
      default: return 'MOON';
    }
  };

  const isNew = (releaseDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(releaseDate).getTime()) / (1000 * 3600 * 24));
    return days < 14;
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- SEARCH HEADER --- */}
      <div className="p-6 bg-white rounded-b-[40px] shadow-sm sticky top-0 z-20">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search catalog..."
            className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] rounded-[24px] text-sm font-bold border-none focus:ring-2 focus:ring-[#7ED7C1] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- RARITY FILTERS --- */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {['SR', 'S', 'R', 'C'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRarity(selectedRarity === r ? null : r)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                selectedRarity === r 
                  ? "bg-[#2E2A28] text-white" 
                  : "bg-white border border-[#F0E6E4] text-gray-400"
              )}
            >
              {getRarityLabel(r)}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 flex justify-center py-20"><Sparkles className="animate-spin text-[#7ED7C1]" /></div>
          ) : (
            filteredItems.map((item) => (
              <motion.div 
                layout
                key={item.id}
                className="bg-white rounded-[32px] p-3 shadow-sm border border-[#F0E6E4] flex flex-col"
              >
                <div className="aspect-square bg-[#F8F9FB] rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                  <img src={item.image_url} className="w-full h-full object-contain p-2" alt="" />
                  
                  {/* --- NEW/LOCKED BADGE --- */}
                  {isNew(item.release_date) && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-md">
                      <Clock size={10} />
                    </div>
                  )}

                  <button 
                    onClick={() => addToWishlist(item.id)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                  >
                    <Heart size={14} className="text-[#FFB5C5]" />
                  </button>
                </div>

                <div className="px-1 flex-1">
                  <div className="flex gap-1 mb-1">
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase",
                      item.rarity === 'SR' ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
                    )}>
                      {getRarityLabel(item.rarity)}
                    </span>
                    {item.is_sweet_collection && (
                      <span className="text-[8px] font-black bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-md uppercase">
                        Sweet
                      </span>
                    )}
                  </div>
                  <h3 className="text-[11px] font-bold text-[#2E2A28] line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
