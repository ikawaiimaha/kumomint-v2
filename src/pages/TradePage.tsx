import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftRight, Sparkles, User, Package } from 'lucide-react';

export default function TradePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const searchMatches = useCallback(async (haveId: string, wantId: string) => {
    if (!user) return;
    setLoading(true);
    await supabase.rpc('find_perfect_matches', {
      my_id: user.id,
      want_item_id: wantId,
      have_item_id: haveId
    });
    setLoading(false);
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-32 px-6 pt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Matchmaker</h1>
        <Sparkles size={20} className={loading ? "animate-spin text-[var(--accent)]" : "text-[var(--accent)]"} />
      </div>

      <div className="glass-panel p-6 flex items-center justify-around mb-8">
        <div className="text-center">
          <div className="w-12 h-12 glass-panel flex items-center justify-center mb-2"><Package size={20} /></div>
          <p className="text-[8px] font-black uppercase">Have</p>
        </div>
        <ArrowLeftRight size={20} className="text-[var(--accent)]" />
        <div className="text-center">
          <div className="w-12 h-12 glass-panel flex items-center justify-center mb-2 text-[var(--accent)]"><User size={20} /></div>
          <p className="text-[8px] font-black uppercase">Want</p>
        </div>
      </div>

      <button 
        onClick={() => searchMatches('dummy_id', 'dummy_id')}
        className="w-full py-4 moonie-btn text-white rounded-2xl font-black text-xs uppercase"
      >
        Scan Orbit
      </button>
    </div>
  );
}
