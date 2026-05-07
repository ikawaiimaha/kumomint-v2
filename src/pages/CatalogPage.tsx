import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Flower2,
  Heart,
  LayoutGrid,
  Mountain,
  Music,
  Package,
  Plus,
  Search,
  Shirt,
  SlidersHorizontal,
  Sofa,
  Sparkles,
  ToyBrick,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import FilterChip from '@/components/FilterChip';
import BottomSheet from '@/components/BottomSheet';
import RarityBadge, { type RarityTier } from '@/components/RarityBadge';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DbRarity = 'N' | 'R' | 'S' | 'SR';
type SortMode = 'demand' | 'rarity' | 'name';

interface ItemRow {
  id: string;
  name: string;
  category: string;
  subtype: string;
  rarity: DbRarity;
  character: string | null;
  collection_id: string | null;
  demand_score: number | null;
}

interface CollectionRow {
  id: string;
  name: string;
}

interface CatalogItem extends ItemRow {
  collectionName: string;
  rarityTier: RarityTier;
  wishlisted: boolean;
}

const CATEGORY_CONFIG: Array<{
  label: string;
  value: string;
  icon: ReactNode;
}> = [
  { label: 'All', value: 'all', icon: <LayoutGrid size={16} /> },
  { label: 'Furniture', value: 'furniture', icon: <Sofa size={16} /> },
  { label: 'Fashion', value: 'fashion', icon: <Shirt size={16} /> },
  { label: 'Makeup', value: 'makeup', icon: <Sparkles size={16} /> },
  { label: 'Plushie', value: 'plushie', icon: <ToyBrick size={16} /> },
  { label: 'Character', value: 'character', icon: <UserRound size={16} /> },
  { label: 'Flower', value: 'flower', icon: <Flower2 size={16} /> },
  { label: 'Terrain', value: 'terrain', icon: <Mountain size={16} /> },
  { label: 'Melody', value: 'melody', icon: <Music size={16} /> },
];

const rarityTierMap: Record<DbRarity, RarityTier> = {
  N: 'Moon',
  R: 'Star',
  S: 'Comet',
  SR: 'Galaxy',
};

