import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface KumoBubbleProps {
  message?: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBubble?: boolean;
}

const TIPS = [
  'Tap any item to see details and trading options!',
  'The more items you add, the better Kumo can match you!',
  'Heart items 3 times to add them to your wishlist!',
  'Check your collection progress to see what you\'re missing!',
  'You can undo wishlist hearts by tapping again!',
];

export default function KumoBubble({
  message,
  image = '/kumo-mascot.png',
  size = 'md',
  className,
  showBubble = true,
}: KumoBubbleProps) {
  const sizeMap = { sm: 36, md: 48, lg: 64 };
  const imgSize = sizeMap[size];

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div
        className="relative flex-shrink-0 rounded-full flex items-center justify-center animate-float-gentle"
        style={{
          width: imgSize + 12,
          height: imgSize + 12,
          backgroundColor: 'rgba(165,214,200,0.15)',
          border: '1px solid rgba(165,214,200,0.25)',
        }}
      >
        <img
          src={image}
          alt="Kumo"
          className="object-contain"
          style={{ width: imgSize, height: imgSize }}
        />
      </div>
      {showBubble && message && (
        <div className="relative bg-white rounded-2xl px-4 py-3 shadow-glass max-w-[220px]">
          <p className="text-[14px] text-[#2E2A28] font-body leading-relaxed">{message}</p>
          <div
            className="absolute left-[-6px] top-5 w-3 h-3 bg-white rotate-45"
            style={{ borderRadius: '2px' }}
          />
        </div>
      )}
    </div>
  );
}

export function KumoTipRotator({ className }: { className?: string }) {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % TIPS.length);
        setIsVisible(true);
      }, 150);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('glass-surface p-4 flex items-start gap-3', className)}>
      <div
        className="relative flex-shrink-0 rounded-full flex items-center justify-center animate-float"
        style={{
          width: 60,
          height: 60,
          backgroundColor: 'rgba(165,214,200,0.15)',
          border: '1px solid rgba(165,214,200,0.25)',
        }}
      >
        <img
          src="/kumo-mascot.png"
          alt="Kumo"
          className="w-[48px] h-[48px] object-contain"
        />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <p
          className={cn(
            'text-[13px] text-[#2E2A2899] font-body leading-relaxed transition-opacity duration-150',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          {TIPS[currentTip]}
        </p>
      </div>
    </div>
  );
}

export { TIPS };
