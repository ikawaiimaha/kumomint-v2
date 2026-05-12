import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  Sparkles, 
  ChevronRight, 
  User,
  Star,
  Heart
} from 'lucide-react';

interface MatchItem {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
}

interface MatchCardProps {
  match: {
    partner_id: string;
    partner_name: string;
    partner_buddy: string;
    match_score: number;
    items_you_give: MatchItem[];
    items_they_give: MatchItem[];
  };
}

export default function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();

  // Logic: Calculate if this is a "Super Match"
  const isHighIntensity = match.match_score >= 80;

  return (
    <div className={`glass-panel p-6 mb-6 relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] border-[#2D1B4E] ${
      isHighIntensity ? 'bg-gradient-to-br from-[#1A0B2E] to-[#2D1B4E] shadow-[0_0_30px_rgba(163,137,244,0.1)]' : 'bg-[#1A0B2E]/60'
    }`}>
      
      {/* 🔮 Match Intensity Sparkle */}
      {isHighIntensity && (
        <div className="absolute top-0 right-0 p-4">
          <Sparkles className="text-[var(--accent)] animate-pulse" size={20} />
        </div>
      )}

      {/* 👤 Partner Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#0C0F21] border border-[var(--accent-blue)]/30 flex items-center justify-center text-[var(--accent-blue)] shadow-inner">
          <User size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black uppercase tracking-tighter italic leading-none">
            {match.partner_name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 opacity-50">
            <Heart size={10} className="fill-[var(--accent-pink)] text-[var(--accent-pink)]" />
            <span className="text-[7px] font-black uppercase tracking-widest">Buddy: {match.partner_buddy}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black italic text-[var(--accent)]">{match.match_score}%</span>
          <p className="text-[6px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Match</p>
        </div>
      </div>

      {/* ⇆ The Mirror Swap View */}
      <div className="flex items-center justify-between gap-2 p-4 bg-black/20 rounded-2xl border border-white/5 mb-6 relative">
        
        {/* Items You Give */}
        <div className="flex-1">
          <p className="text-[6px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 text-center">You Give</p>
          <div className="flex -space-x-4 justify-center">
            {match.items_you_give.slice(0, 3).map((item, idx) => (
              <div key={item.id} className="w-12 h-12 bg-[#0C0F21] rounded-xl border border-[#2D1B4E] p-1.5 shadow-xl relative" style={{ zIndex: 10 - idx }}>
                <img src={item.image_url} className="w-full h-full object-contain" alt="" />
                {item.rarity === 'SSR' && <Star size={6} className="absolute bottom-1 right-1 text-yellow-400 fill-yellow-400" />}
              </div>
            ))}
          </div>
        </div>

        <ArrowLeftRight size={16} className="text-[var(--accent)] opacity-20 shrink-0" />

        {/* Items They Give */}
        <div className="flex-1">
          <p className="text-[6px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 text-center">You Get</p>
          <div className="flex -space-x-4 justify-center">
            {match.items_they_give.slice(0, 3).map((item, idx) => (
              <div key={item.id} className="w-12 h-12 bg-[#0C0F21] rounded-xl border border-[#2D1B4E] p-1.5 shadow-xl relative" style={{ zIndex: 10 - idx }}>
                <img src={item.image_url} className="w-full h-full object-contain" alt="" />
                {item.rarity === 'SSR' && <Star size={6} className="absolute bottom-1 right-1 text-yellow-400 fill-yellow-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🛰️ Action Footer */}
      <div className="flex gap-3">
        <button 
          onClick={() => navigate(`/profile/${match.partner_id}`)}
          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
        >
          View Orbit
        </button>
        <button 
          onClick={() => navigate(`/propose-trade/${match.partner_id}`)}
          className="flex-1 py-3 bg-[var(--accent)] text-[var(--bg-app)] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
        >
          Propose <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
