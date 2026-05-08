import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowLeftRight, User, Package, ChevronRight } from 'lucide-react';

interface Match {
  trader_id: string;
  username: string;
  avatar_url: string;
  item_name: string;
}

export default function TradePage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Better Alternative: RPC Matching
  const searchMatches = useCallback(async (haveId: string, wantId: string) => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase.rpc('find_perfect_matches', {
      my_id: user.id,
      want_item_id: wantId,
      have_item_id: haveId
    });

    if (!error && data) setMatches(data);
    setLoading(false);
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-32 px-6 pt-10">
      <header className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Matchmaker</h1>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Finding signals in the nebula</p>
      </header>

      <main className="space-y-6">
        {/* Selection Area (Simplified for now) */}
        <div className="glass-panel p-6 flex items-center justify-around">
          <div className="text-center">
            <div className="w-12 h-12 glass-panel flex items-center justify-center mb-2"><Package size={20} /></div>
            <p className="text-[8px] font-black uppercase">Have</p>
          </div>
          <ArrowLeftRight size={20} className="text-[var(--accent)]" />
          <div className="text-center">
            <div className="w-12 h-12 glass-panel flex items-center justify-center mb-2 text-[var(--accent)]"><Sparkles size={20} /></div>
            <p className="text-[8px] font-black uppercase">Want</p>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase opacity-30 px-1">Potential Swaps</h3>
          
          {loading ? (
             <div className="py-10 text-center"><Sparkles className="animate-spin mx-auto text-[var(--accent)]" /></div>
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.trader_id} className="glass-panel p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bg-app)] border border-[var(--border)] overflow-hidden">
                    {match.avatar_url ? <img src={match.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={20} className="m-2.5 opacity-20" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic">@{match.username}</h4>
                    <p className="text-[10px] font-bold opacity-40">Trading: {match.item_name}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="opacity-20" />
              </div>
            ))
          ) : (
            <div className="py-10 glass-panel border-dashed text-center opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest">No active signals found</p>
            </div>
          )}
        </div>
        
        {/* Manual Trigger for Testing */}
        <button 
          onClick={() => searchMatches('item_a_id', 'item_b_id')}
          className="w-full py-4 moonie-btn text-white rounded-2xl font-black text-xs uppercase"
        >
          Scan Galaxy
        </button>
      </main>
    </div>
  );
}
