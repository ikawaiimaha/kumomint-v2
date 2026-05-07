import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, ArrowLeft } from 'lucide-react';
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
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted || !user) return;
      const { data } = await getTraderProfile(user.id);
      if (isMounted) setUsername(data?.display_name || data?.username || 'Dreamer');
    };
    syncUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { void syncUser(); });
    return () => { isMounted = false; authListener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasHeader = title !== "";

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#1A1816] transition-colors overflow-x-hidden">
      <div className="max-w-[600px] mx-auto relative min-h-screen flex flex-col overflow-x-hidden">
        {hasHeader && (
          <header className={cn(
            'sticky top-0 z-50 h-14 flex items-center justify-between px-4 transition-all',
            scrolled ? 'bg-white/80 dark:bg-[#1A1816]/80 backdrop-blur-xl border-b border-[rgba(165,214,200,0.1)]' : 'bg-transparent'
          )}>
            <div className="flex items-center gap-2">
              {showBack && (
                <button onClick={onBack || (() => navigate(-1))} className="p-2 text-[#2E2A28] dark:text-white"><ArrowLeft size={20} /></button>
              )}
              <h1 className="font-bold text-[18px] text-[#2E2A28] dark:text-white">{title || `Hi, ${username}!`}</h1>
            </div>
            <div className="flex items-center gap-1">
              {rightAction}
              <button onClick={() => setIsDark(!isDark)} className="p-2 text-[#2E2A28] dark:text-white">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={() => navigate('/notifications')} className="p-2 relative text-[#2E2A28] dark:text-white"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full" /></button>
            </div>
          </header>
        )}

        <main className={cn('flex-1 px-4', hasHeader ? 'pt-2' : 'pt-6', showNav ? 'pb-28' : 'pb-10')}>
          {children}
        </main>
        {showNav && <Navbar />}
      </div>
    </div>
  );
}