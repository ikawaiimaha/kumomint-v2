import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, ChevronLeft, Package, LogIn } from 'lucide-react';

export default function WardrobePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInventory();
    } else {
      setFetching(false);
    }
  }, [user]);

  const fetchInventory = async () => {
    try {
      const { data } = await supabase.from('inventory').select('*, items(*)').eq('trader_id', user?.id);
      if (data) setInventory(data);
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) return (
    <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1]" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#FDF8F7] flex flex-col items-center justify-center p-10 text-center">
      <Package size={48} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-black text-[#2E2A28] mb-2 text-center">Wardrobe Locked</h2>
      <p className="text-xs font-bold text-gray-400 mb-8 text-center text-pretty">Please sign in to view your collection of Happy Bags!</p>
      <button onClick={() => navigate('/login')} className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2">
        <LogIn size={16} /> Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-32 text-center">
      <header className="p-6 bg-white rounded-b-[40px] shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="p-2 bg-[#F8F9FB] rounded-full text-gray-400"><ChevronLeft size={20} /></button>
          <h1 className="text-xl font-black text-[#2E2A28]">My Wardrobe</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input type="text" placeholder="Search your items..." className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold border-none" />
        </div>
      </header>

      <main className="px-6 mt-6">
        {inventory.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {inventory.map((entry) => (
              <div key={entry.id} className="bg-white p-3 rounded-[32px] border border-[#F0E6E4] shadow-sm">
                <div className="aspect-square bg-[#F8F9FB] rounded-2xl mb-3 flex items-center justify-center">
                  <img src={entry.items?.image_url} className="w-full h-full object-contain p-2" alt="" />
                </div>
                <h3 className="text-[11px] font-bold text-[#2E2A28] truncate">{entry.items?.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-20">
            <Package size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs text-center">Wardrobe is empty</p>
          </div>
        )}
      </main>
    </div>
  );
}
