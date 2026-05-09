import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Sparkles, Wand2, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. Zod Validation Schema
const mintSchema = z.object({
  name: z.string().min(2, "Identity required"),
  collection_id: z.string().min(1, "Select a sector"),
  rarity: z.enum(['Common', 'Rare', 'Ultra', 'Celestial']),
  image: z.any().refine((files) => files?.length > 0, "Visual signal required"),
});

type MintFormData = z.infer<typeof mintSchema>;

export default function CreatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Database State
  const [collections, setCollections] = useState<{id: string, name: string}[]>([]);
  
  // UI States
  const [isMinting, setIsMinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Form Setup
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
    defaultValues: { rarity: 'Common', collection_id: '' }
  });

  const imageFile = watch('image');
  const itemName = watch('name');

  // Fetch Collections from Supabase
  const fetchData = useCallback(async () => {
    const { data } = await supabase.from('collections').select('id, name').order('name');
    if (data) setCollections(data);
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Handle Image Preview Generation
  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const url = URL.createObjectURL(imageFile[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [imageFile]);

  // Form Submission Logic
  const onSubmit = async (data: MintFormData) => {
    if (!user) return;
    
    setIsMinting(true);
    setProgress(0);
    setSuccess(false);

    // Start fake progress bar for visual flair while uploading
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 85 ? prev + Math.floor(Math.random() * 10) + 5 : prev));
    }, 400);

    try {
      // 1. Upload Image to Storage
      const file = data.image[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage.from('items').getPublicUrl(filePath);

      // 3. Insert into Database
      const { error: dbError } = await supabase.from('items').insert([{
        name: data.name,
        collection_id: data.collection_id,
        rarity: data.rarity,
        image_url: urlData.publicUrl,
        creator_id: user.id
      }]);

      if (dbError) throw dbError;

      // Success!
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsMinting(false);
        setSuccess(true);
      }, 500);

    } catch (err: any) {
      clearInterval(progressInterval);
      setIsMinting(false);
      alert(err.message || "Failed to mint item.");
    }
  };

  const resetStudio = () => {
    reset();
    setSuccess(false);
    setProgress(0);
    setPreview(null);
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Creator Studio</h1>
      </header>

      <main className="space-y-6 relative">
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* VISUAL SIGNAL BOX */}
          <div className="relative">
            <div className="flex justify-between items-end mb-2 ml-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Visual Signal</p>
              {errors.image && <p className="text-[10px] text-red-500 font-bold">{errors.image.message as string}</p>}
            </div>
            
            <div className={`glass-panel aspect-square flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 relative overflow-hidden ${
              isMinting ? 'border-[var(--accent)] shadow-[0_0_40px_rgba(163,137,244,0.3)] bg-[var(--accent)]/5' : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50'
            }`}>
              
              {/* Invisible File Input Overlay */}
              {!isMinting && !success && (
                <input 
                  type="file" 
                  accept="image/*" 
                  {...register("image")} 
                  className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                />
              )}
              
              {success ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-500 z-10">
                  <div className="w-24 h-24 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mb-4 border border-[var(--accent-green)]/50">
                    <CheckCircle2 size={40} className="text-[var(--accent-green)]" />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest text-[var(--accent-green)]">Item Minted!</p>
                </div>
              ) : isMinting ? (
                <div className="flex flex-col items-center z-10">
                  <Sparkles size={40} className="text-[var(--accent)] animate-pulse mb-4" />
                  <p className="font-black text-[10px] uppercase tracking-widest text-[var(--accent)] animate-pulse">Syncing with Stars...</p>
                </div>
              ) : preview ? (
                <img src={preview} className="w-full h-full object-cover z-10" alt="Preview" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] hover:scale-110 transition-transform shadow-lg z-10">
                  <Camera size={24} />
                </div>
              )}
            </div>
          </div>

          <div className={`space-y-6 transition-opacity duration-300 ${isMinting || success ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {/* NAME INPUT */}
            <div>
              <input 
                type="text" 
                {...register("name")}
                placeholder="Name your creation..."
                className="w-full bg-transparent border-none outline-none font-black text-2xl placeholder:text-[var(--border-subtle)] px-2"
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1">{errors.name.message as string}</p>}
            </div>

            {/* DROPDOWNS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block ml-2 mb-1">Collection</label>
                <select 
                  {...register("collection_id")}
                  className="w-full bg-transparent font-bold text-sm outline-none appearance-none px-2 pb-1 text-[var(--text-main)]"
                >
                  <option value="" disabled>Select Set...</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="glass-panel p-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] block ml-2 mb-1">Rarity</label>
                <select 
                  {...register("rarity")}
                  className="w-full bg-transparent font-bold text-sm outline-none appearance-none px-2 pb-1 text-[var(--text-main)]"
                >
                  <option value="Common">Moon (Common)</option>
                  <option value="Rare">Star (Rare)</option>
                  <option value="Ultra">Comet (Ultra)</option>
                  <option value="Celestial">Galaxy (Celestial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* WARNING BANNER */}
          <div className={`bg-yellow-400/10 p-4 rounded-3xl flex gap-3 border border-yellow-400/20 transition-opacity duration-300 ${isMinting || success ? 'opacity-50' : 'opacity-100'}`}>
            <AlertCircle size={18} className="text-yellow-600 shrink-0" />
            <p className="text-[10px] font-bold text-yellow-700/80 dark:text-yellow-400/80">Permanent minting in progress. Once ignited, this signal cannot be un-sent.</p>
          </div>

          {/* INVISIBLE SUBMIT (Triggered by the absolute bottom button) */}
          <button id="hidden-submit" type="submit" className="hidden" />
        </form>

        {/* MINT ACTION BUTTON (Fixed at bottom) */}
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
              onClick={() => document.getElementById('hidden-submit')?.click()}
              disabled={isMinting || !itemName || !imageFile || imageFile.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex justify-center items-center gap-2 transition-all duration-300 relative overflow-hidden ${
                itemName && imageFile && imageFile.length > 0 
                  ? 'bg-[var(--accent)] text-white hover:opacity-90' 
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
              }`}
            >
              {isMinting ? (
                <>
                  <div 
                    className="absolute inset-0 bg-white/20 transition-all duration-300 ease-out"
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
