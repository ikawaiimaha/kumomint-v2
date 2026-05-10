import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Inbox, Send, CheckCircle2, 
  XCircle, ArrowRightLeft, Clock, Sparkles, Package 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Types
type DbItem = { id: string, name: string, rarity: string, image_url: string };
type Trade = {
  id: string,
  initiator_id: string,
  receiver_id: string,
  offered_items: string[],
  requested_items: string[],
  status: string,
  created_at: string
};

export default function TradeInboxPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [itemDictionary, setItemDictionary] = useState<Record<string, DbItem>>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch real trades and the associated items
  const fetchInboxData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch trades where user is involved
      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (tradeError) throw tradeError;
      
      const fetchedTrades = (tradeData as Trade[]) || [];
      setTrades(fetchedTrades);

      // 2. Collect all unique item IDs from these trades
      const allItemIds = new Set<string>();
      fetchedTrades.forEach(t => {
        t.offered_items.forEach(id => allItemIds.add(id));
        t.requested_items.forEach(id => allItemIds.add(id));
      });

      // 3. Fetch item details for the dictionary
      if (allItemIds.size > 0) {
        const { data: itemData } = await supabase
          .from('items')
          .select('*')
          .in('id', Array.from(allItemIds));

        if (itemData) {
          const dict: Record<string, DbItem> = {};
          itemData.forEach(item => dict[item.id] = item);
          setItemDictionary(dict);
        }
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInboxData();
  }, [fetchInboxData]);

  // Handle Trade Actions
  const handleAccept = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      // Call the SQL Function we created in Supabase
      const { error } = await supabase.rpc('accept_trade', { trade_uuid: tradeId });
      if (error) throw error;
      
      // Update local state instantly
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'accepted' } : t));
    } catch (err) {
      console.error(err);
      alert("Trade failed: Make sure both players still own the items!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (tradeId: string, status: 'declined' | 'cancelled') => {
    setProcessingId(tradeId);
    try {
      const { error } = await supabase
        .from('trades')
        .update({ status })
        .eq('id', tradeId);
      if (error) throw error;
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status } : t));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter based on tab and hide non-pending
  const filteredTrades = trades.filter(trade => {
    const isIncoming = trade.receiver_id === user?.id;
    const matchesTab = activeTab === 'incoming' ? isIncoming : !isIncoming;
    return matchesTab && trade.status === 'pending';
  });

  // Tiny Rarity Colors
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'SR': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      case 'N': return 'text-[var(--text-muted)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  // Helper to render tiny item preview grids
  const renderItemPreview = (itemIds: string[]) => (
    <div className="flex flex-wrap gap-2">
      {itemIds.map(id => {
        const item = itemDictionary[id];
        if (!item) return null;
        
        return (
          <div key={id} className="flex flex-col items-center group">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-lg shadow-sm mb-1 overflow-hidden">
              {item.image_url ? <img src={item.image_url} alt="item" className="w-full h-full object-cover"/> : <Package size={16} className="text-[var(--text-muted)]" />}
            </div>
            <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity || 'N'}</span>
          </div>
        );
      })}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      
      <header className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
            <ChevronLeft size={20} className="text-[var(--text-muted)]" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter">Trade Inbox</h1>
          <div className="w-10" />
        </div>

        {/* INCOMING / OUTGOING TABS */}
        <div className="glass-panel p-1.5 flex rounded-full relative z-10">
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'incoming' 
                ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_rgba(163,137,244,0.4)]' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
            }`}
          >
            <Inbox size={14} /> Incoming
            {trades.some(t => t.receiver_id === user?.id && t.status === 'pending') && (
              <span className="w-2 h-2 bg-pink-400 rounded-full border border-white dark:border-[#0F0B1E]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'outgoing' 
                ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_rgba(163,137,244,0.4)]' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
            }`}
          >
            <Send size={14} /> Outgoing
          </button>
        </div>
      </header>

      <main className="space-y-4 relative z-10">
        {filteredTrades.length > 0 ? (
          filteredTrades.map(trade => (
            <div key={trade.id} className="glass-panel p-5 relative animate-in fade-in slide-in-from-bottom-4">
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] border border-[var(--accent)] flex items-center justify-center font-black text-[var(--accent)] text-xs">
                    ?
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black">Trade Proposal</span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                      <Clock size={10} /> Pending
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
                  Action Required
                </span>
              </div>

              {/* Trade Details */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex-1 bg-[var(--bg-app)]/50 p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                    {activeTab === 'incoming' ? 'They Offer' : 'You Offer'}
                  </span>
                  {renderItemPreview(trade.offered_items)}
                </div>

                <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                  <ArrowRightLeft size={14} />
                </div>

                <div className="flex-1 bg-[var(--bg-app)]/50 p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                    {activeTab === 'incoming' ? 'They Request' : 'You Request'}
                  </span>
                  {renderItemPreview(trade.requested_items)}
                </div>
              </div>

              {/* Action Buttons */}
              {activeTab === 'incoming' ? (
                <div className="flex gap-3">
                  <button 
                    disabled={!!processingId}
                    onClick={() => handleDecline(trade.id, 'declined')}
                    className="flex-1 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl font-black text-[10px] uppercase transition-colors flex justify-center items-center gap-1.5"
                  >
                    <XCircle size={14} /> Decline
                  </button>
                  <button 
                    disabled={!!processingId}
                    onClick={() => handleAccept(trade.id)}
                    className="flex-1 py-3 bg-[var(--accent-green)] text-[#1A1A1A] rounded-xl font-black text-[10px] uppercase shadow-lg shadow-[var(--accent-green)]/20 flex justify-center items-center gap-1.5"
                  >
                    {processingId === trade.id ? <Sparkles className="animate-spin" size={14}/> : <CheckCircle2 size={14} />} 
                    Accept
                  </button>
                </div>
              ) : (
                <button 
                  disabled={!!processingId}
                  onClick={() => handleDecline(trade.id, 'cancelled')}
                  className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl font-black text-[10px] uppercase flex justify-center items-center gap-1.5"
                >
                  <XCircle size={14} /> Cancel Request
                </button>
              )}

            </div>
          ))
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <img src="/kumo-sad.png" alt="Empty" className="w-24 h-24 mb-4 drop-shadow-lg opacity-60 grayscale" />
            <p className="font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">
              No pending {activeTab} trades.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
