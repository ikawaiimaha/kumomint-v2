import { Heart } from 'lucide-react';

interface ItemCardProps {
  item: {
    id: string;
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
        <div className="flex gap-1">
          {item.quantity && item.quantity > 1 && (
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
          )}
        Complete codes only where and full codes only
