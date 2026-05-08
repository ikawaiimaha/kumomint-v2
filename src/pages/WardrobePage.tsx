import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, ChevronLeft, Package, LogIn } from 'lucide-react';

interface Item {
  name: string;
  image_url: string;
}

interface InventoryEntry {
  id: string;
  items: Item;
}

export default function WardrobePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [fetching, setFetching] = useState(true);

  // Define fetch first
  const fetchInventory = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('inventory').select('*, items(*)').eq('trader_id', user.id);
      if (data) setInventory(data as unknown as InventoryEntry[]);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchInventory();
    } else if (!authLoading) {
      setFetching(false);
    }
  }, [user, authLoading, fetchInventory]);

  if (authLoading || fetching) return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1]" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] flex flex-col items-center justify-center p-10 text-center">
      <Package size={48} className="text-gray-200 dark:text-[#2D1B4E] mb-4" />
      <h2 className="text-xl font-black dark:text-[#FFF9E3] mb-6 text-center">Wardrobe Locked</h2>
      <button onClick={() => navigate('/login')} className="bg-[#2E2A28] dark:bg-[#A389F4] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
        <LogIn size={16} /> Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] pb-32">
      <header className="p-6 bg-white dark:bg-[#2D1B4E] rounded-b-[40px] shadow-sm sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="p-2 bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-full text-gray-400"><ChevronLeft size={20} /></button>
          <h1 className="text-xl font-black text-[#2E2A28] dark:text-[#FFF9E3]">My Wardrobe</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input type="text" placeholder="Search your items..." className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-2xl text-sm font-bold border-none dark:text-[#E0D7FF]" />
        </div>
      </header>

      <main className="px-6 mt-6">
        {inventory.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {inventory.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-[#2D1B4E] p-3 rounded-[32px] border border-[#F0E6E4] dark:border-[#483475] shadow-sm text-center">
                <div className="aspect-square bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-2xl mb-3 flex items-center justify-center">
                  <img src={entry.items?.image_url} className="w-full h-full object-contain p-2" alt={entry.items?.name} />
                </div>
                <h3 className="text-[11px] font-bold text-[#2E2A28] dark:text-[#E0D7FF] truncate">{entry.items?.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-20 dark:text-[#A389F4]">
            <Package size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Wardrobe is empty</p>
          </div>
        )}
      </main>
    </div>
  );
}