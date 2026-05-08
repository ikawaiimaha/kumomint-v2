import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Heart, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    if (selectedRarity) query = query.eq('rarity', selectedRarity);
    const { data } = await query.order('release_date', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const addToWishlist = async (itemId: string) => {
    if (!user) return alert("Login to add to wishlist!");
    const { error } = await supabase
      .from('wishlist')
      .insert([{ trader_id: user.id, item_id: itemId, priority: 1 }]);
    if (error) alert("Already in wishlist or error occurred.");
    else alert("Added!");
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      <div className="p-6 bg-white rounded-b-[40px] sticky top-0 z-20">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] rounded-[24px] text-sm font-bold border-none"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['SR', 'S', 'R', 'C'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRarity(selectedRarity === r ? null : r)}
              className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all", selectedRarity === r ? "bg-[#2E2A28] text-white" : "bg-white border text-gray-400")}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 mt-6 grid grid-cols-2 gap-4">
        {loading ? <Sparkles className="animate-spin text-[#7ED7C1] col-span-2 mx-auto" /> : filteredItems.map((item) => (
          <motion.div layout key={item.id} className="bg-white rounded-[32px] p-3 border border-[#F0E6E4]">
            <div className="aspect-square bg-[#F8F9FB] rounded-2xl mb-3 flex items-center justify-center relative">
              <img src={item.image_url} className="w-full h-full object-contain p-2" alt="" />
              <button onClick={() => addToWishlist(item.id)} className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"><Heart size={14} className="text-[#FFB5C5]" /></button>
              {Math.floor((new Date().getTime() - new Date(item.release_date).getTime()) / 86400000) < 14 && <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded-full"><Clock size={10} /></div>}
            </div>
            <h3 className="text-[11px] font-bold text-[#2E2A28] line-clamp-1">{item.name}</h3>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
