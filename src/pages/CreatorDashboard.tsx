import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'mint' | 'collection' | 'manage'>('mint');
  const [collections, setCollections] = useState<any[]>([]);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selfMint, setSelfMint] = useState(true); 
  
  const [itemForm, setItemForm] = useState({
    name: '', rarity: 'R', collection_id: '', image_url: '', character: ''
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

  const handleMint = async () => {
    if (!itemForm.collection_id || !itemForm.name) return alert("Fill required fields!");
    setLoading(true);

    const { data: newItem, error } = await supabase.from('items').insert([{
      ...itemForm,
      release_date: new Date().toISOString()
    }]).select().single();

    if (error) {
      alert(error.message);
    } else if (selfMint && user && newItem) {
      await supabase.from('inventory').insert([{
        trader_id: user.id,
        item_id: newItem.id,
        is_padlocked: false
      }]);
      alert("Minted to Catalog & added to your Wardrobe!");
    } else {
      alert("Minted to Catalog!");
    }

    setItemForm({ name: '', rarity: 'R', collection_id: '', image_url: '', character: '' });
    fetchData();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F7F6] pb-32">
      <div className="p-6 text-center">
        <h1 className="text-2xl font-black text-[#2E2A28]">Creator Studio</h1>
      </div>

      <div className="px-6 flex gap-2 mb-6">
        {['mint', 'collection', 'manage'].map((t) => (
          <button key={t} onClick={() => setTab(t as any)} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm", tab === t ? "bg-white text-[#4E927E] border-b-4 border-[#7ED7C1]" : "bg-white/50 text-gray-400")}>
            {t}
          </button>
        ))}
      </div>

      <main className="px-6 space-y-4">
        {tab === 'mint' && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
            <input className="w-full p-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} placeholder="Item Name" />
            <select className="w-full p-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold" value={itemForm.collection_id} onChange={e => setItemForm({...itemForm, collection_id: e.target.value})}>
              <option value="">Select Collection</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="w-full p-4 bg-[#F8F9FB] rounded-2xl text-sm font-bold" value={itemForm.image_url} onChange={e => setItemForm({...itemForm, image_url: e.target.value})} placeholder="Image URL" />
            
            <div className="flex items-center gap-3 p-2">
              <input type="checkbox" checked={selfMint} onChange={() => setSelfMint(!selfMint)} className="w-5 h-5 accent-[#7ED7C1]" />
              <label className="text-xs font-bold text-gray-400">Add 1 copy to my Wardrobe</label>
            </div>

            <button onClick={handleMint} disabled={loading} className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase">{loading ? "MINTING..." : "MINT ITEM"}</button>
          </div>
        )}
        
        {tab === 'manage' && (
          <div className="space-y-3">
            {existingItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-[28px] flex items-center gap-4 shadow-sm">
                <img src={item.image_url} className="w-10 h-10 rounded-lg object-contain" alt="" />
                <div className="flex-1">
                  <p className="text-xs font-black">{item.name}</p>
                  <p className="text-[9px] font-bold text-gray-400">{item.collections?.name}</p>
                </div>
                <button className="p-2 text-[#4E927E]"><Edit3 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