const rarityOrder: Record<DbRarity, number> = {
  SR: 0,
  S: 1,
  R: 2,
  N: 3,
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
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function demandLabel(score: number) {
  if (score >= 80) return 'High';
  if (score >= 45) return 'Medium';
  return 'Low';
}

function CategoryIcon({ category, size = 28 }: { category: string; size?: number }) {
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

function ItemPreview({ item, className }: { item: CatalogItem; className?: string }) {
  const [start, end] = getGradient(item.category);

  return (
    <div
      className={cn('flex items-center justify-center rounded-2xl', className)}
      style={{ background: `linear-gradient(135deg, ${start}, ${end})` }}
    >
      <CategoryIcon category={item.category} size={36} />
    </div>
  );
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [collections, setCollections] = useState<Record<string, string>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('demand');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      setLoading(true);
      setError(null);

      const [{ data: authData }, itemsResult, collectionsResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('items')
          .select('id, name, category, subtype, rarity, character, collection_id, demand_score')
          .order('created_at', { ascending: false }),
        supabase.from('collections').select('id, name'),
      ]);

      if (!mounted) return;

      if (itemsResult.error) {
        setError(itemsResult.error.message);
        setLoading(false);
        return;
      }

      if (collectionsResult.error) {
        setError(collectionsResult.error.message);
        setLoading(false);
        return;
      }

      const authUserId = authData.user?.id ?? null;
      setUserId(authUserId);
      setItems((itemsResult.data ?? []) as ItemRow[]);
      setCollections(
        Object.fromEntries(
          ((collectionsResult.data ?? []) as CollectionRow[]).map((entry) => [entry.id, entry.name])
        )
      );

      if (authUserId) {
        const wishlistResult = await supabase
          .from('wishlist_entries')
          .select('item_id')
          .eq('trader_id', authUserId);

        if (!mounted) return;

        if (!wishlistResult.error) {
          setWishlistedIds(
            new Set((wishlistResult.data ?? []).map((entry) => entry.item_id as string))
          );
        }
      }

      setLoading(false);
    };

    void loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  const catalogItems = useMemo<CatalogItem[]>(() => {
    const query = search.trim().toLowerCase();

    const next = items
      .map((item) => ({
        ...item,
        collectionName: collections[item.collection_id ?? ''] ?? toTitleCase(item.collection_id),
        rarityTier: rarityTierMap[item.rarity],
        wishlisted: wishlistedIds.has(item.id),
      }))
      .filter((item) => {
        const matchesCategory = category === 'all' || item.category === category;
        const haystack = [
          item.name,
          item.character ?? '',
          item.collectionName,
          toTitleCase(item.subtype),
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = !query || haystack.includes(query);

        return matchesCategory && matchesSearch;
      });

    next.sort((left, right) => {
      if (sortMode === 'name') return left.name.localeCompare(right.name);
      if (sortMode === 'rarity') return rarityOrder[left.rarity] - rarityOrder[right.rarity];
      return (right.demand_score ?? 0) - (left.demand_score ?? 0);
    });

    return next;
  }, [category, collections, items, search, sortMode, wishlistedIds]);

  const toggleWishlist = async (itemId: string) => {
    if (!userId) {
      navigate('/login');
      return;
    }

    setPendingItemId(itemId);

    const isWishlisted = wishlistedIds.has(itemId);
    const result = isWishlisted
      ? await supabase
          .from('wishlist_entries')
          .delete()
          .eq('trader_id', userId)
          .eq('item_id', itemId)
      : await supabase.from('wishlist_entries').insert({
          trader_id: userId,
          item_id: itemId,
          heart_tier: 1,
        });

    if (!result.error) {
      setWishlistedIds((previous) => {
        const next = new Set(previous);
        if (isWishlisted) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        return next;
      });
      setSelectedItem((previous) =>
        previous && previous.id === itemId
          ? { ...previous, wishlisted: !isWishlisted }
          : previous
      );
    } else {
      setError(result.error.message);
    }

    setPendingItemId(null);
  };

  const addToInventory = async (itemId: string) => {
    if (!userId) {
      navigate('/login');
      return;
    }

    setPendingItemId(itemId);

    const current = await supabase
      .from('trader_inventory')
      .select('id, quantity')
      .eq('trader_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (current.error) {
      setError(current.error.message);
      setPendingItemId(null);
      return;
    }

    const result = current.data
      ? await supabase
          .from('trader_inventory')
          .update({ quantity: (current.data.quantity ?? 0) + 1 })
          .eq('id', current.data.id)
      : await supabase.from('trader_inventory').insert({
          trader_id: userId,
          item_id: itemId,
          quantity: 1,
        });

    if (result.error) {
      setError(result.error.message);
    }

    setPendingItemId(null);
  };

  return (
    <Layout title="Catalog">
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-3 rounded-2xl bg-white/[0.75] px-4 py-3 border border-[rgba(165,214,200,0.2)]">
            <Search size={18} className="text-[#2E2A2866]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search items, collections, characters..."
              className="w-full bg-transparent text-[14px] text-[#2E2A28] outline-none placeholder:text-[#2E2A2866]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[#2E2A2866]"
              >
                <X size={16} />
              </button>
            ) : null}
          </label>

          <button
            onClick={() => setFilterOpen(true)}
            className="h-12 w-12 rounded-2xl bg-white/[0.75] border border-[rgba(165,214,200,0.2)] flex items-center justify-center text-[#2E2A28]"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_CONFIG.map((entry) => (
            <FilterChip
              key={entry.value}
              label={entry.label}
              active={category === entry.value}
              onClick={() => setCategory(entry.value)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[13px] text-[#2E2A2899]">
          <span>{catalogItems.length} items</span>
          <span>Sort: {toTitleCase(sortMode)}</span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(239,154,154,0.3)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-56 rounded-[24px] bg-white/[0.55] border border-[rgba(165,214,200,0.15)] animate-pulse"
              />
            ))}
          </div>
        ) : catalogItems.length === 0 ? (
          <div className="rounded-[28px] bg-white/[0.7] border border-[rgba(165,214,200,0.18)] px-5 py-12 text-center">
            <Package size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
            <p className="text-[15px] font-semibold text-[#2E2A28]">No items match this filter.</p>
            <p className="mt-1 text-[13px] text-[#2E2A2899]">Try another category or clear the search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {catalogItems.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className="text-left rounded-[24px] bg-white/[0.78] border border-[rgba(165,214,200,0.18)] p-3 shadow-[0_10px_30px_rgba(46,42,40,0.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <RarityBadge tier={item.rarityTier} />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void toggleWishlist(item.id);
                    }}
                    disabled={pendingItemId === item.id}
                    className="rounded-full p-1.5 text-[#FFB5C5] disabled:opacity-50"
                  >
                    <Heart
                      size={16}
                      className={cn(item.wishlisted && 'fill-[#FFB5C5]')}
                    />
                  </button>
                </div>

                <ItemPreview item={item} className="mt-3 h-28 w-full" />

                <div className="mt-3 space-y-1">
                  <h3 className="line-clamp-2 text-[14px] font-semibold text-[#2E2A28]">{item.name}</h3>
                  <p className="text-[12px] text-[#2E2A2899]">
                    {item.collectionName} • {toTitleCase(item.character)}
                  </p>
                  <p className="text-[12px] text-[#2E2A2899]">
                    {toTitleCase(item.subtype)} • {demandLabel(item.demand_score ?? 0)} demand
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void addToInventory(item.id);
                  }}
                  disabled={pendingItemId === item.id}
                  className="mt-3 w-full rounded-2xl bg-[#A5D6C8] px-3 py-2 text-[13px] font-semibold text-[#2E2A28] disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Plus size={14} />
                    I Have This
                  </span>
                </button>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <BottomSheet isOpen={filterOpen} onClose={() => setFilterOpen(false)} title="Sort Catalog">
        <div className="space-y-2">
          {[
            ['demand', 'Highest demand first'],
            ['rarity', 'Rarest items first'],
            ['name', 'Alphabetical'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setSortMode(value as SortMode);
                setFilterOpen(false);
              }}
              className={cn(
                'w-full rounded-2xl border px-4 py-3 text-left text-[14px] font-medium',
                sortMode === value
                  ? 'border-transparent bg-[#A5D6C8] text-[#2E2A28]'
                  : 'border-[rgba(165,214,200,0.18)] bg-white/[0.7] text-[#2E2A28]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name}
      >
        {selectedItem ? (
          <div className="space-y-4">
            <ItemPreview item={selectedItem} className="h-40 w-full" />

            <div className="flex flex-wrap gap-2">
              <RarityBadge tier={selectedItem.rarityTier} />
              <span className="rounded-full bg-white/[0.8] px-3 py-1 text-[12px] text-[#2E2A2899] border border-[rgba(165,214,200,0.18)]">
                {toTitleCase(selectedItem.category)}
              </span>
              <span className="rounded-full bg-white/[0.8] px-3 py-1 text-[12px] text-[#2E2A2899] border border-[rgba(165,214,200,0.18)]">
                {toTitleCase(selectedItem.subtype)}
              </span>
            </div>

            <div className="rounded-2xl bg-white/[0.72] border border-[rgba(165,214,200,0.16)] p-4 space-y-2 text-[13px] text-[#2E2A2899]">
              <p>
                <span className="font-semibold text-[#2E2A28]">Collection:</span> {selectedItem.collectionName}
              </p>
              <p>
                <span className="font-semibold text-[#2E2A28]">Character:</span> {toTitleCase(selectedItem.character)}
              </p>
              <p>
                <span className="font-semibold text-[#2E2A28]">Demand:</span>{' '}
                {demandLabel(selectedItem.demand_score ?? 0)} ({selectedItem.demand_score ?? 0})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => void toggleWishlist(selectedItem.id)}
                disabled={pendingItemId === selectedItem.id}
                className="rounded-2xl border border-[rgba(255,181,197,0.35)] bg-[rgba(255,181,197,0.14)] px-4 py-3 text-[13px] font-semibold text-[#9A3F52] disabled:opacity-50"
              >
                {selectedItem.wishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
              </button>
              <button
                onClick={() => void addToInventory(selectedItem.id)}
                disabled={pendingItemId === selectedItem.id}
                className="rounded-2xl bg-[#A5D6C8] px-4 py-3 text-[13px] font-semibold text-[#2E2A28] disabled:opacity-50"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </Layout>
  );
}
