import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Inbox, Send, CheckCircle2, XCircle, ArrowRightLeft, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// --- MOCK DATA ---
type Item = { id: number, name: string, rarity: string, image: string };
type TradeOffer = {
  id: string,
  type: 'incoming' | 'outgoing',
  otherUser: { name: string, avatar: string },
  giving: Item[],    // What the initiator is giving
  receiving: Item[], // What the initiator wants
  status: 'pending' | 'accepted' | 'declined',
  timeAgo: string
};

const MOCK_TRADES: TradeOffer[] = [
  {
    id: "trd_1",
    type: 'incoming',
    otherUser: { name: "StarBoi99", avatar: "S" },
    giving: [{ id: 201, name: "Dreamy Carousel", rarity: "SSR", image: "🎠" }],
    receiving: [
      { id: 101, name: "Cinnamoroll Cloud Hat", rarity: "SR", image: "☁️" },
      { id: 102, name: "Star Pin", rarity: "R", image: "⭐" }
    ],
    status: 'pending',
    timeAgo: "10m ago"
  },
  {
    id: "trd_2",
    type: 'incoming',
    otherUser: { name: "MelodyFan", avatar: "M" },
    giving: [{ id: 202, name: "Cozy Nightcap", rarity: "N", image: "🌙" }],
    receiving: [{ id: 103, name: "Pastel Sparkles", rarity: "N", image: "✨" }],
    status: 'pending',
    timeAgo: "2h ago"
  },
  {
    id: "trd_3",
    type: 'outgoing',
    otherUser: { name: "KuromiQueen", avatar: "K" },
    giving: [{ id: 104, name: "Galaxy Wand", rarity: "SSR", image: "🪄" }],
    receiving: [{ id: 204, name: "Spooky Ribbon", rarity: "SR", image: "🎀" }],
    status: 'pending',
    timeAgo: "1d ago"
  }
];

export default function TradeInboxPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  const filteredTrades = MOCK_TRADES.filter(trade => trade.type === activeTab);

  // Tiny Rarity Colors
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'SR': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      case 'N': return 'text-[var(--text-muted)]';
      default: return '';
    }
  };

  // Helper to render tiny item preview grids
  const renderItemPreview = (items: Item[]) => (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <div key={item.id} className="flex flex-col items-center group">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-lg shadow-sm mb-1">
            {item.image}
          </div>
          <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
        </div>
      ))}
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
          <div className="w-10" /> {/* Spacer */}
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
            {/* Notification Dot */}
            <span className="w-2 h-2 bg-pink-400 rounded-full border border-white dark:border-[#0F0B1E]" />
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
                    {trade.otherUser.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black">{trade.otherUser.name}</span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                      <Clock size={10} /> {trade.timeAgo}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
                  Pending
                </span>
              </div>

              {/* Trade Details (Mini UI) */}
              <div className="flex items-center justify-between gap-2 mb-6">
                
                {/* Left Side: What You Get (if incoming) or What You Give (if outgoing) */}
                <div className="flex-1 bg-[var(--bg-app)]/50 p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                    {activeTab === 'incoming' ? 'They Offer' : 'You Offer'}
                  </span>
                  {renderItemPreview(trade.giving)}
                </div>

                {/* Exchange Icon */}
                <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                  <ArrowRightLeft size={14} />
                </div>

                {/* Right Side: What You Give (if incoming) or What You Get (if outgoing) */}
                <div className="flex-1 bg-[var(--bg-app)]/50 p-3 rounded-2xl border border-[var(--border-subtle)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">
                    {activeTab === 'incoming' ? 'They Request' : 'You Request'}
                  </span>
                  {renderItemPreview(trade.receiving)}
                </div>

              </div>

              {/* Action Buttons */}
              {activeTab === 'incoming' ? (
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl font-black text-[10px] uppercase hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors flex justify-center items-center gap-1.5">
                    <XCircle size={14} /> Decline
                  </button>
                  <button className="flex-1 py-3 bg-[var(--accent-green)] text-[#1A1A1A] rounded-xl font-black text-[10px] uppercase shadow-lg shadow-[var(--accent-green)]/20 hover:opacity-90 transition-opacity flex justify-center items-center gap-1.5">
                    <CheckCircle2 size={14} /> Accept
                  </button>
                </div>
              ) : (
                <button className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl font-black text-[10px] uppercase hover:bg-[var(--bg-secondary)] transition-colors flex justify-center items-center gap-1.5">
                  <XCircle size={14} /> Cancel Request
                </button>
              )}

            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <img src="/kumo-sad.png" alt="Empty" className="w-24 h-24 mb-4 drop-shadow-lg opacity-60 grayscale" />
            <p className="font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">
              No {activeTab} trades found.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
