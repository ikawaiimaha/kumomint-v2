import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Lock, ShieldCheck, X, CheckCircle2, MessageCircleHeart } from 'lucide-react';
import { cn } from '../lib/utils';
import RarityBadge from './RarityBadge';

// --- Types ---
type Item = { id: string; name: string; rarity: 'N' | 'R' | 'S' | 'SR'; image_url: string };
type Stamp = { id: string; emoji: string; label: string };

export default function CreateOfferModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [wantedItem, setWantedItem] = useState<Item | null>(null);
  const [offeredItem, setOfferedItem] = useState<Item | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);

  // --- Mock Data ---
  const theirItems: Item[] = [
    { id: '1', name: 'Sakura Long Hair', rarity: 'SR', image_url: 'https://via.placeholder.com/150/E6DCF9' },
    { id: '2', name: 'Birdcage Rose Wall', rarity: 'S', image_url: 'https://via.placeholder.com/150/FFD6E5' },
  ];

  const myInventory: Item[] = [
    { id: '3', name: 'Dreamy Starlight Dress', rarity: 'SR', image_url: 'https://via.placeholder.com/150/E9FAF4' },
    { id: '4', name: 'Basic Floor', rarity: 'N', image_url: 'https://via.placeholder.com/150/E8ECEE' },
  ];

  const greetingStamps: Stamp[] = [
    { id: 's1', emoji: '🎀', label: 'Pretty please!' },
    { id: 's2', emoji: '✨', label: 'Dream Trade!' },
    { id: 's3', emoji: '🥺', label: 'Looking everywhere!' },
    { id: 's4', emoji: '🤝', label: 'Let\'s trade!' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2E2A28]/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-[400px] bg-[#FDFCF8] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(165,214,200,0.2)]">
          <div>
            <h2 className="text-[18px] font-bold text-[#2E2A28]">Propose Trade</h2>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#4E927E]">
              <ShieldCheck size={12} /> Safe Chat-Free Trading
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Choose What You Want */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <p className="text-[14px] font-semibold text-[#2E2A28] mb-3">Select the item you want:</p>
                <div className="grid grid-cols-2 gap-3">
                  {theirItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => { setWantedItem(item); setStep(2); }}
                      className="border border-[rgba(165,214,200,0.2)] bg-white rounded-2xl p-2 text-left hover:border-[#A5D6C8] hover:shadow-md transition-all group"
                    >
                      <div className="h-24 rounded-xl bg-gray-100 overflow-hidden mb-2 relative">
                        <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                        <div className="absolute top-1 left-1"><RarityBadge tier={item.rarity} /></div>
                      </div>
                      <p className="text-[12px] font-bold text-[#2E2A28] truncate">{item.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Choose What You Give (Strict Rarity Match) */}
            {step === 2 && wantedItem && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="bg-[#E9FAF4]/50 rounded-2xl p-3 mb-4 flex items-center justify-between border border-[#A5D6C8]/30">
                  <span className="text-[12px] text-[#2E2A2899]">Target Rarity:</span>
                  <RarityBadge tier={wantedItem.rarity} />
                </div>
                
                <p className="text-[14px] font-semibold text-[#2E2A28] mb-3">Select your offer:</p>
                <div className="grid grid-cols-2 gap-3">
                  {myInventory.map(item => {
                    const isMatch = item.rarity === wantedItem.rarity;
                    return (
                      <button 
                        key={item.id}
                        disabled={!isMatch}
                        onClick={() => { setOfferedItem(item); setStep(3); }}
                        className={cn(
                          "border rounded-2xl p-2 text-left transition-all relative overflow-hidden group",
                          isMatch ? "border-[rgba(165,214,200,0.4)] hover:border-[#A5D6C8] hover:shadow-md bg-white" : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                        )}
                      >
                        {!isMatch && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                            <Lock size={16} className="text-gray-400 mb-1" />
                            <span className="text-[10px] font-bold text-gray-500">Rarity Locked</span>
                          </div>
                        )}
                        <div className="h-24 rounded-xl bg-gray-100 overflow-hidden mb-2 relative">
                          <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                          <div className="absolute top-1 left-1"><RarityBadge tier={item.rarity} /></div>
                        </div>
                        <p className="text-[12px] font-bold text-[#2E2A28] truncate">{item.name}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: The Greeting Stamp */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#FFF4F6] rounded-full flex items-center justify-center mx-auto mb-3 text-[#FFB5C5]">
                    <MessageCircleHeart size={24} />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#2E2A28]">Add a Greeting Stamp</h3>
                  <p className="text-[12px] text-[#2E2A2899] mt-1">Make your offer stand out!</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {greetingStamps.map(stamp => (
                    <button
                      key={stamp.id}
                      onClick={() => { setSelectedStamp(stamp); setStep(4); }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[rgba(165,214,200,0.2)] bg-white hover:bg-[#E9FAF4] hover:border-[#A5D6C8] transition-all"
                    >
                      <span className="text-3xl mb-2">{stamp.emoji}</span>
                      <span className="text-[11px] font-semibold text-[#2E2A28]">{stamp.label}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => { setSelectedStamp(null); setStep(4); }}
                  className="w-full py-3 text-[13px] font-semibold text-[#2E2A2899] hover:text-[#2E2A28] transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            )}

            {/* STEP 4: The Handshake (Review) */}
            {step === 4 && wantedItem && offeredItem && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                
                {/* Stamp Preview Display */}
                {selectedStamp && (
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-[#FFF4F6] border border-[#FFB5C5]/30 px-4 py-2 rounded-full shadow-sm">
                      <span className="text-lg">{selectedStamp.emoji}</span>
                      <span className="text-[12px] font-bold text-[#9A3F52]">"{selectedStamp.label}"</span>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-[rgba(165,214,200,0.2)] rounded-[24px] p-4 shadow-sm mb-6">
                  
                  {/* Their Item */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 shadow-inner">
                      <img src={wantedItem.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[#4E927E] mb-0.5">You Receive</p>
                      <p className="text-[14px] font-bold text-[#2E2A28] truncate">{wantedItem.name}</p>
                      <RarityBadge tier={wantedItem.rarity} className="mt-1" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative h-[1px] bg-[rgba(165,214,200,0.3)] my-2">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[#A5D6C8]">
                      <ArrowRightLeft size={16} />
                    </div>
                  </div>

                  {/* Your Item */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 shadow-inner">
                      <img src={offeredItem.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[#E18E47] mb-0.5">You Give</p>
                      <p className="text-[14px] font-bold text-[#2E2A28] truncate">{offeredItem.name}</p>
                      <RarityBadge tier={offeredItem.rarity} className="mt-1" />
                    </div>
                  </div>

                </div>

                <button 
                  onClick={() => alert('Sending to Supabase...')}
                  className="w-full flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#A5D6C8,#82C9B2)] text-[#2E2A28] py-4 rounded-[20px] font-bold text-[15px] transition-transform hover:scale-[1.02] shadow-[0_14px_28px_rgba(165,214,200,0.35)]"
                >
                  <CheckCircle2 size={18} />
                  Confirm Trade Offer
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
