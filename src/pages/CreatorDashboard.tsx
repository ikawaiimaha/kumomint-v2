import { useState, useEffect } from 'react';
import { Camera, Sparkles, Wand2, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  
  const [itemName, setItemName] = useState('');
  const [itemSet, setItemSet] = useState('Dreamy Starlight');
  const [rarity, setRarity] = useState('N');

  // Simulated Minting Process
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMinting) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsMinting(false);
            setSuccess(true);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isMinting]);

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    setIsMinting(true);
    setProgress(0);
    setSuccess(false);
  };

  const resetStudio = () => {
    setItemName('');
    setSuccess(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Creator Studio</h1>
      </header>

      <main className="space-y-6">
        
        {/* VISUAL SIGNAL BOX */}
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 ml-2">Visual Signal</p>
          
          <div className={`glass-panel aspect-square flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 ${
            isMinting ? 'border-[var(--accent)] shadow-[0_0_40px_rgba(163,137,244,0.3)] bg-[var(--accent)]/5' : 'border-[var(--border-subtle)]'
          }`}>
            
            {success ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mb-4 border border-[var(--accent-green)]/50">
                  <CheckCircle2 size={40} className="text-[var(--accent-green)]" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest text-[var(--accent-green)]">Item Minted!</p>
              </div>
            ) : isMinting ? (
              <div className="flex flex-col items-center">
                <Sparkles size={40} className="text-[var(--accent)] animate-pulse mb-4" />
                <p className="font-black text-[10px] uppercase tracking-widest text-[var(--accent)] animate-pulse">Syncing with Stars...</p>
              </div>
            ) : (
              <button className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] hover:scale-110 transition-transform shadow-lg">
                <Camera size={24} />
              </button>
            )}
          </div>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleMint} className={`space-y-6 transition-opacity duration-300 ${isMinting || success ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          
          <input 
            type="text" 
            placeholder="Name your creation..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-black text-2xl placeholder:text-[var(--border-subtle)] px-2"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block ml-2 mb-1">Collection</label>
              <select 
                value={itemSet}
                onChange={(e) => setItemSet(e.target.value)}
                className="w-full bg-transparent font-bold text-sm outline-none appearance-none px-2 pb-1"
              >
                <option value="Dreamy Starlight">Dreamy Starlight</option>
                <option value="Sky Haven">Sky Haven</option>
                <option value="Everyday Magic">Everyday Magic</option>
                <option value="Sanrio Collab">Sanrio Collab</option>
              </select>
            </div>

            <div className="glass-panel p-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block ml-2 mb-1">Rarity</label>
              <select 
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                className="w-full bg-transparent font-bold text-sm outline-none appearance-none px-2 pb-1"
              >
                <option value="N">Moon (Common)</option>
                <option value="R">Star (Rare)</option>
                <option value="S">Comet (Super)</option>
                <option value="SR">Galaxy (Ultra)</option>
              </select>
            </div>
          </div>
        </form>

        {/* MINT ACTION BUTTON */}
        <div className="fixed bottom-28 left-6 right-6 z-40">
          {success ? (
            <button 
              onClick={resetStudio}
              className="w-full py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-2xl font-black text-xs uppercase shadow-lg flex justify-center items-center gap-2 hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Mint Another Item
            </button>
          ) : (
            <button 
              onClick={handleMint}
              disabled={isMinting || !itemName}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex justify-center items-center gap-2 transition-all duration-300 relative overflow-hidden ${
                itemName ? 'bg-[var(--accent)] text-white hover:opacity-90' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              {isMinting ? (
                <>
                  <div 
                    className="absolute inset-0 bg-white/20 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 drop-shadow-md">{progress}% Orbiting...</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} /> Ignite Signal
                </>
              )}
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
