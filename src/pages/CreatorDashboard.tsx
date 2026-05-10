import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Package, Sparkles, ChevronLeft, 
  Image as ImageIcon, Fingerprint, Star, CheckCircle2 
} from 'lucide-react';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [rarity, setRarity] = useState('N');
  const [imageUrl, setImageUrl] = useState('');
  const [collectionId, setCollectionId] = useState('');
  
  // UI State
  const [isMinting, setIsMinting] = useState(false);
  const [mintedItem, setMintedItem] = useState<{name: string, rarity: string} | null>(null);
  const [collections, setCollections] = useState<{id: string, name: string}[]>([]);

  // Fetch available collections for the dropdown
  useEffect(() => {
    async function fetchCollections() {
      const { data } = await supabase.from('collections').select('id, name');
      if (data) setCollections(data);
    }
    fetchCollections();
  }, []);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !collectionId) return;

    setIsMinting(true);
    setMintedItem(null);

    try {
      // 1. Insert the new item into the global items table
      const { data: newItem, error: itemError } = await supabase
        .from('items')
        .insert([{
          name,
          rarity,
          image_url: imageUrl || null,
          collection_id: collectionId
        }])
        .select()
        .single();

      if (itemError) throw itemError;

      // 2. AUTO-GRANT: Add the item to the current user's inventory
      const { error: invError } = await supabase
        .from('user_items')
        .insert([{
          user_id: user.id,
          item_id: newItem.id
        }]);

      if (invError) throw invError;

      // Success! Clear form and show success state
      setMintedItem({ name: newItem.name, rarity: newItem.rarity });
      setName('');
      setImageUrl('');
      
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Failed to mint item. Check your database permissions.");
    } finally {
      setIsMinting(false);
    }
  };

  // Visual Rarity Helpers
  const getRarityColor = (r: string) => {
    switch (r) {
      case 'SSR': return 'text-[#E84393]';
      case 'SR': return 'text-[#9B59B6]';
      case 'R': return 'text-[#F39C12]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      
      <header className="flex items-center justify-between mb-8 relative z-10">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Forge Item</h1>
        <div className="w-10" />
      </header>

      <main className="max-w-md mx-auto">
        
        {/* SUCCESS TOAST */}
        {mintedItem && (
          <div className="glass-panel p-4 mb-6 border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center text-[var(--accent-green)]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--accent-green)]">Minted & Claimed!</p>
                <p className="text-[10px] font-bold opacity-80">{mintedItem.name} ({mintedItem.rarity}) is now in your wardrobe.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleMint} className="space-y-6">
          
          {/* Item Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Item Name</label>
            <div className="glass-panel p-1 flex items-center">
              <div className="p-3 text-[var(--accent)]"><Fingerprint size={20} /></div>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your creation..."
                className="bg-transparent border-none outline-none flex-1 font-bold text-sm p-2 w-full text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* Rarity Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Rarity Tier</label>
            <div className="grid grid-cols-4 gap-2">
              {['N', 'R', 'SR', 'SSR'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRarity(r)}
                  className={`py-3 rounded-2xl border font-black text-xs transition-all ${
                    rarity === r 
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' 
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Asset URL</label>
            <div className="glass-panel p-1 flex items-center">
              <div className="p-3 text-[var(--text-muted)]"><ImageIcon size={20} /></div>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="bg-transparent border-none outline-none flex-1 font-bold text-[10px] p-2 w-full text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* Collection Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Collection</label>
            <div className="glass-panel p-1 flex items-center">
              <div className="p-3 text-[var(--text-muted)]"><Package size={20} /></div>
              <select 
                required
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 font-bold text-sm p-3 w-full text-[var(--text-main)] appearance-none"
              >
                <option value="" disabled className="bg-[var(--bg-card)]">Select Collection</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id} className="bg-[var(--bg-card)]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MINT BUTTON */}
          <button 
            type="submit"
            disabled={isMinting}
            className="w-full py-5 bg-[var(--accent)] text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isMinting ? (
              <Sparkles className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            {isMinting ? 'Forging in Stars...' : 'Mint & Claim Item'}
          </button>

        </form>

        {/* Live Preview */}
        <div className="mt-12">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center mb-4">Live Preview</p>
          <div className="flex justify-center">
            <div className="glass-panel p-4 w-40 flex flex-col items-center text-center relative border-dashed border-2">
              <div className={`absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest ${getRarityColor(rarity)}`}>
                {rarity}
              </div>
              <div className="w-20 h-20 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden mb-3 mt-4">
                {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <Package size={32} className="opacity-20" />}
              </div>
              <h3 className="font-black text-[10px] leading-tight mb-1">{name || 'Item Name'}</h3>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
