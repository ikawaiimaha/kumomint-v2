import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Catalog', path: '/catalog' },
  { icon: PlusSquare, label: 'Creator', path: '/creator' },
  { icon: ShoppingBag, label: 'Wardrobe', path: '/wardrobe' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1A1816]/80 backdrop-blur-xl border border-[rgba(165,214,200,0.2)] rounded-[28px] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)] pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          // SAFETY CHECK: If for some reason the icon is missing, use Home as a fallback
          const Icon = item.icon || Home;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center w-14 h-12 rounded-[22px] transition-all duration-300",
                isActive 
                  ? "bg-[#A5D6C8] text-[#2E2A28] shadow-sm" 
                  : "text-[#2E2A2899] dark:text-[#FDFCF899] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#2E2A28]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}