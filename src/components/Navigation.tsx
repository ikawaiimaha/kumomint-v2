import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ArrowLeftRight, 
  ShoppingBag, 
  User 
} from 'lucide-react';

/**
 * Bottom navigation bar for Kumomint v2.
 * Uses the glass-panel styling and variable colors defined in index.css.
 */
export default function Navigation() {
  const location = useLocation();
  
  // Navigation items mapping to routes in App.tsx
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/catalog', label: 'Search' },
    { icon: ArrowLeftRight, path: '/trades', label: 'Trades' }, // Updated for Trade Matching
    { icon: ShoppingBag, path: '/wishlist', label: 'Wishlist' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50">
      {/* Floating glass bar with backdrop blur */}
      <div className="glass-panel py-4 px-8 flex justify-between items-center shadow-2xl backdrop-blur-xl bg-[var(--bg-card)]/80 border-[var(--border-subtle)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="relative flex flex-col items-center group active:scale-90 transition-transform"
            >
              {/* Dynamic icon coloring based on active route */}
              <item.icon 
                size={22} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? 'text-[var(--accent)] scale-110' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`} 
              />
              
              {/* Glowing dot indicator for the active page */}
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
