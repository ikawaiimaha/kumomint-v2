import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cloud,
  Sun,
  Gamepad2,
  Wind,
  Moon,
  TrendingUp,
  Bell,
  Loader2,
  Heart,
  Package,
  Zap,
  ChevronRight,
  Scale,
  Search,
  ShieldCheck,
  ShieldAlert,
  Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import RarityBadge from '../components/RarityBadge';
import Layout from '../components/Layout';
import { cn } from '../lib/utils';

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

type TraderStatus = TraderProfile['current_status'];

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
  rarity: 'N' | 'R' | 'S' | 'SR' | 'SSR';
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
  sunny:    { label: 'Sunny',    icon: Sun,      color: '#F1C40F', bgClass: 'bg-[#FFF9E6]', ringClass: 'ring-[#F1C40F]' },
  playing:  { label: 'Playing',  icon: Gamepad2, color: '#3498DB', bgClass: 'bg-[#EBF5FB]', ringClass: 'ring-[#3498DB]' },
  drifting: { label: 'Drifting', icon: Wind,     color: '#E67E22', bgClass: 'bg-[#FDEDEC]', ringClass: 'ring-[#E67E22]' },
  dreaming: { label: 'Dreaming', icon: Moon,     color: '#9B59B6', bgClass: 'bg-[#F4ECF7]', ringClass: 'ring-[#9B59B6]' },
} as const;

