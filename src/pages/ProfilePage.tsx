import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Moon, Sun, Edit3, Sparkles, 
  Clock, Package, Settings, ChevronRight 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('traders').select('username').eq('id', user.id).single();
    if (data) setUsername(data.username || 'Kawaii');
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app-dark)] text-[var(--text-main-dark)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app-dark)] text-[var(--text-main-dark)] overflow-hidden">
      <header className="flex justify-between items-center mb-10 relative z-20">
        <h1 className="text-xl font-black uppercase tracking-tighter">My Orbit</h1>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-[var(--bg-card-dark)] border border-dashed border-[var(--accent)]/30">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/notifications')} className="p-2.5 rounded-2xl bg-[var(--bg-card-dark)] relative">
            <Bell size={20} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-400 rounded-full border-2 border-[var(--bg-app-dark)]" />
          </button>
        </div>
      </header>

      <main className="space-y-8 relative">
        <div className="absolute top-4 right-0 w-20 h-20 bg-[#FFF4D2] rounded-full shadow-[0_0_40px_rgba(255,244,210,0.6)] z-0" />

        {/* MAIN PROFILE CARD */}
        <div className="bg-[#EAE4FF] rounded-[32px] p-6 shadow-xl shadow-[var(--accent)]/10 relative overflow-hidden text-[#1A1A1A] z-10 mt-12">
          {/* subtle mint background blur */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)] opacity-20 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-6 mb-8 relative z-10">
            {/* Added shrink-0 to prevent squishing */}
            <div className="w-24 h-24 shrink-0 rounded-full border-2 border-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_rgba(163,137,244,0.3)] bg-white relative">
              <span className="text-4xl font-black text-[var(--accent)]">{username.charAt(0)}</span>
              <button onClick={() => navigate('/edit-profile')} className="absolute -bottom-2 -right-2 p-1.5 bg-[var(--accent)] text-white rounded-full">
                <Edit3 size={14} />
              </button>
            </div>

            {/* Added pr-12 to keep text away from the absolute gear icon */}
            <div className="flex-1 pr-12">
              <h2 className="text-2xl font-black mb-1 break-all">{username}</h2>
              {/* Pronouns and Buddy will go here later! */}
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Syncing with Stars
              </p>
            </div>

            {/* GEAR ICON: Now absolutely positioned to the top right corner */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="absolute top-0 right-0 p-3 bg-white/60 text-[var(--accent)] rounded-2xl"
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="space-y-4 border-t border-[#F0EEFF] pt-6 mb-6">
            <div className="flex justify-between items-center bg-[#F8F7FF] p-5 rounded-2xl">
              <span className="text-sm font-black text-[#666666] uppercase tracking-wider">Total Mints</span>
              <span className="text-xl font-black">{128}</span>
            </div>
            <div className="flex justify-between items-center bg-[#F8F7FF] p-5 rounded-2xl">
              <span className="text-sm font-black text-[#666666] uppercase tracking-wider">Trades</span>
              <span className="text-xl font-black">{14}</span>
            </div>
          </div>

          <button 
            onClick={() => { signOut(); navigate('/login'); }} 
            className="w-full flex justify-between items-center p-5 bg-[#FFF0F0] text-red-500 rounded-2xl font-black text-xs uppercase"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} /> Logout
            </div>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="relative z-10">
           <div className="flex justify-between items-center mb-4 opacity-70">
             <h3 className="font-black text-sm uppercase">Recent Finds</h3>
             <Package size={16} />
           </div>
           <div className="py-8 flex flex-col items-center justify-center">
              <img 
                src="/kumo-sad.png" 
                alt="Sad Kumoru" 
                className="w-24 h-24 mb-4 drop-shadow-lg opacity-80" 
              />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">No items in orbit</p>
           </div>
        </div>
      </main>
    </div>
  );
}
