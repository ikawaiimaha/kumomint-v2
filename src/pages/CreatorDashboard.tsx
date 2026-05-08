import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusSquare, Sparkles, ChevronLeft, Check, 
  UploadCloud, AlertCircle, Camera 
} from 'lucide-react';

// --- 1. THE SCHEMA (The Bouncer) ---
const mintSchema = z.object({
  name: z.string().min(2, "Identity required (min 2 chars)"),
  collection_id: z.string().min(1, "Select a sector"),
  rarity: z.enum(['Common', 'Rare', 'Ultra', 'Celestial']),
  // This validates that a file was actually picked
  image: z.any().refine((files) => files?.length > 0, "Visual signal required"),
});

type MintFormData = z.infer<typeof mintSchema>;

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<{id: string, name: string}[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // --- 2. THE HOOK SETUP ---
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch, 
    formState: { errors } 
  } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
    defaultValues: { rarity: 'Common' }
  });

  // Watch the image field to show a preview on your phone instantly
  const imageFile = watch('image');
  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const url = URL.createObjectURL(imageFile[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from('collections').select('id, name').order('name');
    if (data) setCollections(data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 3. THE PRO UPLOAD & MINT LOGIC ---
  const onSubmit = async (data: MintFormData) => {
    if (!user) return;
    setIsMinting(true);

    try {
      const file = data.image[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // A. Upload binary to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // B. Generate the permanent link
      const { data: urlData } = supabase.storage.from('items').getPublicUrl(filePath);

      // C. Record the item in the database
      const { error: dbError } = await supabase.from('items').insert([{
        name: data.name,
        collection_id: data.collection_id,
        rarity: data.rarity,
        image_url: urlData.publicUrl,
        creator_id: user.id
      }]);

      if (dbError) throw dbError;

      alert("Signal broadcasted! Item successfully minted. ✨");
      reset();
      setPreview(null);
    } catch (err: any) {
      alert(`Signal interrupted: ${err.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 transition-colors">
      <header className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => window.history.back()} className="p-2 glass-panel text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest text-[var(--text-main)]">Creator Studio</h1>
        </div>
      </header>

      <main className="px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Visual Signal (Image Upload) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Visual Signal</label>
            <div className="relative group">
              <input 
                type="file"
                accept="image/*"
                {...register("image")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`h-56 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-3 overflow-hidden transition-all ${
                errors.image ? 'border-red-400 bg-red-400/5' : 'border-[var(--border)] hover:border-[var(--accent)]'
              }`}>
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <div className="p-4 bg-[var(--bg-app)] rounded-3xl text-[var(--accent)] shadow-inner">
                      <Camera size={28} />
                    </div>
                    <p className="text-[10px] font-black uppercase opacity-40">Sync local file</p>
                  </>
                )}
              </div>
            </div>
            {errors.image && <p className="text-[10px] text-red-400 font-bold ml-1">{errors.image.message as string}</p>}
          </div>

          {/* Identity */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Identity</label>
            <input 
              {...register("name")}
              placeholder="Name your creation..."
              className={`w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-sm font-bold focus:ring-2 transition-all ${
                errors.name ? 'ring-2 ring-red-400' : 'focus:ring-[var(--accent)]'
              }`}
            />
            {errors.name && <p className="text-[10px] text-red-400 font-bold ml-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Sector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Sector</label>
              <select 
                {...register("collection_id")}
                className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-xs font-bold appearance-none dark:text-white"
              >
                <option value="">Select Set</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.collection_id && <p className="text-[10px] text-red-400 font-bold ml-1">Required</p>}
            </div>

            {/* Rarity */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Rarity</label>
              <select 
                {...register("rarity")}
                className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-xs font-bold appearance-none dark:text-white"
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Ultra">Ultra</option>
                <option value="Celestial">Celestial</option>
              </select>
            </div>
          </div>

          <div className="bg-[#FEF9C3] dark:bg-white/5 p-4 rounded-3xl flex gap-3 items-start border border-[#FEF08A] dark:border-white/10">
            <AlertCircle size={18} className="text-yellow-600 dark:text-[var(--accent)] shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold opacity-60 leading-tight">
              Minting uses local storage relay. Avoid refreshing while signal is syncing.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isMinting}
            className="w-full py-5 moonie-btn text-white rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-95"
          >
            {isMinting ? <Sparkles className="animate-spin" size={18} /> : <PlusSquare size={18} />}
            {isMinting ? 'Broadcasting...' : 'Finalize Mint'}
          </button>
        </form>
      </main>
    </div>
  );
}
