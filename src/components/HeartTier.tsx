import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeartTierProps {
  tier: number; // 1 to 4
}

export default function HeartTier({ tier }: HeartTierProps) {
  const labels = ["Nice to have", "Want", "Need", "DREAM ITEM"];
  const isDream = tier === 4;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "flex items-center gap-0.5 rounded-full px-2 py-1 shadow-sm",
        isDream ? "bg-[#FFF4F6] border border-[#FFB5C5]" : "bg-white border border-gray-100"
      )}>
        {[1, 2, 3, 4].map((index) => (
          <Heart 
            key={index} 
            size={12} 
            className={cn(
              index <= tier 
                ? (isDream ? "fill-[#FF6B9E] text-[#FF6B9E]" : "fill-[#FFA7C4] text-[#FFA7C4]") 
                : "text-gray-200 fill-transparent"
            )} 
          />
        ))}
      </div>
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-wider",
        isDream ? "text-[#FF6B9E] drop-shadow-sm" : "text-gray-400"
      )}>
        {labels[tier - 1]}
      </span>
    </div>
  );
}
