import { cn } from '@/lib/utils';
import { Moon, Sparkles, Star, Atom } from 'lucide-react';

type RarityTier = 'Moon' | 'Star' | 'Comet' | 'Galaxy';

interface RarityBadgeProps {
  tier: RarityTier;
  className?: string;
}

const rarityConfig = {
  Moon: {
    color: '#90A4AE',
    bg: 'rgba(144,164,174,0.15)',
    label: 'MOON',
    Icon: Moon,
  },
  Star: {
    color: '#FFB5C5',
    bg: 'rgba(255,181,197,0.15)',
    label: 'STAR',
    Icon: Star,
  },
  Comet: {
    color: '#A5D6C8',
    bg: 'rgba(165,214,200,0.15)',
    label: 'COMET',
    Icon: Sparkles,
  },
  Galaxy: {
    color: '#D1A3FF',
    bg: 'rgba(209,163,255,0.15)',
    label: 'GALAXY',
    Icon: Atom,
  },
};

export default function RarityBadge({ tier, className }: RarityBadgeProps) {
  const config = rarityConfig[tier];
  const Icon = config.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.04em]',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <Icon size={12} style={{ color: config.color }} />
      {config.label}
    </span>
  );
}

export { rarityConfig };
export type { RarityTier };
