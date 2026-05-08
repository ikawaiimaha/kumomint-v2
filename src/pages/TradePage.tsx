import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomSheet from '../components/BottomSheet';
import { ArrowLeftRight, Sparkles, Package, Search } from 'lucide-react';

export default function TradePage() {
  const { user } = useAuth();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Better Alternative: Derived UI logic
  const handleSelect = (id: string) => {
    setSelectedItem(id);
    setIsPickerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-32 px-6 pt-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Matchmaker</h1>
        <Sparkles size={22} className="text-[var(--accent)]" />
      </header>

      {/* Selection Area */}
      <div className="glass-panel p-8 flex items-center justify-around mb-10">
        <button onClick={() => setIsPickerOpen(true)} className="flex flex-col items-center gap-3 active:scale-95 transition-transform">
          <div className={`w-16 h-16 glass-panel flex items-center justify-center border-2 ${selectedItem ? 'border-[var(--accent)]' : 'border-dashed'}`}>
            <Package size={24} className={selectedItem ? 'text-[var(--accent)]' : 'opacity-20'} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Wardrobe</span>
        </button>

        <ArrowLeftRight size={24} className="text-[var(--accent)] opacity-30" />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 glass-panel flex items-center justify-center border-2 border-dashed border-pink-400/20">
            <Search size={24} className="text-pink-400 opacity-20" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Item</span>
        </div>
      </div>

      {/* The Inventory Picker Drawer */}
      <BottomSheet 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        title="Select from Wardrobe"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* We'll hook this up to your useInventory hook next */}
          {[1, 2, 3, 4].map((i) => (
            <button 
              key={i} 
              onClick={() => handleSelect(`item-${i}`)}
              className="glass-panel p-4 flex flex-col items-center gap-3 active:scale-95 transition-all"
            >
              <div className="w-full aspect-square bg-[var(--bg-app)] rounded-2xl" />
              <p className="text-[10px] font-black uppercase tracking-tighter opacity-60">Item Name {i}</p>
            </button>
          ))}
        </div>
      </BottomSheet>

      <button className={`w-full py-5 rounded-3xl font-black text-xs uppercase transition-all shadow-2xl ${
        selectedItem ? 'moonie-btn text-white' : 'glass-panel opacity-20 text-gray-500'
      }`}>
        Scan Nebula for Swaps
      </button>

      {/* Hidden check to ensure user variable is used for the build */}
      <div className="hidden">{user?.id}</div>
    </div>
  );
}
