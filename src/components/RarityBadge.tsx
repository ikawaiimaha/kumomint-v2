import { Moon, Sparkles, Star, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

// We now include BOTH languages so the other pages stop complaining
export type RarityTier = 'N' | 'R' | 'S' | 'SR' | 'SSR' | 'Moon' | 'Star' | 'Comet' | 'Galaxy';

const RARITY_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  // Database Language
  N:   { label: 'Moon',  icon: Moon,     color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200' },
  R:   { label: 'Star',  icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  S:   { label: 'Spark', icon: Zap,      color: '#9B59B6',          bg: 'bg-purple-50',  border: 'border-purple-200' },
  SR:  { label: 'Super', icon: Sparkles, color: 'text-pink-500',    bg: 'bg-pink-50',    border: 'border-pink-200' },
  SSR: { label: 'Ultra', icon: Sparkles, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
  
  // Fancy Page Language (Mapping them to the same styles)
  Moon:   { label: 'Moon',  icon: Moon,     color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200' },
  Star:   { label: 'Star',  icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  Comet:  { label: 'Spark', icon: Zap,      color: '#9B59B6',          bg: 'bg-purple-50',  border: 'border-purple-200' },
  Galaxy: { label: 'Super', icon: Sparkles, color: 'text-pink-500',    bg: 'bg-pink-50',    border: 'border-pink-200' },
};

interface RarityBadgeProps {
  tier?: RarityTier | string;
  rarity?: RarityTier | string;
  className?: string;
}

export default function RarityBadge({ tier, rarity, className }: RarityBadgeProps) {
  const activeTier = (tier || rarity || 'N') as string;
  
  // SAFETY SHIELD: If it's not in the list, default to Moon (N)
  const config = RARITY_CONFIG[activeTier] || RARITY_CONFIG.N;
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
      config.bg,
      config.border,
      className
    )}>
      <Icon 
        size={10} 
        style={{ color: config.color.startsWith('#') ? config.color : undefined }}
        className={!config.color.startsWith('#') ? config.color : ''} 
      />
      <span className={config.color.startsWith('#') ? '' : config.color} style={{ color: config.color.startsWith('#') ? config.color : undefined }}>
        {config.label}
      </span>
    </div>
  );
}