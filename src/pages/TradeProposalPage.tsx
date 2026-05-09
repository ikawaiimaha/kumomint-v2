import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRightLeft, Plus, X, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// 1. The HKDV Point System
const RARITY_POINTS: Record<string, number> = {
  'N': 1,
  'R': 3,
  'SR': 10,
  'SSR': 30
};

// Types
type Item = { id: number, name: string, rarity: string, image: string };

// Mock Inventories to choose from (Later, you will fetch these from Supabase!)
const MY_INVENTORY: Item[] = [
  { id: 101, name: "Cinnamoroll Cloud Hat", rarity: "SR", image: "☁️" },
  { id: 102, name: "Pastel Sparkles", rarity: "N", image: "✨" },
  { id: 103, name: "Galaxy Wand", rarity: "SSR", image: "🪄" },
  { id: 104, name: "Star Pin", rarity: "R", image: "⭐" }
];

const THEIR_INVENTORY: Item[] = [
  { id: 201, name: "Moonlit Ribbon", rarity: "R", image: "🎀" },
  { id: 202, name: "Cozy Nightcap", rarity: "N", image: "🌙" },
  { id: 203, name: "Fluffy Cloud Bed", rarity: "SR", image: "☁️" },
  { id: 204, name: "Dreamy Carousel", rarity: "SSR", image: "🎠" }
];

