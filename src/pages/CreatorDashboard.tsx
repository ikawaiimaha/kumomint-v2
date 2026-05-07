import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Box, 
  Image as ImageIcon,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'mint' | 'collection' | 'manage'>('mint');
  const [collections, setCollections] = useState<any[]>([]);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State for Items (Handles both Add & Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '', category: 'Fashion', subtype: 'Dress',
    rarity: 'R', collection_id: '', character: '',
    demand_score: 50, image_url: '', thumbnail_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: colls } = await supabase.from('collections').select('*').order('name');
    const { data: items } = await supabase.from('items').select('*, collections(name)').order('created_at', { ascending: false });
    if (colls) setCollections(colls);
    if (items) setExistingItems(items);
  };

  const handleMintOrUpdate = async () => {
    setLoading(true);
    const payload = { ...itemForm, release_date: new Date().toISOString() };

    let error;
    if (editingId) {
      // UPDATE existing item
      const { error: err } = await supabase.from('items').update(payload).eq('id', editingId);
      error = err;
    } else {
      // INSERT new item
      const { error: err } = await supabase.from('items').insert([payload]);
      error = err;
    }

    if (!error) {
      alert(editingId ? "Item Updated!" : "Item Minted!");
      setItemForm({ name: '', category: 'Fashion', subtype: 'Dress', rarity: 'R', collection_id: '', character: '', demand_score: 50, image_url: '', thumbnail_url: '' });
      setEditingId(null);
      fetchData();
    }
    setLoading(false);
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setItemForm({
      name: item.name, category: item.category || 'Fashion',
      subtype: item.subtype || 'Dress', rarity: item.rarity,
      collection_id: item.collection_id, character: item.character || '',
      demand_score: item.demand_score || 50, image_url: item.image_url,
      thumbnail_url: item.thumbnail_url || ''
    });
    setTab('mint'); // Switch to form tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F0F7F6] pb-24">
      {/* --- HEADER --- */}
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[#2E2A28]">Creator Dashboard</h1>
        <p className="text-xs text-gray-500 font-bold">Mint items and manage collections</p>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="px-6 flex gap-2 mb-6">
        {['mint', 'collection', 'manage'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
              tab === t ? "bg-white text-[#4E927E] border-b-4 border-[#7ED7C1]" : "bg-white/50 text-gray-400"
            )}
          >
            {t === 'mint' ? (editingId ? 'Edit Item' : 'Mint Item') : t}
          </button>
        ))}
      </div>

      <main className="px-6">
        {tab === 'mint' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
            {/* ITEM NAME */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Item Name *</label>
              <input 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-sm font-bold"
                value={itemForm.name}
                onChange={e => setItemForm({...itemForm, name: e.target.value})}
                placeholder="e.g. Dreamy Starlight Dress"
              />
            </div>

            {/* RARITY SELECTION */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Rarity</label>
              <div className="flex gap-2 mt-1">
                {['N', 'R', 'S', 'SR'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setItemForm({...itemForm, rarity: r})}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold border-2 transition-all",
                      itemForm.rarity === r ? "border-[#7ED7C1] bg-[#F0F7F6] text-[#4E927E]" : "border-gray-100 text-gray-300"
                    )}
                  >
                    {r === 'SR' ? 'Super Rare' : r === 'S' ? 'Special' : r === 'R' ? 'Rare' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>

            {/* COLLECTION DROPDOWN */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Collection</label>
              <select 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-sm font-bold"
                value={itemForm.collection_id}
                onChange={e => setItemForm({...itemForm, collection_id: e.target.value})}
              >
                <option value="">Select a Collection</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* IMAGE URLS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Image URL</label>
                <input 
                  className="w-full mt-1 p-3 bg-[#F8F9FB] rounded-xl text-[10px]"
                  value={itemForm.image_url}
                  onChange={e => setItemForm({...itemForm, image_url: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Thumbnail</label>
                <input 
                  className="w-full mt-1 p-3 bg-[#F8F9FB] rounded-xl text-[10px]"
                  value={itemForm.thumbnail_url}
                  onChange={e => setItemForm({...itemForm, thumbnail_url: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleMintOrUpdate}
              disabled={loading}
              className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 shadow-lg active:scale-95 transition-transform"
            >
              {loading ? "Processing..." : (editingId ? "Update Item" : "Mint Item")}
            </button>
            
            {editingId && (
              <button 
                onClick={() => {setEditingId(null); setItemForm({name:'', category:'Fashion', subtype:'Dress', rarity:'R', collection_id:'', character:'', demand_score:50, image_url:'', thumbnail_url:''})}}
                className="w-full text-xs font-bold text-gray-400 uppercase"
              >
                Cancel Editing
              </button>
            )}
          </div>
        )}

        {tab === 'manage' && (
          <div className="space-y-3">
            {existingItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-[28px] flex items-center gap-4 shadow-sm">
                <img src={item.image_url} className="w-12 h-12 rounded-xl bg-gray-50 object-contain" />
                <div className="flex-1">
                  <p className="text-xs font-black text-[#2E2A28]">{item.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">{item.collections?.name}</p>
                </div>
                <button 
                  onClick={() => startEdit(item)}
                  className="p-2 bg-[#F0F7F6] text-[#4E927E] rounded-xl"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
