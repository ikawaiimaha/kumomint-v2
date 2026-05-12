import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MessageSquare, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';

interface TradeProposal {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender_item: any;
  receiver_item: any;
}

export default function TradeInboxPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [proposals, setProposals] = useState<TradeProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      if (!user) return;

      // FIXED: Removed unused 'error' declaration to resolve TS6133
      const { data } = await supabase
        .from('trade_proposals')
        .select(`
          id, 
          status, 
          created_at,
          sender_item:items!sender_item_id(*),
          receiver_item:items!receiver_item_id(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (data) setProposals(data as any);
      setLoading(false);
    }
    fetchProposals();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Trade Inbox</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-pink)] animate-pulse" />
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
            Active Proposals
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {proposals.length > 0 ? (
          proposals.map((trade) => (
            <div key={trade.id} className="glass-panel p-5 bg-[#1A0B2E]/60 border-[#2D1B4E] relative overflow-hidden">
              
              {/* Status Badge */}
              <div className="absolute top-0 right-0 px-3 py-1 bg-[#0C0F21] rounded-bl-xl border-l border-b border-[#2D1B4E]">
                <span className={`text-[7px] font-black uppercase tracking-widest ${
                  trade.status === 'accepted' ? 'text-green-400' : 
                  trade.status === 'declined' ? 'text-red-400' : 'text-[var(--accent-blue)]'
                }`}>
                  {trade.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2">
                {/* Their Offer */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 bg-black/40 rounded-xl p-2 mb-2 border border-[#2D1B4E]">
                    <img src={trade.sender_item.image_url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full text-[var(--text-muted)]">They Give</span>
                </div>

                <ArrowLeftRight size={16} className="opacity-20 text-[var(--accent)]" />

                {/* Your Item */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 bg-black/40 rounded-xl p-2 mb-2 border border-[#2D1B4E]">
                    <img src={trade.receiver_item.image_url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full text-[var(--text-muted)]">You Give</span>
                </div>
              </div>

              {/* Action Buttons (Only for pending trades) */}
              {trade.status === 'pending' && (
                <div className="flex gap-2 mt-5">
                  <button className="flex-1 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle2 size={12} /> Accept
                  </button>
                  <button className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <XCircle size={12} /> Decline
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#2D1B4E] flex justify-between items-center">
                <div className="flex items-center gap-1.5 opacity-40">
                  <Clock size={10} />
                  <span className="text-[7px] font-bold uppercase tracking-tighter">
                    {new Date(trade.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button className="p-2 bg-[#0C0F21] rounded-lg text-[var(--accent)]">
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-20">
            <MessageSquare size={40} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No transmissions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
