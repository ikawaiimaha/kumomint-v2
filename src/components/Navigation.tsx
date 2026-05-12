import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  // These are the links for your bottom bar
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/catalog', label: 'Search' },
    { icon: PlusSquare, path: '/add', label: 'Add' },
    { icon: ShoppingBag, path: '/wishlist', label: 'Wishlist' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50">
      {/* The glass-panel style makes it look like it's floating */}
      <div className="glass-panel py-4 px-8 flex justify-between items-center shadow-2xl backdrop-blur-xl bg-[var(--bg-card)]/80 border-[var(--border-subtle)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="relative flex flex-col items-center group"
            >
              {/* The icon changes color if you are on that page */}
              <item.icon 
                size={22} 
                className={`transition-all duration-300 ${
                  isActive ? 'text-[var(--accent)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`} 
              />
              {/* A tiny glowing dot appears under the active icon */}
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
