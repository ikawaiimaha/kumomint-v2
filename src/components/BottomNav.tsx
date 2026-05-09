import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/' },
    { icon: Search, path: '/catalog' },
    { icon: PlusSquare, path: '/creator' },
    { icon: ShoppingBag, path: '/wardrobe' },
    { icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-[var(--bottom-nav)] backdrop-blur-md rounded-[32px] py-4 px-6 flex justify-between items-center shadow-2xl border border-[var(--accent)]/20 transition-colors duration-500">
        {navItems.map(({ icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative p-2 flex flex-col items-center justify-center transition-all"
            >
              <Icon 
                size={24} 
                className={isActive ? 'text-[var(--accent)] drop-shadow-md' : 'text-[var(--nav-icon)]'} 
              />
              {isActive && (
                <span className="absolute -bottom-2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full drop-shadow-[0_0_5px_rgba(163,137,244,1)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
