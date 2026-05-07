import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Award,
  Check,
  Cloud,
  Edit3,
  Gamepad2,
  Heart,
  Loader2,
  Lock,
  Moon,
  Package,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Ticket,
  Wind,
  X,
  ArrowRightLeft
} from 'lucide-react';
import Layout from '../components/Layout';
import BottomSheet from '../components/BottomSheet';
import RarityBadge from '../components/RarityBadge';
import CreateOfferModal from '../components/CreateOfferModal';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

// --- Types ---
type TraderStatus = 'sunny' | 'playing' | 'drifting' | 'dreaming';
type PreferredMethod = 'tickets_only' | 'gifts_only' | 'both';
type ItemRarity = 'N' | 'R' | 'S' | 'SR' | 'SSR';
type VerificationStatus = 'pending' | 'verified' | 'rejected';

interface TraderProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_status: TraderStatus;
  preferred_method: PreferredMethod;
  unlocked_badges: string[] | null;
  friend_code: string | null;
  hkdv_verified: boolean;
  hkdv_verified_at: string | null;
  reputation_score: number;
  total_trades: number;
  successful_trades: number;
  dream_mints: number;
  login_streak: number;
  role: string;
  created_at: string;
}

interface ItemRecord {
  id: string;
  name: string;
  rarity: ItemRarity;
  thumbnail_url?: string | null;
  image_url?: string | null;
  character?: string | null;
}

interface InventoryRow {
  id: string;
  quantity: number;
  is_padlocked: boolean;
  item_id: string;
  items: ItemRecord | ItemRecord[] | null;
}

interface WishlistRow {
  id: string;
  heart_tier: number;
  item_id: string;
  items: ItemRecord | ItemRecord[] | null;
}

interface InventoryPreviewItem {
  id: string;
  entryId: string;
  name: string;
  rarityTier: string;
  quantity: number;
  isPadlocked: boolean;
  thumbnailUrl: string | null;
  imageUrl: string | null;
}

interface WishlistPreviewItem {
  id: string;
  entryId: string;
  name: string;
  rarityTier: string;
  heartTier: number;
  thumbnailUrl: string | null;
  imageUrl: string | null;
}

interface HkdvAccount {
  id: string;
  friend_code: string;
  player_name: string | null;
  server_region: string;
  status: VerificationStatus;
  verified_at: string | null;
  rejected_reason: string | null;
}

const STATUS_CONFIG: Record<
  TraderStatus,
  { label: string; icon: any; dotClass: string; pillClass: string }
> = {
  sunny: {
    label: 'Sunny',
    icon: Sun,
    dotClass: 'bg-[#F1C40F]',
    pillClass: 'bg-[rgba(255,236,178,0.8)] text-[#B78425]',
  },
  playing: {
    label: 'Playing',
    icon: Gamepad2,
    dotClass: 'bg-[#4A90E2]',
    pillClass: 'bg-[rgba(180,212,247,0.75)] text-[#4A90E2]',
  },
  drifting: {
    label: 'Drifting',
    icon: Wind,
    dotClass: 'bg-[#E18E47]',
    pillClass: 'bg-[rgba(255,220,191,0.75)] text-[#C5762C]',
  },
  dreaming: {
    label: 'Dreaming',
    icon: Moon,
    dotClass: 'bg-[#9A7AE7]',
    pillClass: 'bg-[rgba(223,211,255,0.85)] text-[#7C5FD1]',
  },
};

