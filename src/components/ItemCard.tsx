import { Heart, Lock } from 'lucide-react';

interface ItemCardProps {
  item: {
    id?: string;
    name: string;
    image_url: string;
    rarity: string;
    is_padlocked?: boolean;
    collection_type?: string;
    quantity?: number;
  };
  variant?: 'catalog' | 'wardrobe' | 'wishlist';
}

export default function ItemCard({ item, variant = 'catalog' }: ItemCardProps) {
  return (
    <div className="glass-panel p-3 flex flex-col group border-white/5 bg-gradient-to-br from-[var(--bg-card)] to-transparent">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[7px] font-black text-[var(--accent)] tracking-[0.2em] uppercase">
          {item.rarity}
        </span>
        <div className="flex gap-1 items-center">
          {item.is_padlocked && <Lock size={10} className="text-[var(--accent-pink)]" />}
          {item.quantity && item.quantity > 1 && (
             <span className="text-[8px] font-bold text-[var(--accent-blue)]">x{item.quantity}</span>
          )}
        </div>
      </div>

      <div className="w-full aspect-square bg-black/10 rounded-2xl mb-4 flex items-center justify-center border border-white/5 overflow-hidden relative">
        <img 
          src={item.image_url} 
          className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform duration-500" 
          alt="" 
        />
        {variant === 'wishlist' && (
          <div className="absolute top-2 right-2">
            <Heart size={10} fill="var(--accent-pink)" className="text-[var(--accent-pink)]" />
          </div>
        )}
      </div>

      <h4 className="text-[9px] font-bold uppercase text-[var(--text-main)] leading-tight px-1 mb-3 line-clamp-1">
        {item.name}
      </h4>

      <div className="mt-auto px-2 py-1.5 bg-black/5 rounded-xl text-[6px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-center">
        {item.collection_type || 'HB Collection'}
      </div>
    </div>
  );
}
