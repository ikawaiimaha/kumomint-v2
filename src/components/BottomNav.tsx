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
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1A0B2E]/90 backdrop-blur-xl border-t border-[#F0E6E4] dark:border-[#483475] px-6 py-4 pb-10 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center relative transition-all active:scale-90">
            <Icon size={24} className={isActive ? "text-[#7ED7C1] dark:text-[#A389F4]" : "text-gray-300 dark:text-[#2D1B4E]"} />
            {isActive && <div className="absolute -bottom-3 w-1.5 h-1.5 bg-[#7ED7C1] dark:bg-[#A389F4] rounded-full shadow-[0_0_8px_#A389F4]" />}
          </button>
        );
      })}
    </div>
  );
}