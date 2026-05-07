import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Sun,
  Gamepad2,
  Wind,
  Moon,
  TrendingUp,
  Bell,
  ArrowRight,
  Loader2,
  Heart,
  Package,
  Zap,
  ChevronRight,
  Scale,
  Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import RarityBadge from '@/components/RarityBadge';
import BottomSheet from '@/components/BottomSheet';
import { cn } from '@/lib/utils';

// ─── Types ───
interface TraderProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  current_status: 'sunny' | 'playing' | 'drifting' | 'dreaming';
  preferred_method: 'tickets_only' | 'gifts_only' | 'both';
  reputation_score: number;
  total_trades: number;
  dream_mints: number;
  login_streak: number;
  can_claim_today: boolean;
}

interface TradeMatch {
  matched_trader_id: string;
  matched_username: string;
  matched_avatar_url: string | null;
  match_score: number;
  their_wanted_items: { item_id: string; name: string; rarity: string }[] | null;
  your_wanted_items: { item_id: string; name: string; rarity: string }[] | null;
  method_compatibility: 'perfect' | 'compatible' | 'incompatible';
}

interface TrendingItem {
  id: string;
  name: string;
  rarity: 'N' | 'R' | 'S' | 'SR';
  character: string;
  collection_id: string | null;
  demand_score: number;
  image_url: string | null;
  thumbnail_url: string | null;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

const STATUS_CONFIG = {
  sunny:    { label: 'Sunny',    icon: Sun,       color: '#F1C40F', bg: 'bg-yellow-50',    ring: 'ring-yellow-400' },
  playing:  { label: 'Playing',  icon: Gamepad2,  color: '#3498DB', bg: 'bg-blue-50',      ring: 'ring-blue-400' },
  drifting: { label: 'Drifting', icon: Wind,      color: '#E67E22', bg: 'bg-orange-50',    ring: 'ring-orange-400' },
  dreaming: { label: 'Dreaming', icon: Moon,      color: '#9B59B6', bg: 'bg-purple-50',    ring: 'ring-purple-400' },
} as const;

const COMPATIBILITY_LABEL = {
  perfect:      { text: 'Perfect Match',     color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-200' },
  compatible:   { text: 'Compatible',        color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  incompatible: { text: 'Different Method',  color: 'text-red-400',    bg: 'bg-red-50',    border: 'border-red-200' },
};

const NOTIF_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  offer_received:   { icon: Heart,       color: '#E84393', bg: 'bg-pink-50',    label: 'Trade Offer' },
  offer_accepted:   { icon: Zap,         color: '#2ECC71', bg: 'bg-green-50',   label: 'Accepted' },
  offer_declined:   { icon: Wind,        color: '#E67E22', bg: 'bg-orange-50',  label: 'Declined' },
  trade_completed:  { icon: Package,     color: '#7ED7C1', bg: 'bg-[#7ED7C1]/10', label: 'Completed' },
  match_found:      { icon: Search,      color: '#9B59B6', bg: 'bg-purple-50',  label: 'Match' },
  system:           { icon: Bell,        color: '#3498DB', bg: 'bg-blue-50',    label: 'System' },
  verification:     { icon: ShieldCheck, color: '#2ECC71', bg: 'bg-green-50',   label: 'Verified' },
  ghosting_warning: { icon: ShieldAlert, color: '#E74C3C', bg: 'bg-red-50',     label: 'Reminder' },
  badge_earned:     { icon: Award,       color: '#FFD700', bg: 'bg-amber-50',   label: 'Badge' },
};

// ─── Kumo Mascot (REAL PNG) ───
function KumoMascot({ size = 80 }: { size?: number }) {
  return <img src="/kumo-mascot.png" alt="Kumo" style={{ width: size, height: size }} className="object-contain" />;
}

function NotifIcon({ type }: { type: string }) {
  const cfg = NOTIF_CONFIG[type] || NOTIF_CONFIG.system;
  const Icon = cfg.icon;
  return <Icon className="w-5 h-5" style={{ color: cfg.color }} />;
}

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) { const mins = Math.floor(diff / (1000 * 60)); return mins < 1 ? 'Just now' : `${mins}m ago`; }
    return 'Today';
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// ─── Component ───
export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // ── Fetch profile ──
  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase.from('traders').select('*').eq('id', userId).single();
      if (!error && data) setProfile(data as TraderProfile);
      setProfileLoading(false);
    };
    fetchProfile();
  }, [userId]);

  // ── Fetch trade matches ──
  useEffect(() => {
    if (!userId) return;
    const fetchMatches = async () => {
      setMatchesLoading(true);
      const { data, error } = await supabase.rpc('get_trade_matches', { p_trader_id: userId });
      if (!error && data) setMatches(data as TradeMatch[]);
      setMatchesLoading(false);
    };
    fetchMatches();
  }, [userId]);

  // ── Fetch trending items ──
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      const { data, error } = await supabase.from('items').select('*').order('demand_score', { ascending: false }).limit(5);
      if (!error && data) setTrending(data as TrendingItem[]);
      setTrendingLoading(false);
    };
    fetchTrending();
  }, []);

  // ── Fetch notifications ──
  useEffect(() => {
    if (!userId) { setNotifLoading(false); return; }
    const fetchNotifs = async () => {
      setNotifLoading(true);
      const { data, error } = await supabase.from('notifications').select('*').eq('trader_id', userId).order('created_at', { ascending: false }).limit(5);
      if (!error && data) { setNotifications(data as Notification[]); setUnreadCount(data.filter((n: Notification) => !n.is_read).length); }
      setNotifLoading(false);
    };
    fetchNotifs();
  }, [userId]);

  // ── Update status ──
  const updateStatus = useCallback(async (newStatus: keyof typeof STATUS_CONFIG) => {
    if (!userId || updatingStatus) return;
    setUpdatingStatus(true);
    const { error } = await supabase.from('traders').update({ current_status: newStatus }).eq('id', userId);
    if (!error) setProfile((prev) => (prev ? { ...prev, current_status: newStatus } : prev));
    setUpdatingStatus(false);
  }, [userId, updatingStatus]);

  // ── Claim daily login reward ──
  const claimDaily = useCallback(async () => {
    if (!userId || !profile?.can_claim_today) return;
    const newStreak = profile.login_streak + 1;
    const { error } = await supabase.from('traders').update({ dream_mints: profile.dream_mints + 10, login_streak: newStreak, last_claim_date: new Date().toISOString().split('T')[0], can_claim_today: false }).eq('id', userId);
    if (!error) setProfile((prev) => prev ? { ...prev, dream_mints: prev.dream_mints + 10, login_streak: newStreak, can_claim_today: false } : prev);
  }, [userId, profile]);

  const currentStatus = profile?.current_status ?? 'sunny';
  const statusCfg = STATUS_CONFIG[currentStatus];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-[#E8F4F8] pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* ═══════ WELCOME HEADER ═══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn('relative overflow-hidden rounded-3xl p-6', 'bg-white/70 backdrop-blur-xl border border-white/50', 'shadow-[0_4px_24px_rgba(0,0,0,0.06)]')}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#7ED7C1]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="shrink-0"><KumoMascot size={72} /></div>
            <div className="flex-1 min-w-0">
              {profileLoading ? <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" /> : <h1 className="text-xl font-bold text-gray-800 truncate" style={{ fontFamily: 'Quicksand, sans-serif' }}>Hi, {profile?.display_name || profile?.username || 'Dreamer'}!</h1>}
              <p className="text-sm text-gray-500 mt-0.5">{profileLoading ? 'Loading your cloud...' : `Reputation ${profile?.reputation_score ?? 100} · ${profile?.total_trades ?? 0} trades`}</p>
              <div className="flex gap-2 mt-3">
                {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((s) => {
                  const cfg = STATUS_CONFIG[s]; const Icon = cfg.icon; const isActive = currentStatus === s;
                  return <button key={s} onClick={() => updateStatus(s)} disabled={updatingStatus} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all', isActive ? `${cfg.bg} ${cfg.ring} ring-2 text-gray-700` : 'bg-black/5 text-gray-400 hover:bg-black/10')}>{updatingStatus && isActive ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: cfg.color }} /> : <Icon className="w-3 h-3" style={{ color: isActive ? cfg.color : undefined }} />}<span className="capitalize">{cfg.label}</span></button>;
                })}
              </div>
            </div>
          </div>
          <div className="relative flex gap-3 mt-5">
            {[{ label: 'Dream Mints', value: profile?.dream_mints ?? 0, icon: Cloud, color: '#7ED7C1' }, { label: 'Day Streak', value: profile?.login_streak ?? 0, icon: Zap, color: '#F1C40F' }, { label: 'Matches', value: matches.length, icon: Heart, color: '#9B59B6' }].map((s) => (
              <div key={s.label} className={cn('flex-1 rounded-2xl p-3 text-center border', s.color === '#7ED7C1' ? 'bg-gradient-to-br from-[#7ED7C1]/20 to-[#7ED7C1]/5 border-[#7ED7C1]/20' : s.color === '#F1C40F' ? 'bg-gradient-to-br from-amber-50 to-amber-50/50 border-amber-200/50' : 'bg-gradient-to-br from-purple-50 to-purple-50/50 border-purple-200/50')}><s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} /><p className="text-lg font-bold text-gray-800">{s.value}</p><p className="text-[10px] text-gray-500 uppercase tracking-wide">{s.label}</p></div>
            ))}
          </div>
          {profile?.can_claim_today && <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={claimDaily} className="relative mt-4 w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#7ED7C1] to-[#5BBAA3] text-white text-sm font-semibold shadow-lg shadow-[#7ED7C1]/30 hover:shadow-xl hover:shadow-[#7ED7C1]/40 transition-all">Claim Daily Login Reward (+10 Dream Mints)</motion.button>}
        </motion.div>

        {/* ═══════ TRADE MATCHES ═══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Quicksand, sans-serif' }}>Kumo Found Matches</h2>
            {matchesLoading ? <Loader2 className="w-4 h-4 text-gray-300 animate-spin" /> : <span className="text-xs text-gray-400">{matches.length} potential trades</span>}
          </div>
          {matchesLoading && <div className="flex items-center justify-center py-10 bg-white/50 rounded-2xl backdrop-blur-sm"><Loader2 className="w-6 h-6 text-[#7ED7C1] animate-spin mr-2" /><span className="text-sm text-gray-500">Kumo is searching the clouds...</span></div>}
          {!matchesLoading && matches.length === 0 && <div className="flex flex-col items-center justify-center py-10 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/40"><KumoMascot size={60} /><p className="text-sm text-gray-500 font-medium mt-3">No matches yet</p><p className="text-xs text-gray-400 mt-1 text-center px-8">Add more items to your wishlist and inventory to find trading partners!</p><a href="/catalog" className="mt-3 px-4 py-2 rounded-xl bg-[#7ED7C1] text-white text-xs font-medium hover:bg-[#5BBAA3] transition-all">Browse Catalog</a></div>}
          {!matchesLoading && matches.length > 0 && matches.map((match, i) => {
            const compat = COMPATIBILITY_LABEL[match.method_compatibility];
            return <motion.div key={match.matched_trader_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn('mb-3 p-4 rounded-2xl border backdrop-blur-sm bg-white/60 border-white/50 hover:bg-white/80 transition-all cursor-pointer')} onClick={() => {}}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#7ED7C1]/30 to-[#B4E7FF]/30 flex items-center justify-center text-lg">{match.matched_avatar_url ? <img src={match.matched_avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span>{match.matched_username.charAt(0).toUpperCase()}</span>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-800 text-sm truncate">{match.matched_username}</h3><span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', compat.bg, compat.color, compat.border)}>{compat.text}</span></div>
                  <div className="flex items-center gap-1 mt-1"><Scale className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500">Match score: {match.match_score}</span></div>
                  {match.their_wanted_items && match.their_wanted_items.length > 0 && <div className="mt-2"><p className="text-[10px] text-gray-400 mb-1">They have items you want:</p><div className="flex gap-1 flex-wrap">{match.their_wanted_items.slice(0, 3).map(item => <span key={item.item_id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 border border-white/50 text-[10px] text-gray-600"><RarityBadge rarity={item.rarity as any} size="xs" /><span className="truncate max-w-[80px]">{item.name}</span></span>)}{match.their_wanted_items.length > 3 && <span className="text-[10px] text-gray-400 px-1">+{match.their_wanted_items.length - 3}</span>}</div></div>}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 self-center" />
              </div>
            </motion.div>;
          })}
        </motion.div>
                {/* ═══════ TRENDING ITEMS ═══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Quicksand, sans-serif' }}>Trending Items</h2>
            <a href="/catalog" className="text-xs text-[#5BBAA3] font-medium flex items-center gap-0.5 hover:underline">View all <ArrowRight className="w-3 h-3" /></a>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {trendingLoading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="shrink-0 w-36 h-44 rounded-2xl bg-white/40 animate-pulse snap-start" />)}
            {!trendingLoading && trending.map((item) => (
              <a key={item.id} href={`/catalog?item=${item.id}`} className={cn('shrink-0 w-36 rounded-2xl overflow-hidden snap-start bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300')}>
                <div className={cn('relative h-28 overflow-hidden bg-gradient-to-br', item.rarity === 'N' ? 'from-gray-200 to-gray-300' : item.rarity === 'R' ? 'from-amber-100 to-amber-200' : item.rarity === 'S' ? 'from-violet-200 to-violet-300' : 'from-pink-200 via-rose-200 to-fuchsia-200')}>
                  {item.thumbnail_url || item.image_url ? <img src={item.thumbnail_url || item.image_url!} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-white/40" /></div>}
                  <div className="absolute top-2 right-2"><RarityBadge rarity={item.rarity} size="xs" /></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm"><TrendingUp className="w-3 h-3 text-white" /><span className="text-[10px] text-white font-medium">{item.demand_score}</span></div>
                </div>
                <div className="p-2.5"><p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p><p className="text-[10px] text-gray-400 mt-0.5">{item.character}</p></div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* ═══════ RECENT ACTIVITY ═══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Quicksand, sans-serif' }}>Recent Activity</h2>
            </div>
            {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>}
          </div>
          <div className="space-y-2">
            {notifLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-2xl bg-white/40 animate-pulse" />)}
            {!notifLoading && notifications.length === 0 && <div className="text-center py-6 bg-white/40 rounded-2xl backdrop-blur-sm"><Bell className="w-6 h-6 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No recent activity</p></div>}
            {!notifLoading && notifications.map((notif) => {
              const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system;
              return <div key={notif.id} className={cn('flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer', notif.is_read ? 'bg-white/40 border-white/30' : 'bg-white/70 border-[#7ED7C1]/20 shadow-sm')} onClick={() => {}}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', notif.is_read ? 'bg-gray-100 text-gray-400' : 'bg-[#7ED7C1]/20 text-[#5BBAA3]')}><NotifIcon type={notif.type} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className={cn('text-xs font-bold', notif.is_read ? 'text-gray-500' : 'text-gray-800')}>{cfg.label}</span><span className="text-[10px] text-gray-300">· {formatTime(notif.created_at)}</span></div>
                  <h4 className={cn('text-sm mt-0.5', notif.is_read ? 'text-gray-500' : 'text-gray-800 font-medium')}>{notif.title}</h4>
                  {notif.message && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>}
                </div>
                <span className="text-[10px] text-gray-300 shrink-0">{getDateGroup(notif.created_at)}</span>
              </div>;
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}