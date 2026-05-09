import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Generates a massive box-shadow string to create stars from a single div
const generateStars = (count: number) => {
  let shadows = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    // Mix of bright white and soft lavender stars
    const color = Math.random() > 0.8 ? '#BB98FF' : '#F0E6FF'; 
    shadows += `${x}vw ${y}vh 1px ${color}${i < count - 1 ? ', ' : ''}`;
  }
  return shadows;
};

export default function StarField() {
  const { resolvedTheme } = useTheme();

  // Memoize so they don't recalculate on every render
  const layer1 = useMemo(() => generateStars(30), []); // Fast twinkles
  const layer2 = useMemo(() => generateStars(20), []); // Slow twinkles
  const layer3 = useMemo(() => generateStars(10), []); // Bigger, rare stars

  // Only render if we are in dark mode
  if (resolvedTheme !== 'dark') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 3 simple divs handling 60 stars total via box-shadow */}
      <div 
        className="w-[2px] h-[2px] rounded-full animate-pulse opacity-70" 
        style={{ boxShadow: layer1, animationDuration: '2s' }} 
      />
      <div 
        className="w-[2px] h-[2px] rounded-full animate-pulse opacity-50" 
        style={{ boxShadow: layer2, animationDuration: '4s' }} 
      />
      <div 
        className="w-[3px] h-[3px] rounded-full animate-pulse opacity-90 drop-shadow-[0_0_4px_#BB98FF]" 
        style={{ boxShadow: layer3, animationDuration: '6s' }} 
      />
    </div>
  );
}
