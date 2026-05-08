import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Sparkles, 
  Clock,
  ChevronLeft,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistItem {
  id: string;
  priority: number;
  item: {
    id: string;
    name: string;
    image_url: string;
    rarity: string;
    release_date: string;
  };
}

export default function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('wishlist')
      .select(`id, priority, item:items (id, name, image_url, rarity, release_date)`)
      .eq('trader_id', user?.id)
      .order('priority', { ascending: false });

    if (data) setWishlist(data as any);
    setLoading(false);
  };

  const removeFromWishlist = async (id: string) => {
    await supabase.from('wishlist').delete().eq('id', id);
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      <div className="p-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[#2E2A28]">My Wishlist</h1>
      </div>

      <main className="px-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Sparkles className="animate-spin text-[#FFB5C5]" /></div>
        ) : wishlist.length > 0 ? (
          wishlist.map((wish) => (
            <div key={wish.id} className="bg-white rounded-[32px] p-4 shadow-sm border border-[#F0E6E4] flex items-center gap-4">
              <div className="w-20 h-20 bg-[#F8F9FB] rounded-2xl flex-shrink-0 flex items-center justify-center relative">
                <img src={wish.item.image_url} className="w-16 h-16 object-contain" alt="" />
                {Math.floor((new Date().getTime() - new Date(wish.item.release_date).getTime()) / 86400000) < 14 && (
                  <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                    <Clock size={16} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#2E2A28]">{wish.item.name}</h3>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((h) => (
                    <Heart key={h} size={14} className={cn(h <= wish.priority ? "fill-[#FFB5C5] text-[#FFB5C5]" : "text-gray-200")} />
                  ))}
                </div>
              </div>
              <button onClick={() => removeFromWishlist(wish.id)} className="text-gray-300 hover:text-red-400">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/40 border-2 border-dashed border-[#F0E6E4] rounded-[40px]">
            <div className="w-16 h-16 bg-[#FFF5F7] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-[#FFB5C5]" />
            </div>
            <p className="font-bold text-[#2E2A28]">Your wishlist is empty</p>
            <p className="text-[11px] text-gray-400 mt-1 mb-6">Heart items in the catalog to add them!</p>
            <button 
              onClick={() => navigate('/catalog')}
              className="bg-[#2E2A28] text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 mx-auto"
            >
              <Search size={14} /> Explore Catalog
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
