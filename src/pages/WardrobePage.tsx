import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flower2,
  Heart,
  Lock,
  Minus,
  Mountain,
  Music,
  Package,
  Plus,
  Search,
  Shirt,
  Sofa,
  Sparkles,
  ToyBrick,
  Trash2,
  Unlock,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import BottomSheet from '@/components/BottomSheet';
import RarityBadge, { type RarityTier } from '@/components/RarityBadge';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DbRarity = 'N' | 'R' | 'S' | 'SR';
type WardrobeTab = 'inventory' | 'wishlist';

interface ItemDetails {
  id: string;
  name: string;
  category: string;
  subtype: string;
  rarity: DbRarity;
  character: string | null;
  collection_id: string | null;
  demand_score: number | null;
}

interface InventoryRow {
  id: string;
  quantity: number;
  is_padlocked: boolean;
  item_id: string;
  items: ItemDetails | ItemDetails[] | null;
}

interface WishlistRow {
  id: string;
  heart_tier: number;
  item_id: string;
  items: ItemDetails | ItemDetails[] | null;
}

interface WardrobeItem {
  id: string;
  entryId: string;
  name: string;
  category: string;
  subtype: string;
  rarityTier: RarityTier;
  character: string | null;
  collectionId: string | null;
  demandScore: number;
}

interface OwnedItem extends WardrobeItem {
  quantity: number;
  isPadlocked: boolean;
}

interface WishlistItem extends WardrobeItem {
  heartTier: number;
}

const rarityTierMap: Record<DbRarity, RarityTier> = {
  N: 'Moon',
  R: 'Star',
  S: 'Comet',
  SR: 'Galaxy',
};

const categoryGradients: Record<string, [string, string]> = {
  furniture: ['#E8F1EE', '#BFDCCE'],
  fashion: ['#F9E3EB', '#F5BCD0'],
  makeup: ['#F6E6FB', '#DCC2F4'],
  plushie: ['#E8F2FF', '#BDD7FB'],
  character: ['#FFF2DF', '#FFD7AB'],
  flower: ['#FBE5EE', '#F8C5DA'],
  terrain: ['#E6F5EA', '#B8DEBE'],
  melody: ['#ECEBFF', '#CEC9FA'],
};

function getGradient(category: string): [string, string] {
  return categoryGradients[category] ?? ['#EFEDE7', '#D7D1C6'];
}

