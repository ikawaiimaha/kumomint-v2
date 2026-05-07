import { useState, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, ArrowLeft, Gamepad2, Wind, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getTraderProfile, supabase } from '../lib/supabase';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNav?: boolean;
  rightAction?: ReactNode;
}

// Safety config for the status buttons
const STATUS_CONFIG = {
  sunny:    { label: 'Sunny',    icon: Sun,      color: '#F1C40F', bgClass: 'bg-[#FFF9E6]', ringClass: 'ring-[#F1C40F]' },
  playing:  { label: 'Playing',  icon: Gamepad2, color: '#3498DB', bgClass: 'bg-[#EBF5FB]', ringClass: 'ring-[#3498DB]' },
  drifting: { label: 'Drifting', icon: Wind,     color: '#E67E22', bgClass: 'bg-[#FDEDEC]', ringClass: 'ring-[#E67E22]' },
  dreaming: { label: 'Dreaming', icon: Moon,     color: '#9B59B6', bgClass: 'bg-[#F4ECF7]', ringClass: 'ring-[#9B59B6]' },
};

export default function Layout({
  children,
  title,
  showBack = false,
  onBack,
  showNav = true,
  rightAction,
}: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [username, setUsername] = useState('Dreamer');
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    let isMounted = true;
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (!user) { setUsername('Dreamer'); return; }

      const fallbackUsername = user.user_metadata.username || user.email?.split('@')[0] || 'Dreamer';
      const { data } = await getTraderProfile(user.id);
      if (!isMounted) return;
      setUsername(data?.display_name || data?.username || fallbackUsername);
    };

    syncUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { void syncUser(); });
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const pageTitle = title || (isHome ? `Hi, ${username}!` : '');

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <div className={cn('min-h-[100dvh] bg-[#FDFCF8] dark:bg-[#1A1816] transition-colors duration-300')}>
      <div className="max-w-[600px] mx-auto relative">
        <header className={cn(
          'sticky top-0 z-50 h-14 flex items-center justify-between px-4 transition-all duration-200',
          scrolled ? 'bg-white/80 dark:bg-[#1A1816]/80 backdrop-blur-xl border-b border-[rgba(165,214,200,0.1)]' : 'bg-transparent'
        )}>
          <div className="flex items-center gap-2">
            {showBack && (
              <button onClick={onBack || (() => navigate(-1))} className="w-9 h-9 rounded-full flex items-center justify-center -ml-1">
                <ArrowLeft size={20} className="text-[#2E2A28] dark:text-[#FDFCF8]" />
              </button>
            )}
            <h1 className={cn("font-bold font-display text-[#2E2A28] dark:text-[#FDFCF8]", isHome ? "text-[22px]" : "text-[18px]")}>
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {rightAction}
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center text-[#2E2A28] dark:text-[#FDFCF8]">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/notifications')} className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#2E2A28] dark:text-[#FDFCF8]">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF9A9A]" />
            </button>
          </div>
        </header>

        <motion.main 
          className={cn('px-4 pb-24', showNav && 'pb-28')}
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          {children}
        </motion.main>

        {showNav && <Navbar />}
      </div>
    </div>
  );
}