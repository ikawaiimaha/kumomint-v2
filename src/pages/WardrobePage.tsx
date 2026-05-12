import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Package, 
  Search,
  Sparkles
} from 'lucide-react';
import ItemCard from '../components/ItemCard';

interface InventoryItem {
  item_id: string;
  quantity: number;
  is_padlocked: boolean;
  items: {
    name: string;
    image_url: string;
    rarity: string;
    collection_type: string;
  };
}

export default function WardrobePage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInventory = async () => {
    if (!user) return;
    // FIXED: Removed unused 'error' declaration
    const { data } = await supabase
      .from('inventory')
      .select(`
        item_id,
        quantity,
        is_padlocked,
        items (*)
      `)
      .eq('trader_id', user.id);

    if (data) setInventory(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, [user]);

  const togglePadlock = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('inventory')
      .update({ is_padlocked: !currentStatus })
      .match({ trader_id: user?.id, item_id: itemId });

    if (!error) {
      setInventory(prev => prev.map(item => 
        item.item_id === itemId ? { ...item, is_padlocked: !currentStatus } : item
      ));
    }
  };

  const filteredInventory = inventory.filter(i => 
    i.items.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Your Wardrobe</h1>
        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">
          Managing {inventory.length} Collected Items
        </p>

        <div className="flex items-center p-4 gap-3 mt-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)]">
          <Search size={18} className="text-[var(--accent)]" />
          <input 
            type="text"
            placeholder="Search your collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {filteredInventory.map((entry) => (
          <ItemCard 
            key={entry.item_id}
            item={{
              id: entry.item_id,
              name: entry.items.name,
              image_url: entry.items.image_url,
              rarity: entry.items.rarity,
              quantity: entry.quantity,
              is_padlocked: entry.is_padlocked
            }}
            variant="wardrobe"
            onToggleLock={togglePadlock}
          />
        ))}
      </div>

      {inventory.length === 0 && (
        <div className="py-20 text-center opacity-20">
          <Package size={48} className="mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Inventory is empty</p>
        </div>
      )}
    </div>
  );
}
