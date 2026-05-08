import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Sign up user
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      alert(error.message);
    } else if (data.user) {
      // 2. Create the profile in your traders table
      await supabase.from('traders').insert([{
        id: data.user.id,
        username: username,
        bio: 'Hello! I am new here.'
      }]);
      alert("Success! Please check your email or try logging in.");
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] p-8 flex flex-col">
      <button onClick={() => navigate('/')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-12">
        <ChevronLeft size={20} className="text-gray-400" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full text-center">
        <h1 className="text-3xl font-black text-[#2E2A28] mb-2">Join Kumomint</h1>
        <p className="text-xs font-bold text-gray-400 mb-10 uppercase tracking-widest text-center">Start your collection</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username"
            className="w-full p-4 bg-white rounded-2xl border border-[#F0E6E4] text-sm font-bold shadow-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
            className="w-full py-4 bg-[#7ED7C1] text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Sparkles className="animate-spin" size={16} /> : <UserPlus size={16} />}
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
          Already a member? <Link to="/login" className="text-[#2E2A28] ml-1">Log In</Link>
        </p>
      </div>
    </div>
  );
}
