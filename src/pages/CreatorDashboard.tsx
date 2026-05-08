import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Edit3, 
  Sparkles, 
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
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '', category: 'Fashion', subtype: 'Dress',
    rarity: 'R', collection_id: '', character: '',
    demand_score: 50, image_url: '', thumbnail_url: ''
  });

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

  const handleMintOrUpdate = async () => {
    setLoading(true);
    const payload = { ...itemForm, release_date: new Date().toISOString() };
    if (editingId) {
      await supabase.from('items').update(payload).eq('id', editingId);
    } else {
      await supabase.from('items').insert([payload]);
    }
    setItemForm({ name: '', category: 'Fashion', subtype: 'Dress', rarity: 'R', collection_id: '', character: '', demand_score: 50, image_url: '', thumbnail_url: '' });
    setEditingId(null);
    fetchData();
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    setLoading(true);
    const payload: any = { ...collectionForm, is_active: true };
    const { error } = await supabase.from('collections').insert([payload]);
    if (!error) {
      setCollectionForm({ id: '', name: '', type: 'Happy Bag Regular', character: '', description: '', total_items: 0, image_url: '' });
      fetchData();
      setTab('mint');
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
        <button onClick={() => navigate(-1)} className="mb-4 p-2 bg-white rounded-full shadow-sm"><ChevronLeft size={20} /></button>
        <h1 className="text-2xl font-black text-[#2E2A28]">Creator Dashboard</h1>
      </div>

      <div className="px-6 flex gap-2 mb-6">
        {['mint', 'collection', 'manage'].map((t) => (
          <button key={t} onClick={() => setTab(t as any)} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm", tab === t ? "bg-white text-[#4E927E] border-b-4 border-[#7ED7C1]" : "bg-white/50 text-gray-400")}>
            {t === 'mint' ? (editingId ? 'Edit' : 'Mint') : t}
          </button>
        ))}
      </div>

      <main className="px-6">
        {tab === 'mint' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
            <input className="w-full p-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} placeholder="Item Name" />
            <select className="w-full p-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold" value={itemForm.collection_id} onChange={e => setItemForm({...itemForm, collection_id: e.target.value})}>
              <option value="">Select Collection</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleMintOrUpdate} disabled={loading} className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase">{loading ? "..." : (editingId ? "Update" : "Mint")}</button>
          </div>
        )}

        {tab === 'collection' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
            <input className="w-full p-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold" value={collectionForm.name} onChange={e => setCollectionForm({...collectionForm, name: e.target.value})} placeholder="Collection Name" />
            <button onClick={handleCreateCollection} disabled={loading} className="w-full py-4 bg-[#7ED7C1] text-white rounded-2xl font-black text-xs uppercase">{loading ? "..." : "Create Collection"}</button>
          </div>
        )}

        {tab === 'manage' && (
          <div className="space-y-3">
            {existingItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-[28px] flex items-center gap-4 shadow-sm">
                <img src={item.image_url} className="w-10 h-10 rounded-lg object-contain" alt="" />
                <p className="flex-1 text-xs font-black">{item.name}</p>
                <button onClick={() => startEdit(item)} className="p-2 text-[#4E927E]"><Edit3 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
