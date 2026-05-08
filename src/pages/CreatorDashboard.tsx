import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusSquare, 
  Sparkles, 
  ChevronLeft, 
  AlertCircle, 
  Camera 
} from 'lucide-react';

const mintSchema = z.object({
  name: z.string().min(2, "Identity required"),
  collection_id: z.string().min(1, "Select a sector"),
  rarity: z.enum(['Common', 'Rare', 'Ultra', 'Celestial']),
  image: z.any().refine((files) => files?.length > 0, "Visual signal required"),
});

type MintFormData = z.infer<typeof mintSchema>;

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<{id: string, name: string}[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
    defaultValues: { rarity: 'Common' }
  });

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

  const onSubmit = async (data: MintFormData) => {
    if (!user) return;
    setIsMinting(true);

    try {
      const file = data.image[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('items').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('items').insert([{
        name: data.name,
        collection_id: data.collection_id,
        rarity: data.rarity,
        image_url: urlData.publicUrl,
        creator_id: user.id
      }]);

      if (dbError) throw dbError;

      alert("Item minted! ✨");
      reset();
      setPreview(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-[var(--bg-app)]">
      <header className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => window.history.back()} className="p-2 glass-panel text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest">Creator Studio</h1>
        </div>
      </header>

      <main className="px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Visual Signal</label>
            <div className="relative group">
              <input type="file" accept="image/*" {...register("image")} className="absolute inset-0 w-full h-full opacity-0 z-10" />
              <div className="h-56 rounded-[32px] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center overflow-hidden">
                {preview ? <img src={preview} className="w-full h-full object-cover" alt="" /> : <Camera size={28} className="text-[var(--accent)]" />}
              </div>
            </div>
            {errors.image && <p className="text-[10px] text-red-400 font-bold">{errors.image.message as string}</p>}
          </div>

          <input {...register("name")} placeholder="Name..." className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none font-bold" />
          
          <div className="grid grid-cols-2 gap-3">
            <select {...register("collection_id")} className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-xs font-bold">
              <option value="">Set</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select {...register("rarity")} className="w-full p-4 bg-[var(--bg-app)] rounded-2xl border-none text-xs font-bold">
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Ultra">Ultra</option>
              <option value="Celestial">Celestial</option>
            </select>
          </div>

          <div className="bg-yellow-400/10 p-4 rounded-3xl flex gap-3 border border-yellow-400/20">
            <AlertCircle size={18} className="text-yellow-600 shrink-0" />
            <p className="text-[10px] font-bold opacity-60">Permanent minting in progress.</p>
          </div>

          <button type="submit" disabled={isMinting} className="w-full py-5 moonie-btn text-white rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-2">
            {isMinting ? <Sparkles className="animate-spin" size={18} /> : <PlusSquare size={18} />}
            {isMinting ? 'Syncing...' : 'Finalize Mint'}
          </button>
        </form>
      </main>
    </div>
  );
}
