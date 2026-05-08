import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Sparkles, 
  Clock,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Removed unused AnimatePresence

interface WishlistItem {
  id: string;
  priority: number;
  item: {
    id: string;
    name: string;
    image_url: string;
    rarity: string;
    release_date: string;
    is_sweet_collection: boolean;
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
      .select(`
        id,
        priority,
        item:items (
          id, name, image_url, rarity, release_date, is_sweet_collection
        )
      `)
      .eq('trader_id', user?.id)
      .order('priority', { ascending: false });

    if (data) setWishlist(data as any);
    setLoading(false);
  };

  const updatePriority = async (wishlistId: string, newPriority: number) => {
    await supabase.from('wishlist').update({ priority: newPriority }).eq('id', wishlistId);
    setWishlist(prev => prev.map(item => 
      item.id === wishlistId ? { ...item, priority: newPriority } : item
    ).sort((a, b) => b.priority - a.priority));
  };

  const removeFromWishlist = async (wishlistId: string) => {
    await supabase.from('wishlist').delete().eq('id', wishlistId);
    setWishlist(prev => prev.filter(item => item.id !== wishlistId));
  };

  const isLocked = (releaseDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(releaseDate).getTime()) / (1000 * 3600 * 24));
    return days < 14;
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
        ) : (
          wishlist.map((wish) => (
            <div key={wish.id} className="bg-white rounded-[32px] p-4 shadow-sm border border-[#F0E6E4] flex items-center gap-4">
              <div className="w-20 h-20 bg-[#F8F9FB] rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                <img src={wish.item.image_url} className="w-16 h-16 object-contain" alt="" />
                {isLocked(wish.item.release_date) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <Clock size={16} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md uppercase">
                    {wish.item.rarity}
                  </span>
                  {wish.priority === 4 && (
                    <span className="text-[8px] font-black bg-[#7ED7C1] text-white px-1.5 py-0.5 rounded-md uppercase">Dreamy</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#2E2A28] truncate">{wish.item.name}</h3>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((h) => (
                    <button key={h} onClick={() => updatePriority(wish.id, h)}>
                      <Heart size={18} className={cn("transition-colors", h <= wish.priority ? (wish.priority === 4 ? "fill-[#7ED7C1] text-[#7ED7C1]" : "fill-[#FFB5C5] text-[#FFB5C5]") : "text-gray-200")} />
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => removeFromWishlist(wish.id)} className="p-2 text-gray-300 hover:text-red-400">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
