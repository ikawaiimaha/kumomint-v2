import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  Sparkles,
  ChevronLeft,
  Check,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const CATEGORIES = ['furniture', 'fashion', 'makeup', 'character', 'plushie', 'flower', 'terrain', 'melody'] as const;

const SUBTYPES: Record<string, string[]> = {
  furniture: ['wall', 'floor', 'door', 'bed', 'chair', 'table', 'lamp', 'decor', 'rug', 'patio'],
  fashion: ['hair', 'extensions', 'dress', 'shoes', 'jacket', 'head_accessory', 'body_accessory', 'face_accessory', 'effect'],
  makeup: ['eyes', 'lips', 'cheeks'],
  character: ['character'],
  plushie: ['plushie_s', 'plushie_m', 'plushie_l', 'plushie_xl'],
  flower: ['flower'],
  terrain: ['terrain'],
  melody: ['melody'],
};

const RARITY_OPTIONS: Array<{ value: 'N' | 'R' | 'S' | 'SR'; label: string; color: string }> = [
  { value: 'N', label: 'Normal', color: '#C0C0C0' },
  { value: 'R', label: 'Rare', color: '#FFD700' },
  { value: 'S', label: 'Super Rare', color: '#9B59B6' },
  { value: 'SR', label: 'Special Rare', color: '#E84393' },
];

