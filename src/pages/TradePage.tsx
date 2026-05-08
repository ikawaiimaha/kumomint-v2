import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftRight, Sparkles, Package, Search } from 'lucide-react';

export default function TradePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const searchMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    // Placeholder IDs for the build to pass
    await supabase.rpc('find_perfect_matches', {
      my_id: user.id,
      want_item_id: '00000000-0000-0000-0000-000000000000',
      have_item_id: '00000000-0000-0000-0000-000000000000'
    });
    setLoading(false);
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-32 px-6 pt-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Matchmaker</h1>
        <div className={loading ? "animate-spin" : ""}>
          <Sparkles size={20} className="text-[var(--accent)]" />
        </div>
      </header>

      <div className="glass-panel p-6 flex items-center justify-around mb-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 glass-panel flex items-center justify-center">
            <Package size={20} />
          </div>
          <span className="text-[8px] font-black uppercase opacity-40">Have</span>
        </div>
        
        <ArrowLeftRight size={20} className="text-[var(--accent)] opacity-50" />
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 glass-panel flex items-center justify-center">
            <Search size={20} className="text-[var(--accent)]" />
          </div>
          <span className="text-[8px] font-black uppercase opacity-40">Want</span>
        </div>
      </div>

      <button 
        onClick={searchMatches}
        className="w-full py-4 moonie-btn text-white rounded-2xl font-black text-xs uppercase"
      >
        Find Swaps
      </button>
    </div>
  );
}
