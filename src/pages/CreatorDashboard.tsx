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
  ChevronLeft,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'mint' | 'collection' | 'manage'>('mint');
  const [collections, setCollections] = useState<any[]>([]);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- Form State: Items ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '', category: 'Fashion', subtype: 'Dress',
    rarity: 'R', collection_id: '', character: '',
    demand_score: 50, image_url: '', thumbnail_url: ''
  });

  // --- Form State: Collections ---
  const [collectionForm, setCollectionForm] = useState({
    id: '', name: '', type: 'Happy Bag Regular',
    character: '', description: '', total_items: 0,
    image_url: ''
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

  // --- HANDLERS ---

  const handleMintOrUpdate = async () => {
    setLoading(true);
    const payload = { ...itemForm, release_date: new Date().toISOString() };
    let error;
    if (editingId) {
      const { error: err } = await supabase.from('items').update(payload).eq('id', editingId);
      error = err;
    } else {
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

  const handleCreateCollection = async () => {
    setLoading(true);
    // Use manually entered ID if provided, otherwise Supabase generates a UUID
    const payload: any = { 
      name: collectionForm.name,
      type: collectionForm.type,
      character: collectionForm.character,
      description: collectionForm.description,
      total_items: collectionForm.total_items,
      image_url: collectionForm.image_url,
      is_active: true
    };
    if (collectionForm.id) payload.id = collectionForm.id;

    const { error } = await supabase.from('collections').insert([payload]);
    if (!error) {
      alert("Collection Created!");
      setCollectionForm({ id: '', name: '', type: 'Happy Bag Regular', character: '', description: '', total_items: 0, image_url: '' });
      fetchData();
      setTab('mint'); // Switch back to mint items for the new collection
    } else {
      alert(error.message);
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
    setTab('mint');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F0F7F6] pb-24">
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[#2E2A28]">Creator Dashboard</h1>
        <p className="text-xs text-gray-500 font-bold">Manage your platform content</p>
      </div>

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
            {t === 'mint' ? (editingId ? 'Edit Item' : 'Mint Item') : t === 'collection' ? 'New Collection' : 'Manage'}
          </button>
        ))}
      </div>

      <main className="px-6">
        {/* --- TAB: MINT ITEM --- */}
        {tab === 'mint' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Item Name *</label>
              <input 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-sm font-bold"
                value={itemForm.name}
                onChange={e => setItemForm({...itemForm, name: e.target.value})}
                placeholder="e.g. Dreamy Starlight Dress"
              />
            </div>
            {/* Rarity & Collection selectors remain same as previous version */}
            <button 
              onClick={handleMintOrUpdate}
              disabled={loading}
              className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4"
            >
              {loading ? "Processing..." : (editingId ? "Update Item" : "Mint Item")}
            </button>
          </div>
        )}

        {/* --- TAB: NEW COLLECTION --- */}
        {tab === 'collection' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Collection ID (Optional)</label>
              <input 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-xs font-bold"
                value={collectionForm.id}
                onChange={e => setCollectionForm({...collectionForm, id: e.target.value})}
                placeholder="e.g. dreamy_starlight"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Collection Name *</label>
              <input 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-sm font-bold"
                value={collectionForm.name}
                onChange={e => setCollectionForm({...collectionForm, name: e.target.value})}
                placeholder="e.g. Dreamy Starlight Storytime"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Type</label>
                <select 
                  className="w-full mt-1 p-3 bg-[#F8F9FB] rounded-xl text-xs font-bold"
                  value={collectionForm.type}
                  onChange={e => setCollectionForm({...collectionForm, type: e.target.value})}
                >
                  <option>Happy Bag Regular</option>
                  <option>Sweet Collection</option>
                  <option>Event/Limited</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Total Items</label>
                <input 
                  type="number"
                  className="w-full mt-1 p-3 bg-[#F8F9FB] rounded-xl text-xs font-bold"
                  value={collectionForm.total_items}
                  onChange={e => setCollectionForm({...collectionForm, total_items: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Character</label>
              <input 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-sm font-bold"
                value={collectionForm.character}
                onChange={e => setCollectionForm({...collectionForm, character: e.target.value})}
                placeholder="e.g. Little Twin Stars"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase">Description</label>
              <textarea 
                className="w-full mt-1 p-4 bg-[#F8F9FB] rounded-2xl border-none text-sm font-bold h-24"
                value={collectionForm.description}
                onChange={e => setCollectionForm({...collectionForm, description: e.target.value})}
                placeholder="Short description..."
              />
            </div>

            <button 
              onClick={handleCreateCollection}
              disabled={loading}
              className="w-full py-4 bg-[#7ED7C1] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 shadow-lg active:scale-95 transition-transform"
            >
              {loading ? "Creating..." : "Create Collection"}
            </button>
          </div>
        )}

        {/* --- TAB: MANAGE --- */}
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
