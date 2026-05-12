import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Cloud, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Ticket, 
  Gift, 
  Check,
  Package,
  Heart
} from 'lucide-react';

interface Profile {
  username: string;
  buddy: string;
  vibe: string;
  current_status: 'sunny' | 'playing' | 'drifting' | 'dreaming';
  preferred_method: 'tickets_only' | 'gifts_only' | 'both';
  unlocked_badges: string[];
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('traders')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('traders')
      .update(updates)
      .eq('id', user.id);

    if (!error) setProfile({ ...profile, ...updates });
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      
      {/* 🌌 Hero Section */}
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-[#1A0B2E] border-2 border-[var(--accent)] p-0 overflow-hidden relative">
            {/* Avatar Layering: Pinned to 0,0 */}
            <User className="absolute inset-0 m-auto text-[var(--accent)] opacity-20" size={48} />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent)]/10 to-transparent" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[var(--bg-app)] p-1.5 rounded-full border border-[var(--border-subtle)]">
            <ShieldCheck size={16} className="text-[var(--accent-blue)]" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">
          {profile?.username || user?.email?.split('@')[0]}
        </h1>
        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
          {profile?.vibe || "Celestial Voyager"}
        </p>
      </header>

      {/* ☁️ Kumomint Cloud Statuses */}
      <section className="mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Cloud size={14} className="text-[var(--accent)]" /> Current Status
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {(['sunny', 'playing', 'drifting', 'dreaming'] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateProfile({ current_status: status })}
              className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-tighter transition-all ${
                profile?.current_status === status 
                ? 'bg-[var(--accent)] text-[var(--bg-app)] border-transparent scale-105' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] opacity-60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* ⇆ Trade Method Preferences */}
      <section className="mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Settings size={14} className="text-[var(--accent-blue)]" /> Trade Methods
        </h3>
        <div className="space-y-2">
          {[
            { id: 'tickets_only', label: 'Exchange Tickets Only', icon: Ticket },
            { id: 'gifts_only', label: 'Gift Exchange Only', icon: Gift },
            { id: 'both', label: 'All Methods Welcome', icon: Sparkles }
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => updateProfile({ preferred_method: method.id as any })}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                profile?.preferred_method === method.id 
                ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]' 
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <method.icon size={18} className={profile?.preferred_method === method.id ? 'text-[var(--accent-blue)]' : ''} />
                <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
              </div>
              {profile?.preferred_method === method.id && <Check size={14} className="text-[var(--accent-blue)]" />}
            </button>
          ))}
        </div>
      </section>

      {/* 🏆 Unlocked Badges */}
      <section className="mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-4">Reputation</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.unlocked_badges.map((badge) => (
            <div key={badge} className="px-3 py-1.5 bg-[#1A0B2E] border border-[var(--accent-pink)]/30 rounded-lg flex items-center gap-2">
              <Sparkles size={10} className="text-[var(--accent-pink)]" />
              <span className="text-[7px] font-black uppercase text-[var(--accent-pink)]">{badge}</span>
            </div>
          )) || (
            <p className="text-[8px] font-bold text-[var(--text-muted)] italic">No badges unlocked yet...</p>
          )}
        </div>
      </section>

      {/* ⚙️ Account Actions */}
      <div className="space-y-3">
        <div className="glass-panel p-5 bg-[#1A0B2E]/40 border-[#2D1B4E] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-[var(--accent-blue)]" />
            <div>
              <p className="text-[9px] font-black uppercase">Storage Status</p>
              <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">5TB Cloud Plan Active</p>
            </div>
          </div>
          <Heart size={14} className="text-[var(--accent-pink)]" />
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
        >
          <LogOut size={16} /> Disconnect from Orbit
        </button>
      </div>

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <Sparkles className="animate-spin text-[var(--accent)]" size={24} />
        </div>
      )}
    </div>
  );
}
