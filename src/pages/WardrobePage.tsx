import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Lock, 
  Unlock, 
  Clock,
  Sparkles
} from 'lucide-react';

interface InventoryItem {
  id: string;
  is_padlocked: boolean;
  created_at: string;
  item: {
    name: string;
    image_url: string;
    rarity: string;
  };
}

export default function WardrobePage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('id, is_padlocked, created_at, item:items(name, image_url, rarity)').eq('trader_id', user?.id);
    if (data) setInventory(data as any);
    setLoading(false);
  };

  const togglePadlock = async (id: string, current: boolean) => {
    await supabase.from('inventory').update({ is_padlocked: !current }).eq('id', id);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, is_padlocked: !current } : i));
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] p-6 pb-24">
      <h1 className="text-2xl font-black text-[#2E2A28] mb-6">Wardrobe</h1>
      <div className="grid grid-cols-2 gap-4">
        {loading ? <Sparkles className="animate-spin text-[#7ED7C1] col-span-2 mx-auto" /> : inventory.map((inv) => (
          <div key={inv.id} className="bg-white p-3 rounded-[32px] border border-[#F0E6E4] shadow-sm">
            <div className="aspect-square bg-[#F8F9FB] rounded-2xl mb-3 flex items-center justify-center relative">
              <img src={inv.item.image_url} className="w-full h-full object-contain p-2" alt="" />
              <button onClick={() => togglePadlock(inv.id, inv.is_padlocked)} className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow-md text-[#7ED7C1]">
                {inv.is_padlocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              {Math.floor((new Date().getTime() - new Date(inv.created_at).getTime()) / 86400000) < 14 && <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded-full"><Clock size={10} /></div>}
            </div>
            <p className="text-[11px] font-bold truncate">{inv.item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