const COLLECTION_TYPES = [
  'happy_bag_regular', 'happy_bag_limited', 'happy_bag_permanent', 'sweet_collection',
  'petite_collection', 'custom_happy_bag', 'lucky_bag', 'sugarbunnies_cart',
  'buyer_shop', 'select_shop', 'event', 'collaboration',
] as const;

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState<'mint' | 'create_collection'>('mint');
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  const [itemForm, setItemForm] = useState({
    id: '', name: '', category: 'fashion', subtype: 'dress', rarity: 'R',
    collection_id: '', character: '', demand_score: 50, image_url: '', thumbnail_url: '',
  });

  const [collectionForm, setCollectionForm] = useState({
    id: '', name: '', type: 'happy_bag_regular', character: '', description: '', total_items: 0,
  });

  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [itemSuccess, setItemSuccess] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  const [collectionSubmitting, setCollectionSubmitting] = useState(false);
  const [collectionSuccess, setCollectionSuccess] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setCheckingRole(false); return; }
      const { data: trader } = await supabase.from('traders').select('role').eq('id', uid).single();
      setIsAdmin(trader?.role === 'admin' || trader?.role === 'volunteer');
      setCheckingRole(false);
    });
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      setCollectionsLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setCollections(data);
        if (data.length > 0) {
          setItemForm((prev) => ({ ...prev, collection_id: prev.collection_id || data[0].id }));
        }
      }
      setCollectionsLoading(false);
    };
    fetchCollections();
  }, [collectionSuccess]);

  const createCollection = useCallback(async () => {
    if (!userId || !isAdmin) return;
    setCollectionSubmitting(true); setCollectionError(null); setCollectionSuccess(false);
    const { error } = await supabase.from('collections').insert({
      id: collectionForm.id.trim() || undefined,
      name: collectionForm.name.trim(),
      type: collectionForm.type,
      character: collectionForm.character.trim() || null,
      description: collectionForm.description.trim() || null,
      total_items: collectionForm.total_items || 0,
      is_active: true,
    });
    if (error) setCollectionError(error.message);
    else { setCollectionSuccess(true); setCollectionForm({ id: '', name: '', type: 'happy_bag_regular', character: '', description: '', total_items: 0 }); }
    setCollectionSubmitting(false);
  }, [userId, isAdmin, collectionForm]);

  const mintItem = useCallback(async () => {
    if (!userId || !isAdmin) return;
    if (!itemForm.collection_id) { setItemError('Select a collection first'); return; }
    setItemSubmitting(true); setItemError(null); setItemSuccess(false);
    const { error } = await supabase.from('items').insert({
      id: itemForm.id.trim() || undefined,
      name: itemForm.name.trim(),
      category: itemForm.category,
      subtype: itemForm.subtype,
      rarity: itemForm.rarity,
      collection_id: itemForm.collection_id,
      character: itemForm.character.trim() || null,
      demand_score: itemForm.demand_score,
      image_url: itemForm.image_url.trim() || null,
      thumbnail_url: itemForm.thumbnail_url.trim() || null,
    });
    if (error) setItemError(error.message);
    else {
      setItemSuccess(true);
      setItemForm((prev) => ({ ...prev, id: '', name: '', character: '', image_url: '', thumbnail_url: '', demand_score: 50 }));
    }
    setItemSubmitting(false);
  }, [userId, isAdmin, itemForm]);

  if (checkingRole) {
    return <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-[#E8F4F8] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#7ED7C1] animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-[#E8F4F8] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Admin access required</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 rounded-xl bg-[#7ED7C1] text-white text-sm font-medium">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-[#E8F4F8] pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/60 text-gray-600 hover:bg-white/80 transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Quicksand, sans-serif' }}>Creator Dashboard</h1>
            <p className="text-sm text-gray-500">Mint items and manage collections</p>
          </div>
        </div>

        <div className="flex gap-1 bg-black/5 rounded-xl p-1 mb-6">
          {[
            { key: 'mint' as const, label: 'Mint Item', icon: Sparkles },
            { key: 'create_collection' as const, label: 'New Collection', icon: LayoutGrid },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all', activeTab === tab.key ? 'bg-white text-[#5BBAA3] shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'mint' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Item ID (optional)</label><input type="text" value={itemForm.id} onChange={(e) => setItemForm({ ...itemForm, id: e.target.value })} placeholder="Leave empty for auto-generated ID" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Item Name *</label><input type="text" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g. Dreamy Starlight Dress" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label><select value={itemForm.category} onChange={(e) => { const cat = e.target.value; setItemForm({ ...itemForm, category: cat, subtype: SUBTYPES[cat]?.[0] ?? '' }); }} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all">{CATEGORIES.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}</select></div>
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Subtype</label><select value={itemForm.subtype} onChange={(e) => setItemForm({ ...itemForm, subtype: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all">{(SUBTYPES[itemForm.category] ?? []).map((s) => (<option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>))}</select></div>
            </div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Rarity</label><div className="flex gap-2">{RARITY_OPTIONS.map((r) => (<button key={r.value} onClick={() => setItemForm({ ...itemForm, rarity: r.value })} className={cn('flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all', itemForm.rarity === r.value ? 'border-2 shadow-sm' : 'bg-white/40 border-white/40 text-gray-500 hover:bg-white/60')} style={{ borderColor: itemForm.rarity === r.value ? r.color : undefined, color: itemForm.rarity === r.value ? r.color : undefined, backgroundColor: itemForm.rarity === r.value ? `${r.color}15` : undefined }}>{r.label}</button>))}</div></div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Collection *</label>
              {collectionsLoading ? (<div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/40 text-sm text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading collections...</div>) : collections.length === 0 ? (<div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">No active collections. <button onClick={() => setActiveTab('create_collection')} className="underline font-medium">Create one first</button>.</div>) : (
                <select value={itemForm.collection_id} onChange={(e) => setItemForm({ ...itemForm, collection_id: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all">
                  <option value="" disabled>Select a collection...</option>
                  {collections.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              )}
            </div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Character</label><input type="text" value={itemForm.character} onChange={(e) => setItemForm({ ...itemForm, character: e.target.value })} placeholder="e.g. Hello Kitty, My Melody, Cinnamoroll" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Demand Score: {itemForm.demand_score}</label><input type="range" min={0} max={100} value={itemForm.demand_score} onChange={(e) => setItemForm({ ...itemForm, demand_score: parseInt(e.target.value) })} className="w-full accent-[#7ED7C1]" /><div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>Unwanted</span><span>Average</span><span>Most Wanted</span></div></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Image URL</label><input type="text" value={itemForm.image_url} onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Thumbnail URL</label><input type="text" value={itemForm.thumbnail_url} onChange={(e) => setItemForm({ ...itemForm, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            </div>
            {itemError && (<div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{itemError}</div>)}
            {itemSuccess && (<div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-600 flex items-center gap-2"><Check className="w-4 h-4" /> Item minted successfully!</div>)}
            <button onClick={mintItem} disabled={itemSubmitting || !itemForm.name || !itemForm.collection_id} className={cn('w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all', itemSubmitting || !itemForm.name || !itemForm.collection_id ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#7ED7C1] to-[#5BBAA3] text-white shadow-lg shadow-[#7ED7C1]/30 hover:shadow-xl')}>{itemSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Mint Item</button>
          </motion.div>
        )}

        {activeTab === 'create_collection' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Collection ID (optional)</label><input type="text" value={collectionForm.id} onChange={(e) => setCollectionForm({ ...collectionForm, id: e.target.value })} placeholder="e.g. dreamy_starlight — leave empty for auto" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Collection Name *</label><input type="text" value={collectionForm.name} onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })} placeholder="e.g. Dreamy Starlight Storytime" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Type</label><select value={collectionForm.type} onChange={(e) => setCollectionForm({ ...collectionForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all">{COLLECTION_TYPES.map((t) => (<option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>))}</select></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Character</label><input type="text" value={collectionForm.character} onChange={(e) => setCollectionForm({ ...collectionForm, character: e.target.value })} placeholder="e.g. Little Twin Stars" className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label><textarea value={collectionForm.description} onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })} placeholder="Short description..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all resize-none" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Total Items</label><input type="number" min={0} value={collectionForm.total_items} onChange={(e) => setCollectionForm({ ...collectionForm, total_items: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7ED7C1]/50 transition-all" /></div>
            {collectionError && (<div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{collectionError}</div>)}
            {collectionSuccess && (<div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-600 flex items-center gap-2"><Check className="w-4 h-4" /> Collection created! You can now mint items into it.</div>)}
            <button onClick={createCollection} disabled={collectionSubmitting || !collectionForm.name} className={cn('w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all', collectionSubmitting || !collectionForm.name ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#7ED7C1] to-[#5BBAA3] text-white shadow-lg shadow-[#7ED7C1]/30 hover:shadow-xl')}>{collectionSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Create Collection</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
