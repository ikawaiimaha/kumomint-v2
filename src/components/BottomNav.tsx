import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/catalog', label: 'Explore' },
    { icon: PlusSquare, path: '/creator', label: 'Mint' },
    { icon: ShoppingBag, path: '/wardrobe', label: 'Wardrobe' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#F0E6E4] px-6 py-3 pb-8 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 relative"
          >
            <Icon 
              size={24} 
              className={`transition-all ${isActive ? "text-[#7ED7C1] scale-110" : "text-gray-300"}`} 
            />
            {isActive && (
              <div className="absolute -bottom-2 w-1 h-1 bg-[#7ED7C1] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
