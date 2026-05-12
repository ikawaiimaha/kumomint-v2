import { Lock, Unlock, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    image_url: string;
    rarity: string;
    quantity?: number;
    is_padlocked?: boolean;
  };
  onToggleLock?: (id: string, currentStatus: boolean) => void;
  variant?: 'wardrobe' | 'catalog';
}

export default function ItemCard({ item, onToggleLock, variant = 'catalog' }: ItemCardProps) {
  // Logic: Duplicate Guard
  const isUnique = (item.quantity || 0) <= 1;
  const isLocked = item.is_padlocked || false;
  const isTradeable = !isUnique && !isLocked;

  return (
    <div className={`glass-panel p-4 relative flex flex-col items-center transition-all duration-300 ${
      isLocked ? 'border-[var(--accent-pink)]/40 bg-[var(--accent-pink)]/5' : 'bg-[#1A0B2E]/60 border-[#2D1B4E]'
    }`}>
      
      {/* 🔐 The Padlock Toggle (Only shows in Wardrobe view) */}
      {variant === 'wardrobe' && (
        <button 
          onClick={() => onToggleLock?.(item.id, isLocked)}
          className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all ${
            isLocked ? 'text-[var(--accent-pink)] opacity-100' : 'text-[var(--text-muted)] opacity-30 hover:opacity-100'
          }`}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
      )}

      {/* 📦 Quantity Badge (Only shows if > 1) */}
      {(item.quantity || 0) > 1 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 rounded text-[7px] font-black uppercase text-[var(--accent-blue)]">
          x{item.quantity}
        </div>
      )}

      <div className="w-full aspect-square bg-[#0C0F21] rounded-xl mb-3 mt-4 flex items-center justify-center border border-white/5 overflow-hidden">
        <img 
          src={item.image_url} 
          className={`w-full h-full object-contain p-2 transition-transform duration-500 ${isLocked ? 'scale-90 opacity-60' : ''}`} 
          alt="" 
        />
      </div>

      <h4 className="text-[8px] font-black uppercase text-center truncate w-full mb-1">{item.name}</h4>
      
      {/* 💎 Rarity Label */}
      <span className="text-[7px] font-bold text-[var(--accent-blue)] uppercase mb-3">{item.rarity}</span>

      {/* 🛡️ Duplicate Guard Status (Only for Wardrobe) */}
      {variant === 'wardrobe' && (
        <div className={`w-full py-2 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border ${
          isUnique ? 'border-white/5 text-[var(--text-muted)] bg-white/5' : 
          isLocked ? 'border-[var(--accent-pink)]/30 text-[var(--accent-pink)]' : 
          'border-green-500/30 text-green-400'
        }`}>
          {isUnique ? (
            <><ShieldAlert size={10} /> Unique</>
          ) : isLocked ? (
            <><Lock size={10} /> Padlocked</>
          ) : (
            <><ShieldCheck size={10} /> Tradeable</>
          )}
        </div>
      )}
    </div>
  );
}
