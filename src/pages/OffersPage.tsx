import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Ban,
  Check,
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  Package,
  Scale,
  Send,
  Shield,
  Truck,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import BottomSheet from '@/components/BottomSheet';
import RarityBadge, { type RarityTier } from '@/components/RarityBadge';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
type TradeStatus = 'in_progress' | 'completed' | 'disputed' | 'cancelled';
type DeclineReason =
  | 'saving_for_dream'
  | 'values_unbalanced'
  | 'already_traded'
  | 'out_of_tickets';
type TabKey = 'incoming' | 'outgoing' | 'history';
type ItemRarity = 'N' | 'R' | 'S' | 'SR';

interface OfferRow {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  offered_item_ids: string[] | null;
  offered_method: string | null;
  status: OfferStatus;
  decline_message: DeclineReason | null;
  fairness_score: number | null;
  created_at: string;
  responded_at: string | null;
  expires_at: string | null;
}

interface ListingRow {
  id: string;
  item_id: string;
  note: string | null;
  asking_method: string | null;
  asking_item_ids: string[] | null;
}

interface TraderRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  reputation_score: number;
  current_status: string | null;
}

interface ItemRow {
  id: string;
  name: string;
  rarity: ItemRarity;
  thumbnail_url: string | null;
  image_url: string | null;
  category: string | null;
}

interface TradeRow {
  id: string;
  offer_id: string;
  status: TradeStatus;
  buyer_sent: boolean;
  seller_sent: boolean;
  buyer_id: string;
  seller_id: string;
}

interface OfferCardData {
  offer: OfferRow;
  listing: ListingRow | null;
  requestedItem: ItemRow | null;
  offeredItems: ItemRow[];
  buyer: TraderRow | null;
  seller: TraderRow | null;
  trade: TradeRow | null;
}

const rarityMap: Record<ItemRarity, RarityTier> = {
  N: 'Moon',
  R: 'Star',
  S: 'Comet',
  SR: 'Galaxy',
};

const DECLINE_REASONS: Array<{ value: DeclineReason; label: string }> = [
  { value: 'saving_for_dream', label: "They're saving this item for a special trade" },
  { value: 'values_unbalanced', label: 'The values do not quite match up this time' },
  { value: 'already_traded', label: 'They just traded this item away' },
  { value: 'out_of_tickets', label: 'They are taking a break from trading' },
];

const STATUS_STYLE: Record<
  OfferStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-[rgba(255,224,130,0.18)] text-[#B78425] border-[rgba(255,224,130,0.35)]',
    icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-[rgba(165,214,200,0.18)] text-[#4E927E] border-[rgba(165,214,200,0.35)]',
    icon: Check,
  },
  declined: {
    label: 'Declined',
    className: 'bg-[rgba(239,154,154,0.16)] text-[#B96565] border-[rgba(239,154,154,0.35)]',
    icon: X,
  },
  expired: {
    label: 'Expired',
    className: 'bg-[rgba(46,42,40,0.08)] text-[#2E2A2899] border-[rgba(46,42,40,0.10)]',
    icon: Ban,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-[rgba(46,42,40,0.08)] text-[#2E2A2899] border-[rgba(46,42,40,0.10)]',
    icon: Ban,
  },
};

function fairBand(score: number | null) {
  if (score === null) {
    return { label: 'Unknown', textClass: 'text-[#2E2A2899]', barClass: 'bg-[#D7D1C6]', width: 0 };
  }

  if (score >= 40 && score <= 60) {
    return { label: 'Fair', textClass: 'text-[#4E927E]', barClass: 'bg-[#81C784]', width: score };
  }

  if ((score >= 25 && score < 40) || (score > 60 && score <= 75)) {
    return { label: 'Negotiable', textClass: 'text-[#B78425]', barClass: 'bg-[#FFE082]', width: score };
  }

  return { label: 'Unfair', textClass: 'text-[#B96565]', barClass: 'bg-[#EF9A9A]', width: score };
}

function formatRelative(value: string) {
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

function formatMethod(value: string | null | undefined) {
  if (!value) return 'Any method';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function ItemTile({ item, compact = false }: { item: ItemRow | null; compact?: boolean }) {
  const size = compact ? 'h-16 w-16' : 'h-20 w-20';

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EFEDE7,#D7D1C6)]',
            size
          )}
        >
          <Package size={compact ? 18 : 22} className="text-white/55" />
        </div>
        <span className="max-w-[88px] truncate text-[11px] font-semibold text-[#2E2A2899]">Unknown</span>
      </div>
    );
  }

  const tier = rarityMap[item.rarity] ?? 'Moon';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-2xl',
          size,
          tier === 'Moon'
            ? 'bg-[linear-gradient(135deg,#E8ECEE,#CBD4D9)]'
            : tier === 'Star'
              ? 'bg-[linear-gradient(135deg,#FBE9CC,#FFE082)]'
              : tier === 'Comet'
                ? 'bg-[linear-gradient(135deg,#E7F5EF,#A5D6C8)]'
                : 'bg-[linear-gradient(135deg,#F9D8EA,#D1A3FF)]'
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
          <Package size={compact ? 18 : 22} className="text-white/55" />
        )}
      </div>
      <span className="max-w-[88px] truncate text-[11px] font-semibold text-[#2E2A28]">{item.name}</span>
      <RarityBadge tier={tier} className="!px-1.5 !py-0.5 !text-[9px]" />
    </div>
  );
}

