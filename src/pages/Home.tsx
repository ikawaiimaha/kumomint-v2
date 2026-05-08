import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Package, Heart, ChevronRight, Sparkles, LogIn } from 'lucide-react';

const TIER_NAMES = ["Daydream", "Reverie", "Lucid", "Ethereal", "Celestial"];
const TIER_COLORS = ["bg-[#7ED7C1]", "bg-[#A389F4]", "bg-[#FFB5C5]", "bg-[#93C5FD]", "bg-[#FCD34D]"];

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [xp] = useState(25); 

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F7] flex flex-col items-center justify-center">
      <Sparkles className="animate-spin text-[#7ED7C1] mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Kumomint...</p>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#FDF8F7] flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-sm mb-6">
        <Package size={32} className="text-[#7ED7C1]" />
      </div>
      <h2 className="text-xl font-black text-[#2E2A28] mb-2">Welcome to Kumomint</h2>
      <p className="text-xs font-bold text-gray-400 mb-8 leading-relaxed">Login to start trading and building your dream wardrobe!</p>
      <button 
        onClick={() => navigate('/login')}
        className="w-full py-4 bg-[#2E2A28] text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
      >
        <LogIn size={16} /> Sign In
      </button>
    </div>
  );

  const currentTierIndex = Math.min(Math.floor(xp / 100), 4);
  const progressToNext = xp % 100;

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-32 px-6 pt-6">
      <div className="flex justify-between items-center mb-8 mt-2">
        <h1 className="text-2xl font-black text-[#2E2A28]">KUMOMINT</h1>
        <button onClick={() => navigate('/notifications')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#F0E6E4] relative text-gray-400">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white"></span>
        </button>
      </div>

      <div className={`${TIER_COLORS[currentTierIndex]} p-6 rounded-[32px] text-white relative overflow-hidden mb-8`}>
        <h2 className="text-xl font-black mb-3">{TIER_NAMES[currentTierIndex]}</h2>
        <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/80 transition-all duration-1000" style={{ width: `${progressToNext}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => navigate('/wardrobe')} className="bg-[#EEF2FF] p-6 rounded-[32px] flex flex-col items-center gap-3">
          <div className="p-2 bg-white rounded-xl"><Package size={20} className="text-blue-400" /></div>
          <span className="font-black text-[10px] uppercase">Wardrobe</span>
        </button>
        <button onClick={() => navigate('/wishlist')} className="bg-[#FFF0F3] p-6 rounded-[32px] flex flex-col items-center gap-3">
          <div className="p-2 bg-white rounded-xl"><Heart size={20} className="text-pink-400" /></div>
          <span className="font-black text-[10px] uppercase">Wishlist</span>
        </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="font-black text-lg">New Collections</h3>
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </div>
  );
}
