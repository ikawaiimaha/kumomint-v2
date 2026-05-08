import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Moon, Sun, Edit3, Sparkles, Clock, Package } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Declare fetch function BEFORE the useEffect
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-black uppercase tracking-tighter">My Orbit</h1>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="p-2 glass-card">
            {theme === 'dark' ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/notifications')} className="p-2 glass-card relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full border-2 border-[var(--bg-primary)]" />
          </button>
        </div>
      </header>

      <main className="space-y-6">
        {/* Main Profile Card */}
        <div className="glass-card p-8 text-center relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)] opacity-10 blur-3xl" />
          
          <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[32px] mx-auto mb-4 border-2 border-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_rgba(163,137,244,0.3)]">
            <span className="text-3xl font-black text-[var(--accent)]">{username.charAt(0)}</span>
          </div>

          <h2 className="text-2xl font-black mb-1">{username}</h2>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
            <Clock size={12} /> Syncing with Stars
          </p>

          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-[#A389F4]/20">
              <Edit3 size={14} className="inline mr-2" /> Edit Persona
            </button>
            <button onClick={() => { signOut(); navigate('/login'); }} className="p-3 glass-card text-red-400">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 text-center">
            <p className="text-[10px] font-black opacity-30 uppercase mb-1">Total Mints</p>
            <p className="text-2xl font-black">128</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-[10px] font-black opacity-30 uppercase mb-1">Trades</p>
            <p className="text-2xl font-black">14</p>
          </div>
        </div>

        {/* Empty State Preview */}
        <div className="opacity-40">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-black text-sm uppercase">Recent Finds</h3>
             <Package size={16} />
           </div>
           <div className="h-32 border-2 border-dashed border-[var(--border)] rounded-[32px] flex items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest">No items in orbit</p>
           </div>
        </div>
      </main>
    </div>
  );
}
