import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  Heart,
  LayoutGrid,
  Loader2,
  Lock,
  Package,
  TrendingUp,
  X,
} from 'lucide-react';
import Layout from '@/components/Layout';
import BottomSheet from '@/components/BottomSheet';
import ProgressRing from '@/components/ProgressRing';
import RarityBadge, { type RarityTier } from '@/components/RarityBadge';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DbRarity = 'N' | 'R' | 'S' | 'SR';

interface CollectionRow {
  id: string;
  name: string;
  type: string;
  character: string | null;
  description: string | null;
  banner_url: string | null;
  shop_photo_url: string | null;
  total_items: number;
  is_active: boolean;
  created_at?: string;
}

interface ItemRow {
  id: string;
  name: string;
  category: string;
  subtype: string;
  rarity: DbRarity;
  character: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  demand_score: number | null;
  collection_id: string | null;
}

interface InventoryEntry {
  item_id: string;
  quantity: number;
  is_padlocked: boolean;
}

type CollectionWithItems = CollectionRow & { items: ItemRow[] };

const rarityTierMap: Record<DbRarity, RarityTier> = {
  N: 'Moon',
  R: 'Star',
  S: 'Comet',
  SR: 'Galaxy',
};

const rarityRank: Record<DbRarity, number> = {
  SR: 0,
  S: 1,
  R: 2,
  N: 3,
};

const collectionTypeLabels: Record<string, string> = {
  happy_bag_regular: 'Happy Bag',
  happy_bag_limited: 'Limited Happy Bag',
  happy_bag_permanent: 'Permanent Happy Bag',
  sweet_collection: 'Sweet Collection',
  petite_collection: 'Petite Collection',
  custom_happy_bag: 'Custom Happy Bag',
  lucky_bag: 'Lucky Bag',
  sugarbunnies_cart: 'Sugarbunnies Cart',
  buyer_shop: 'Buyer Shop',
  select_shop: 'Select Shop',
  event: 'Event',
  collaboration: 'Collaboration',
};

