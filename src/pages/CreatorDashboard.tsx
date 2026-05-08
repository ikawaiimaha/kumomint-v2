import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusSquare, 
  Library, 
  Settings, 
  Sparkles, 
  ChevronLeft, 
  Check, 
  AlertCircle 
} from 'lucide-react';

// --- PRO PATTERN: Interfaces for strict typing ---
interface Collection {
  id: string;
  name: string;
}

interface ItemForm {
  name: string;
  collection_id: string;
  image_url: string;
  rarity: string;
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'mint' | 'collection' | 'manage'>('mint');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);

  // --- BETTER ALTERNATIVE: Object-based State ---
  const [form, setForm] = useState<ItemForm>({
    name: '',
    collection_id: '',
    image_url: '',
    rarity: 'Common'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('collections').select('id, name').order('name');
    if (data) setCollections(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- PRO PATTERN: Universal HandleChange ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.collection_id) return;
    
    setIsMinting(true);
    const { error } = await supabase.from('items').insert([{
      ...form,
      creator_id: user.id
    }]);

    if (error) {
      alert(error.message);
    } else {
      setForm({ name: '', collection_id: '', image_url: '', rarity: 'Common' });
      alert("Item successfully minted into orbit! ✨");
    }
    setIsMinting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <Sparkles className="animate-spin text-[var(--accent)]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 transition-colors">
      <header className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => window.history.back()} className="p-2 glass-panel text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest">Creator Studio</h1>
        </div>

        {/* Tab System */}
        <div className="flex glass-panel p-1">
          {[
            { id: 'mint', icon: PlusSquare, label: 'Mint' },
            { id: 'collection', icon: Library, label: 'Sets' },
            { id: 'manage', icon: Settings, label: 'Manage' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'opacity-40'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6">
        {activeTab === 'mint' && (
          <form onSubmit={handleMint} className="glass-panel p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Item Identity</label>
              <input 
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name your creation..."
                className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-[var(--accent)] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Galaxy Sector</label>
              <select 
                name="collection_id"
                value={form.collection_id}
                onChange={handleChange}
                className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-sm font-bold appearance-none"
                required
              >
                <option value="" disabled>Select Collection</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Visual Signal (URL)</label>
              <input 
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-sm font-bold"
                required
              />
            </div>

            <div className="bg-[#FEF9C3] dark:bg-white/5 p-4 rounded-2xl flex gap-3 items-start border border-[#FEF08A] dark:border-white/10">
              <AlertCircle size={18} className="text-yellow-600 dark:text-[var(--accent)] shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold opacity-70 leading-tight">
                Minting is permanent in this sector. Ensure all assets are synced before finalizing.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isMinting}
              className="w-full py-4 moonie-btn text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
            >
              {isMinting ? <Sparkles className="animate-spin" size={16} /> : <Check size={16} />}
              {isMinting ? 'Finalizing...' : 'Mint Item'}
            </button>
          </form>
        )}

        {activeTab !== 'mint' && (
          <div className="py-20 text-center opacity-20">
            <Sparkles size={40} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-pretty">
              This sector is currently being terraformed.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
