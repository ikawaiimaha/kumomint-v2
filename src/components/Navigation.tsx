import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/catalog', label: 'Search' },
    { icon: PlusSquare, path: '/add', label: 'Add' },
    { icon: ShoppingBag, path: '/wishlist', label: 'Wishlist' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50">
      <div className="glass-panel py-4 px-8 flex justify-between items-center shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="relative flex flex-col items-center group"
            >
              <item.icon 
                size={22} 
                className={`transition-all duration-300 ${
                  isActive ? 'text-[var(--accent)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`} 
              />
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
