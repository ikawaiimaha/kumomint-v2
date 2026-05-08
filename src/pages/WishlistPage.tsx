import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  ChevronLeft, 
  Heart, 
  Package,
  LogIn
} from 'lucide-react';

// --- TYPESCRIPT INTERFACES (Fixes the 'any' errors) ---
interface Item {
  id: string;
  name: string;
  image_url: string;
}

interface WishlistEntry {
  id: string;
  item_id: string;
  items: Item;
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- USECALLBACK (Fixes the 'exhaustive-deps' error) ---
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('wishlist')
      .select('*, items(*)')
      .eq('trader_id', user.id);
    
    if (data) {
      // We 'cast' the data to our interface here
      setWishlist(data as unknown as WishlistEntry[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchWishlist]);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] flex items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1] dark:text-[#A389F4]" />
    </div>
  );

  // --- NO USER FALLBACK ---
  if (!user) return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] flex flex-col items-center justify-center p-10 text-center">
      <Heart size={48} className="text-gray-200 dark:text-[#2D1B4E] mb-4" />
      <h2 className="text-xl font-black dark:text-[#FFF9E3] mb-6">Wishlist Locked</h2>
      <button onClick={() => navigate('/login')} className="bg-[#2E2A28] dark:bg-[#A389F4] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Sign In</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] pb-32 transition-colors">
      <header className="p-6 bg-white dark:bg-[#2D1B4E] rounded-b-[40px] shadow-sm sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-full text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-[#2E2A28] dark:text-[#FFF9E3]">My Wishlist</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text"
            placeholder="Search wishlist..."
            className="w-full pl-12 pr-4 py-4 bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-2xl text-sm font-bold border-none dark:text-[#E0D7FF]"
          />
        </div>
      </header>

      <main className="px-6 mt-6">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {wishlist.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-[#2D1B4E] p-3 rounded-[32px] border border-[#F0E6E4] dark:border-[#483475] shadow-sm">
                <div className="aspect-square bg-[#F8F9FB] dark:bg-[#1A0B2E] rounded-2xl mb-3 flex items-center justify-center">
                  <img src={entry.items?.image_url} className="w-full h-full object-contain p-2" alt="" />
                </div>
                <div className="px-1 text-center">
                  <h3 className="text-[11px] font-bold text-[#2E2A28] dark:text-[#E0D7FF] truncate">{entry.items?.name}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-20 dark:text-[#A389F4]">
            <Package size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Wishlist is empty</p>
          </div>
        )}
      </main>
    </div>
  );
}
