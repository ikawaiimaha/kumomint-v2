import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Package, Search } from 'lucide-react';
import ItemCard from '../components/ItemCard';

export default function WardrobePage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadWardrobe() {
      if (!user) return;
      const { data } = await supabase
        .from('user_items')
        .select('*, items(*)')
        .eq('trader_id', user.id);
      
      if (data) setInventory(data);
      setLoading(false);
    }
    loadWardrobe();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-16 bg-[var(--bg-app)] text-[var(--text-main)]">
      <header className="mb-10">
        <h1 className="text-4xl heading-italic leading-none">Your <span className="text-[var(--accent)]">Wardrobe</span></h1>
        <div className="flex items-center p-4 gap-3 mt-6 glass-panel bg-white/5 border-white/5">
          <Search size={16} className="text-[var(--accent)]" />
          <input 
            type="text" 
            placeholder="Search collection..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {inventory
          .filter(i => i.items.name.toLowerCase().includes(search.toLowerCase()))
          .map((entry) => (
            <ItemCard 
              key={entry.id}
              variant="wardrobe"
              item={{
                id: entry.item_id,
                name: entry.items.name,
                image_url: entry.items.image_url,
                rarity: entry.items.rarity,
                quantity: entry.quantity,
                is_padlocked: entry.is_padlocked,
                collection_type: entry.items.collection_type
              }}
            />
          ))}

        {inventory.length === 0 && (
          <div className="col-span-2 py-24 text-center opacity-20">
            <Package size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Inventory Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