function toTitleCase(value: string | null | undefined) {
  if (!value) return 'Unknown';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeItem(details: ItemDetails | ItemDetails[] | null) {
  if (!details) return null;
  return Array.isArray(details) ? details[0] ?? null : details;
}

function ItemIcon({ category, size = 28 }: { category: string; size?: number }) {
  const className = 'text-white/70';

  switch (category) {
    case 'furniture':
      return <Sofa size={size} className={className} />;
    case 'fashion':
      return <Shirt size={size} className={className} />;
    case 'makeup':
      return <Sparkles size={size} className={className} />;
    case 'plushie':
      return <ToyBrick size={size} className={className} />;
    case 'character':
      return <UserRound size={size} className={className} />;
    case 'flower':
      return <Flower2 size={size} className={className} />;
    case 'terrain':
      return <Mountain size={size} className={className} />;
    case 'melody':
      return <Music size={size} className={className} />;
    default:
      return <Package size={size} className={className} />;
  }
}

function ItemPreview({ item, className }: { item: WardrobeItem; className?: string }) {
  const [start, end] = getGradient(item.category);

  return (
    <div
      className={cn('flex items-center justify-center rounded-2xl', className)}
      style={{ background: `linear-gradient(135deg, ${start}, ${end})` }}
    >
      <ItemIcon category={item.category} size={36} />
    </div>
  );
}

function Hearts({
  heartTier,
  onClick,
}: {
  heartTier: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-0.5"
      disabled={!onClick}
    >
      {[1, 2, 3].map((value) => (
        <Heart
          key={value}
          size={12}
          className={cn(
            value <= heartTier ? 'fill-[#FFB5C5] text-[#FFB5C5]' : 'text-[#2E2A282A]'
          )}
        />
      ))}
    </button>
  );
}

export default function WardrobePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<OwnedItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [tab, setTab] = useState<WardrobeTab>('inventory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedOwned, setSelectedOwned] = useState<OwnedItem | null>(null);
  const [selectedWanted, setSelectedWanted] = useState<WishlistItem | null>(null);
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);

  const loadWardrobe = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setUserId(null);
      setInventory([]);
      setWishlist([]);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const [inventoryResult, wishlistResult] = await Promise.all([
      supabase
        .from('trader_inventory')
        .select('id, quantity, is_padlocked, item_id, items(id, name, category, subtype, rarity, character, collection_id, demand_score)')
        .eq('trader_id', user.id)
        .order('acquired_at', { ascending: false }),
      supabase
        .from('wishlist_entries')
        .select('id, heart_tier, item_id, items(id, name, category, subtype, rarity, character, collection_id, demand_score)')
        .eq('trader_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (inventoryResult.error) {
      setError(inventoryResult.error.message);
      setLoading(false);
      return;
    }

    if (wishlistResult.error) {
      setError(wishlistResult.error.message);
      setLoading(false);
      return;
    }

    setInventory(
      ((inventoryResult.data ?? []) as InventoryRow[])
        .map((row) => {
          const details = normalizeItem(row.items);
          if (!details) return null;

          return {
            id: details.id,
            entryId: row.id,
            name: details.name,
            category: details.category,
            subtype: details.subtype,
            rarityTier: rarityTierMap[details.rarity],
            character: details.character,
            collectionId: details.collection_id,
            demandScore: details.demand_score ?? 0,
            quantity: row.quantity,
            isPadlocked: row.is_padlocked,
          };
        })
        .filter((item): item is OwnedItem => item !== null)
    );

    setWishlist(
      ((wishlistResult.data ?? []) as WishlistRow[])
        .map((row) => {
          const details = normalizeItem(row.items);
          if (!details) return null;

          return {
            id: details.id,
            entryId: row.id,
            name: details.name,
            category: details.category,
            subtype: details.subtype,
            rarityTier: rarityTierMap[details.rarity],
            character: details.character,
            collectionId: details.collection_id,
            demandScore: details.demand_score ?? 0,
            heartTier: row.heart_tier,
          };
        })
        .filter((item): item is WishlistItem => item !== null)
    );

    setLoading(false);
  };

  useEffect(() => {
    void loadWardrobe();
  }, []);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inventory;

    return inventory.filter((item) =>
      [item.name, item.category, item.subtype, item.character ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [inventory, search]);

  const filteredWishlist = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...wishlist].sort((left, right) => right.heartTier - left.heartTier);

    if (!query) return sorted;

    return sorted.filter((item) =>
      [item.name, item.category, item.subtype, item.character ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, wishlist]);

  const changeQuantity = async (entryId: string, currentQuantity: number, delta: number) => {
    const nextQuantity = currentQuantity + delta;
    setPendingEntryId(entryId);

    const result =
      nextQuantity <= 0
        ? await supabase.from('trader_inventory').delete().eq('id', entryId)
        : await supabase.from('trader_inventory').update({ quantity: nextQuantity }).eq('id', entryId);

    if (result.error) {
      setError(result.error.message);
    } else {
      setInventory((previous) =>
        previous
          .map((item) => (item.entryId === entryId ? { ...item, quantity: nextQuantity } : item))
          .filter((item) => item.quantity > 0)
      );
      setSelectedOwned((previous) =>
        previous && previous.entryId === entryId
          ? nextQuantity > 0
            ? { ...previous, quantity: nextQuantity }
            : null
          : previous
      );
    }

    setPendingEntryId(null);
  };

  const togglePadlock = async (entryId: string, isPadlocked: boolean) => {
    setPendingEntryId(entryId);

    const result = await supabase
      .from('trader_inventory')
      .update({ is_padlocked: !isPadlocked })
      .eq('id', entryId);

    if (result.error) {
      setError(result.error.message);
    } else {
      setInventory((previous) =>
        previous.map((item) =>
          item.entryId === entryId ? { ...item, isPadlocked: !isPadlocked } : item
        )
      );
      setSelectedOwned((previous) =>
        previous && previous.entryId === entryId
          ? { ...previous, isPadlocked: !isPadlocked }
          : previous
      );
    }

    setPendingEntryId(null);
  };

  const removeWishlistItem = async (entryId: string) => {
    setPendingEntryId(entryId);
    const result = await supabase.from('wishlist_entries').delete().eq('id', entryId);

    if (result.error) {
      setError(result.error.message);
    } else {
      setWishlist((previous) => previous.filter((item) => item.entryId !== entryId));
      setSelectedWanted((previous) =>
        previous && previous.entryId === entryId ? null : previous
      );
    }

    setPendingEntryId(null);
  };

  const cycleHeartTier = async (entryId: string, currentTier: number) => {
    const nextTier = currentTier >= 3 ? 1 : currentTier + 1;
    setPendingEntryId(entryId);

    const result = await supabase
      .from('wishlist_entries')
      .update({ heart_tier: nextTier })
      .eq('id', entryId);

    if (result.error) {
      setError(result.error.message);
    } else {
      setWishlist((previous) =>
        previous.map((item) =>
          item.entryId === entryId ? { ...item, heartTier: nextTier } : item
        )
      );
      setSelectedWanted((previous) =>
        previous && previous.entryId === entryId ? { ...previous, heartTier: nextTier } : previous
      );
    }

    setPendingEntryId(null);
  };

  const markWantedAsOwned = async (item: WishlistItem) => {
    if (!userId) return;
    setPendingEntryId(item.entryId);

    const currentInventory = await supabase
      .from('trader_inventory')
      .select('id, quantity')
      .eq('trader_id', userId)
      .eq('item_id', item.id)
      .maybeSingle();

    if (currentInventory.error) {
      setError(currentInventory.error.message);
      setPendingEntryId(null);
      return;
    }

    const inventoryWrite = currentInventory.data
      ? await supabase
          .from('trader_inventory')
          .update({ quantity: currentInventory.data.quantity + 1 })
          .eq('id', currentInventory.data.id)
      : await supabase.from('trader_inventory').insert({
          trader_id: userId,
          item_id: item.id,
          quantity: 1,
        });

    if (inventoryWrite.error) {
      setError(inventoryWrite.error.message);
      setPendingEntryId(null);
      return;
    }

    const wishlistDelete = await supabase.from('wishlist_entries').delete().eq('id', item.entryId);
    if (wishlistDelete.error) {
      setError(wishlistDelete.error.message);
      setPendingEntryId(null);
      return;
    }

    await loadWardrobe();
    setSelectedWanted(null);
    setPendingEntryId(null);
  };

  if (!loading && !userId) {
    return (
      <Layout title="My Wardrobe" showNav={false}>
        <div className="pt-10">
          <div className="rounded-[28px] bg-white/[0.78] border border-[rgba(165,214,200,0.18)] px-5 py-10 text-center">
            <Package size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
            <p className="text-[16px] font-semibold text-[#2E2A28]">Sign in to manage your wardrobe.</p>
            <p className="mt-1 text-[13px] text-[#2E2A2899]">
              Inventory, padlocks, and wishlist hearts are tied to your trader account.
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
    <Layout title="My Wardrobe">
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white/[0.75] border border-[rgba(165,214,200,0.16)] px-4 py-4">
            <p className="text-[12px] text-[#2E2A2899]">Inventory</p>
            <p className="mt-1 text-[24px] font-bold text-[#2E2A28]">{inventory.length}</p>
            <p className="text-[12px] text-[#2E2A2899]">
              {inventory.filter((item) => item.quantity > 1).length} duplicates
            </p>
          </div>
          <div className="rounded-[24px] bg-white/[0.75] border border-[rgba(165,214,200,0.16)] px-4 py-4">
            <p className="text-[12px] text-[#2E2A2899]">Wishlist</p>
            <p className="mt-1 text-[24px] font-bold text-[#2E2A28]">{wishlist.length}</p>
            <p className="text-[12px] text-[#2E2A2899]">
              {wishlist.filter((item) => item.heartTier === 3).length} top priority
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.75] p-1 border border-[rgba(165,214,200,0.18)] flex">
          <button
            onClick={() => setTab('inventory')}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-[14px] font-semibold transition-colors',
              tab === 'inventory' ? 'bg-[#A5D6C8] text-[#2E2A28]' : 'text-[#2E2A2899]'
            )}
          >
            My Items
          </button>
          <button
            onClick={() => setTab('wishlist')}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-[14px] font-semibold transition-colors',
              tab === 'wishlist' ? 'bg-[#A5D6C8] text-[#2E2A28]' : 'text-[#2E2A2899]'
            )}
          >
            Wishlist
          </button>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-white/[0.75] px-4 py-3 border border-[rgba(165,214,200,0.2)]">
          <Search size={18} className="text-[#2E2A2866]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tab === 'inventory' ? 'Search my items...' : 'Search wishlist...'}
            className="w-full bg-transparent text-[14px] text-[#2E2A28] outline-none placeholder:text-[#2E2A2866]"
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-[rgba(239,154,154,0.3)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-56 rounded-[24px] bg-white/[0.55] border border-[rgba(165,214,200,0.15)] animate-pulse"
              />
            ))}
          </div>
        ) : tab === 'inventory' ? (
          filteredInventory.length === 0 ? (
            <div className="rounded-[28px] bg-white/[0.7] border border-[rgba(165,214,200,0.18)] px-5 py-12 text-center">
              <Package size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
              <p className="text-[15px] font-semibold text-[#2E2A28]">Your inventory is empty.</p>
              <button
                onClick={() => navigate('/catalog')}
                className="mt-4 rounded-2xl bg-[#A5D6C8] px-4 py-2.5 text-[13px] font-semibold text-[#2E2A28]"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredInventory.map((item) => (
                <motion.button
                  key={item.entryId}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOwned(item)}
                  className="text-left rounded-[24px] bg-white/[0.78] border border-[rgba(165,214,200,0.18)] p-3 shadow-[0_10px_30px_rgba(46,42,40,0.06)]"
                >
                  <div className="flex items-start justify-between">
                    <RarityBadge tier={item.rarityTier} />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void togglePadlock(item.entryId, item.isPadlocked);
                      }}
                      disabled={pendingEntryId === item.entryId}
                      className="rounded-full p-1.5 text-[#2E2A2866] disabled:opacity-50"
                    >
                      {item.isPadlocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </div>

                  <ItemPreview item={item} className="mt-3 h-28 w-full" />

                  <div className="mt-3">
                    <h3 className="line-clamp-2 text-[14px] font-semibold text-[#2E2A28]">{item.name}</h3>
                    <p className="mt-1 text-[12px] text-[#2E2A2899]">
                      {toTitleCase(item.character)} • Qty {item.quantity}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )
        ) : filteredWishlist.length === 0 ? (
          <div className="rounded-[28px] bg-white/[0.7] border border-[rgba(165,214,200,0.18)] px-5 py-12 text-center">
            <Heart size={28} className="mx-auto mb-3 text-[#FFB5C5]" />
            <p className="text-[15px] font-semibold text-[#2E2A28]">Your wishlist is empty.</p>
            <button
              onClick={() => navigate('/catalog')}
              className="mt-4 rounded-2xl bg-[#A5D6C8] px-4 py-2.5 text-[13px] font-semibold text-[#2E2A28]"
            >
              Find Items
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredWishlist.map((item) => (
              <motion.button
                key={item.entryId}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedWanted(item)}
                className="text-left rounded-[24px] bg-white/[0.78] border border-[rgba(165,214,200,0.18)] p-3 shadow-[0_10px_30px_rgba(46,42,40,0.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <RarityBadge tier={item.rarityTier} />
                  <Hearts
                    heartTier={item.heartTier}
                    onClick={() => void cycleHeartTier(item.entryId, item.heartTier)}
                  />
                </div>

                <ItemPreview item={item} className="mt-3 h-28 w-full" />

                <div className="mt-3">
                  <h3 className="line-clamp-2 text-[14px] font-semibold text-[#2E2A28]">{item.name}</h3>
                  <p className="mt-1 text-[12px] text-[#2E2A2899]">
                    {toTitleCase(item.character)} • {toTitleCase(item.subtype)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={selectedOwned !== null}
        onClose={() => setSelectedOwned(null)}
        title={selectedOwned?.name}
      >
        {selectedOwned ? (
          <div className="space-y-4">
            <ItemPreview item={selectedOwned} className="h-40 w-full" />
            <div className="rounded-2xl bg-white/[0.72] border border-[rgba(165,214,200,0.16)] p-4 space-y-2 text-[13px] text-[#2E2A2899]">
              <p>
                <span className="font-semibold text-[#2E2A28]">Character:</span> {toTitleCase(selectedOwned.character)}
              </p>
              <p>
                <span className="font-semibold text-[#2E2A28]">Collection:</span> {toTitleCase(selectedOwned.collectionId)}
              </p>
              <p>
                <span className="font-semibold text-[#2E2A28]">Demand:</span> {selectedOwned.demandScore}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/[0.72] border border-[rgba(165,214,200,0.16)] px-4 py-3">
              <span className="text-[14px] font-semibold text-[#2E2A28]">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void changeQuantity(selectedOwned.entryId, selectedOwned.quantity, -1)}
                  disabled={pendingEntryId === selectedOwned.entryId}
                  className="h-9 w-9 rounded-full bg-[#F3F0E8] flex items-center justify-center disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-[24px] text-center text-[16px] font-bold text-[#2E2A28]">
                  {selectedOwned.quantity}
                </span>
                <button
                  onClick={() => void changeQuantity(selectedOwned.entryId, selectedOwned.quantity, 1)}
                  disabled={pendingEntryId === selectedOwned.entryId}
                  className="h-9 w-9 rounded-full bg-[#A5D6C8] flex items-center justify-center text-[#2E2A28] disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => void togglePadlock(selectedOwned.entryId, selectedOwned.isPadlocked)}
                disabled={pendingEntryId === selectedOwned.entryId}
                className="rounded-2xl border border-[rgba(165,214,200,0.25)] bg-white/[0.72] px-4 py-3 text-[13px] font-semibold text-[#2E2A28] disabled:opacity-50"
              >
                {selectedOwned.isPadlocked ? 'Unlock Item' : 'Padlock Item'}
              </button>
              <button
                onClick={() => void changeQuantity(selectedOwned.entryId, 1, -1)}
                disabled={pendingEntryId === selectedOwned.entryId}
                className="rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] font-semibold text-[#9A3F52] disabled:opacity-50"
              >
                Remove Item
              </button>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        isOpen={selectedWanted !== null}
        onClose={() => setSelectedWanted(null)}
        title={selectedWanted?.name}
      >
        {selectedWanted ? (
          <div className="space-y-4">
            <ItemPreview item={selectedWanted} className="h-40 w-full" />
            <div className="rounded-2xl bg-white/[0.72] border border-[rgba(165,214,200,0.16)] p-4 space-y-2 text-[13px] text-[#2E2A2899]">
              <p>
                <span className="font-semibold text-[#2E2A28]">Character:</span> {toTitleCase(selectedWanted.character)}
              </p>
              <p>
                <span className="font-semibold text-[#2E2A28]">Collection:</span> {toTitleCase(selectedWanted.collectionId)}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2E2A28]">Priority:</span>
                <Hearts
                  heartTier={selectedWanted.heartTier}
                  onClick={() => void cycleHeartTier(selectedWanted.entryId, selectedWanted.heartTier)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => void markWantedAsOwned(selectedWanted)}
                disabled={pendingEntryId === selectedWanted.entryId}
                className="rounded-2xl bg-[#A5D6C8] px-4 py-3 text-[13px] font-semibold text-[#2E2A28] disabled:opacity-50"
              >
                Mark as Owned
              </button>
              <button
                onClick={() => void removeWishlistItem(selectedWanted.entryId)}
                disabled={pendingEntryId === selectedWanted.entryId}
                className="rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] font-semibold text-[#9A3F52] disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Trash2 size={14} />
                  Remove
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </Layout>
  );
}
