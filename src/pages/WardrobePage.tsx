import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Package, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Search,
  Sparkles
} from 'lucide-react';

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
    const { data, error } = await supabase
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
        {filteredInventory.map((entry) => {
          const isUnique = entry.quantity <= 1;
          const isLocked = entry.is_padlocked;

          return (
            <div key={entry.item_id} className="glass-panel p-4 bg-[#1A0B2E]/60 border-[#2D1B4E] relative flex flex-col items-center">
              
              {/* 🔒 Padlock Toggle */}
              <button 
                onClick={() => togglePadlock(entry.item_id, entry.is_padlocked)}
                className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all ${
                  isLocked ? 'text-[var(--accent-pink)] bg-[var(--accent-pink)]/10 shadow-[0_0_10px_rgba(255,0,122,0.2)]' : 'text-[var(--text-muted)] opacity-30'
                }`}
              >
                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>

              {/* 📦 Quantity Indicator */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 rounded text-[7px] font-black uppercase text-[var(--accent-blue)]">
                x{entry.quantity}
              </div>

              <div className="w-full aspect-square bg-[#0C0F21] rounded-xl mb-3 mt-4 flex items-center justify-center border border-white/5">
                <img src={entry.items.image_url} className="w-full h-full object-contain p-2" alt="" />
              </div>

              <h4 className="text-[8px] font-black uppercase text-center truncate w-full mb-1">{entry.items.name}</h4>
              <span className="text-[7px] font-bold text-[var(--accent-blue)] uppercase mb-3">{entry.items.rarity}</span>

              {/* 🛡️ Duplicate Guard Status */}
              <div className={`w-full py-2 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border ${
                isUnique ? 'border-white/5 text-[var(--text-muted)] bg-white/5' : 
                isLocked ? 'border-[var(--accent-pink)]/30 text-[var(--accent-pink)] bg-[var(--accent-pink)]/5' : 
                'border-green-500/30 text-green-400 bg-green-500/5'
              }`}>
                {isUnique ? (
                  <>Unique Copy</>
                ) : isLocked ? (
                  <><Lock size={10} /> Locked</>
                ) : (
                  <><ShieldCheck size={10} /> Tradeable</>
                )}
              </div>
            </div>
          );
        })}
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