function toTitleCase(value: string | null | undefined) {
  if (!value) return 'Unknown';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortItems(items: ItemRow[]) {
  return [...items].sort((a, b) => {
    const rarityDiff = rarityRank[a.rarity] - rarityRank[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return a.name.localeCompare(b.name);
  });
}

function CollectionCard({
  collection,
  owned,
  total,
  percentage,
  onOpen,
}: {
  collection: CollectionWithItems;
  owned: number;
  total: number;
  percentage: number;
  onOpen: () => void;
}) {
  const art = collection.shop_photo_url || collection.banner_url;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/40 bg-white/70 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/85"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)]">
        {art ? (
          <img src={art} alt={collection.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <LayoutGrid className="h-6 w-6 text-[#7ED7C180]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold text-[#2E2A28]">{collection.name}</h3>
          <span className="rounded-full bg-[rgba(46,42,40,0.05)] px-2 py-0.5 text-[10px] font-medium text-[#2E2A2899]">
            {collectionTypeLabels[collection.type] || toTitleCase(collection.type)}
          </span>
        </div>

        {collection.character ? (
          <p className="mt-0.5 text-[12px] text-[#2E2A2899]">{collection.character}</p>
        ) : null}

        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(46,42,40,0.08)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                percentage === 100 ? 'bg-green-400' : percentage >= 50 ? 'bg-[#7ED7C1]' : 'bg-amber-300'
              )}
            />
          </div>
          <span className="shrink-0 text-[12px] font-medium text-[#2E2A2899]">
            {owned}/{total}
          </span>
        </div>
      </div>

      <ProgressRing
        percentage={percentage}
        size={48}
        strokeWidth={4}
        showLabel={false}
        className="shrink-0"
      />
    </motion.button>
  );
}

function ItemTile({
  item,
  owned,
  quantity,
  padlocked,
  wishlistTier,
  onOpen,
  onToggleWishlist,
}: {
  item: ItemRow;
  owned: boolean;
  quantity: number;
  padlocked: boolean;
  wishlistTier: number;
  onOpen: () => void;
  onToggleWishlist: () => void;
}) {
  const image = item.thumbnail_url || item.image_url;
  const tier = rarityTierMap[item.rarity];

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onOpen}
      className={cn(
        'group overflow-hidden rounded-2xl border border-white/40 bg-white/70 text-left backdrop-blur-sm transition-all hover:bg-white/85',
        !owned && 'opacity-85'
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)]">
        {image ? (
          <img
            src={image}
            alt={item.name}
            className={cn('h-full w-full object-cover', !owned && 'grayscale')}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className={cn('h-8 w-8', owned ? 'text-white/45' : 'text-white/30')} />
          </div>
        )}

        <div className="absolute right-2 top-2">
          <RarityBadge tier={tier} className="!px-1.5 !py-0.5 !text-[9px]" />
        </div>

        {padlocked ? (
          <div className="absolute left-2 top-2 rounded-full bg-amber-400/85 p-1">
            <Lock className="h-2.5 w-2.5 text-white" />
          </div>
        ) : null}

        {owned ? (
          <div className="absolute bottom-2 left-2 rounded-md bg-[#7ED7C1] px-1.5 py-0.5 text-[9px] font-bold text-white">
            {quantity > 1 ? `x${quantity}` : 'Owned'}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40 backdrop-blur-sm">
              <span className="text-sm font-bold text-white/80">?</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void onToggleWishlist();
          }}
          className={cn(
            'absolute bottom-2 right-2 rounded-full p-1.5 backdrop-blur-sm transition-all',
            wishlistTier > 0 ? 'bg-white/85 text-red-400' : 'bg-white/55 text-white'
          )}
          aria-label={wishlistTier > 0 ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-3.5 w-3.5', wishlistTier > 0 && 'fill-current')} />
        </button>
      </div>

      <div className="p-2.5">
        <h3 className={cn('line-clamp-2 text-[12px] font-semibold leading-tight', owned ? 'text-[#2E2A28]' : 'text-[#2E2A2899]')}>
          {item.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-[10px] text-[#2E2A2866]">{toTitleCase(item.subtype)}</span>
          {wishlistTier > 0 ? (
            <span className="text-[10px] font-semibold text-red-400">{'♥'.repeat(wishlistTier)}</span>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

export default function CollectionPage() {
  const navigate = useNavigate();
  const { id: collectionId } = useParams<{ id?: string }>();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDataReady, setUserDataReady] = useState(false);
  const [inventoryMap, setInventoryMap] = useState<Map<string, InventoryEntry>>(new Map());
  const [wishlistMap, setWishlistMap] = useState<Map<string, number>>(new Map());
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [collectionItems, setCollectionItems] = useState<ItemRow[]>([]);
  const [activeCollection, setActiveCollection] = useState<CollectionRow | null>(null);
  const [activeItems, setActiveItems] = useState<ItemRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemRow | null>(null);
  const [wishlistPendingId, setWishlistPendingId] = useState<string | null>(null);

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
    if (!authReady) return;

    let active = true;
    const loadUserData = async () => {
      setUserDataReady(false);

      if (!userId) {
        if (!active) return;
        setInventoryMap(new Map());
        setWishlistMap(new Map());
        setUserDataReady(true);
        return;
      }

      const [inventoryResult, wishlistResult] = await Promise.all([
        supabase
          .from('trader_inventory')
          .select('item_id, quantity, is_padlocked')
          .eq('trader_id', userId),
        supabase
          .from('wishlist_entries')
          .select('item_id, heart_tier')
          .eq('trader_id', userId),
      ]);

      if (!active) return;

      const nextInventory = new Map<string, InventoryEntry>();
      (inventoryResult.data ?? []).forEach((row) => {
        nextInventory.set(row.item_id as string, {
          item_id: row.item_id as string,
          quantity: row.quantity as number,
          is_padlocked: row.is_padlocked as boolean,
        });
      });

      const nextWishlist = new Map<string, number>();
      (wishlistResult.data ?? []).forEach((row) => {
        nextWishlist.set(row.item_id as string, row.heart_tier as number);
      });

      setInventoryMap(nextInventory);
      setWishlistMap(nextWishlist);
      setUserDataReady(true);
    };

    void loadUserData();

    return () => {
      active = false;
    };
  }, [authReady, userId]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      setPageLoading(true);
      setError(null);

      if (collectionId) {
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select(
            'id, name, type, character, description, banner_url, shop_photo_url, total_items, is_active, created_at'
          )
          .eq('id', collectionId)
          .maybeSingle();

        if (!active) return;

        if (collectionError) {
          setError(collectionError.message);
          setActiveCollection(null);
          setActiveItems([]);
          setPageLoading(false);
          return;
        }

        if (!collectionData) {
          setActiveCollection(null);
          setActiveItems([]);
          setPageLoading(false);
          return;
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select(
            'id, name, category, subtype, rarity, character, image_url, thumbnail_url, demand_score, collection_id'
          )
          .eq('collection_id', collectionId);

        if (!active) return;

        if (itemsError) {
          setError(itemsError.message);
          setActiveCollection(collectionData as CollectionRow);
          setActiveItems([]);
          setPageLoading(false);
          return;
        }

        setActiveCollection(collectionData as CollectionRow);
        setActiveItems(sortItems((itemsData ?? []) as ItemRow[]));
        setPageLoading(false);
        return;
      }

      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select(
          'id, name, type, character, description, banner_url, shop_photo_url, total_items, is_active, created_at'
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (collectionsError) {
        setError(collectionsError.message);
        setCollections([]);
        setCollectionItems([]);
        setPageLoading(false);
        return;
      }

      const nextCollections = (collectionsData ?? []) as CollectionRow[];
      setCollections(nextCollections);

      if (nextCollections.length === 0) {
        setCollectionItems([]);
        setPageLoading(false);
        return;
      }

      const ids = nextCollections.map((collection) => collection.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(
          'id, name, category, subtype, rarity, character, image_url, thumbnail_url, demand_score, collection_id'
        )
        .in('collection_id', ids);

      if (!active) return;

      if (itemsError) {
        setError(itemsError.message);
        setCollectionItems([]);
        setPageLoading(false);
        return;
      }

      setCollectionItems((itemsData ?? []) as ItemRow[]);
      setPageLoading(false);
    };

    void loadPage();

    return () => {
      active = false;
    };
  }, [collectionId]);

  const collectionsWithItems = useMemo(() => {
    const grouped = collectionItems.reduce<Record<string, ItemRow[]>>((acc, item) => {
      const key = item.collection_id ?? '';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return collections.map((collection) => ({
      ...collection,
      items: sortItems(grouped[collection.id] ?? []),
    }));
  }, [collections, collectionItems]);

  const getProgress = useCallback(
    (items: ItemRow[], fallbackTotal = 0) => {
      const total = items.length || fallbackTotal;
      const owned = items.filter((item) => inventoryMap.has(item.id)).length;
      const percentage = total > 0 ? (owned / total) * 100 : 0;
      return { owned, total, percentage };
    },
    [inventoryMap]
  );

  const toggleWishlist = useCallback(
    async (itemId: string) => {
      if (!userId) {
        navigate('/login');
        return;
      }

      setWishlistPendingId(itemId);

      if (wishlistMap.has(itemId)) {
        const { error: deleteError } = await supabase
          .from('wishlist_entries')
          .delete()
          .eq('trader_id', userId)
          .eq('item_id', itemId);

        if (!deleteError) {
          setWishlistMap((prev) => {
            const next = new Map(prev);
            next.delete(itemId);
            return next;
          });
        }
      } else {
        const { error: insertError } = await supabase
          .from('wishlist_entries')
          .insert({ trader_id: userId, item_id: itemId, heart_tier: 1 });

        if (!insertError) {
          setWishlistMap((prev) => new Map(prev).set(itemId, 1));
        }
      }

      setWishlistPendingId(null);
    },
    [navigate, userId, wishlistMap]
  );

  if (!authReady || !userDataReady || pageLoading) {
    return (
      <Layout title="Collections">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#7ED7C1]" />
          <p className="text-sm text-[#2E2A2899]">Loading collections...</p>
        </div>
      </Layout>
    );
  }

  if (collectionId) {
    if (error) {
      return (
        <Layout title="Collection" showBack onBack={() => navigate('/collection')}>
          <div className="rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
            {error}
          </div>
        </Layout>
      );
    }

    if (!activeCollection) {
      return (
        <Layout title="Collection" showBack onBack={() => navigate('/collection')}>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="mb-3 h-10 w-10 text-[#2E2A2833]" />
            <p className="text-[15px] font-semibold text-[#2E2A28]">Collection not found</p>
            <button
              onClick={() => navigate('/collection')}
              className="mt-4 rounded-2xl bg-[#A5D6C8] px-4 py-2 text-sm font-semibold text-[#2E2A28]"
            >
              Back to Collections
            </button>
          </div>
        </Layout>
      );
    }

    const progress = getProgress(activeItems, activeCollection.total_items);

    return (
      <Layout title={activeCollection.name} showBack onBack={() => navigate('/collection')}>
        <div className="space-y-5 pt-2">
          <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-[linear-gradient(135deg,#F0F9F6,#E8F4F8)]">
            {activeCollection.banner_url ? (
              <img
                src={activeCollection.banner_url}
                alt={activeCollection.name}
                className="h-48 w-full object-cover opacity-35"
                loading="lazy"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center">
                <LayoutGrid className="h-10 w-10 text-[#7ED7C180]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[#2E2A2899]">
                {collectionTypeLabels[activeCollection.type] || toTitleCase(activeCollection.type)}
              </span>
              <h1 className="mt-1 text-[24px] font-bold text-[#2E2A28]">{activeCollection.name}</h1>
              {activeCollection.character ? (
                <p className="text-[13px] text-[#2E2A2899]">{activeCollection.character}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-[28px] border border-white/50 bg-white/75 p-5 backdrop-blur-sm">
            <ProgressRing percentage={progress.percentage} className="relative shrink-0" size={84} strokeWidth={6} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-[#2E2A28]">{progress.owned}</span>
                <span className="text-[13px] text-[#2E2A2899]">/ {progress.total} collected</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[rgba(46,42,40,0.08)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    progress.percentage === 100
                      ? 'bg-green-400'
                      : progress.percentage >= 50
                        ? 'bg-[#7ED7C1]'
                        : 'bg-amber-300'
                  )}
                />
              </div>
              <p className="mt-1.5 text-[12px] text-[#2E2A2899]">
                {progress.percentage === 100
                  ? 'Collection complete!'
                  : `${Math.max(progress.total - progress.owned, 0)} items remaining`}
              </p>
            </div>
          </div>

          {activeCollection.description ? (
            <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-[13px] text-[#2E2A2899]">
              {activeCollection.description}
            </div>
          ) : null}

          {activeItems.length === 0 ? (
            <div className="rounded-[28px] border border-white/40 bg-white/70 px-5 py-16 text-center">
              <Package className="mx-auto mb-3 h-8 w-8 text-[#2E2A2833]" />
              <p className="text-[15px] font-semibold text-[#2E2A28]">No items in this collection yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {activeItems.map((item) => {
                const inventoryEntry = inventoryMap.get(item.id);
                const owned = Boolean(inventoryEntry);
                const wishlistTier = wishlistMap.get(item.id) ?? 0;

                return (
                  <ItemTile
                    key={item.id}
                    item={item}
                    owned={owned}
                    quantity={inventoryEntry?.quantity ?? 0}
                    padlocked={inventoryEntry?.is_padlocked ?? false}
                    wishlistTier={wishlistTier}
                    onOpen={() => setSelectedItem(item)}
                    onToggleWishlist={() => toggleWishlist(item.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <BottomSheet
          isOpen={selectedItem !== null}
          onClose={() => setSelectedItem(null)}
          title="Item Details"
        >
          {selectedItem ? (
            <div className="space-y-5 pb-4">
              <div className="relative h-56 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#E9FAF4,#F8EEFF)]">
                {selectedItem.image_url || selectedItem.thumbnail_url ? (
                  <img
                    src={selectedItem.image_url || selectedItem.thumbnail_url || ''}
                    alt={selectedItem.name}
                    className={cn(
                      'h-full w-full object-cover',
                      !inventoryMap.has(selectedItem.id) && 'grayscale'
                    )}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-14 w-14 text-white/45" />
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <RarityBadge
                    tier={rarityTierMap[selectedItem.rarity]}
                    className="!px-2.5 !py-1 !text-[10px]"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-[20px] font-bold text-[#2E2A28]">{selectedItem.name}</h2>
                <p className="mt-1 text-[13px] text-[#2E2A2899]">
                  {toTitleCase(selectedItem.subtype)} • {selectedItem.character || 'Unknown'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={cn(
                    'rounded-2xl border p-3',
                    inventoryMap.has(selectedItem.id)
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {inventoryMap.has(selectedItem.id) ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Owned</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Missing</span>
                      </>
                    )}
                  </div>
                  {inventoryMap.get(selectedItem.id) ? (
                    <p className="mt-1 text-[12px] text-green-700">
                      Quantity {inventoryMap.get(selectedItem.id)?.quantity}
                      {inventoryMap.get(selectedItem.id)?.is_padlocked ? ' • Padlocked' : ''}
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-gray-500">Not in your inventory yet</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/70 p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#7ED7C1]" />
                    <span className="text-sm font-medium text-[#2E2A28]">Demand</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#2E2A2899]">
                    Score {selectedItem.demand_score ?? 0}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/70 p-4 text-[13px] text-[#2E2A2899]">
                <p>
                  <span className="font-semibold text-[#2E2A28]">Category:</span>{' '}
                  {toTitleCase(selectedItem.category)}
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-[#2E2A28]">Subtype:</span>{' '}
                  {toTitleCase(selectedItem.subtype)}
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-[#2E2A28]">Wishlist:</span>{' '}
                  {wishlistMap.has(selectedItem.id)
                    ? `${'♥'.repeat(wishlistMap.get(selectedItem.id) ?? 1)} saved`
                    : 'Not wishlisted'}
                </p>
              </div>

              <button
                onClick={() => void toggleWishlist(selectedItem.id)}
                disabled={wishlistPendingId === selectedItem.id}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-60',
                  wishlistMap.has(selectedItem.id)
                    ? 'border border-red-200 bg-red-50 text-red-400'
                    : 'bg-[#7ED7C1] text-white'
                )}
              >
                {wishlistPendingId === selectedItem.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn('h-4 w-4', wishlistMap.has(selectedItem.id) && 'fill-current')} />
                )}
                {wishlistMap.has(selectedItem.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          ) : null}
        </BottomSheet>
      </Layout>
    );
  }

  return (
    <Layout title="Collections">
      <div className="space-y-5 pt-2">
        <div>
          <p className="text-[14px] font-semibold text-[#2E2A28]">Track your progress across HKDV sets</p>
          <p className="mt-1 text-[12px] text-[#2E2A2899]">
            Owned items are full color. Missing ones stay grayscale until you collect them.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
            {error}
          </div>
        ) : null}

        {collectionsWithItems.length === 0 ? (
          <div className="rounded-[28px] border border-white/40 bg-white/70 px-5 py-16 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-[#2E2A2833]" />
            <p className="text-[15px] font-semibold text-[#2E2A28]">No collections available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collectionsWithItems.map((collection) => {
              const progress = getProgress(collection.items, collection.total_items);
              return (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  owned={progress.owned}
                  total={progress.total}
                  percentage={progress.percentage}
                  onOpen={() => navigate(`/collection/${collection.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
