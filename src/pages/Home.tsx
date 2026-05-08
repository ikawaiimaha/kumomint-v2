import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { initiateTradeOffer } from '../lib/trade-utils';
import { 
  Heart, 
  ArrowLeftRight, 
  Sparkles, 
  Cloud, 
  Bell, 
  ChevronRight,
  Package
} from 'lucide-react';

interface PerfectMatch {
  trader_id: string;
  trader_name: string;
  trader_avatar: string;
  give_item_id: string;
  give_item_name: string;
  give_item_image: string;
  get_item_id: string;
  get_item_name: string;
  get_item_image: string;
  fairness_ratio: number;
}

interface Collection {
  id: string;
  name: string;
  image_url: string;
}

const TIER_NAMES = ["Sticker", "Charm", "Treasure", "Dream", "Legendary"];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [perfectMatches, setPerfectMatches] = useState<PerfectMatch[]>([]);
  const [recentCollections, setRecentCollections] = useState<Collection[]>([]);
  const [userStats, setUserStats] = useState({ xp: 0, tier: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, [user]);

  const fetchHomeData = async () => {
    setLoading(true);
    if (user) {
      const { data: userData } = await supabase.from('traders').select('xp, tier').eq('id', user.id).single();
      if (userData) setUserStats(userData);
      const { data: matches } = await supabase.rpc('get_perfect_matches', { p_user_id: user.id });
      if (matches) setPerfectMatches(matches);
    }
    const { data: colls } = await supabase.from('collections').select('id, name, image_url').eq('is_active', true).limit(6);
    if (colls) setRecentCollections(colls);
    setLoading(false);
  };

  const handleSendOffer = async (match: PerfectMatch) => {
    if (!user) return navigate('/login');
    try {
      await initiateTradeOffer(user.id, match.trader_id, match.give_item_id, match.get_item_id);
      navigate('/offers');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center"><Sparkles className="animate-spin text-[#7ED7C1]" /></div>;

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#2E2A28]">KUMOMINT</h1>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><Bell size={18} /></button>
      </header>

      <main className="px-6 space-y-8">
        {user && (
          <section onClick={() => navigate('/profile')} className="bg-gradient-to-br from-[#7ED7C1] to-[#5BBAA3] p-5 rounded-[32px] text-white shadow-md">
            <h2 className="text-xl font-black">{TIER_NAMES[userStats.tier - 1]}</h2>
            <div className="bg-black/10 h-2 rounded-full mt-2"><div className="h-full bg-white" style={{ width: `${(userStats.xp / 18000) * 100}%` }} /></div>
          </section>
        )}

        <section>
          <h3 className="font-bold text-lg mb-3">Perfect Matches</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {perfectMatches.map((m, i) => (
              <div key={i} className="min-w-[280px] bg-white rounded-[32px] p-4 border border-[#F0E6E4]">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-4"><span>{m.trader_name}</span><span>{Math.round(m.fairness_ratio * 100)}% Fair</span></div>
                <div className="flex items-center justify-between"><img src={m.get_item_image} className="w-12 h-12" alt="" /><ArrowLeftRight size={16} className="text-[#FFB5C5]" /><img src={m.give_item_image} className="w-12 h-12" alt="" /></div>
                <button onClick={() => handleSendOffer(m)} className="w-full mt-4 py-3 bg-[#7ED7C1] text-white rounded-2xl text-[10px] font-black uppercase">Send Offer</button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/wardrobe')} className="bg-[#EEF2FF] p-5 rounded-[32px] text-left border border-[#DDE4FF]"><Package size={20} className="text-[#7C93FF] mb-2" /><p className="font-bold text-sm">Wardrobe</p></button>
          <button onClick={() => navigate('/wishlist')} className="bg-[#FFF5F7] p-5 rounded-[32px] text-left border border-[#FFDDE4]"><Heart size={20} className="text-[#FFB5C5] mb-2" /><p className="font-bold text-sm">Wishlist</p></button>
        </div>

        <section>
          <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">New Collections</h3><ChevronRight size={20} className="text-gray-400" /></div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {recentCollections.map(c => (
              <div key={c.id} onClick={() => navigate(`/catalog?collection=${c.id}`)} className="min-w-[140px]"><div className="aspect-[4/5] bg-white rounded-[24px] mb-2 border border-[#F0E6E4] p-3 flex items-center justify-center shadow-sm">{c.image_url ? <img src={c.image_url} className="w-full h-full object-contain" alt="" /> : <Cloud size={32} className="opacity-20" />}</div><p className="text-[11px] font-bold line-clamp-1">{c.name}</p></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
