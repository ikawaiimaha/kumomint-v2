import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Package, Heart, ChevronRight } from 'lucide-react';

const TIER_NAMES = ["Daydream", "Reverie", "Lucid", "Ethereal", "Celestial"];

// The colors perfectly match your app's pastel theme!
const TIER_COLORS = [
  "bg-[#7ED7C1]", // Daydream - Teal
  "bg-[#A389F4]", // Reverie - Purple
  "bg-[#FFB5C5]", // Lucid - Pink
  "bg-[#93C5FD]", // Ethereal - Blue
  "bg-[#FCD34D]"  // Celestial - Gold
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // This is temporary mock XP just to make the bar look pretty for now!
  const [xp, setXp] = useState(25); 

  useEffect(() => {
    // If someone tries to open the app but isn't logged in, send them to the login screen
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // If user is null, don't render anything while redirecting
  if (!user) return null; 

  // Math to figure out which tier they are in based on their XP
  // Every 100 XP levels them up to the next tier name and color
  const currentTierIndex = Math.min(Math.floor(xp / 100), 4);
  const progressToNext = xp % 100;
  
  const currentTierName = TIER_NAMES[currentTierIndex];
  const currentTierColor = TIER_COLORS[currentTierIndex];

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-32 px-6 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <h1 className="text-2xl font-black text-[#2E2A28] tracking-tight">KUMOMINT</h1>
        <button onClick={() => navigate('/notifications')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F0E6E4] relative text-gray-400 active:scale-95 transition-transform">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Dynamic Tier Card */}
      <div className={`${currentTierColor} p-6 rounded-[32px] shadow-sm mb-8 text-white relative overflow-hidden transition-colors duration-500`}>
        {/* Soft overlay gradient to make it pop */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        <h2 className="text-xl font-black mb-3 relative z-10">{currentTierName}</h2>
        <div className="h-2 w-full bg-black/10 rounded-full relative z-10 overflow-hidden">
          <div 
            className="h-full bg-white/80 rounded-full transition-all duration-1000" 
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Perfect Matches */}
      <div className="mb-8">
        <h3 className="font-black text-[#2E2A28] mb-4 text-lg">Perfect Matches</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/wardrobe')}
            className="bg-[#EEF2FF] p-6 rounded-[32px] border border-blue-100 flex flex-col items-start gap-4 active:scale-95 transition-transform shadow-sm"
          >
            <div className="p-2 bg-white rounded-2xl shadow-sm">
              <Package size={20} className="text-blue-400" />
            </div>
            <span className="font-black text-xs text-[#2E2A28]">Wardrobe</span>
          </button>
          
          <button 
            onClick={() => navigate('/wishlist')}
            className="bg-[#FFF0F3] p-6 rounded-[32px] border border-pink-100 flex flex-col items-start gap-4 active:scale-95 transition-transform shadow-sm"
          >
            <div className="p-2 bg-white rounded-2xl shadow-sm">
              <Heart size={20} className="text-pink-400" />
            </div>
            <span className="font-black text-xs text-[#2E2A28]">Wishlist</span>
          </button>
        </div>
      </div>

      {/* New Collections */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-[#2E2A28] text-lg">New Collections</h3>
          <button className="text-gray-400 active:scale-90 transition-transform">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
