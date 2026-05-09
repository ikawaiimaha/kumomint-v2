import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [sanrioBuddy, setSanrioBuddy] = useState('');
  const [tradeVibe, setTradeVibe] = useState('');
  const [birthday, setBirthday] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('traders')
        .select('username, pronouns, sanrio_buddy, trade_vibe, birthday')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setUsername(data.username || '');
        setPronouns(data.pronouns || '');
        setSanrioBuddy(data.sanrio_buddy || '');
        setTradeVibe(data.trade_vibe || '');
        setBirthday(data.birthday || '');
      }
    }
    load();
  }, [user]);

  // --- NEW FORMATTING LOGIC ---
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Remove anything that isn't a number
    let cleaned = e.target.value.replace(/\D/g, '');
    
    // 2. Prevent entering more than 4 digits
    cleaned = cleaned.substring(0, 4);
    
    // 3. Automatically insert the slash after the month
    if (cleaned.length > 2) {
      cleaned = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    
    setBirthday(cleaned);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('traders')
      .update({ 
        username,
        pronouns,
        sanrio_buddy: sanrioBuddy,
        trade_vibe: tradeVibe,
        birthday
      })
      .eq('id', user.id);
      
    setSaving(false);
    
    if (!error) {
      navigate(-1);
    } else {
      alert("Oops! Something went wrong saving your persona.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]/30 transition-colors duration-500">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Edit Persona</h1>
      </header>

      <main>
        {/* Swapped hardcoded purple for our new dynamic glass panel */}
        <form onSubmit={handleSave} className="glass-panel p-6 space-y-6">
          
          <div>
            <label className="text-[10px] font-black uppercase opacity-60 block mb-2 tracking-widest text-[var(--accent)]">Display Name</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-[var(--accent)] transition-all"
              placeholder="e.g. KawaiiMaha"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-60 block mb-2 tracking-widest text-[var(--accent)]">Pronouns</label>
            <input 
              type="text" 
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              className="w-full p-4 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-[var(--accent)] transition-all"
              placeholder="e.g. she/her"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-60 block mb-2 tracking-widest text-[var(--accent)]">Sanrio Buddy</label>
            <select 
              value={sanrioBuddy}
              onChange={(e) => setSanrioBuddy(e.target.value)}
              className="w-full p-4 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-[var(--accent)] transition-all appearance-none"
            >
              <option value="">Select a buddy...</option>
              <option value="Hello Kitty">Hello Kitty</option>
              <option value="My Melody">My Melody</option>
              <option value="Kuromi">Kuromi</option>
              <option value="Cinnamoroll">Cinnamoroll</option>
              <option value="Pompompurin">Pompompurin</option>
              <option value="Pochacco">Pochacco</option>
              <option value="Little Twin Stars">Little Twin Stars</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase opacity-60 block mb-2 tracking-widest text-[var(--accent)]">Trade Vibe</label>
              <select 
                value={tradeVibe}
                onChange={(e) => setTradeVibe(e.target.value)}
                className="w-full p-4 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-[var(--accent)] transition-all appearance-none text-sm"
              >
                <option value="">Select vibe...</option>
                <option value="Casual">Casual</option>
                <option value="Strict">Strict WL</option>
                <option value="Gift Friendly">Gifts OK</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase opacity-60 block mb-2 tracking-widest text-[var(--accent)]">Birthday</label>
              <input 
                type="text" 
                value={birthday}
                onChange={handleBirthdayChange} // Using the new function
                className="w-full p-4 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-[var(--accent)] transition-all text-sm"
                placeholder="MM/DD"
                maxLength={5}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-[#A389F4]/30 flex justify-center items-center gap-2 mt-4 hover:opacity-90 transition-opacity"
          >
            {saving ? <Sparkles className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Syncing with Stars...' : 'Save Persona'}
          </button>
        </form>
      </main>
    </div>
  );
}
