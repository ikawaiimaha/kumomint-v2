import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Check, 
  Sparkles,
  Clock,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

interface TradeProposal {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  sender_item: any;
  receiver_item: any;
}

export default function TradeInboxPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<TradeProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchProposals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trade_proposals')
      .select(`
        id, status, created_at, sender_id, receiver_id,
        sender_item:items!sender_item_id(*),
        receiver_item:items!receiver_item_id(*)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (data) setProposals(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchProposals(); }, [user]);

  const updateStatus = async (tradeId: string, newStatus: string) => {
    const { error } = await supabase
      .from('trade_proposals')
      .update({ status: newStatus })
      .eq('id', tradeId);
    
    if (!error) fetchProposals();
  };

  /**
   * 🔄 AUTO-SWAP LOGIC
   * Calls the database function to swap items and update status.
   */
  const handleCompleteTrade = async (tradeId: string) => {
    setProcessing(tradeId);
    try {
      const { error } = await supabase.rpc('complete_trade_and_swap', {
        trade_uuid: tradeId
      });
      
      if (error) throw error;
      await fetchProposals();
    } catch (err) {
      console.error("Trade finalization failed:", err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Trade Command</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-pink)] animate-pulse" />
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Zero-Chat Secure Trading</p>
        </div>
      </header>

      <div className="space-y-6">
        {proposals.map((trade) => {
          const isIncoming = trade.receiver_id === user?.id;
          const partnerId = isIncoming ? trade.sender_id : trade.receiver_id;
          const isProcessing = processing === trade.id;

          return (
            <div key={trade.id} className={`glass-panel p-6 border-[#2D1B4E] relative overflow-hidden transition-all ${trade.status === 'completed' ? 'opacity-40 grayscale-[0.5]' : 'bg-[#1A0B2E]/60'}`}>
              
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--accent-blue)]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {isIncoming ? 'Incoming Request' : 'Outgoing Request'}
                    </span>
                 </div>
                 <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${
                   trade.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 
                   trade.status === 'completed' ? 'bg-white/10 text-white' : 
                   trade.status === 'declined' ? 'bg-red-500/20 text-red-400' : 'bg-[var(--accent)]/20 text-[var(--accent)]'
                 }`}>
                   {trade.status}
                 </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-4 border-y border-white/5 mb-6">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 bg-black/40 rounded-2xl p-2 mb-2 border border-white/5">
                    <img src={trade.sender_item.image_url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <span className="text-[7px] font-black uppercase text-[var(--text-muted)] text-center">{trade.sender_item.name}</span>
                </div>

                <ArrowLeftRight size={20} className="text-[var(--accent)] opacity-30" />

                <div className="flex-1 flex flex-col items-center">
                  <div className="w-16 h-16 bg-black/40 rounded-2xl p-2 mb-2 border border-white/5">
                    <img src={trade.receiver_item.image_url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <span className="text-[7px] font-black uppercase text-[var(--text-muted)] text-center">{trade.receiver_item.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {trade.status === 'pending' && isIncoming && (
                  <>
                    <button 
                      onClick={() => updateStatus(trade.id, 'accepted')}
                      className="py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={12} /> Accept
                    </button>
                    <button 
                      onClick={() => updateStatus(trade.id, 'declined')}
                      className="py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <XCircle size={12} /> Refuse
                    </button>
                  </>
                )}

                {trade.status === 'accepted' && (
                  <button 
                    disabled={isProcessing}
                    onClick={() => handleCompleteTrade(trade.id)}
                    className="col-span-2 py-4 bg-[var(--accent)] text-[var(--bg-app)] rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isProcessing ? <Sparkles className="animate-spin" size={16} /> : <PackageCheck size={16} />}
                    {isProcessing ? 'Updating Inventories...' : 'Finalize & Swap Items'}
                  </button>
                )}

                {(trade.status === 'pending' || trade.status === 'declined') && (
                  <button 
                    onClick={() => navigate(`/propose-trade/${partnerId}`)}
                    className="col-span-2 py-3 bg-white/5 border border-white/10 text-[var(--text-main)] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={12} /> Propose Counter Offer
                  </button>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center opacity-30">
                <div className="flex items-center gap-1.5">
                  <Clock size={10} />
                  <span className="text-[7px] font-black uppercase">{new Date(trade.created_at).toLocaleDateString()}</span>
                </div>
                <span className="text-[7px] font-black uppercase tracking-tighter italic">Secured by Orbit</span>
              </div>
            </div>
          );
        })}

        {proposals.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <ArrowLeftRight size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No orbital transmissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
