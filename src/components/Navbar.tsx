import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cloud, Search, Shirt, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: Cloud, path: '/' },
  { label: 'Catalog', icon: Search, path: '/catalog' },
  { label: 'Wardrobe', icon: Shirt, path: '/wardrobe' },
  { label: 'Collection', icon: LayoutGrid, path: '/collection' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-nav glass-nav pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-[600px] mx-auto flex items-center justify-around h-16">
        {tabs.map((tab, index) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.label}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 h-full select-none',
                'transition-colors duration-200'
              )}
              onClick={() => {
                setTappedIndex(index);
                setTimeout(() => setTappedIndex(null), 100);
                navigate(tab.path);
              }}
              animate={{
                scale: tappedIndex === index ? 0.88 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <Icon
                size={24}
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-[#A5D6C8]' : 'text-[#2E2A2866]'
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-[0.04em] transition-all duration-200',
                  isActive
                    ? 'text-[#A5D6C8] font-display scale-105'
                    : 'text-[#2E2A2866]'
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
