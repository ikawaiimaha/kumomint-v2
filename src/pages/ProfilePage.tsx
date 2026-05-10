import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Moon, Sun, Edit3, Sparkles, 
  Clock, Package, Settings, ChevronRight, Calendar, Heart 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Grouped profile state for cleaner code
  const [profile, setProfile] = useState({
    username: '',
    pronouns: '',
    sanrioBuddy: '',
    tradeVibe: '',
    birthday: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('traders')
      .select('username, pronouns, sanrio_buddy, trade_vibe, birthday')
      .eq('id', user.id)
      .single();
      
    if (data) {
      setProfile({
        username: data.username || 'Kawaii',
        pronouns: data.pronouns || '',
        sanrioBuddy: data.sanrio_buddy || '',
        tradeVibe: data.trade_vibe || '',
        birthday: data.birthday || ''
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden transition-colors duration-500">
      
      <header className="flex justify-between items-center mb-10 relative z-20">
        <h1 className="text-xl font-black uppercase tracking-tighter">My Orbit</h1>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors duration-500">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
          </button>
          
          {/* Linked to the new Trade Inbox */}
          <button onClick={() => navigate('/inbox')} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] relative transition-colors duration-500">
            <Bell size={20} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--accent-pink)] rounded-full border-2 border-[var(--bg-app)]" />
          </button>
        </div>
      </header>

      <main className="space-y-8 relative">
        {/* Subtle glow behind the card */}
        <div className="absolute top-4 right-0 w-20 h-20 bg-[var(--accent-sky)] rounded-full blur-3xl opacity-30 z-0" />

        {/* MAIN PROFILE CARD using the glass-panel class */}
        <div className="glass-panel p-6 relative overflow-hidden z-10 mt-12">
          
          <div className="flex items-center gap-6 mb-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 shrink-0 rounded-full border-2 border-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_rgba(163,137,244,0.3)] bg-[var(--bg-card)] relative">
              <span className="text-4xl font-black text-[var(--accent)]">{profile.username.charAt(0)}</span>
              <button onClick={() => navigate('/edit-profile')} className="absolute -bottom-2 -right-2 p-1.5 bg-[var(--accent)] text-white rounded-full hover:scale-110 transition-transform shadow-md">
                <Edit3 size={14} />
              </button>
            </div>

            {/* Identity Info */}
            <div className="flex-1 pr-12">
              <h2 className="text-2xl font-black mb-1 break-all">{profile.username}</h2>
              
              {/* PRONOUNS DISPLAY */}
              {profile.pronouns && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-2 inline-block uppercase tracking-wider">
                  {profile.pronouns}
                </span>
              )}
              
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2 mt-1">
                <Clock size={12} /> Syncing with Stars
              </p>
            </div>

            {/* Absolute Gear Icon */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="absolute top-0 right-0 p-3 bg-[var(--bg-app)]/50 text-[var(--accent)] rounded-2xl hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* SANRIO BUDDY DISPLAY */}
          {profile.sanrioBuddy && (
            <div className="mb-6 flex items-center gap-2 text-xs font-bold bg-[var(--bg-app)]/50 px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] w-fit text-[var(--text-main)]">
              <Heart size={14} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]" />
              Buddy: <span className="text-[var(--accent)]">{profile.sanrioBuddy}</span>
            </div>
          )}

          {/* STATS GRID */}
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-6 mb-6">
            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1">Mints</span>
              <span className="text-lg font-black">128</span>
            </div>
            
            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1">Trades</span>
              <span className="text-lg font-black">14</span>
            </div>

            {/* TRADE VIBE DISPLAY */}
            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1">Trade Vibe</span>
              <span className="text-sm font-black text-[var(--accent)]">{profile.tradeVibe || 'Mystery'}</span>
            </div>

            {/* BIRTHDAY DISPLAY */}
            <div className="flex flex-col bg-[var(--bg-app)]/40 p-4 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1">Birthday</span>
              <span className="text-sm font-black flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--accent-pink)]"/> 
                {profile.birthday || '??/??'}
              </span>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button 
            onClick={() => { signOut(); navigate('/login'); }} 
            className="w-full flex justify-between items-center p-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs uppercase hover:bg-red-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} /> Logout
            </div>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* RECENT FINDS SECTION */}
        <div className="relative z-10">
           <div className="flex justify-between items-center mb-4 text-[var(--text-muted)] px-2">
             <h3 className="font-black text-sm uppercase">Recent Finds</h3>
             <Package size={16} />
           </div>
           
           <div className="glass-panel py-8 flex flex-col items-center justify-center border-dashed">
              <img 
                src="/kumo-sad.png" 
                alt="Sad Kumoru" 
                className="w-24 h-24 mb-4 drop-shadow-lg opacity-80 grayscale transition-all hover:grayscale-0" 
                onError={(e) => {
                  // Fallback if the image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No items in orbit</p>
           </div>
        </div>
      </main>
    </div>
  );
}
