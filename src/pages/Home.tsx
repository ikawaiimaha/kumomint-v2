import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  ArrowLeftRight, 
  Sparkles, 
  Cloud, 
  Search, 
  Bell, 
  Settings,
  ChevronRight,
  Package
} from 'lucide-react';

interface PerfectMatch {
  trader_id: string;
  trader_name: string;
  trader_avatar: string;
  give_item_name: string;
  give_item_image: string;
  get_item_name: string;
  get_item_image: string;
}

interface Collection {
  id: string;
  name: string;
  image_url: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [perfectMatches, setPerfectMatches] = useState<PerfectMatch[]>([]);
  const [recentCollections, setRecentCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, [user]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Perfect Matches if logged in
      if (user) {
        const { data: matches, error: matchError } = await supabase
          .rpc('get_perfect_matches', { p_user_id: user.id });
        
        if (!matchError && matches) {
          setPerfectMatches(matches);
        }
      }

      // 2. Fetch Recent Collections for the slider
      const { data: collections, error: collError } = await supabase
        .from('collections')
        .select('id, name, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!collError && collections) {
        setRecentCollections(collections);
      }

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      {/* --- HEADER --- */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#2E2A28] tracking-tight">KUMOMINT</h1>
          <p className="text-[10px] font-bold text-[#4E927E] tracking-widest uppercase opacity-70">
            Digital Trade Matching
          </p>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F0E6E4]">
            <Search size={18} className="text-[#2E2A28]" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F0E6E4]">
            <Bell size={18} className="text-[#2E2A28]" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">
        
        {/* --- PERFECT MATCHES SECTION --- */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-[#2E2A28]">Perfect Matches</h3>
            {perfectMatches.length > 0 && (
              <span className="text-[11px] font-bold text-[#4E927E] bg-[#E8F4F1] px-2 py-0.5 rounded-full">
                {perfectMatches.length} Found
              </span>
            )}
          </div>
          
          {!user ? (
            /* Guest View */
            <div className="bg-[#FFF5F7] border border-[#FFDDE4] rounded-[28px] p-6 text-center">
              <Sparkles size={24} className="text-[#FFB5C5] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#2E2A28]">Login to find trades!</p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-3 px-6 py-2 bg-[#FFB5C5] text-white rounded-full text-xs font-bold"
              >
                Get Started
              </button>
            </div>
          ) : perfectMatches.length > 0 ? (
            /* Success View */
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 w-full">
              {perfectMatches.map((match, idx) => (
                <div 
                  key={idx}
                  className="min-w-[280px] bg-white rounded-[32px] p-4 shadow-sm border border-[#F0E6E4]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <img src={match.trader_avatar} className="w-6 h-6 rounded-full bg-gray-100" alt="" />
                    <span className="text-[11px] font-bold text-gray-500">{match.trader_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 bg-[#F8F9FB] rounded-2xl mx-auto mb-2 flex items-center justify-center overflow-hidden">
                        <img src={match.get_item_image} className="w-12 h-12 object-contain" alt="" />
                      </div>
                      <p className="text-[10px] font-bold text-[#2E2A28] line-clamp-1">Receive</p>
                    </div>
                    
                    <ArrowLeftRight size={16} className="text-[#FFB5C5]" />
                    
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 bg-[#F8F9FB] rounded-2xl mx-auto mb-2 flex items-center justify-center overflow-hidden">
                        <img src={match.give_item_image} className="w-12 h-12 object-contain" alt="" />
                      </div>
                      <p className="text-[10px] font-bold text-[#2E2A28] line-clamp-1">Send</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State / Discovery */
            <div className="bg-white/60 border border-dashed border-[#A5D6C8] rounded-[28px] p-8 text-center">
              <div className="w-12 h-12 bg-[#F8EEFF] rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart size={20} className="text-[#FFB5C5]" />
              </div>
              <p className="text-sm font-bold text-[#2E2A28]">No matches found yet</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
                Heart more items in the catalog to help the algorithm find traders for you!
              </p>
              <button 
                onClick={() => navigate('/catalog')}
                className="mt-4 text-[11px] font-bold text-[#4E927E] uppercase tracking-wider"
              >
                Browse Catalog
              </button>
            </div>
          )}
        </section>

        {/* --- QUICK ACTIONS --- */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/wardrobe')}
            className="bg-[#EEF2FF] p-5 rounded-[32px] text-left border border-[#DDE4FF]"
          >
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
              <Package size={20} className="text-[#7C93FF]" />
            </div>
            <p className="font-bold text-[#2E2A28] text-sm">Wardrobe</p>
            <p className="text-[10px] text-[#7C93FF] font-bold">Manage Items</p>
          </button>

          <button 
            onClick={() => navigate('/wishlist')}
            className="bg-[#FFF5F7] p-5 rounded-[32px] text-left border border-[#FFDDE4]"
          >
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
              <Heart size={20} className="text-[#FFB5C5]" />
            </div>
            <p className="font-bold text-[#2E2A28] text-sm">Wishlist</p>
            <p className="text-[10px] text-[#FFB5C5] font-bold">Find Trait</p>
          </button>
        </div>

        {/* --- RECENT COLLECTIONS SLIDER --- */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-[#2E2A28]">New Collections</h3>
            <button onClick={() => navigate('/catalog')} className="text-gray-400">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {recentCollections.map((col) => (
              <div 
                key={col.id}
                onClick={() => navigate(`/catalog?collection=${col.id}`)}
                className="min-w-[140px] group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-white rounded-[24px] mb-2 border border-[#F0E6E4] overflow-hidden p-3 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
                  {col.image_url ? (
                    <img src={col.image_url} className="w-full h-full object-contain" alt="" />
                  ) : (
                    <Cloud size={32} className="text-[#A5D6C8] opacity-20" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-[#2E2A28] line-clamp-1 px-1">{col.name}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* --- BOT NAV PLACEHOLDER (Assuming you have one) --- */}
    </div>
  );
};

export default Home;
