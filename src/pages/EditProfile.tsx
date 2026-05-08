import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('traders').select('username').eq('id', user.id).single();
      if (data) setUsername(data.username || '');
    }
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('traders')
      .update({ username })
      .eq('id', user.id);
      
    setSaving(false);
    
    if (!error) {
      navigate(-1); // Go back to profile
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 glass-card">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Edit Persona</h1>
      </header>

      <main>
        <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase opacity-40 block mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-[var(--bg-primary)] rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-[var(--accent)] transition-all"
              placeholder="Your username..."
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-[#A389F4]/20 flex justify-center items-center gap-2"
          >
            {saving ? <Sparkles className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
