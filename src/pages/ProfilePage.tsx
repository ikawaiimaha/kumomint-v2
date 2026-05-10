import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Moon, Sun, Edit3, Sparkles, 
  Clock, Package, Settings, ChevronRight, Calendar, Heart 
} from 'lucide-react';

type WishlistItem = {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    username: '',
    pronouns: '',
    sanrioBuddy: '',
    tradeVibe: '',
    birthday: ''
  });
  const [stats, setStats] = useState({ inventoryCount: 0, completedTrades: 0 });
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('traders')
        .select('username, pronouns, sanrio_buddy, trade_vibe, birthday')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setProfile({
          username: profileData.username || 'Kawaii',
          pronouns: profileData.pronouns || '',
          sanrioBuddy: profileData.sanrio_buddy || '',
          tradeVibe: profileData.trade_vibe || '',
          birthday: profileData.birthday || ''
        });
      }

      const { data: wishData } = await supabase
        .from('wishlists')
        .select(`items (id, name, rarity, image_url)`)
        .eq('trader_id', user.id);

      if (wishData) {
        setWishlistItems(wishData.map(w => w.items).filter(Boolean) as unknown as WishlistItem[]);
      }

      const { count: invCount } = await supabase
        .from('user_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: tradeCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`);

      setStats({
        inventoryCount: invCount || 0,
        completedTrades: tradeCount || 0
      });

    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      
      <header className="flex justify-between items-center mb-10 relative z-20">
        <h1 className="text-xl font-black uppercase tracking-tighter">My Orbit</h1>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
          </button>
          
          <button onClick={() => navigate('/inbox')} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] relative">
            <Bell size={20} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--accent-pink)] rounded-full border-2 border-[var(--bg-app)]" />
          </button>
        </div>
      </header>

      <main className="space-y-8 relative">
        <div className="absolute top-4 right-0 w-20 h-20 bg-[var(--accent-sky)] rounded-full blur-3xl opacity-30 z-0" />

        {/* MAIN PROFILE CARD */}
        <div className="glass-panel p-6 relative overflow-hidden z-10 mt-12">
          
          {/* Settings gear stays in the absolute corner */}
          <button 
            onClick={() => navigate('/edit-profile')}
            className="absolute top-4 right-4 p-3 bg-[var(--bg-app)]/50 text-[var(--accent)] rounded-2xl hover:bg-[var(--accent)]/10 transition-colors z-20"
          >
            <Settings size={20} />
          </button>

          <div className="flex items-center gap-6 mb-6 relative z-10">
            {/* Avatar Section */}
            <div className="w-24 h-24 shrink-0 rounded-full border-2 border-[var(--accent)] flex items-center justify-center bg-[var(--bg-card)] relative shadow-[0_0_15px_rgba(163,137,244,0.3)]">
              <span className="text-4xl font-black text-[var(--accent)]">{profile.username.charAt(0)}</span>
              <button onClick={() => navigate('/edit-profile')} className="absolute -bottom-2 -right-2 p-1.5 bg-[var(--accent)] text-white rounded-full hover:scale-110 transition-transform shadow-md">
                <Edit3 size={14} />
              </button>
            </div>

            {/* Username & Info Section - Unified Space */}
            <div className="flex-1 min-w-0 pr-2"> 
              <h2 className="text-xl font-black mb-1 text-[var(--text-main)] leading-tight">
                {profile.username}
              </h2>
              {profile.pronouns && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-2 inline-block uppercase tracking-widest">
                  {profile.pronouns}
                </span>
              )}
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2 mt-1">
                <Clock size={12} /> Syncing with Stars
              </p>
            </div>
          </div>

          {profile.sanrioBuddy && (
            <div className="mb-6 flex items-center gap-2 text-[10px] font-bold bg-[var(--bg-app)]/50 px-4 py-2 rounded-2xl border border-[var(--border-subtle)] w-fit uppercase tracking-widest">
              <Heart size={14} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]" />
              Buddy: <span className="text-[var(--accent)]">{profile.sanrioBuddy}</span>
            </div>
          )}

          {/* DYNAMIC STATS GRID */}
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-6 mb-6">
            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)]">
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Mints</span>
              <span className="text-lg font-black">{stats.inventoryCount}</span>
            </div>
            
            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)]">
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Trades</span>
              <span className="text-lg font-black">{stats.completedTrades}</span>
            </div>

            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)]">
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Trade Vibe</span>
              <span className="text-xs font-black text-[var(--accent)]">{profile.tradeVibe || 'Mystery'}</span>
            </div>

            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)]">
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Birthday</span>
              <span className="text-xs font-black flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--accent-pink)]"/> 
                {profile.birthday || '??/??'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => { signOut(); navigate('/login'); }} 
            className="w-full flex justify-between items-center p-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} /> Logout
            </div>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 3-HEART WISHLIST SECTION */}
        <div className="relative z-10 pt-4">
          <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mb-4 pl-2">
            <Heart size={14} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]" /> My Top Wishlist
          </h3>
          
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {wishlistItems.map((item, idx) => (
                <div key={idx} className={`glass-panel p-2 flex flex-col items-center text-center ${getRarityStyles(item.rarity)}`}>
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center mb-2 mt-2 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity || 'N'}</span>
                  <span className="text-[8px] font-bold line-clamp-1 text-[var(--text-main)] w-full truncate px-1">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
             <div className="glass-panel py-6 flex flex-col items-center justify-center border-dashed">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">No items wished for yet</p>
                <button onClick={() => navigate('/catalog')} className="text-[10px] font-bold text-[var(--accent)] hover:underline">Browse Catalog</button>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