const METHOD_LABEL: Record<PreferredMethod, string> = {
  tickets_only: 'Tickets Only',
  gifts_only: 'Gifts Only',
  both: 'Tickets + Gifts',
};

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: any; colorClass: string; borderClass: string }
> = {
  moon: {
    label: 'Moon Trader',
    icon: Cloud,
    colorClass: 'text-[#90A4AE]',
    borderClass: 'border-[rgba(144,164,174,0.25)] bg-[rgba(144,164,174,0.12)]',
  },
  star: {
    label: 'Star Trader',
    icon: Sparkles,
    colorClass: 'text-[#FFB5C5]',
    borderClass: 'border-[rgba(255,181,197,0.28)] bg-[rgba(255,181,197,0.12)]',
  },
  comet: {
    label: 'Comet Trader',
    icon: Award,
    colorClass: 'text-[#A5D6C8]',
    borderClass: 'border-[rgba(165,214,200,0.28)] bg-[rgba(165,214,200,0.12)]',
  },
  galaxy: {
    label: 'Galaxy Trader',
    icon: Sparkles,
    colorClass: 'text-[#D1A3FF]',
    borderClass: 'border-[rgba(209,163,255,0.28)] bg-[rgba(209,163,255,0.12)]',
  },
  trusted: {
    label: 'Trusted',
    icon: ShieldCheck,
    colorClass: 'text-[#4E927E]',
    borderClass: 'border-[rgba(165,214,200,0.28)] bg-[rgba(165,214,200,0.12)]',
  },
  beta_tester: {
    label: 'Beta Tester',
    icon: Ticket,
    colorClass: 'text-[#4A90E2]',
    borderClass: 'border-[rgba(180,212,247,0.3)] bg-[rgba(180,212,247,0.14)]',
  },
};

const rarityBackground: Record<string, string> = {
  N: 'bg-[linear-gradient(135deg,#E8ECEE,#CBD4D9)]',
  Moon: 'bg-[linear-gradient(135deg,#E8ECEE,#CBD4D9)]',
  R: 'bg-[linear-gradient(135deg,#FBE9CC,#FFE082)]',
  Star: 'bg-[linear-gradient(135deg,#FBE9CC,#FFE082)]',
  S: 'bg-[linear-gradient(135deg,#E7F5EF,#A5D6C8)]',
  Comet: 'bg-[linear-gradient(135deg,#E7F5EF,#A5D6C8)]',
  SR: 'bg-[linear-gradient(135deg,#F9D8EA,#D1A3FF)]',
  Galaxy: 'bg-[linear-gradient(135deg,#F9D8EA,#D1A3FF)]',
  SSR: 'bg-[linear-gradient(135deg,#F9D8EA,#D1A3FF)]',
};

function normalizeJoinedItem(item: ItemRecord | ItemRecord[] | null) {
  if (!item) return null;
  return Array.isArray(item) ? item[0] ?? null : item;
}

function formatJoinDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function VerificationPill({
  hkdvAccount,
  verified,
}: {
  hkdvAccount: HkdvAccount | null;
  verified: boolean;
}) {
  if (verified || hkdvAccount?.status === 'verified') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(165,214,200,0.16)] px-3 py-1.5 text-[12px] font-semibold text-[#4E927E]">
        <ShieldCheck size={14} />
        Verified Trader
      </div>
    );
  }

  if (hkdvAccount?.status === 'pending') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,224,130,0.18)] px-3 py-1.5 text-[12px] font-semibold text-[#B78425]">
        <Shield size={14} />
        Verification Pending
      </div>
    );
  }

  if (hkdvAccount?.status === 'rejected') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(239,154,154,0.16)] px-3 py-1.5 text-[12px] font-semibold text-[#B96565]">
        <ShieldAlert size={14} />
        Verification Rejected
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(46,42,40,0.06)] px-3 py-1.5 text-[12px] font-semibold text-[#2E2A2899]">
      <Shield size={14} />
      Not Verified
    </div>
  );
}

