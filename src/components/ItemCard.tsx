import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import RarityBadge from './RarityBadge';
import type { RarityTier } from './RarityBadge';

export interface ItemData {
  id: string;
  name: string;
  rarity: RarityTier;
  image: string;
  character?: string;
  category?: string;
}

interface ItemCardProps {
  item: ItemData;
  variant?: 'default' | 'compact' | 'mini';
  showHeart?: boolean;
  onHeartToggle?: (id: string, hearted: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export default function ItemCard({
  item,
  variant = 'default',
  showHeart = true,
  onHeartToggle,
  onClick,
  className,
}: ItemCardProps) {
  const [hearted, setHearted] = useState(false);

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newHearted = !hearted;
    setHearted(newHearted);
    onHeartToggle?.(item.id, newHearted);
  };

  if (variant === 'mini') {
    return (
      <motion.div
        className={cn('glass-item-card p-3 w-[140px] flex-shrink-0 cursor-pointer', className)}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FDFCF8] mb-2">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {showHeart && (
            <button
              onClick={handleHeart}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart
                size={14}
                className={cn('transition-colors', hearted ? 'fill-[#FFB5C5] text-[#FFB5C5]' : 'text-[#2E2A2866]')}
              />
            </button>
          )}
        </div>
        <h4 className="text-[13px] font-semibold text-[#2E2A28] truncate-1 font-body">{item.name}</h4>
        <div className="mt-1">
          <RarityBadge tier={item.rarity} />
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn('glass-item-card p-2.5 w-[160px] flex-shrink-0 cursor-pointer', className)}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FDFCF8] mb-2">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {showHeart && (
            <button
              onClick={handleHeart}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart
                size={14}
                className={cn('transition-colors', hearted ? 'fill-[#FFB5C5] text-[#FFB5C5]' : 'text-[#2E2A2866]')}
              />
            </button>
          )}
        </div>
        <h4 className="text-[13px] font-semibold text-[#2E2A28] truncate-1 font-body">{item.name}</h4>
        <div className="mt-1">
          <RarityBadge tier={item.rarity} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('glass-item-card p-3 cursor-pointer', className)}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FDFCF8] mb-2.5">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {showHeart && (
          <button
            onClick={handleHeart}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Heart
              size={16}
              className={cn('transition-colors', hearted ? 'fill-[#FFB5C5] text-[#FFB5C5]' : 'text-[#2E2A2866]')}
            />
          </button>
        )}
      </div>
      <h4 className="text-[15px] font-semibold text-[#2E2A28] truncate-1 font-body">{item.name}</h4>
      {item.character && (
        <p className="text-[12px] text-[#2E2A2899] mt-0.5 font-body">{item.character}</p>
      )}
      <div className="mt-1.5">
        <RarityBadge tier={item.rarity} />
      </div>
    </motion.div>
  );
}