export default function TradeProposalPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [tradeSent, setTradeSent] = useState(false);

  // Dynamic States for the Trade Offers
  const [myOffer, setMyOffer] = useState<Item[]>([]);
  const [theirOffer, setTheirOffer] = useState<Item[]>([]);
  
  // State to control the Selection Modal ('mine' or 'theirs')
  const [isSelectingFor, setIsSelectingFor] = useState<'mine' | 'theirs' | null>(null);

  // 2. Automatic Fairness Calculation based on Current State
  const myTotal = myOffer.reduce((sum, item) => sum + RARITY_POINTS[item.rarity], 0);
  const theirTotal = theirOffer.reduce((sum, item) => sum + RARITY_POINTS[item.rarity], 0);
  
  const totalPoints = myTotal + theirTotal;
  const myPercentage = totalPoints === 0 ? 50 : (myTotal / totalPoints) * 100;

  // Determine Bar Color and Status
  let fairnessStatus = "Fair Trade";
  let barColor = "bg-[var(--accent-green)] shadow-[0_0_15px_rgba(126,215,193,0.6)]";
  let statusColor = "text-[var(--accent-green)]";

  if (totalPoints === 0) {
    fairnessStatus = "Add items to calculate";
    barColor = "bg-[var(--text-muted)]";
    statusColor = "text-[var(--text-muted)]";
  } else if (theirTotal === 0 && myTotal > 0) {
    fairnessStatus = "Gift (Sending)";
    barColor = "bg-[var(--accent-pink)] shadow-[0_0_15px_rgba(255,184,208,0.6)]";
    statusColor = "text-[var(--accent-pink)]";
  } else if (myTotal === 0 && theirTotal > 0) {
    fairnessStatus = "Gift (Receiving)";
    barColor = "bg-[var(--accent-pink)] shadow-[0_0_15px_rgba(255,184,208,0.6)]";
    statusColor = "text-[var(--accent-pink)]";
  } else if (myPercentage > 60) {
    fairnessStatus = "You are Overpaying!";
    barColor = "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]";
    statusColor = "text-yellow-500";
  } else if (myPercentage < 40) {
    fairnessStatus = "You are Underpaying!";
    barColor = "bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.6)]";
    statusColor = "text-red-500";
  }

  // Visual Helpers
  const getRarityStyles = (rarity: string) => {
    if (resolvedTheme === 'light') return ''; 
    switch (rarity) {
      case 'SSR': return 'shadow-[0_0_24px_rgba(232,107,179,0.4)] border-[#FF6BB3]/50'; 
      case 'SR': return 'shadow-[0_0_16px_rgba(155,89,182,0.3)] border-[#C175E6]/50'; 
      case 'R': return 'shadow-[0_0_12px_rgba(255,215,0,0.2)] border-[#FFE44D]/50'; 
      case 'N': return 'shadow-[0_0_8px_rgba(192,192,192,0.1)] border-[#A0A0A0]/30'; 
      default: return '';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'SR': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      case 'N': return 'text-[var(--text-muted)]';
      default: return '';
    }
  };

  // Action Handlers
  const handleSelectItem = (item: Item) => {
    if (isSelectingFor === 'mine') {
      if (!myOffer.find(i => i.id === item.id)) setMyOffer([...myOffer, item]);
    } else {
      if (!theirOffer.find(i => i.id === item.id)) setTheirOffer([...theirOffer, item]);
    }
    setIsSelectingFor(null); // Close modal
  };

  const handleRemoveItem = (side: 'mine' | 'theirs', id: number) => {
    if (side === 'mine') {
      setMyOffer(myOffer.filter(item => item.id !== id));
    } else {
      setTheirOffer(theirOffer.filter(item => item.id !== id));
    }
  };

  if (tradeSent) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mb-6 border-2 border-[var(--accent-green)]/50 shadow-[0_0_40px_rgba(126,215,193,0.3)]">
          <ArrowRightLeft size={50} className="text-[var(--accent-green)]" />
        </div>
        <h1 className="text-3xl font-black uppercase mb-2">Trade Sent!</h1>
        <p className="text-[var(--text-muted)] font-bold text-sm mb-8">Your proposal is orbiting towards the other trader.</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl font-black text-xs uppercase hover:bg-[var(--bg-secondary)] transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Propose Trade</h1>
        <div className="w-10" />
      </header>

      <main className="space-y-6">
        
        {/* FAIRNESS METER */}
        <div className="glass-panel p-6 text-center transition-all duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Fairness Analysis</p>
          
          <div className="w-full h-3 bg-[var(--bg-app)] rounded-full overflow-hidden border border-[var(--border-subtle)] flex mb-3">
            <div 
              className={`h-full transition-all duration-700 ease-out ${barColor}`} 
              style={{ width: `${myPercentage}%` }} 
            />
            <div className="h-full bg-[var(--accent)]/10 flex-1" />
          </div>

          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className={myPercentage > 60 && theirTotal > 0 ? statusColor : 'text-[var(--text-muted)]'}>My Value: {myTotal}</span>
            <span className={statusColor}>{fairnessStatus}</span>
            <span className={myPercentage < 40 && myTotal > 0 ? statusColor : 'text-[var(--text-muted)]'}>Their Value: {theirTotal}</span>
          </div>
        </div>

        {/* TRADE SIDES */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* MY OFFER COLUMN */}
          <div className="glass-panel p-3 border-dashed border-2 flex flex-col h-[400px]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-center mb-4 pb-2 border-b border-[var(--border-subtle)] text-[var(--text-muted)]">My Offer</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
              {myOffer.map(item => (
                <div key={item.id} className={`p-2 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center gap-2 relative group animate-in fade-in slide-in-from-bottom-2 ${getRarityStyles(item.rarity)}`}>
                  {/* Delete Button */}
                  <button onClick={() => handleRemoveItem('mine', item.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md">
                    <X size={12} />
                  </button>
                  <div className="text-xl bg-[var(--bg-card)] p-1.5 rounded-xl border border-[var(--border-subtle)]">{item.image}</div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[9px] font-bold leading-tight truncate">{item.name}</span>
                    <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Add Button */}
            <button 
              onClick={() => setIsSelectingFor('mine')}
              className="mt-3 py-3 w-full rounded-2xl border border-dashed border-[var(--border-subtle)] text-[var(--accent)] text-[10px] font-black uppercase flex justify-center items-center gap-1 bg-[var(--bg-app)]/50 hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* THEIR OFFER COLUMN */}
          <div className="glass-panel p-3 border-dashed border-2 flex flex-col h-[400px]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-center mb-4 pb-2 border-b border-[var(--border-subtle)] text-[var(--text-muted)]">Their Offer</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
              {theirOffer.map(item => (
                <div key={item.id} className={`p-2 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center gap-2 relative group animate-in fade-in slide-in-from-bottom-2 ${getRarityStyles(item.rarity)}`}>
                   <button onClick={() => handleRemoveItem('theirs', item.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md">
                    <X size={12} />
                  </button>
                  <div className="text-xl bg-[var(--bg-card)] p-1.5 rounded-xl border border-[var(--border-subtle)]">{item.image}</div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[9px] font-bold leading-tight truncate">{item.name}</span>
                    <span className={`text-[8px] font-black uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsSelectingFor('theirs')}
              className="mt-3 py-3 w-full rounded-2xl border border-dashed border-[var(--border-subtle)] text-[var(--accent)] text-[10px] font-black uppercase flex justify-center items-center gap-1 bg-[var(--bg-app)]/50 hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

        </div>

        {/* SEND BUTTON */}
        <div className="fixed bottom-6 left-6 right-6 z-40">
          <button 
            onClick={() => setTradeSent(true)}
            disabled={myOffer.length === 0 && theirOffer.length === 0}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex justify-center items-center gap-2 transition-all ${
              myOffer.length > 0 || theirOffer.length > 0 
                ? 'bg-[var(--accent)] text-white hover:opacity-90' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
            }`}
          >
            <ArrowRightLeft size={16} /> Send Proposal
          </button>
        </div>
      </main>

      {/* CATALOG SELECTION BOTTOM SHEET */}
      {isSelectingFor && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSelectingFor(null)} />
          
          <div className="relative glass-panel rounded-b-none rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom-full duration-300 h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Package size={18} className="text-[var(--accent)]"/> 
                Select from {isSelectingFor === 'mine' ? 'My Orbit' : 'Their Orbit'}
              </h2>
              <button onClick={() => setIsSelectingFor(null)} className="p-2 bg-[var(--bg-app)] rounded-full text-[var(--text-muted)]">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 pr-2">
              {(isSelectingFor === 'mine' ? MY_INVENTORY : THEIR_INVENTORY).map((item) => {
                // Check if already selected so we can disable it
                const isAlreadySelected = isSelectingFor === 'mine' 
                  ? myOffer.some(i => i.id === item.id) 
                  : theirOffer.some(i => i.id === item.id);

                return (
                  <div 
                    key={item.id}
                    onClick={() => !isAlreadySelected && handleSelectItem(item)}
                    className={`flex flex-col items-center text-center p-2 rounded-2xl bg-[var(--bg-app)] border ${
                      isAlreadySelected ? 'border-[var(--border-subtle)] opacity-40 grayscale cursor-not-allowed' : `border-[var(--border-subtle)] cursor-pointer hover:-translate-y-1 transition-transform ${getRarityStyles(item.rarity)}`
                    }`}
                  >
                    <div className="text-3xl mb-2">{item.image}</div>
                    <span className={`text-[9px] font-black uppercase mb-1 ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                    <span className="text-[8px] font-bold line-clamp-2 leading-tight text-[var(--text-main)]">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