function PreviewCard({
  item,
  quantity,
  heartTier,
  locked,
}: {
  item: { name: string; rarityTier: string; thumbnailUrl: string | null; imageUrl: string | null };
  quantity?: number;
  heartTier?: number;
  locked?: boolean;
}) {
  return (
    <div className="w-32 shrink-0 overflow-hidden rounded-[22px] border border-[rgba(165,214,200,0.14)] bg-white/[0.76] p-3 shadow-[0_10px_24px_rgba(46,42,40,0.04)]">
      <div className={cn('relative h-24 rounded-[18px]', rarityBackground[item.rarityTier] || rarityBackground.N)}>
        {item.thumbnailUrl || item.imageUrl ? (
          <img
            src={item.thumbnailUrl || item.imageUrl || ''}
            alt=""
            className="h-full w-full rounded-[18px] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={22} className="text-white/55" />
          </div>
        )}

        <div className="absolute left-2 top-2">
          <RarityBadge tier={item.rarityTier as any} className="!px-1.5 !py-0 !text-[9px]" />
        </div>

        {typeof quantity === 'number' ? (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold text-white">
            x{quantity}
          </div>
        ) : null}

        {locked ? (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/25 p-1 text-white">
            <Lock size={10} />
          </div>
        ) : null}

        {typeof heartTier === 'number' ? (
          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-black/25 px-1.5 py-1">
            {[1, 2, 3].map((value) => (
              <Heart
                key={value}
                size={9}
                className={cn(
                  value <= heartTier ? 'fill-white text-white' : 'text-white/35'
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      <p className="mt-3 line-clamp-1 text-[12px] font-semibold text-[#2E2A28]">{item.name}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [inventoryPreview, setInventoryPreview] = useState<InventoryPreviewItem[]>([]);
  const [wishlistPreview, setWishlistPreview] = useState<WishlistPreviewItem[]>([]);
  const [hkdvAccount, setHkdvAccount] = useState<HkdvAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setMyId(data.user?.id ?? null);
      setAuthReady(true);
    };

    void syncAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setMyId(session?.user?.id ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const targetId = id || myId;
  const isMyProfile = Boolean(myId && targetId && myId === targetId);

  useEffect(() => {
    let active = true;

    if (!authReady) return;
    if (!targetId) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const [profileResult, likeCountResult, inventoryResult, wishlistResult, hkdvResult, likeStateResult] =
        await Promise.all([
          supabase
            .from('traders')
            .select(
              'id, username, display_name, avatar_url, bio, current_status, preferred_method, unlocked_badges, friend_code, hkdv_verified, hkdv_verified_at, reputation_score, total_trades, successful_trades, dream_mints, login_streak, role, created_at'
            )
            .eq('id', targetId)
            .maybeSingle(),
          supabase
            .from('profile_likes')
            .select('id', { count: 'exact', head: true })
            .eq('target_user_id', targetId),
          supabase
            .from('trader_inventory')
            .select('id, quantity, is_padlocked, item_id, items(id, name, rarity, thumbnail_url, image_url)')
            .eq('trader_id', targetId)
            .order('acquired_at', { ascending: false })
            .limit(8),
          supabase
            .from('wishlist_entries')
            .select('id, heart_tier, item_id, items(id, name, rarity, thumbnail_url, image_url)')
            .eq('trader_id', targetId)
            .order('heart_tier', { ascending: false })
            .limit(8),
          supabase
            .from('hkdv_player_accounts')
            .select('id, friend_code, player_name, server_region, status, verified_at, rejected_reason')
            .eq('trader_id', targetId)
            .maybeSingle(),
          myId
            ? supabase
                .from('profile_likes')
                .select('id')
                .eq('liker_id', myId)
                .eq('target_user_id', targetId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

      if (!active) return;

      if (profileResult.error || !profileResult.data) {
        setError(profileResult.error?.message ?? 'Profile not found');
        setLoading(false);
        return;
      }

      const nextProfile = profileResult.data as TraderProfile;
      setProfile(nextProfile);
      setEditDisplayName(nextProfile.display_name ?? '');
      setEditBio(nextProfile.bio ?? '');
      setLikesCount(likeCountResult.count ?? 0);
      setHasLiked(Boolean((likeStateResult as any).data));

      const invData = (inventoryResult.data ?? []) as InventoryRow[];
      setInventoryPreview(
        invData
          .map((row) => {
            const item = normalizeJoinedItem(row.items);
            if (!item) return null;
            return {
              id: item.id,
              entryId: row.id,
              name: item.name,
              rarityTier: item.rarity,
              quantity: row.quantity,
              isPadlocked: row.is_padlocked,
              thumbnailUrl: item.thumbnail_url ?? null,
              imageUrl: item.image_url ?? null,
            } as InventoryPreviewItem;
          })
          .filter((item): item is InventoryPreviewItem => item !== null)
      );

      const wishData = (wishlistResult.data ?? []) as WishlistRow[];
      setWishlistPreview(
        wishData
          .map((row) => {
            const item = normalizeJoinedItem(row.items);
            if (!item) return null;
            return {
              id: item.id,
              entryId: row.id,
              name: item.name,
              rarityTier: item.rarity,
              heartTier: row.heart_tier,
              thumbnailUrl: item.thumbnail_url ?? null,
              imageUrl: item.image_url ?? null,
            } as WishlistPreviewItem;
          })
          .filter((item): item is WishlistPreviewItem => item !== null)
      );

      setHkdvAccount((hkdvResult.data as HkdvAccount | null) ?? null);
      setLoading(false);
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [authReady, myId, targetId]);

  const badges = useMemo(() => {
    const unlocked = profile?.unlocked_badges ?? [];
    return unlocked.map((badgeId) => {
      const key = badgeId.toLowerCase();
      const config = BADGE_CONFIG[key];
      return {
        id: badgeId,
        label: config?.label ?? badgeId.replace(/_/g, ' '),
        Icon: config?.icon ?? Award,
        colorClass: config?.colorClass ?? 'text-[#A5D6C8]',
        borderClass:
          config?.borderClass ??
          'border-[rgba(165,214,200,0.25)] bg-[rgba(165,214,200,0.12)]',
      };
    });
  }, [profile?.unlocked_badges]);

  const toggleLike = async () => {
    if (!profile || likeLoading || isMyProfile) return;
    if (!myId) {
      navigate('/login');
      return;
    }

    setLikeLoading(true);

    if (hasLiked) {
      const { error: deleteError } = await supabase
        .from('profile_likes')
        .delete()
        .eq('liker_id', myId)
        .eq('target_user_id', profile.id);

      if (!deleteError) {
        setHasLiked(false);
        setLikesCount((count) => Math.max(0, count - 1));
      } else {
        setError(deleteError.message);
      }
    } else {
      const { error: insertError } = await supabase.from('profile_likes').insert({
        liker_id: myId,
        target_user_id: profile.id,
      });

      if (!insertError) {
        setHasLiked(true);
        setLikesCount((count) => count + 1);
      } else {
        setError(insertError.message);
      }
    }

    setLikeLoading(false);
  };

  const saveProfile = async () => {
    if (!profile || !myId || !isMyProfile || editSaving) return;

    setEditSaving(true);
    const nextDisplayName = editDisplayName.trim() || null;
    const nextBio = editBio.trim();

    const { error: updateError } = await supabase
      .from('traders')
      .update({
        display_name: nextDisplayName,
        bio: nextBio || '',
      })
      .eq('id', myId);

    if (!updateError) {
      setProfile((previous) =>
        previous
          ? {
              ...previous,
              display_name: nextDisplayName,
              bio: nextBio,
            }
          : previous
      );
      setEditOpen(false);
    } else {
      setError(updateError.message);
    }

    setEditSaving(false);
  };

  if (!loading && !targetId) {
    return (
      <Layout title="Profile" showNav={false}>
        <div className="pt-10">
          <div className="rounded-[28px] bg-white/[0.78] border border-[rgba(165,214,200,0.18)] px-5 py-10 text-center">
            <Cloud size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
            <p className="text-[16px] font-semibold text-[#2E2A28]">Sign in to view your profile.</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-5 rounded-2xl bg-[#A5D6C8] px-5 py-3 text-[14px] font-semibold text-[#2E2A28]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Profile" showBack={Boolean(id)}>
        <div className="space-y-4 pt-4">
          <div className="h-52 animate-pulse rounded-[32px] bg-white/[0.58]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 animate-pulse rounded-[24px] bg-white/[0.58]" />
            <div className="h-28 animate-pulse rounded-[24px] bg-white/[0.58]" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout title="Profile" showBack={Boolean(id)}>
        <div className="pt-10">
          <div className="rounded-[28px] bg-white/[0.78] border border-[rgba(239,154,154,0.24)] px-5 py-10 text-center">
            <Cloud size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
            <p className="text-[16px] font-semibold text-[#2E2A28]">Profile not found.</p>
            {error ? <p className="mt-2 text-[13px] text-[#9A3F52]">{error}</p> : null}
          </div>
        </div>
      </Layout>
    );
  }

  const status = STATUS_CONFIG[profile.current_status];
  const StatusIcon = status.icon;

  return (
    <Layout title={isMyProfile ? 'My Profile' : profile.display_name || profile.username} showBack={Boolean(id)}>
      <div className="space-y-5 pt-2">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-[rgba(165,214,200,0.18)] bg-white/[0.8] p-5 shadow-[0_18px_40px_rgba(46,42,40,0.06)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-full bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)] p-1">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-[24px] font-bold text-[#2E2A28]">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-full w-full object-cover block"
                    />
                  ) : (
                    (profile.display_name || profile.username).charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className={cn(
                    'absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white',
                    status.dotClass
                  )}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-[24px] font-bold font-display text-[#2E2A28] leading-tight truncate">
                  {profile.display_name || profile.username}
                </h2>
                <p className="mt-1 text-[13px] text-[#2E2A2899] truncate">@{profile.username}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold', status.pillClass)}>
                    <StatusIcon size={13} />
                    {status.label}
                  </span>
                  <span className="rounded-full bg-[rgba(46,42,40,0.06)] px-3 py-1.5 text-[12px] font-semibold text-[#2E2A2899]">
                    {METHOD_LABEL[profile.preferred_method]}
                  </span>
                </div>
              </div>
            </div>

            {isMyProfile ? (
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-full border border-[rgba(165,214,200,0.18)] bg-white/[0.8] p-3 text-[#2E2A28]"
              >
                <Edit3 size={16} />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <VerificationPill hkdvAccount={hkdvAccount} verified={profile.hkdv_verified} />

            {!isMyProfile ? (
              <button
                onClick={() => void toggleLike()}
                disabled={likeLoading}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold',
                  hasLiked
                    ? 'bg-[rgba(255,181,197,0.2)] text-[#B96565]'
                    : 'bg-[rgba(46,42,40,0.06)] text-[#2E2A2899]',
                  likeLoading && 'opacity-60'
                )}
              >
                {likeLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Heart size={14} className={cn(hasLiked && 'fill-current')} />
                )}
                {likesCount} likes
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,181,197,0.14)] px-3 py-1.5 text-[12px] font-semibold text-[#B96565]">
                <Heart size={14} className="fill-current" />
                {likesCount} likes
              </span>
            )}
          </div>

          {profile.bio ? (
            <p className="mt-4 text-[14px] leading-6 text-[#2E2A28]">{profile.bio}</p>
          ) : (
            <p className="mt-4 text-[14px] leading-6 text-[#2E2A2899]">
              {isMyProfile ? 'Add a short bio so other traders know your style.' : 'No bio added yet.'}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-[#2E2A2899]">
            <span>Joined {formatJoinDate(profile.created_at)}</span>
            {profile.friend_code ? <span>Friend Code: {profile.friend_code}</span> : null}
            {hkdvAccount?.player_name ? <span>HKDV: {hkdvAccount.player_name}</span> : null}
          </div>

          {hkdvAccount?.status === 'rejected' && hkdvAccount.rejected_reason ? (
            <div className="mt-4 rounded-2xl border border-[rgba(239,154,154,0.28)] bg-[rgba(255,235,238,0.85)] px-4 py-3 text-[12px] text-[#B96565]">
              Verification note: {hkdvAccount.rejected_reason}
            </div>
          ) : null}
        </motion.section>

        {/* --- TRADE BUTTON (ONLY SHOWS ON OTHER PEOPLE'S PROFILES) --- */}
        {!isMyProfile && (
          <div className="bg-[#E9FAF4]/30 rounded-[24px] p-6 border border-[rgba(165,214,200,0.3)] text-center">
            <p className="text-[13px] text-[#2E2A2899] mb-4">
              Found an item you want in {profile.display_name || profile.username}'s wardrobe?
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#A5D6C8,#82C9B2)] text-[#2E2A28] py-4 rounded-[20px] font-bold text-[15px] shadow-[0_14px_28px_rgba(165,214,200,0.35)] hover:scale-[1.02] transition-transform"
            >
              <ArrowRightLeft size={18} />
              Propose Trade
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white/[0.76] border border-[rgba(165,214,200,0.16)] px-4 py-4">
            <p className="text-[12px] text-[#2E2A2899]">Total Trades</p>
            <p className="mt-1 text-[24px] font-bold text-[#2E2A28]">{profile.total_trades}</p>
          </div>
          <div className="rounded-[24px] bg-white/[0.76] border border-[rgba(165,214,200,0.16)] px-4 py-4">
            <p className="text-[12px] text-[#2E2A2899]">Completed Trades</p>
            <p className="mt-1 text-[24px] font-bold text-[#2E2A28]">{profile.successful_trades}</p>
          </div>
          <div className="rounded-[24px] bg-white/[0.76] border border-[rgba(165,214,200,0.16)] px-4 py-4">
            <p className="text-[12px] text-[#2E2A2899]">Login Streak</p>
            <p className="mt-1 text-[24px] font-bold text-[#2E2A28]">{profile.login_streak}</p>
          </div>
          <div className="rounded-[24px] bg-white/[0.76] border border-[rgba(165,214,200,0.16)] px-4 py-4">
            <p className="text-[12px] text-[#2E2A2899]">Dream Mints</p>
            <p className="mt-1 text-[24px] font-bold text-[#2E2A28]">{profile.dream_mints}</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-[rgba(165,214,200,0.14)] bg-white/[0.76] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold font-display text-[#2E2A28]">Badges</h3>
            <span className="text-[12px] text-[#2E2A2899]">{badges.length}</span>
          </div>

          {badges.length === 0 ? (
            <p className="text-[13px] text-[#2E2A2899]">No badges unlocked yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.id}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-semibold',
                    badge.borderClass
                  )}
                >
                  <badge.Icon size={14} className={badge.colorClass} />
                  <span className="capitalize text-[#2E2A28]">{badge.label}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[rgba(165,214,200,0.14)] bg-white/[0.76] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold font-display text-[#2E2A28]">Inventory Preview</h3>
            {isMyProfile ? (
              <button
                onClick={() => navigate('/wardrobe')}
                className="text-[12px] font-semibold text-[#4E927E]"
              >
                Open Wardrobe
              </button>
            ) : null}
          </div>

          {inventoryPreview.length === 0 ? (
            <p className="text-[13px] text-[#2E2A2899]">No inventory items to show.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {inventoryPreview.map((item) => (
                <PreviewCard
                  key={item.entryId}
                  item={item}
                  quantity={item.quantity}
                  locked={item.isPadlocked}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[rgba(165,214,200,0.14)] bg-white/[0.76] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-bold font-display text-[#2E2A28]">Wishlist Preview</h3>
            {isMyProfile ? (
              <button
                onClick={() => navigate('/wardrobe')}
                className="text-[12px] font-semibold text-[#4E927E]"
              >
                Manage Wishlist
              </button>
            ) : null}
          </div>

          {wishlistPreview.length === 0 ? (
            <p className="text-[13px] text-[#2E2A2899]">No wishlist items to show.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {wishlistPreview.map((item) => (
                <PreviewCard key={item.entryId} item={item} heartTier={item.heartTier} />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomSheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2899]">
              Display Name
            </label>
            <input
              value={editDisplayName}
              onChange={(event) => setEditDisplayName(event.target.value)}
              maxLength={40}
              className="w-full rounded-2xl border border-[rgba(165,214,200,0.18)] bg-white/[0.82] px-4 py-3 text-[14px] text-[#2E2A28] outline-none"
              placeholder="How other traders see you"
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2899]">
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(event) => setEditBio(event.target.value)}
              maxLength={180}
              rows={4}
              className="w-full resize-none rounded-2xl border border-[rgba(165,214,200,0.18)] bg-white/[0.82] px-4 py-3 text-[14px] text-[#2E2A28] outline-none"
              placeholder="Share your trading style, dream collections, or favorite Sanrio vibe."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-2xl border border-[rgba(46,42,40,0.12)] bg-white/[0.82] px-4 py-3 text-[13px] font-semibold text-[#2E2A28]"
            >
              <span className="inline-flex items-center gap-1.5">
                <X size={14} />
                Cancel
              </span>
            </button>
            <button
              onClick={() => void saveProfile()}
              disabled={editSaving}
              className="rounded-2xl bg-[#A5D6C8] px-4 py-3 text-[13px] font-semibold text-[#2E2A28] disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1.5">
                {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save
              </span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* The Offer Modal */}
      {isModalOpen && (
        <CreateOfferModal onClose={() => setIsModalOpen(false)} />
      )}
    </Layout>
  );
}
