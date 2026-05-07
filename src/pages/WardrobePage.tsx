import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  LayoutGrid, 
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface InventoryItem {
  id: string;
  is_padlocked: boolean;
  item: {
    id: string;
    name: string;
    image_url: string;
    rarity: 'N' | 'R' | 'S' | 'SR';
    category: string;
    is_sweet_collection: boolean;
  };
}

export default function Wardrobe() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ xp: 0, tier: 1 });

  useEffect(() => {
    if (user) {
      fetchInventory();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    const { data } = await supabase
      .from('traders')
      .select('xp, tier')
      .eq('id', user?.id)
      .single();
    if (data) setUserStats(data);
  };

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        is_padlocked,
        item:items (
          id, name, image_url, rarity, category, is_sweet_collection
        )
      `)
      .eq('trader_id', user?.id);

    if (!error && data) setInventory(data as any);
    setLoading(false);
  };

  const togglePadlock = async (inventoryId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('inventory')
      .update({ is_padlocked: !currentStatus })
      .eq('id', inventoryId);

    if (!error) {
      setInventory(prev => prev.map(item => 
        item.id === inventoryId ? { ...item, is_padlocked: !currentStatus } : item
      ));
    }
  };

  const TIER_NAMES = ["Sticker", "Charm", "Treasure", "Dream", "Legendary"];

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- XP TIER HEADER --- */}
      <div className="p-6 bg-gradient-to-br from-[#7ED7C1] to-[#5BBAA3] rounded-b-[40px] text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Current Tier</p>
            <h1 className="text-3xl font-black">{TIER_NAMES[userStats.tier - 1]}</h1>
          </div>
          <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
            <Sparkles size={24} />
          </div>
        </div>
        <div className="bg-black/10 h-3 rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(userStats.xp / 18000) * 100}%` }}
            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </div>
        <p className="text-[10px] font-bold text-right opacity-80">{userStats.xp} / 18,000 XP TO LEGENDARY</p>
      </div>

      <main className="px-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2E2A28]">My Wardrobe</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-xl shadow-sm border border-[#F0E6E4]"><Search size={18} /></button>
            <button className="p-2 bg-white rounded-xl shadow-sm border border-[#F0E6E4]"><Filter size={18} /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Sparkles className="animate-spin text-[#7ED7C1]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {inventory.map((inv) => (
                <motion.div 
                  layout
                  key={inv.id}
                  className="bg-white rounded-[32px] p-3 shadow-sm border border-[#F0E6E4] relative group"
                >
                  {/* --- PADLOCK TOGGLE --- */}
                  <button 
                    onClick={() => togglePadlock(inv.id, inv.is_padlocked)}
                    className={cn(
                      "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
                      inv.is_padlocked ? "bg-[#FFB5C5] text-white" : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {inv.is_padlocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>

                  <div className="aspect-square rounded-2xl bg-[#F8F9FB] mb-3 flex items-center justify-center overflow-hidden">
                    <img src={inv.item.image_url} className="w-full h-full object-contain" alt={inv.item.name} />
                  </div>
                  
                  <div className="px-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase",
                        inv.item.rarity === 'SR' ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-400"
                      )}>
                        {inv.item.rarity}
                      </span>
                      {inv.item.is_sweet_collection && (
                        <span className="text-[8px] font-black bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-md uppercase">Sweet</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[#2E2A28] line-clamp-1">{inv.item.name}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
