import { Heart, Lock } from 'lucide-react';

interface ItemCardProps {
  item: {
    id?: string; // Added this back to fix the error
    name: string;
    image_url: string;
    rarity: string;
    is_padlocked?: boolean;
    collection_type?: string;
    quantity?: number; // Added this for Wardrobe tracking
  };
  variant?: 'catalog' | 'wardrobe' | 'wishlist';
}

export default function ItemCard({ item, variant = 'catalog' }: ItemCardProps) {
  return (
    <div className="glass-panel p-3 flex flex-col items-center group transition-all duration-300">
      <div className="w-full flex justify-between items-center mb-2 px-1">
        <span className="text-[7px] font-black opacity-30 tracking-widest uppercase">{item.rarity}</span>
        <div className="flex gap-1">
          {item.is_padlocked && <Lock size={10} className="text-[var(--accent-pink)]" />}
          {item.quantity && item.quantity > 1 && (
            <span className="text-[7px] font-bold text-[var(--accent-blue)]">x{item.quantity}</span>
          )}
        </div>
      </div>

      <div className="w-full aspect-square rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 relative overflow-hidden">
        <img 
          src={item.image_url} 
          className="w-[75%] h-[75%] object-contain transition-transform duration-500 group-hover:scale-110" 
          alt="" 
        />
        {variant === 'wishlist' && (
          <div className="absolute top-2 right-2">
            <Heart size={8} fill="var(--accent-pink)" className="text-[var(--accent-pink)]" />
          </div>
        )}
      </div>

      <h4 className="text-[9px] font-black uppercase text-center leading-tight mb-2 line-clamp-2 h-[2.2em] px-1">
        {item.name}
      </h4>

      <div className="w-full py-1.5 bg-black/5 dark:bg-white/5 rounded-xl text-[7px] font-bold text-center uppercase tracking-widest opacity-40">
        {item.collection_type || 'HB Collection'}
      </div>
    </div>
  );
}
