import { useEffect, useState } from 'react';
import { Cloud, Heart, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RarityBadge from '../components/RarityBadge';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      
      const [trendRes] = await Promise.all([
        supabase.from('items').select('*').order('demand_score', { ascending: false }).limit(8)
      ]);
      setTrending(trendRes.data ?? []);

      if (user) {
        const [profRes, matchRes] = await Promise.all([
          supabase.from('traders').select('*').eq('id', user.id).maybeSingle(),
          supabase.rpc('get_trade_matches', { p_trader_id: user.id })
        ]);
        setProfile(profRes.data);
        setMatches(matchRes.data ?? []);
      }
    };
    init();
  }, []);

  const welcomeName = profile?.display_name || profile?.username || 'Dreamer';

  return (
    <Layout title="" showNav={true}>
      <div className="space-y-6">
        {/* HERO */}
        <section className="bg-white/80 dark:bg-white/10 border border-[rgba(165,214,200,0.18)] rounded-[32px] p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#E9FAF4] to-[#F8EEFF] p-3 rounded-2xl">
              <img src="/kumo-mascot.png" className="w-16 h-16 object-contain" alt="Kumo" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-gray-400">Teacup Kumoru</p>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white truncate">Welcome, {welcomeName}</h2>
            </div>
          </div>
          {!userId && (
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigate('/login')} className="bg-[#A5D6C8] px-6 py-2 rounded-xl font-bold text-[#2E2A28]">Sign In</button>
              <button onClick={() => navigate('/register')} className="border border-[rgba(165,214,200,0.3)] px-6 py-2 rounded-xl font-bold text-[#2E2A28] dark:text-white">Join</button>
            </div>
          )}
        </section>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-[rgba(165,214,200,0.1)] text-center shadow-sm">
            <Cloud className="mx-auto mb-1 text-blue-300" size={20} />
            <p className="text-xl font-bold text-[#2E2A28] dark:text-white">{profile?.dream_mints || 0}</p>
            <p className="text-[10px] text-gray-400">MINTS</p>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-[rgba(165,214,200,0.1)] text-center shadow-sm">
            <Zap className="mx-auto mb-1 text-yellow-400" size={20} />
            <p className="text-xl font-bold text-[#2E2A28] dark:text-white">{profile?.login_streak || 0}</p>
            <p className="text-[10px] text-gray-400">STREAK</p>
          </div>
          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-[rgba(165,214,200,0.1)] text-center shadow-sm">
            <Heart className="mx-auto mb-1 text-pink-300" size={20} />
            <p className="text-xl font-bold text-[#2E2A28] dark:text-white">{matches.length}</p>
            <p className="text-[10px] text-gray-400">MATCHES</p>
          </div>
        </div>

        {/* TRENDING SECTION - THE FIX */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-[#2E2A28] dark:text-white">Trending Items</h3>
            <button onClick={() => navigate('/catalog')} className="text-sm text-[#4E927E] font-semibold inline-flex items-center">See All <ChevronRight size={14}/></button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {trending.map((item) => (
              <div key={item.id} className="w-36 shrink-0 bg-white dark:bg-white/5 rounded-3xl border border-[rgba(165,214,200,0.14)] overflow-hidden shadow-sm">
                <div className="h-28 bg-gray-50 dark:bg-gray-800 relative">
                   <img src={item.thumbnail_url || item.image_url || ''} className="w-full h-full object-cover" alt={item.name} />
                   <div className="absolute top-2 left-2">
                     <RarityBadge tier={item.rarity} />
                   </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-[#2E2A28] dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{item.character || 'HKDV'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}