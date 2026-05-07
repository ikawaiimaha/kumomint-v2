import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  Cloud,
  Gamepad2,
  Heart,
  Loader2,
  Moon,
  Package,
  Scale,
  Search,
  Sun,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RarityBadge, { type RarityTier } from '../components/RarityBadge';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

// --- Types ---
type TraderStatus = 'sunny' | 'playing' | 'drifting' | 'dreaming';
type Compatibility = 'perfect' | 'compatible' | 'incompatible';
type ItemRarity = 'N' | 'R' | 'S' | 'SR';

interface TraderProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  current_status: TraderStatus;
  reputation_score: number;
  total_trades: number;
  dream_mints: number;
  login_streak: number;
  can_claim_today: boolean;
}

interface MatchItem {
  item_id: string;
  name: string;
  rarity: ItemRarity;
}

interface TradeMatch {
  matched_trader_id: string;
  matched_username: string;
  matched_avatar_url: string | null;
  match_score: number;
  their_wanted_items: MatchItem[] | null;
  your_wanted_items: MatchItem[] | null;
  method_compatibility: Compatibility;
}

interface TrendingItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  character: string | null;
  demand_score: number | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
}

interface ActivityNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

const STATUS_CONFIG: Record<
  TraderStatus,
  { label: string; icon: any; color: string; bgClass: string; ringClass: string }
> = {
  sunny: {
    label: 'Sunny',
    icon: Sun,
    color: '#E5A400',
    bgClass: 'bg-[rgba(255,236,178,0.7)]',
    ringClass: 'ring-[#E5A400]',
  },
  playing: {
    label: 'Playing',
    icon: Gamepad2,
    color: '#4A90E2',
    bgClass: 'bg-[rgba(180,212,247,0.55)]',
    ringClass: 'ring-[#4A90E2]',
  },
  drifting: {
    label: 'Drifting',
    icon: Wind,
    color: '#E18E47',
    bgClass: 'bg-[rgba(255,220,191,0.7)]',
    ringClass: 'ring-[#E18E47]',
  },
  dreaming: {
    label: 'Dreaming',
    icon: Moon,
    color: '#9A7AE7',
    bgClass: 'bg-[rgba(223,211,255,0.7)]',
    ringClass: 'ring-[#9A7AE7]',
  },
};

const COMPATIBILITY_CONFIG: Record<
  Compatibility,
  { label: string; className: string }
> = {
  perfect: {
    label: 'Perfect Match',
    className: 'bg-[rgba(165,214,200,0.18)] text-[#4E927E] border-[rgba(165,214,200,0.35)]',
  },
  compatible: {
    label: 'Compatible',
    className: 'bg-[rgba(255,224,130,0.18)] text-[#B78425] border-[rgba(255,224,130,0.35)]',
  },
  incompatible: {
    label: 'Different Method',
    className: 'bg-[rgba(239,154,154,0.16)] text-[#B96565] border-[rgba(239,154,154,0.35)]',
  },
};

const rarityMap: Record<ItemRarity, RarityTier> = {
  N: 'Moon',
  R: 'Star',
  S: 'Comet',
  SR: 'Galaxy',
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'offer_received': return Heart;
    case 'offer_accepted': return Zap;
    case 'offer_declined': return Wind;
    case 'trade_completed': return Package;
    case 'match_found': return Search;
    case 'verification': return Sun;
    case 'ghosting_warning': return Moon;
    case 'badge_earned': return TrendingUp;
    default: return Bell;
  }
}

