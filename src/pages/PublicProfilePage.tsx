import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ArrowRightLeft, Package, Sparkles, Heart, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

type ItemDetail = {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
};

type InventoryItem = {
  id: string;
  item_id: string;
  items: ItemDetail;
};

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { resolvedTheme } = useTheme();

  const [profile, setProfile] = useState({
    id: '',
    username: 'Loading...',
    pronouns: '',
    tradeVibe: 'Mystery',
    sanrioBuddy: ''
  });
  
  const [wishlistItems, setWishlistItems] = useState<ItemDetail[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    
    try {
      // 1. Fetch Profile Data
      const { data: profileData } = await supabase
        .from('traders')
        .select('id, username, pronouns, sanrio_buddy, trade_vibe')
        .eq('id', id)
        .single();
        
      if (profileData) {
        setProfile({
          id: profileData.id,
          username: profileData.username || 'Unknown Star',
          pronouns: profileData.pronouns || '',
          sanrioBuddy: profileData.sanrio_buddy || '',
          tradeVibe: profileData.trade_vibe || 'Mystery'
        });
      }

      // 2. Fetch Wishlist Data
      const { data: wishData } = await supabase
        .from('wishlists')
        .select(`items (id, name, rarity, image_url)`)
        .eq('trader_id', id);

      if (wishData) {
        setWishlistItems(wishData.map(w => w.items).filter(Boolean) as unknown as ItemDetail[]);
      }

      // 3. Fetch REAL Inventory Data from user_items
      const { data: invData } = await supabase
        .from('user_items')
        .select(`id, item_id, items (name, rarity, image_url)`)
        .eq('user_id', id);

      if (invData) {
        setInventory((invData as unknown as InventoryItem[]) || []);
      }

    } catch (error) {
      console.error("Error fetching public profile:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getRarityStyles = (rarity: string) => {
    if (resolvedTheme === 'light') return ''; 
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'shadow-[0_0_24px_rgba(232,107,179,0.4)] border-[#FF6BB3]/50'; 
      case 'SR': return 'shadow-[0_0_16px_rgba(155,89,182,0.3)] border-[#C175E6]/50'; 
      case 'R': return 'shadow-[0_0_12px_rgba(255,215,0,0.2)] border-[#FFE44D]/50'; 
      case 'N': return 'shadow-[0_0_8px_rgba(192,192,192,0.1)] border-[#A0A0A0]/30'; 
      default: return '';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'SR': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      <header className="flex items-center justify-between mb-8 relative z-20">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]">
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter text-[var(--text-muted)]">User Orbit</h1>
        <div className="w-10" />
      </header>

      <main className="space-y-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] rounded-full blur-3xl opacity-20 z-0 pointer-events-none" />

        {/* PROFILE CARD */}
        <div className="glass-panel p-6 relative z-10">
          <div className="flex items-center gap-5 mb-5">
            <div className="w-20 h-20 shrink-0 rounded-full border-2 border-[var(--accent)] flex items-center justify-center bg-[var(--bg-card)]">
              <span className="text-3xl font-black text-[var(--accent)]">{profile.username.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-1">{profile.username}</h2>
              <div className="flex flex-wrap gap-2">
                {profile.pronouns && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase">
                    {profile.pronouns}
                  </span>
                )}
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] uppercase">
                  {profile.tradeVibe}
                </span>
              </div>
            </div>
          </div>
          {profile.sanrioBuddy && (
            <div className="mb-5 flex items-center gap-2 text-[10px] font-bold bg-[var(--bg-app)]/50 px-3 py-2 rounded-xl border border-[var(--border-subtle)] w-fit text-[var(--text-main)] uppercase tracking-widest">
              <Heart size={12} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]" />
              Buddy: <span className="text-[var(--accent)]">{profile.sanrioBuddy}</span>
            </div>
          )}
        </div>

        {/* 3-HEART WISHLIST */}
        <div className="relative z-10">
          <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2 text-[var(--text-main)] mb-3 pl-2">
            <Heart size={14} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]" /> Top Wishlist
          </h3>
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {wishlistItems.map(item => (
                <div key={item.id} className={`glass-panel p-2 flex flex-col items-center text-center ${getRarityStyles(item.rarity)}`}>
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center mb-2 mt-2 overflow-hidden">
                    {item.image_url ? <img src={item.image_url} alt="item" className="w-full h-full object-cover" /> : <Package size={20} />}
                  </div>
                  <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity || 'N'}</span>
                  <span className="text-[8px] font-bold line-clamp-1 leading-tight">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel py-6 flex flex-col items-center justify-center border-dashed">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No items wished for</p>
            </div>
          )}
        </div>

        {/* REAL INVENTORY GRID */}
        <div className="relative z-10 pt-4">
          <div className="flex justify-between items-center mb-3 pl-2">
            <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2 text-[var(--text-main)]">
              <Package size={14} /> Their Orbit
            </h3>
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest pr-2">
              {inventory.length} Items
            </span>
          </div>

          {inventory.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {inventory.map((item) => (
                <div key={item.id} className={`glass-panel p-3 flex flex-col items-center text-center relative group transition-all ${getRarityStyles(item.items.rarity)}`}>
                  <div className={`absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest ${getRarityColor(item.items.rarity)}`}>
                    {item.items.rarity || 'N'}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden mb-2 mt-4">
                    {item.items.image_url ? <img src={item.items.image_url} alt="item" className="w-full h-full object-cover" /> : <Package size={32} />}
                  </div>
                  <h3 className="font-black text-[10px] leading-tight mb-0.5 line-clamp-2">{item.items.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel py-12 flex flex-col items-center justify-center border-dashed">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">This orbit is empty</p>
            </div>
          )}
        </div>

        {/* FLOATING PROPOSE TRADE BUTTON */}
        <div className="fixed bottom-24 left-6 right-6 z-40">
          <button 
            onClick={() => navigate('/propose', { state: { receiverId: profile.id } })}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase shadow-[0_10px_30px_rgba(163,137,244,0.4)] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={!profile.id}
          >
            <ArrowRightLeft size={16} /> Propose Trade
          </button>
        </div>
      </main>
    </div>
  );
}
