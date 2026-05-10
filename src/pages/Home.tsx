import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, Sparkles, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('Dreamer');

  // Fetch the user's display name for a warm greeting
  useEffect(() => {
    async function getUsername() {
      if (!user) return;
      const { data } = await supabase
        .from('traders')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (data && data.username) {
        setUsername(data.username);
      }
    }
    getUsername();
  }, [user]);

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-[-5%] left-[-10%] w-64 h-64 bg-[var(--accent)] opacity-20 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-48 h-48 bg-[var(--accent-sky)] opacity-20 blur-[60px] rounded-full pointer-events-none" />

      <header className="mb-10 relative z-10 flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--accent-pink)]" /> 
            Welcome back,
          </h2>
          <h1 className="text-3xl font-black tracking-tight">{username}</h1>
        </div>
        
        {/* Little Teacup Kumoru Greeting - Now links to test Public Profile! */}
        <div 
          onClick={() => navigate('/user/123')}
          className="w-16 h-16 animate-[float_6s_ease-in-out_infinite] drop-shadow-lg cursor-pointer hover:scale-110 transition-transform"
        >
          <img src="/kumo-sad.png" alt="Kumoru" className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(163,137,244,0.3)]" />
        </div>
      </header>

      <main className="space-y-8 relative z-10">
        
        {/* TIER STATUS - Upgraded to Glassmorphism */}
        <div className="glass-panel p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 rounded-bl-[100px] transition-transform group-hover:scale-110" />
          
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Current Tier</p>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl font-black text-[var(--accent)] drop-shadow-sm">Daydream</h2>
            <Star className="text-[var(--accent-pink)] fill-[var(--accent-pink)] animate-pulse" size={24} />
          </div>
          
          <div className="w-24 h-2 bg-[var(--bg-app)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div className="w-1/3 h-full bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/wardrobe')}
            className="glass-panel p-6 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--accent-sky)]/20 flex items-center justify-center border border-[var(--accent-sky)]/30 group-hover:scale-110 transition-transform">
              <Package size={24} className="text-[var(--accent-sky)]" />
            </div>
            <span className="font-black text-sm uppercase tracking-wider text-[var(--text-main)]">Wardrobe</span>
          </button>

          <button 
            onClick={() => navigate('/catalog')}
            className="glass-panel p-6 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--accent-pink)]/20 flex items-center justify-center border border-[var(--accent-pink)]/30 group-hover:scale-110 transition-transform">
              <Heart size={24} className="text-[var(--accent-pink)] fill-[var(--accent-pink)]/20" />
            </div>
            <span className="font-black text-sm uppercase tracking-wider text-[var(--text-main)]">Wishlist</span>
          </button>
        </div>

        {/* IN ORBIT NOW SECTION */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg">In Orbit Now</h3>
            <button className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="glass-panel p-8 flex flex-col items-center justify-center border-dashed">
            <Sparkles size={32} className="text-[var(--border-subtle)] mb-3" />
            <p className="text-sm font-bold text-[var(--text-muted)] text-center">
              The galaxy is quiet today.<br/>Go mint some new items!
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