function KumoMascot({ size = 80 }: { size?: number }) {
  return <img src="/kumo-mascot.png" alt="Kumo" style={{ width: size, height: size }} className="object-contain" />;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number;
  icon: any;
  accentClass: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/[0.74] border border-[rgba(165,214,200,0.16)] px-4 py-4 shadow-[0_10px_24px_rgba(46,42,40,0.04)]">
      <div className={cn('mb-2 inline-flex rounded-full p-2', accentClass)}>
        <Icon size={16} className="text-[#2E2A28]" />
      </div>
      <p className="text-[22px] font-bold font-display text-[#2E2A28]">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#2E2A2899]">{label}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);

  useEffect(() => {
    let mounted = true;
    const syncAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    };
    void syncAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadTrending = async () => {
      setTrendingLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('id, name, rarity, character, demand_score, image_url, thumbnail_url')
        .order('demand_score', { ascending: false })
        .limit(8);
      if (!active) return;
      if (error) {
        setHomeError(error.message);
        setTrending([]);
      } else {
        setTrending((data ?? []) as TrendingItem[]);
      }
      setTrendingLoading(false);
    };
    void loadTrending();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!authReady) return;
    if (!userId) {
      setProfile(null);
      setMatches([]);
      setNotifications([]);
      setProfileLoading(false);
      setMatchesLoading(false);
      setNotificationsLoading(false);
      return;
    }
    const loadPrivateData = async () => {
      setProfileLoading(true);
      setMatchesLoading(true);
      setNotificationsLoading(true);
      setHomeError(null);
      const [profileResult, matchResult, notificationResult] = await Promise.all([
        supabase.from('traders').select('*').eq('id', userId).maybeSingle(),
        supabase.rpc('get_trade_matches', { p_trader_id: userId }),
        supabase.from('notifications').select('*').eq('trader_id', userId).order('created_at', { ascending: false }).limit(5),
      ]);
      if (!active) return;
      if (profileResult.error) setHomeError(profileResult.error.message);
      setProfile((profileResult.data as TraderProfile | null) ?? null);
      setMatches((matchResult.data ?? []) as TradeMatch[]);
      setNotifications((notificationResult.data ?? []) as ActivityNotification[]);
      setProfileLoading(false);
      setMatchesLoading(false);
      setNotificationsLoading(false);
    };
    void loadPrivateData();
    return () => { active = false; };
  }, [authReady, userId]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const updateStatus = useCallback(async (nextStatus: TraderStatus) => {
    if (!userId || !profile || updatingStatus || profile.current_status === nextStatus) return;
    setUpdatingStatus(true);
    const { error } = await supabase.from('traders').update({ current_status: nextStatus }).eq('id', userId);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, current_status: nextStatus } : prev);
    } else {
      setHomeError(error.message);
    }
    setUpdatingStatus(false);
  }, [profile, updatingStatus, userId]);

  const claimDaily = useCallback(async () => {
    if (!userId || !profile || !profile.can_claim_today || claimingDaily) return;
    setClaimingDaily(true);
    const nextMints = profile.dream_mints + 10;
    const nextStreak = profile.login_streak + 1;
    const { error } = await supabase.from('traders').update({
      dream_mints: nextMints,
      login_streak: nextStreak,
      last_claim_date: new Date().toISOString().split('T')[0],
      can_claim_today: false,
    }).eq('id', userId);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, dream_mints: nextMints, login_streak: nextStreak, can_claim_today: false } : prev);
    } else {
      setHomeError(error.message);
    }
    setClaimingDaily(false);
  }, [claimingDaily, profile, userId]);

  const welcomeName = profile?.display_name || profile?.username || 'Dreamer';
  const currentStatus = profile?.current_status ?? 'sunny';

  return (
    <Layout title="" showNav={true}>
      <div className="space-y-6 pt-2 overflow-x-hidden">
        {/* WELCOME SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'relative overflow-hidden rounded-[32px] border border-[rgba(165,214,200,0.18)]',
            'bg-white/[0.78] p-5 shadow-[0_18px_40px_rgba(46,42,40,0.06)]'
          )}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[rgba(165,214,200,0.14)] blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="shrink-0 rounded-[24px] bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)] p-3">
              <KumoMascot />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] uppercase tracking-[0.1em] text-[#2E2A2899]">Teacup Kumoru</p>
              {profileLoading ? (
                <div className="mt-2 h-7 w-40 animate-pulse rounded-full bg-[#F3F0E8]" />
              ) : (
                <h2 className="mt-1 text-[24px] font-bold font-display text-[#2E2A28]">
                  {userId ? `Welcome back, ${welcomeName}` : 'Welcome to KumoMint'}
                </h2>
              )}
              <p className="mt-1 text-[13px] text-[#2E2A2899]">
                {userId
                  ? `Reputation ${profile?.reputation_score ?? 100} • ${profile?.total_trades ?? 0} trades completed`
                  : 'Sign in to unlock live matches, activity, and your wardrobe.'}
              </p>
            </div>
          </div>

          {/* FIX: Error Display for Build Compliance */}
          {homeError && (
            <div className="relative mt-4 rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
              {homeError}
            </div>
          )}

          {userId && (
            <>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as TraderStatus[]).map((status) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const active = currentStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => void updateStatus(status)}
                      disabled={updatingStatus}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all',
                        active ? `${config.bgClass} ring-2 ${config.ringClass} text-[#2E2A28]` : 'bg-white/[0.8] text-[#2E2A2899] border border-[rgba(165,214,200,0.16)]'
                      )}
                    >
                      {updatingStatus && active ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
                      {config.label}
                    </button>
                  );
                })}
              </div>
              {profile?.can_claim_today && (
                <button
                  onClick={() => void claimDaily()}
                  disabled={claimingDaily}
                  className="relative mt-4 w-full rounded-[22px] bg-[linear-gradient(135deg,#A5D6C8,#82C9B2)] px-4 py-3 text-[14px] font-semibold text-[#2E2A28] shadow-[0_14px_28px_rgba(165,214,200,0.35)]"
                >
                  {claimingDaily ? 'Claiming reward...' : 'Claim Daily Reward (+10 Dream Mints)'}
                </button>
              )}
            </>
          )}
          {!userId && (
            <div className="relative mt-4 flex gap-3">
              <button onClick={() => navigate('/login')} className="rounded-[20px] bg-[#A5D6C8] px-4 py-3 text-[14px] font-semibold text-[#2E2A28]">Sign In</button>
              <button onClick={() => navigate('/register')} className="rounded-[20px] border border-[rgba(165,214,200,0.2)] bg-white/[0.8] px-4 py-3 text-[14px] font-semibold text-[#2E2A28]">Create Account</button>
            </div>
          )}
        </motion.section>

        {/* STATS */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard label="Dream Mints" value={profile?.dream_mints ?? 0} icon={Cloud} accentClass="bg-[rgba(165,214,200,0.18)]" />
          <StatCard label="Day Streak" value={profile?.login_streak ?? 0} icon={Zap} accentClass="bg-[rgba(255,224,130,0.22)]" />
          <StatCard label="Matches" value={matches.length} icon={Heart} accentClass="bg-[rgba(209,163,255,0.18)]" />
        </section>

        {/* MATCHES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold font-display text-[#2E2A28]">Kumo Found Matches</h3>
            <button onClick={() => navigate('/offers')} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4E927E]">Offers <ChevronRight size={14} /></button>
          </div>
          {matchesLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.58]" />)}
            </div>
          ) : !userId || matches.length === 0 ? (
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-8 text-center">
              <Heart size={22} className="mx-auto mb-3 text-[#D1A3FF]" />
              <p className="text-[14px] font-semibold text-[#2E2A28]">{!userId ? 'Sign in to see trade matches.' : 'No live matches yet.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const compatibility = COMPATIBILITY_CONFIG[match.method_compatibility];
                return (
                  <button
                    key={match.matched_trader_id}
                    onClick={() => navigate(`/profile/${match.matched_trader_id}`)}
                    className="w-full rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] p-4 text-left shadow-[0_10px_24px_rgba(46,42,40,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)] text-[16px] font-semibold text-[#2E2A28] overflow-hidden">
                        {match.matched_avatar_url ? <img src={match.matched_avatar_url} className="h-full w-full object-cover" /> : match.matched_username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-[14px] font-semibold text-[#2E2A28]">{match.matched_username}</h4>
                          <span className={cn('rounded-full border px-2 py-1 text-[10px] font-semibold', compatibility.className)}>{compatibility.label}</span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-[#2E2A2899]"><Scale size={12} /> Match score {match.match_score}</div>
                      </div>
                      <ChevronRight size={16} className="mt-1 shrink-0 text-[#2E2A2866]" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* TRENDING ITEMS */}
        <section className="space-y-3 max-w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold font-display text-[#2E2A28]">Trending Items</h3>
            <button onClick={() => navigate('/catalog')} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4E927E]">Catalog <ChevronRight size={14} /></button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar max-w-full">
            {trendingLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="h-44 w-36 shrink-0 animate-pulse rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.58]" />)
            ) : (
              trending.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate('/catalog')}
                  className="w-36 shrink-0 overflow-hidden rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] text-left shadow-[0_10px_24px_rgba(46,42,40,0.04)]"
                >
                  <div className={cn('relative h-28 overflow-hidden', item.rarity === 'N' ? 'bg-[#E8ECEE]' : item.rarity === 'R' ? 'bg-[#FBE9CC]' : item.rarity === 'S' ? 'bg-[#E6DCF9]' : 'bg-[#FFD6E5]')}>
                    <img src={item.thumbnail_url || item.image_url || ''} className="h-full w-full object-cover" alt={item.name} />
                    <div className="absolute left-2 top-2"><RarityBadge tier={rarityMap[item.rarity] ?? 'Moon'} className="!px-1.5 !py-0 !text-[9px]" /></div>
                    <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold text-white"><TrendingUp size={10} /> {item.demand_score ?? 0}</div>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-[13px] font-semibold text-[#2E2A28]">{item.name}</p>
                    <p className="mt-1 text-[11px] text-[#2E2A2899]">{item.character || 'HKDV Item'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="space-y-3 pb-24">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold font-display text-[#2E2A28]">Recent Activity</h3>
            {unreadCount > 0 && <button onClick={() => navigate('/notifications')} className="rounded-full bg-[rgba(255,181,197,0.18)] px-2.5 py-1 text-[11px] font-semibold text-[#B96565]">{unreadCount} new</button>}
          </div>
          {notificationsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.58]" />)}
            </div>
          ) : !userId || notifications.length === 0 ? (
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-8 text-center">
              <Bell size={22} className="mx-auto mb-3 text-[#A5D6C8]" />
              <p className="text-[14px] font-semibold text-[#2E2A28]">{!userId ? 'Sign in to see activity feed.' : 'No recent activity.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const Icon = getNotificationIcon(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => navigate('/notifications')}
                    className={cn('flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left shadow-[0_10px_24px_rgba(46,42,40,0.04)]', n.is_read ? 'border-[rgba(165,214,200,0.12)] bg-white/[0.66]' : 'border-[rgba(165,214,200,0.22)] bg-white/[0.82]')}
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', n.is_read ? 'bg-[#F3F0E8] text-[#2E2A2866]' : 'bg-[rgba(165,214,200,0.18)] text-[#4E927E]')}><Icon size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-[13px]', n.is_read ? 'text-[#2E2A2899]' : 'font-semibold text-[#2E2A28]')}>{n.title}</p>
                      {n.message && <p className="mt-0.5 truncate text-[11px] text-[#2E2A2899]">{n.message}</p>}
                    </div>
                    <span className="shrink-0 text-[11px] text-[#2E2A2866]">{formatRelativeDate(n.created_at)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}