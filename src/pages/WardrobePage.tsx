import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sparkles, 
  Search, 
  Filter,
  ChevronLeft
} from 'lucide-react';

export default function WardrobePage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('inventory')
      .select('*, items(*)')
      .eq('trader_id', user?.id);
    
    if (data) setInventory(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-32">
      <header className="p-6 bg-white rounded-b-[40px] shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="p-2 bg-[#F8F9FB] rounded-full text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-[#2E2A28]">My Wardrobe</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text"
            placeholder="Search your items..."
            className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold border-none"
          />
        </div>
      </header>

      <main className="px-6 mt-6">
        {loading ? (
          <div className="flex justify-center py-20"><Sparkles className="animate-spin text-[#7ED7C1]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {inventory.map((entry) => (
              <div key={entry.id} className="bg-white p-3 rounded-[32px] border border-[#F0E6E4] shadow-sm">
                <div className="aspect-square bg-[#F8F9FB] rounded-2xl mb-3 flex items-center justify-center">
                  <img src={entry.items?.image_url} className="w-full h-full object-contain p-2" alt="" />
                </div>
                <div className="px-1 text-center">
                  <h3 className="text-[11px] font-bold text-[#2E2A28] truncate">{entry.items?.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && inventory.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Filter size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs text-center">Your wardrobe is empty</p>
          </div>
        )}
      </main>
    </div>
  );
}
