import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Filter, Heart, Package, LogIn, X, ArrowRightLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Defining our types based on your Supabase structure
interface DbItem {
  id: string;
  name: string;
  image_url?: string;
  rarity?: string;
  set_name?: string;
}

interface InventoryEntry {
  id: string;
  items: DbItem;
  quantity?: number;
}

export default function WardrobePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryEntry | null>(null);

  // 1. Fetch Inventory from Supabase
  const fetchInventory = useCallback(async () => {
    if (!user) {
      setFetching(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*, items(*)')
        .eq('trader_id', user.id);
        
      if (error) throw error;
      if (data) setInventory(data as unknown as InventoryEntry[]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchInventory();
    }
  }, [authLoading, fetchInventory]);

  // 2. UI Helpers for Rarity Styles
  const getRarityStyles = (rarity?: string) => {
    if (resolvedTheme === 'light' || !rarity) return ''; 
    switch (rarity.toUpperCase()) {
      case 'SR': return 'shadow-[0_0_24px_rgba(232,107,179,0.4)] border-[#FF6BB3]/50'; 
      case 'S': return 'shadow-[0_0_16px_rgba(155,89,182,0.3)] border-[#C175E6]/50'; 
      case 'R': return 'shadow-[0_0_12px_rgba(255,215,0,0.2)] border-[#FFE44D]/50'; 
      case 'N': return 'shadow-[0_0_8px_rgba(192,192,192,0.1)] border-[#A0A0A0]/30'; 
      default: return '';
    }
  };

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'text-[var(--text-muted)]';
    switch (rarity.toUpperCase()) {
      case 'SR': return 'text-[#E84393] dark:text-[#FF6BB3]';
      case 'S': return 'text-[#9B59B6] dark:text-[#C175E6]';
      case 'R': return 'text-[#F39C12] dark:text-[#FFE44D]';
      case 'N': return 'text-[var(--text-muted)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  // 3. Filter Logic
  const filteredInventory = inventory.filter(entry => {
    const itemName = entry.items?.name || '';
    const itemSet = entry.items?.set_name || '';
    return itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           itemSet.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // --- RENDER STATES ---

  if (authLoading || fetching) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center transition-colors duration-500">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-10 text-center transition-colors duration-500">
      <Package size={64} className="text-[var(--border-subtle)] mb-6" />
      <h2 className="text-2xl font-black text-[var(--text-main)] mb-6 tracking-tight">Wardrobe Locked</h2>
      <button 
        onClick={() => navigate('/login')} 
        className="bg-[var(--accent)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
      >
        <LogIn size={16} /> Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-6 bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 relative">
      
      {/* Search and Filter Header */}
      <header className="mb-6 sticky top-4 z-20">
        <div className="glass-panel flex items-center p-3 gap-3 shadow-lg shadow-[var(--shadow-card)]">
          <Search size={20} className="text-[var(--text-muted)] ml-2 shrink-0" />
          <input 
            type="text"
            placeholder="Search your orbit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-bold text-sm placeholder:text-[var(--text-muted)] w-full text-[var(--text-main)]"
          />
          <button className="p-2 bg-[var(--bg-app)]/50 rounded-xl text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 text-[var(--text-muted)]">
            <Package size={16} /> My Items
          </h2>
          <span className="text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] px-2.5 py-1 rounded-full border border-[var(--accent)]/20">
            {inventory.length} Total
          </span>
        </div>

        {/* Dynamic Grid vs Empty State */}
        {filteredInventory.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {filteredInventory.map((entry) => {
              const item = entry.items;
              if (!item) return null; // Safety check

              return (
                <div 
                  key={entry.id} 
                  onClick={() => setSelectedItem(entry)}
                  className={`glass-panel p-4 flex flex-col items-center text-center relative group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${getRarityStyles(item.rarity)}`}
                >
                  {/* Rarity Badge & Quantity */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getRarityColor(item.rarity)}`}>
                      {item.rarity || 'N'}
                    </span>
                  </div>
                  
                  {/* Show quantity if more than 1 */}
                  {(entry.quantity && entry.quantity > 1) && (
                    <div className="absolute top-3 right-3 text-[10px] font-black bg-[var(--accent-green)]/20 text-[var(--accent-green)] px-1.5 py-0.5 rounded-md border border-[var(--accent-green)]/30">
                      x{entry.quantity}
                    </div>
                  )}

                  {/* Image Rendering */}
                  <div className="w-20 h-20 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] flex items-center justify-center text-4xl mb-3 mt-4 group-hover:scale-105 transition-transform overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-[var(--text-muted)]/50" />
                    )}
                  </div>

                  <h3 className="font-black text-xs leading-tight mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] line-clamp-1">
                    {item.set_name || 'Mystery Set'}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <img src="/kumo-sad.png" alt="Empty" className="w-24 h-24 mb-4 drop-shadow-lg opacity-60 grayscale" />
            <p className="font-black uppercase tracking-widest text-[10px] text-[var(--text-muted)]">No items match your search</p>
          </div>
        )}
      </main>

      {/* OVERLAY & BOTTOM SHEET MODAL */}
      {selectedItem && selectedItem.items && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedItem(null)}
          />
          
          <div className="relative glass-panel rounded-b-none rounded-t-[32px] p-6 pb-12 animate-in slide-in-from-bottom-full duration-300 border-b-0 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 p-2 bg-[var(--bg-app)]/50 text-[var(--text-muted)] rounded-full hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mt-2 text-center">
              
              <div className={`w-32 h-32 rounded-3xl bg-[var(--bg-app)]/60 border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden mb-6 shadow-xl ${getRarityStyles(selectedItem.items.rarity)}`}>
                {selectedItem.items.image_url ? (
                   <img src={selectedItem.items.image_url} alt={selectedItem.items.name} className="w-full h-full object-cover" />
                ) : (
                   <Package size={48} className="text-[var(--text-muted)]/50" />
                )}
              </div>
              
              <span className={`text-xs font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-[var(--bg-app)] ${getRarityColor(selectedItem.items.rarity)}`}>
                {selectedItem.items.rarity || 'N'} TIER
              </span>
              
              <h2 className="text-2xl font-black mb-1">{selectedItem.items.name}</h2>
              
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[var(--accent-pink)]"/> 
                {selectedItem.items.set_name || 'Mystery Set'}
              </p>

              {/* Action Buttons */}
              <div className="w-full flex gap-3 mt-8">
                <button className="flex-1 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-2xl font-black text-xs uppercase shadow-sm flex justify-center items-center gap-2 hover:bg-[var(--bg-secondary)] transition-colors">
                  <ArrowRightLeft size={16} className="text-[var(--accent)]" />
                  Trade
                </button>
                <button className="flex-1 py-4 bg-[var(--accent-green)] text-[#1A1A1A] rounded-2xl font-black text-xs uppercase shadow-lg shadow-[var(--accent-green)]/30 flex justify-center items-center hover:opacity-90 transition-opacity">
                  Equip
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
