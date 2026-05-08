import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Heart, 
  Sparkles, 
  Filter,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  collection_id: string;
  release_date: string;
}

interface Collection {
  id: string;
  name: string;
}

export default function CatalogPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: colls } = await supabase.from('collections').select('id, name').eq('is_active', true);
    if (colls) setCollections(colls);

    const { data: itemList } = await supabase.from('items').select('*').order('release_date', { ascending: false });
    if (itemList) setItems(itemList);
    setLoading(false);
  };

  const addToWishlist = async (itemId: string) => {
    if (!user) return alert("Please login first!");
    const { error } = await supabase.from('wishlist').insert([{ 
      trader_id: user.id, 
      item_id: itemId, 
      priority: 1 
    }]);
    if (error) alert("Already in your wishlist!");
    else alert("Added to Wishlist!");
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = selectedRarity ? item.rarity === selectedRarity : true;
    const matchesCollection = selectedCollection === 'all' ? true : item.collection_id === selectedCollection;
    return matchesSearch && matchesRarity && matchesCollection;
  });

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-32">
      <header className="p-6 bg-white rounded-b-[40px] shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="p-2 bg-[#F8F9FB] rounded-full text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-[#2E2A28]">Item Catalog</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text"
            placeholder="Search items, characters..."
            className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-[#7ED7C1]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <select 
            className="bg-[#F8F9FB] border-none rounded-full px-4 py-2 text-[10px] font-black uppercase text-gray-500"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value="all">All Collections</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {['SR', 'S', 'R', 'N'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRarity(selectedRarity === r ? null : r)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all",
                selectedRarity === r ? "bg-[#2E2A28] text-white" : "bg-white border border-[#F0E6E4] text-gray-400"
              )}
            >
              {r === 'SR' ? 'Super' : r === 'S' ? 'Spark' : r === 'R' ? 'Star' : 'Moon'}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 mt-6">
        {loading ? (
          <div className="flex justify-center py-20"><Sparkles className="animate-spin text-[#7ED7C1]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-[32px] border border-[#F0E6E4] shadow-sm relative group">
                <div className="aspect-square bg-[#F8F9FB] rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                  <img src={item.image_url} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" alt="" />
                  <button 
                    onClick={() => addToWishlist(item.id)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-[#FFB5C5] active:scale-75 transition-all"
                  >
                    <Heart size={14} />
                  </button>
                </div>
                <div className="px-1">
                  <p className="text-[8px] font-black text-gray-300 uppercase">{item.rarity}</p>
                  <h3 className="text-[11px] font-bold text-[#2E2A28] truncate">{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Filter size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">No items match your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
