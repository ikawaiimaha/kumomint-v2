import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] p-8 flex flex-col">
      <button onClick={() => navigate('/')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-12">
        <ChevronLeft size={20} className="text-gray-400" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="text-3xl font-black text-[#2E2A28] mb-2 text-center">Welcome Back</h1>
        <p className="text-xs font-bold text-gray-400 mb-10 text-center uppercase tracking-widest">Login to Kumomint</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full p-4 bg-white rounded-2xl border border-[#F0E6E4] text-sm font-bold shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-4 bg-white rounded-2xl border border-[#F0E6E4] text-sm font-bold shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Sparkles className="animate-spin" size={16} /> : <LogIn size={16} />}
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          New here? <Link to="/register" className="text-[#7ED7C1] ml-1">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
