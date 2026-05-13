import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, LogOut, Package, Heart, Star, Sparkles, Cloud } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-[var(--bg-app)] text-[var(--text-main)]">
      
      {/* ☁️ Header / Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <span className="brand-title text-2xl">Profile</span>
        <button 
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-full bg-[var(--bg-card)] border-2 border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-sm active:scale-90 transition-transform"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* 🎀 User Identity Card */}
      <div className="glass-panel p-6 flex flex-col items-center mb-8 relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-blue)] p-1 mb-4 relative shadow-[0_0_20px_rgba(255,133,162,0.3)]">
          <div className="w-full h-full rounded-full bg-[var(--bg-app)] flex items-center justify-center border-4 border-transparent overflow-hidden">
            <span className="text-4xl">✨</span> {/* Placeholder for Avatar */}
          </div>
          {/* Cute level badge */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--accent-mint)] rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center text-[var(--text-main)] shadow-sm">
            <Star size={12} fill="currentColor" />
          </div>
        </div>

        <h2 className="text-2xl heading-cute text-[var(--text-main)] mb-1">
          {user?.user_metadata?.username || 'KawaiiMahaa'}
        </h2>
        <p className="text-[11px] font-bold tracking-wide text-[var(--accent)] uppercase flex items-center gap-1">
          <Cloud size={12} /> Celestial Voyager
        </p>
      </div>

      {/* ☁️ Current Status Pill Selector */}
      <div className="mb-8">
        <h3 className="text-[12px] font-bold text-[var(--text-muted)] mb-3 flex items-center gap-2 uppercase tracking-widest">
          <Sparkles size={14} className="text-[var(--accent)]" /> Current Status
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Sunny ☀️', 'Playing 🎮', 'Drifting 🍃', 'Dreaming ☁️'].map((status, i) => (
            <button 
              key={status}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-bold border-2 transition-all ${
                i === 3 
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_4px_15px_rgba(255,133,162,0.4)]' 
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent)]/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 🎁 Trade Preferences */}
      <div className="mb-8">
        <h3 className="text-[12px] font-bold text-[var(--text-muted)] mb-3 flex items-center gap-2 uppercase tracking-widest">
          <Heart size={14} className="text-[var(--accent)]" /> Trade Methods
        </h3>
        <div className="flex flex-col gap-3">
          <button className="glass-panel p-4 flex items-center justify-between opacity-60">
            <span className="text-[13px] font-bold">Exchange Tickets Only</span>
          </button>
          <button className="glass-panel p-4 flex items-center justify-between border-[var(--accent-blue)] shadow-[0_0_15px_rgba(112,214,255,0.15)]">
            <span className="text-[13px] font-bold text-[var(--accent-blue)]">All Methods Welcome</span>
            <div className="w-5 h-5 rounded-full bg-[var(--accent-blue)] text-[var(--bg-app)] flex items-center justify-center">
              <span className="text-[10px] font-black">✓</span>
            </div>
          </button>
        </div>
      </div>

      {/* 🚪 Account Actions */}
      <div className="mb-4">
        <button className="w-full glass-panel p-4 flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] flex items-center justify-center">
            <Package size={16} />
          </div>
          <div className="text-left flex-1">
            <p className="text-[13px] font-bold heading-cute">Storage Status</p>
            <p className="text-[10px] font-semibold text-[var(--text-muted)]">5TB Cloud Plan Active</p>
          </div>
        </button>

        <button 
          onClick={() => signOut()}
          className="w-full glass-panel p-4 flex items-center justify-center gap-2 border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
        >
          <LogOut size={16} />
          <span className="text-[13px] font-bold heading-cute">Disconnect from Orbit</span>
        </button>
      </div>

    </div>
  );
}
