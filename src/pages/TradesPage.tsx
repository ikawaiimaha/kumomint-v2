import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, ArrowLeftRight, Heart, User, Package } from 'lucide-react';

interface Match {
  partner_id: string;
  item_i_want: string;
  item_they_want: string;
  want_priority: number;
  items_i_want_details: any;
  items_they_want_details: any;
}

export default function TradesPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMatches() {
      if (!user) return;
      // Fetch matches and join item details from the 'items' table
      const { data } = await supabase
        .from('trade_matches')
        .select(`
          partner_id,
          want_priority,
          items_i_want_details:items!item_i_want(*),
          items_they_want_details:items!item_they_want(*)
        `)
        .eq('my_id', user.id)
        .order('want_priority', { ascending: false });

      if (data) setMatches(data as any);
      setLoading(false);
    }
    getMatches();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Perfect Matches</h1>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
          Trading in the <span className="text-[var(--accent)]">Sharjah Stars</span>
        </p>
      </header>

      <div className="space-y-6">
        {matches.map((match, idx) => (
          <div key={idx} className="glass-panel p-6 bg-[#1A0B2E]/60 border-[#2D1B4E] relative overflow-hidden shadow-2xl">
            {/* Priority Badge based on your 4-heart system */}
            {match.want_priority === 4 && (
              <div className="absolute top-0 right-0 bg-[var(--accent-pink)] text-white text-[8px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-tighter">
                Dreamy Match
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {/* Item You Receive */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 bg-black/20 rounded-2xl p-2 mb-2 border border-[var(--border-subtle)]">
                  <img src={match.items_i_want_details.image_url} className="w-full h-full object-contain" alt="" />
                </div>
                <span className="text-[8px] font-black uppercase text-center truncate w-full">{match.items_i_want_details.name}</span>
                <span className="text-[10px] text-[var(--accent-blue)] font-black">{match.items_i_want_details.rarity}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <ArrowLeftRight size={24} className="text-[var(--accent)] opacity-50" />
                <div className="flex gap-0.5">
                   {Array.from({ length: match.want_priority }).map((_, i) => (
                     <Heart key={i} size={10} className="fill-[var(--accent-pink)] text-[var(--accent-pink)]" />
                   ))}
                </div>
              </div>

              {/* Item You Give */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 bg-black/20 rounded-2xl p-2 mb-2 border border-[var(--border-subtle)]">
                  <img src={match.items_they_want_details.image_url} className="w-full h-full object-contain" alt="" />
                </div>
                <span className="text-[8px] font-black uppercase text-center truncate w-full">{match.items_they_want_details.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-black">{match.items_they_want_details.rarity}</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--accent)]/20 transition-all">
              <User size={14} /> Open Partner Orbit
            </button>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <Package size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No matches found in your orbit yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