const COMPATIBILITY_CONFIG: Record<string, { label: string; className: string }> = {
  perfect:      { label: 'Perfect Match',    className: 'border-[#A5D6C8] bg-[#E9FAF4] text-[#4E927E]' },
  compatible:   { label: 'Compatible',       className: 'border-[#FBE9CC] bg-[#FFF8E7] text-[#D49A38]' },
  incompatible: { label: 'Different Method', className: 'border-[rgba(239,154,154,0.4)] bg-[rgba(255,235,238,0.5)] text-[#B96565]' },
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

// ─── Helper Components & Functions ───

function KumoMascot({ size = 80 }: { size?: number }) {
  return <img src="/kumo-mascot.png" alt="Kumo" style={{ width: size, height: size }} className="object-contain" />;
}

// FIXED: Safety fallback for unknown notification types
function getNotificationIcon(type: string) {
  const config = NOTIF_CONFIG[type] || NOTIF_CONFIG.system;
  return config.icon || Bell;
}

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) { 
        const mins = Math.floor(diff / (1000 * 60)); 
        return mins < 1 ? 'Just now' : `${mins}m ago`; 
    }
    return 'Today';
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function StatCard({ label, value, icon: Icon, accentClass }: { label: string, value: number | string, icon: any, accentClass: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-[24px] border border-[rgba(165,214,200,0.14)] p-4 text-center shadow-[0_10px_24px_rgba(46,42,40,0.04)]", accentClass)}>
       <Icon size={20} className="mb-2 text-[#2E2A2899]" />
       <p className="text-[20px] font-bold text-[#2E2A28]">{value}</p>
       <p className="text-[10px] font-semibold text-[#2E2A2899] uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── Main Component ───
export default function Home() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!userId) {
      setProfileLoading(false);
      return;
    }
    const fetchProfile = async () => {
      const { data, error } = await supabase.from('traders').select('*').eq('id', userId).single();
      if (!error && data) setProfile(data as TraderProfile);
      setProfileLoading(false);
    };
    fetchProfile();
  }, [userId]);

  // Fetch trade matches
  useEffect(() => {
    if (!userId) {
      setMatchesLoading(false);
      return;
    }
    const fetchMatches = async () => {
      setMatchesLoading(true);
      const { data, error } = await supabase.rpc('get_trade_matches', { p_trader_id: userId });
      if (!error && data) setMatches(data as TradeMatch[]);
      setMatchesLoading(false);
    };
    fetchMatches();
  }, [userId]);

  // Fetch trending items
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      const { data, error } = await supabase.from('items').select('*').order('demand_score', { ascending: false }).limit(5);
      if (!error && data) setTrending(data as TrendingItem[]);
      setTrendingLoading(false);
    };
    fetchTrending();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userId) { 
      setNotificationsLoading(false); 
      return; 
    }
    const fetchNotifs = async () => {
      setNotificationsLoading(true);
      const { data, error } = await supabase.from('notifications').select('*').eq('trader_id', userId).order('created_at', { ascending: false }).limit(5);
      if (!error && data) { 
        setNotifications(data as Notification[]); 
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length); 
      }
      setNotificationsLoading(false);
    };
    fetchNotifs();
  }, [userId]);

  // Update status
  const updateStatus = useCallback(async (newStatus: keyof typeof STATUS_CONFIG) => {
    if (!userId || updatingStatus) return;
    setUpdatingStatus(true);
    const { error } = await supabase.from('traders').update({ current_status: newStatus }).eq('id', userId);
    if (!error) setProfile((prev) => (prev ? { ...prev, current_status: newStatus } : prev));
    setUpdatingStatus(false);
  }, [userId, updatingStatus]);

  // Claim daily login reward
  const claimDaily = useCallback(async () => {
    if (!userId || !profile?.can_claim_today || claimingDaily) return;
    setClaimingDaily(true);
    setHomeError(null);
    
    const newStreak = profile.login_streak + 1;
    const { error } = await supabase.from('traders').update({ 
        dream_mints: profile.dream_mints + 10, 
        login_streak: newStreak, 
        last_claim_date: new Date().toISOString().split('T')[0], 
        can_claim_today: false 
    }).eq('id', userId);
    
    if (!error) {
        setProfile((prev) => prev ? { ...prev, dream_mints: prev.dream_mints + 10, login_streak: newStreak, can_claim_today: false } : prev);
    } else {
        setHomeError(error.message);
    }
    setClaimingDaily(false);
  }, [userId, profile, claimingDaily]);

  const welcomeName = profile?.display_name || profile?.username || 'Dreamer';
  const currentStatus = profile?.current_status ?? 'sunny';

  return (
    <Layout>
      <div className="space-y-6 pt-2 pb-24">
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
              <KumoMascot size={64} />
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

          {homeError ? (
            <div className="relative mt-4 rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
              {homeError}
            </div>
          ) : null}

          {userId ? (
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
                        active
                          ? `${config.bgClass} ring-2 ${config.ringClass} text-[#2E2A28]`
                          : 'bg-white/[0.8] text-[#2E2A2899] border border-[rgba(165,214,200,0.16)]',
                        updatingStatus && active && 'opacity-70'
                      )}
                    >
                      {updatingStatus && active ? (
                        <Loader2 size={13} className="animate-spin" style={{ color: config.color }} />
                      ) : (
                        <Icon size={13} style={{ color: active ? config.color : undefined }} />
                      )}
                      {config.label}
                    </button>
                  );
                })}
              </div>

              {profile?.can_claim_today ? (
                <button
                  onClick={() => void claimDaily()}
                  disabled={claimingDaily}
                  className="relative mt-4 w-full rounded-[22px] bg-[linear-gradient(135deg,#A5D6C8,#82C9B2)] px-4 py-3 text-[14px] font-semibold text-[#2E2A28] shadow-[0_14px_28px_rgba(165,214,200,0.35)] disabled:opacity-60 transition-all hover:opacity-90"
                >
                  {claimingDaily ? 'Claiming reward...' : 'Claim Daily Reward (+10 Dream Mints)'}
                </button>
              ) : null}
            </>
          ) : (
            <div className="relative mt-4 flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="rounded-[20px] bg-[#A5D6C8] px-4 py-3 text-[14px] font-semibold text-[#2E2A28] hover:bg-[#82C9B2] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-[20px] border border-[rgba(165,214,200,0.2)] bg-white/[0.8] px-4 py-3 text-[14px] font-semibold text-[#2E2A28] hover:bg-white transition-colors"
              >
                Create Account
              </button>
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
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-bold font-display text-[#2E2A28]">Kumo Found Matches</h3>
            <button
              onClick={() => navigate('/offers')}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4E927E]"
            >
              Offers <ChevronRight size={14} />
            </button>
          </div>

          {matchesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.58]"
                />
              ))}
            </div>
          ) : !userId ? (
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-8 text-center">
              <Heart size={22} className="mx-auto mb-3 text-[#D1A3FF]" />
              <p className="text-[14px] font-semibold text-[#2E2A28]">Sign in to see trade matches.</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-8 text-center">
              <Search size={22} className="mx-auto mb-3 text-[#A5D6C8]" />
              <p className="text-[14px] font-semibold text-[#2E2A28]">No live matches yet.</p>
              <p className="mt-1 text-[12px] text-[#2E2A2899]">
                Add wishlist items and inventory duplicates to unlock matches.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const compatibility = COMPATIBILITY_CONFIG[match.method_compatibility] || COMPATIBILITY_CONFIG.compatible;

                return (
                  <button
                    key={match.matched_trader_id}
                    onClick={() => navigate(`/profile/${match.matched_trader_id}`)}
                    className="w-full rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] p-4 text-left shadow-[0_10px_24px_rgba(46,42,40,0.04)] hover:bg-white transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)] text-[16px] font-semibold text-[#2E2A28] overflow-hidden">
                        {match.matched_avatar_url ? (
                          <img
                            src={match.matched_avatar_url}
                            alt={match.matched_username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          match.matched_username.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-[14px] font-semibold text-[#2E2A28]">
                            {match.matched_username}
                          </h4>
                          <span
                            className={cn(
                              'rounded-full border px-2 py-1 text-[10px] font-semibold whitespace-nowrap',
                              compatibility.className
                            )}
                          >
                            {compatibility.label}
                          </span>
                        </div>

                        <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-[#2E2A2899]">
                          <Scale size={12} />
                          Match score {match.match_score}
                        </div>

                        {match.their_wanted_items && match.their_wanted_items.length > 0 ? (
                          <div className="mt-3">
                            <p className="mb-1 text-[11px] text-[#2E2A2899]">They have items you want</p>
                            <div className="flex flex-wrap gap-2">
                              {match.their_wanted_items.slice(0, 3).map((item) => (
                                <span
                                  key={item.item_id}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(165,214,200,0.14)] bg-white/[0.85] px-2 py-1 text-[11px] text-[#2E2A28]"
                                >
                                  <RarityBadge tier={item.rarity as any} className="!px-1.5 !py-0 !text-[9px]" />
                                  <span className="max-w-[90px] truncate">{item.name}</span>
                                </span>
                              ))}
                              {match.their_wanted_items.length > 3 && (
                                <span className="text-[11px] text-[#2E2A2899]">+{match.their_wanted_items.length - 3}</span>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <ChevronRight size={16} className="mt-1 shrink-0 text-[#2E2A2866]" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* TRENDING */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-bold font-display text-[#2E2A28]">Trending Items</h3>
            <button
              onClick={() => navigate('/catalog')}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4E927E]"
            >
              Catalog <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
            {trendingLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 w-36 shrink-0 snap-start animate-pulse rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.58]"
                  />
                ))
              : trending.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/catalog?item=${item.id}`)}
                    className="w-36 shrink-0 snap-start overflow-hidden rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] text-left shadow-[0_10px_24px_rgba(46,42,40,0.04)] hover:shadow-md transition-all hover:-translate-y-1"
                  >
                    <div
                      className={cn(
                        'relative h-28 overflow-hidden',
                        item.rarity === 'N'
                          ? 'bg-[linear-gradient(135deg,#E8ECEE,#C9D0D5)]'
                          : item.rarity === 'R'
                            ? 'bg-[linear-gradient(135deg,#FBE9CC,#FFE082)]'
                            : item.rarity === 'S'
                              ? 'bg-[linear-gradient(135deg,#E6DCF9,#D1A3FF)]'
                              : 'bg-[linear-gradient(135deg,#FFD6E5,#E6C5FF)]'
                      )}
                    >
                      {item.thumbnail_url || item.image_url ? (
                        <img
                          src={item.thumbnail_url || item.image_url || ''}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={24} className="text-white/50" />
                        </div>
                      )}

                      <div className="absolute left-2 top-2">
                        <RarityBadge tier={item.rarity as any} className="!px-1.5 !py-0.5 !text-[9px]" />
                      </div>

                      <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <TrendingUp size={10} />
                        {item.demand_score ?? 0}
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-1 text-[13px] font-semibold text-[#2E2A28]">{item.name}</p>
                      <p className="mt-1 text-[11px] text-[#2E2A2899] line-clamp-1">{item.character || 'HKDV Item'}</p>
                    </div>
                  </button>
                ))}
          </div>
        </motion.section>

        {/* ACTIVITY */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-bold font-display text-[#2E2A28]">Recent Activity</h3>
            {unreadCount > 0 ? (
              <button
                onClick={() => navigate('/notifications')}
                className="rounded-full bg-[rgba(255,181,197,0.18)] px-2.5 py-1 text-[11px] font-semibold text-[#B96565]"
              >
                {unreadCount} new
              </button>
            ) : null}
          </div>

          {notificationsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.58]"
                />
              ))}
            </div>
          ) : !userId ? (
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-8 text-center">
              <Bell size={22} className="mx-auto mb-3 text-[#A5D6C8]" />
              <p className="text-[14px] font-semibold text-[#2E2A28]">Sign in to see your activity feed.</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-8 text-center">
              <Bell size={22} className="mx-auto mb-3 text-[#A5D6C8]" />
              <p className="text-[14px] font-semibold text-[#2E2A28]">No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                // FIXED: Safety call to fallback helper
                const Icon = getNotificationIcon(notification.type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => navigate('/notifications')}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left shadow-[0_10px_24px_rgba(46,42,40,0.04)] hover:bg-white transition-colors',
                      notification.is_read
                        ? 'border-[rgba(165,214,200,0.12)] bg-white/[0.66]'
                        : 'border-[rgba(165,214,200,0.22)] bg-white/[0.82]'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        notification.is_read
                          ? 'bg-[#F3F0E8] text-[#2E2A2866]'
                          : 'bg-[rgba(165,214,200,0.18)] text-[#4E927E]'
                      )}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-[13px]',
                          notification.is_read ? 'text-[#2E2A2899]' : 'font-semibold text-[#2E2A28]'
                        )}
                      >
                        {notification.title}
                      </p>
                      {notification.message ? (
                        <p className="mt-0.5 truncate text-[11px] text-[#2E2A2899]">
                          {notification.message}
                        </p>
                      ) : null}
                    </div>

                    <span className="shrink-0 text-[11px] text-[#2E2A2866]">
                      {formatRelativeDate(notification.created_at)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </Layout>
  );
}