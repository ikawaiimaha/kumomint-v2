import { Heart, Lock } from 'lucide-react';

interface ItemCardProps {
  item: {
    id?: string;
    name: string;
    image_url: string;
    rarity: string;
    is_padlocked?: boolean;
    quantity?: number;
    collection_type?: string;
  };
  variant?: 'catalog' | 'wardrobe' | 'wishlist';
}

export default function ItemCard({ item, variant = 'catalog' }: ItemCardProps) {
  return (
    <div className="glass-panel pink-glow p-4 flex flex-col group active:scale-95 transition-all duration-300">
      
      {/* 🍬 Metadata: Tiny, wide-tracked text */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[7px] font-black text-[var(--accent)] tracking-[0.3em] uppercase opacity-60">
          {item.rarity}
        </span>
        <div className="flex gap-1 items-center">
          {item.is_padlocked && <Lock size={10} className="text-[var(--accent)]" />}
          {item.quantity && item.quantity > 1 && (
            <span className="text-[8px] font-bold text-[var(--accent-blue)]">x{item.quantity}</span>
          )}
        </div>
      </div>

      {/* 🖼️ Image Container: Soft, rounded background */}
      <div className="w-full aspect-square bg-[var(--bg-app)] rounded-3xl mb-4 flex items-center justify-center border border-[var(--accent)]/10 overflow-hidden relative">
        <img 
          src={item.image_url} 
          className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500" 
          alt={item.name} 
        />
        {variant === 'wishlist' && (
          <div className="absolute top-3 right-3">
            <Heart size={12} fill="var(--accent)" className="text-[var(--accent)] drop-shadow-md" />
          </div>
        )}
      </div>

      {/* 📝 Name & Collection */}
      <h4 className="text-[10px] font-bold uppercase text-[var(--text-main)] leading-tight px-1 mb-3 line-clamp-1">
        {item.name}
      </h4>

      <div className="mt-auto px-3 py-2 bg-[var(--bg-app)] rounded-2xl text-[6px] font-black uppercase tracking-[0.2em] text-[var(--accent)] text-center opacity-80 border border-[var(--accent)]/5">
        {item.collection_type || 'HB Collection'}
      </div>
      
    </div>
  );
}
