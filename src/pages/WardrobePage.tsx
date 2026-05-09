import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Temporary mock data so you can see the gorgeous grid!
const MOCK_ITEMS = [
  { id: 1, name: "Starlight Teacup", set: "Dreamy Starlight", rarity: "SR", isWishlist: true, image: "🍵" },
  { id: 2, name: "Fluffy Cloud Bed", set: "Sky Haven", rarity: "S", isWishlist: false, image: "☁️" },
  { id: 3, name: "Moonlit Ribbon", set: "Dreamy Starlight", rarity: "R", isWishlist: true, image: "🎀" },
  { id: 4, name: "Pastel Sparkles", set: "Everyday Magic", rarity: "N", isWishlist: false, image: "✨" },
  { id: 5, name: "Sleepy Star Plush", set: "Sky Haven", rarity: "S", isWishlist: true, image: "⭐" },
  { id: 6, name: "Cozy Nightcap", set: "Everyday Magic", rarity: "N", isWishlist: false, image: "🌙" },
];

export default function WardrobePage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get the correct glow/border based on rarity
  const getRarityStyles = (rarity: string) => {
    if (resolvedTheme === 'light') return ''; // Light mode uses standard glass borders
    
    // Dark mode gets the magical glowing halos!
    switch (rarity) {
      case 'SR': return 'shadow-[0_0_24px_rgba(232,107,179,0.4)] border-[#FF6BB3]/50'; // Galaxy Pink
      case 'S': return 'shadow-[0_0_16px_rgba(155,89,182,0.3)] border-[#C175E6]/50'; // Comet Purple
      case 'R': return 'shadow-[0_0_12px_rgba(255,215,0,0.2)] border-[#FFE44D]/50'; // Star Gold
      case 'N': return 'shadow-[0_0_8px_rgba(192,192,192,0.1)] border-[#A0A0A0]/30'; // Moon Silver
      default: return '';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'S': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      case 'N': return 'text-[var(--text-muted)]';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      
      {/* Search and Filter Header */}
      <header className="mb-6 sticky top-4 z-30">
        <div className="glass-panel flex items-center p-3 gap-3 shadow-lg shadow-[var(--shadow-card)]">
          <Search size={20} className="text-[var(--text-muted)] ml-2 shrink-0" />
          <input 
            type="text"
            placeholder="Search your orbit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm placeholder:text-[var(--text-muted)] w-full"
          />
          <button className="p-2 bg-[var(--bg-app)]/50 rounded-xl text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {/* Wardrobe Grid */}
      <main>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 text-[var(--text-muted)]">
            <Package size={16} /> My Items
          </h2>
          <span className="text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-full">
            {MOCK_ITEMS.length} Total
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          {MOCK_ITEMS.map((item) => (
            <div 
              key={item.id} 
              className={`glass-panel p-4 flex flex-col items-center text-center relative group hover:-translate-y-1 transition-all duration-300 ${getRarityStyles(item.rarity)}`}
            >
              {/* Rarity Badge */}
              <div className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </div>

              {/* Wishlist Heart */}
              <button className="absolute top-3 right-3 z-10 hover:scale-110 transition-transform">
                <Heart 
                  size={16} 
                  className={item.isWishlist 
                    ? "text-[var(--accent-pink)] fill-[var(--accent-pink)] drop-shadow-[0_0_8px_rgba(255,184,208,0.8)]" 
                    : "text-[var(--border-subtle)]"
                  } 
                />
              </button>

              {/* Mock Image Placeholder */}
              <div className="w-20 h-20 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-4xl mb-3 mt-4 group-hover:scale-105 transition-transform">
                {item.image}
              </div>

              {/* Item Details */}
              <h3 className="font-black text-sm leading-tight mb-1">{item.name}</h3>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] line-clamp-1">
                {item.set}
              </p>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