function FairnessBar({ score }: { score: number | null }) {
  const band = fairBand(score);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-[#2E2A2899]">Fairness</span>
        <span className={cn('font-semibold', band.textClass)}>
          {band.label}
          {score !== null ? ` (${score})` : ''}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#2E2A280D]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, band.width))}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className={cn('h-full rounded-full', band.barClass)}
        />
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const config = {
    incoming: {
      icon: Inbox,
      title: 'No incoming offers',
      message: 'When someone wants to trade with you, their offers will show up here.',
    },
    outgoing: {
      icon: Send,
      title: 'No outgoing offers',
      message: 'Browse the catalog and send a trade to get started.',
    },
    history: {
      icon: Clock,
      title: 'No trade history yet',
      message: 'Accepted, declined, and cancelled offers will appear here.',
    },
  }[tab];

  const Icon = config.icon;

  return (
    <div className="rounded-[28px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-12 text-center">
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)]">
        <Icon size={30} className="text-[#2E2A2866]" />
      </div>
      <p className="text-[15px] font-semibold text-[#2E2A28]">{config.title}</p>
      <p className="mt-1 text-[13px] text-[#2E2A2899]">{config.message}</p>
    </div>
  );
}

export default function OffersPage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [offers, setOffers] = useState<OfferCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('incoming');
  const [selectedOffer, setSelectedOffer] = useState<OfferCardData | null>(null);
  const [declineOffer, setDeclineOffer] = useState<OfferCardData | null>(null);
  const [selectedReason, setSelectedReason] = useState<DeclineReason>('saving_for_dream');
  const [actionOfferId, setActionOfferId] = useState<string | null>(null);

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

  const loadOffers = useCallback(async (currentUserId: string) => {
    setLoading(true);
    setError(null);

    const { data: offerRows, error: offersError } = await supabase
      .from('offers')
      .select(
        'id, listing_id, buyer_id, seller_id, offered_item_ids, offered_method, status, decline_message, fairness_score, created_at, responded_at, expires_at'
      )
      .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (offersError) {
      setError(offersError.message);
      setOffers([]);
      setLoading(false);
      return;
    }

    const baseOffers = (offerRows ?? []) as OfferRow[];
    if (baseOffers.length === 0) {
      setOffers([]);
      setLoading(false);
      return;
    }

    const listingIds = [...new Set(baseOffers.map((offer) => offer.listing_id).filter(Boolean))] as string[];
    const traderIds = [...new Set(baseOffers.flatMap((offer) => [offer.buyer_id, offer.seller_id]))];
    const offeredItemIds = [
      ...new Set(baseOffers.flatMap((offer) => offer.offered_item_ids ?? [])),
    ];
    const tradeOfferIds = baseOffers
      .filter((offer) => offer.status === 'accepted')
      .map((offer) => offer.id);

    const [listingResult, traderResult, tradeResult] = await Promise.all([
      listingIds.length > 0
        ? supabase
            .from('listings')
            .select('id, item_id, note, asking_method, asking_item_ids')
            .in('id', listingIds)
        : Promise.resolve({ data: [], error: null }),
      traderIds.length > 0
        ? supabase
            .from('traders')
            .select('id, username, display_name, avatar_url, reputation_score, current_status')
            .in('id', traderIds)
        : Promise.resolve({ data: [], error: null }),
      tradeOfferIds.length > 0
        ? supabase
            .from('trades')
            .select('id, offer_id, status, buyer_sent, seller_sent, buyer_id, seller_id')
            .in('offer_id', tradeOfferIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const listings = ((listingResult.data ?? []) as ListingRow[]).reduce<Record<string, ListingRow>>(
      (acc, listing) => {
        acc[listing.id] = listing;
        return acc;
      },
      {}
    );

    const listingItemIds = Object.values(listings).map((listing) => listing.item_id);
    const itemIds = [...new Set([...offeredItemIds, ...listingItemIds])];
    const itemsResult =
      itemIds.length > 0
        ? await supabase
            .from('items')
            .select('id, name, rarity, thumbnail_url, image_url, category')
            .in('id', itemIds)
        : { data: [], error: null };

    if (listingResult.error || traderResult.error || tradeResult.error || itemsResult.error) {
      setError(
        listingResult.error?.message ||
          traderResult.error?.message ||
          tradeResult.error?.message ||
          itemsResult.error?.message ||
          'Failed to load offers'
      );
      setOffers([]);
      setLoading(false);
      return;
    }

    const traders = ((traderResult.data ?? []) as TraderRow[]).reduce<Record<string, TraderRow>>(
      (acc, trader) => {
        acc[trader.id] = trader;
        return acc;
      },
      {}
    );

    const items = ((itemsResult.data ?? []) as ItemRow[]).reduce<Record<string, ItemRow>>(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {}
    );

    const trades = ((tradeResult.data ?? []) as TradeRow[]).reduce<Record<string, TradeRow>>(
      (acc, trade) => {
        acc[trade.offer_id] = trade;
        return acc;
      },
      {}
    );

    setOffers(
      baseOffers.map((offer) => {
        const listing = offer.listing_id ? listings[offer.listing_id] ?? null : null;
        return {
          offer,
          listing,
          requestedItem: listing ? items[listing.item_id] ?? null : null,
          offeredItems: (offer.offered_item_ids ?? [])
            .map((itemId) => items[itemId])
            .filter((item): item is ItemRow => Boolean(item)),
          buyer: traders[offer.buyer_id] ?? null,
          seller: traders[offer.seller_id] ?? null,
          trade: trades[offer.id] ?? null,
        };
      })
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!userId) {
      setOffers([]);
      setLoading(false);
      return;
    }
    void loadOffers(userId);
  }, [authReady, loadOffers, userId]);

  const incoming = useMemo(
    () => offers.filter((entry) => entry.offer.seller_id === userId && entry.offer.status === 'pending'),
    [offers, userId]
  );
  const outgoing = useMemo(
    () => offers.filter((entry) => entry.offer.buyer_id === userId && entry.offer.status === 'pending'),
    [offers, userId]
  );
  const history = useMemo(
    () => offers.filter((entry) => entry.offer.status !== 'pending'),
    [offers]
  );
  const activeData =
    activeTab === 'incoming' ? incoming : activeTab === 'outgoing' ? outgoing : history;

  const acceptOffer = useCallback(
    async (entry: OfferCardData) => {
      if (!userId || actionOfferId) return;
      setActionOfferId(entry.offer.id);
      setError(null);

      // 1. Execute the Atomic Swap on the backend
      const { error: swapError } = await supabase.rpc('accept_trade_offer', {
        p_offer_id: entry.offer.id,
      });

      if (swapError) {
        setError("Atomic Swap Failed: " + swapError.message);
        setActionOfferId(null);
        return;
      }

      // 2. Auto-complete the tracking row so your UI still registers it perfectly
      if (!entry.trade) {
        await supabase.from('trades').insert({
          offer_id: entry.offer.id,
          buyer_id: entry.offer.buyer_id,
          seller_id: entry.offer.seller_id,
          status: 'completed',
          buyer_sent: true,
          seller_sent: true
        });
      }

      alert("Success! Items have been swapped atomically.");

      setSelectedOffer(null);
      setActionOfferId(null);
      await loadOffers(userId);
    },
    [actionOfferId, loadOffers, userId]
  );

  const declineSelectedOffer = useCallback(async () => {
    if (!userId || !declineOffer || actionOfferId) return;
    setActionOfferId(declineOffer.offer.id);
    setError(null);

    const respondedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('offers')
      .update({
        status: 'declined',
        decline_message: selectedReason,
        responded_at: respondedAt,
      })
      .eq('id', declineOffer.offer.id)
      .eq('seller_id', userId);

    if (updateError) {
      setError(updateError.message);
      setActionOfferId(null);
      return;
    }

    setDeclineOffer(null);
    setSelectedOffer(null);
    setActionOfferId(null);
    await loadOffers(userId);
  }, [actionOfferId, declineOffer, loadOffers, selectedReason, userId]);

  const cancelOffer = useCallback(
    async (entry: OfferCardData) => {
      if (!userId || actionOfferId) return;
      setActionOfferId(entry.offer.id);
      setError(null);

      const { error: updateError } = await supabase
        .from('offers')
        .update({ status: 'cancelled' })
        .eq('id', entry.offer.id)
        .eq('buyer_id', userId);

      if (updateError) {
        setError(updateError.message);
        setActionOfferId(null);
        return;
      }

      setSelectedOffer(null);
      setActionOfferId(null);
      await loadOffers(userId);
    },
    [actionOfferId, loadOffers, userId]
  );

  const markSent = useCallback(
    async (entry: OfferCardData) => {
      if (!userId || !entry.trade || actionOfferId) return;

      const isBuyer = entry.trade.buyer_id === userId;
      const nextBuyerSent = isBuyer ? true : entry.trade.buyer_sent;
      const nextSellerSent = isBuyer ? entry.trade.seller_sent : true;
      const nextStatus: TradeStatus =
        nextBuyerSent && nextSellerSent ? 'completed' : entry.trade.status;

      setActionOfferId(entry.offer.id);
      setError(null);

      const { error: tradeError } = await supabase
        .from('trades')
        .update({
          buyer_sent: nextBuyerSent,
          seller_sent: nextSellerSent,
          status: nextStatus,
          completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', entry.trade.id);

      if (tradeError) {
        setError(tradeError.message);
        setActionOfferId(null);
        return;
      }

      setActionOfferId(null);
      await loadOffers(userId);
    },
    [actionOfferId, loadOffers, userId]
  );

  if (!loading && !userId) {
    return (
      <Layout title="Offers" showNav={false}>
        <div className="pt-10">
          <div className="rounded-[28px] border border-[rgba(165,214,200,0.18)] bg-white/[0.78] px-5 py-10 text-center">
            <Inbox size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
            <p className="text-[16px] font-semibold text-[#2E2A28]">
              Sign in to manage your trade offers.
            </p>
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

  return (
    <Layout title="Offers">
      <div className="space-y-5 pt-2">
        <div className="flex rounded-2xl border border-[rgba(165,214,200,0.18)] bg-white/[0.75] p-1">
          {[
            { key: 'incoming' as TabKey, label: 'Incoming', icon: Inbox, count: incoming.length },
            { key: 'outgoing' as TabKey, label: 'Outgoing', icon: Send, count: outgoing.length },
            { key: 'history' as TabKey, label: 'History', icon: Clock, count: history.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition-colors',
                activeTab === tab.key ? 'bg-[#A5D6C8] text-[#2E2A28]' : 'text-[#2E2A2899]'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  activeTab === tab.key ? 'bg-white/55' : 'bg-[rgba(46,42,40,0.06)]'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-[28px] bg-white/[0.58]" />
            ))}
          </div>
        ) : activeData.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-3">
            {activeData.map((entry) => {
              const offer = entry.offer;
              const trade = entry.trade;
              const isIncoming = offer.seller_id === userId;
              const otherTrader = isIncoming ? entry.buyer : entry.seller;
              const status = STATUS_STYLE[offer.status];
              const StatusIcon = status.icon;
              const band = fairBand(offer.fairness_score);
              const canMarkSent =
                offer.status === 'accepted' &&
                trade &&
                ((trade.buyer_id === userId && !trade.buyer_sent) ||
                  (trade.seller_id === userId && !trade.seller_sent));

              return (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[28px] border border-[rgba(165,214,200,0.14)] bg-white/[0.78] p-4 text-left shadow-[0_16px_32px_rgba(46,42,40,0.05)]"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedOffer(entry)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedOffer(entry);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)] text-[16px] font-semibold text-[#2E2A28]">
                          {otherTrader?.avatar_url ? (
                            <img
                              src={otherTrader.avatar_url}
                              alt={otherTrader.display_name || otherTrader.username}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            (otherTrader?.display_name || otherTrader?.username || '?')
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-[#2E2A28]">
                            {isIncoming ? 'Incoming from' : 'Sent to'}{' '}
                            {otherTrader?.display_name || otherTrader?.username || 'Trader'}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#2E2A2899]">
                            Reputation {otherTrader?.reputation_score ?? 100} |{' '}
                            {formatRelative(offer.created_at)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
                          status.className
                        )}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2899]">
                          You Give
                        </span>
                        <ItemTile
                          item={isIncoming ? entry.requestedItem : entry.offeredItems[0] ?? null}
                          compact
                        />
                      </div>
                      <ArrowLeftRight size={18} className="text-[#A5D6C8]" />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2899]">
                          You Get
                        </span>
                        <ItemTile
                          item={isIncoming ? entry.offeredItems[0] ?? null : entry.requestedItem}
                          compact
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <FairnessBar score={offer.fairness_score} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[11px] text-[#2E2A2899]">
                        <Scale size={12} />
                        <span>{band.label}</span>
                        {trade ? (
                          <span className="rounded-full bg-[rgba(46,42,40,0.06)] px-2 py-1">
                            {trade.status === 'completed'
                              ? 'Trade complete'
                              : `${trade.buyer_sent ? 'Buyer sent' : 'Buyer waiting'} | ${
                                  trade.seller_sent ? 'Seller sent' : 'Seller waiting'
                                }`}
                          </span>
                        ) : null}
                      </div>

                      <ChevronRight size={16} className="text-[#2E2A2866]" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    {offer.status === 'pending' && isIncoming ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setDeclineOffer(entry);
                            setSelectedReason('saving_for_dream');
                          }}
                          className="rounded-2xl border border-[rgba(239,154,154,0.28)] bg-[rgba(255,235,238,0.85)] px-3 py-2 text-[12px] font-semibold text-[#B96565]"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => void acceptOffer(entry)}
                          disabled={actionOfferId === offer.id}
                          className="rounded-2xl bg-[#A5D6C8] px-3 py-2 text-[12px] font-semibold text-[#2E2A28] disabled:opacity-60"
                        >
                          {actionOfferId === offer.id ? 'Working...' : 'Accept'}
                        </button>
                      </>
                    ) : null}

                    {offer.status === 'pending' && !isIncoming ? (
                      <button
                        type="button"
                        onClick={() => void cancelOffer(entry)}
                        disabled={actionOfferId === offer.id}
                        className="rounded-2xl border border-[rgba(239,154,154,0.28)] bg-[rgba(255,235,238,0.85)] px-3 py-2 text-[12px] font-semibold text-[#B96565] disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    ) : null}

                    {canMarkSent ? (
                      <button
                        type="button"
                        onClick={() => void markSent(entry)}
                        disabled={actionOfferId === offer.id}
                        className="rounded-2xl bg-[rgba(165,214,200,0.18)] px-3 py-2 text-[12px] font-semibold text-[#4E927E] disabled:opacity-60"
                      >
                        Mark as Sent
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={selectedOffer !== null}
        onClose={() => setSelectedOffer(null)}
        title="Offer Details"
      >
        {selectedOffer ? (
          <div className="space-y-5">
            <div className="rounded-[24px] border border-[rgba(165,214,200,0.14)] bg-white/[0.78] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-[#2E2A2899]">Trader</p>
                  <p className="text-[16px] font-semibold text-[#2E2A28]">
                    {(selectedOffer.offer.seller_id === userId
                      ? selectedOffer.buyer?.display_name || selectedOffer.buyer?.username
                      : selectedOffer.seller?.display_name || selectedOffer.seller?.username) ||
                      'Trader'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(46,42,40,0.06)] px-3 py-1.5 text-[12px] font-semibold text-[#2E2A2899]">
                  <Shield size={14} />
                  Reputation{' '}
                  {selectedOffer.offer.seller_id === userId
                    ? selectedOffer.buyer?.reputation_score ?? 100
                    : selectedOffer.seller?.reputation_score ?? 100}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[rgba(46,42,40,0.04)] p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2899]">
                    Requested Item
                  </p>
                  <div className="flex justify-center">
                    <ItemTile item={selectedOffer.requestedItem} />
                  </div>
                </div>
                <div className="rounded-2xl bg-[rgba(46,42,40,0.04)] p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2899]">
                    Offered Items
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {selectedOffer.offeredItems.length > 0 ? (
                      selectedOffer.offeredItems.map((item) => <ItemTile key={item.id} item={item} />)
                    ) : (
                      <ItemTile item={null} />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <FairnessBar score={selectedOffer.offer.fairness_score} />
              </div>

              <div className="mt-4 space-y-2 rounded-2xl bg-[rgba(46,42,40,0.04)] p-4 text-[12px] text-[#2E2A2899]">
                <p>
                  <span className="font-semibold text-[#2E2A28]">Offered method:</span>{' '}
                  {formatMethod(selectedOffer.offer.offered_method)}
                </p>
                <p>
                  <span className="font-semibold text-[#2E2A28]">Listing method:</span>{' '}
                  {formatMethod(selectedOffer.listing?.asking_method)}
                </p>
                <p>
                  <span className="font-semibold text-[#2E2A28]">Sent:</span>{' '}
                  {new Date(selectedOffer.offer.created_at).toLocaleString()}
                </p>
                {selectedOffer.offer.expires_at ? (
                  <p>
                    <span className="font-semibold text-[#2E2A28]">Expires:</span>{' '}
                    {new Date(selectedOffer.offer.expires_at).toLocaleString()}
                  </p>
                ) : null}
                {selectedOffer.listing?.note ? (
                  <p>
                    <span className="font-semibold text-[#2E2A28]">Listing note:</span>{' '}
                    {selectedOffer.listing.note}
                  </p>
                ) : null}
                {selectedOffer.offer.decline_message ? (
                  <p>
                    <span className="font-semibold text-[#2E2A28]">Decline reason:</span>{' '}
                    {DECLINE_REASONS.find(
                      (reason) => reason.value === selectedOffer.offer.decline_message
                    )?.label || selectedOffer.offer.decline_message}
                  </p>
                ) : null}
              </div>

              {selectedOffer.trade ? (
                <div className="mt-4 rounded-2xl border border-[rgba(165,214,200,0.14)] bg-[rgba(165,214,200,0.08)] p-4">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#2E2A28]">
                    <Truck size={15} className="text-[#4E927E]" />
                    Trade Progress
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-[#2E2A2899]">
                    <div className="rounded-2xl bg-white/[0.8] px-3 py-3">
                      Buyer: {selectedOffer.trade.buyer_sent ? 'Sent' : 'Waiting'}
                    </div>
                    <div className="rounded-2xl bg-white/[0.8] px-3 py-3">
                      Seller: {selectedOffer.trade.seller_sent ? 'Sent' : 'Waiting'}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        isOpen={declineOffer !== null}
        onClose={() => setDeclineOffer(null)}
        title="Decline Offer"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#2E2A2899]">
            Choose a gentle reason. This gets saved to the offer.
          </p>
          <div className="space-y-2">
            {DECLINE_REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left text-[13px] font-medium',
                  selectedReason === reason.value
                    ? 'border-transparent bg-[#A5D6C8] text-[#2E2A28]'
                    : 'border-[rgba(165,214,200,0.18)] bg-white/[0.7] text-[#2E2A28]'
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setDeclineOffer(null)}
              className="rounded-2xl border border-[rgba(46,42,40,0.12)] bg-white/[0.82] px-4 py-3 text-[13px] font-semibold text-[#2E2A28]"
            >
              Keep Offer
            </button>
            <button
              onClick={() => void declineSelectedOffer()}
              disabled={!declineOffer || actionOfferId === declineOffer.offer.id}
              className="rounded-2xl bg-[rgba(239,154,154,0.85)] px-4 py-3 text-[13px] font-semibold text-[#2E2A28] disabled:opacity-60"
            >
              {declineOffer && actionOfferId === declineOffer.offer.id ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  Declining
                </span>
              ) : (
                'Decline'
              )}
            </button>
          </div>
        </div>
      </BottomSheet>
    </Layout>
  );
}
