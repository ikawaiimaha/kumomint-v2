import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, ArrowLeftRight, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
}

export default function TradeProposalPage() {
  const { partnerId } = useParams();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const [partnerItems, setPartnerItems] = useState<Item[]>([]);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedPartnerItem, setSelectedPartnerItem] = useState<string | null>(null);
  const [selectedMyItem, setSelectedMyItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadTradeData() {
      if (!user || !partnerId) return;

      // 1. Items THEY HAVE that YOU WANT
      const { data: theyHave } = await supabase
        .from('inventory')
        .select('items(*)')
        .eq('trader_id', partnerId)
        .in('item_id', (
          await supabase.from('wishlists').select('item_id').eq('trader_id', user.id)
        ).data?.map(w => w.item_id) || []);

      // 2. Items YOU HAVE that THEY WANT
      const { data: iHave } = await supabase
        .from('inventory')
        .select('items(*)')
        .eq('trader_id', user.id)
        .in('item_id', (
          await supabase.from('wishlists').select('item_id').eq('trader_id', partnerId)
        ).data?.map(w => w.item_id) || []);

      if (theyHave) setPartnerItems(theyHave.map((d: any) => d.items));
      if (iHave) setMyItems(iHave.map((d: any) => d.items));
      setLoading(false);
    }
    loadTradeData();
  }, [user, partnerId]);

  const sendProposal = async () => {
    if (!user || !partnerId || !selectedPartnerItem || !selectedMyItem) return;
    setSending(true);

    const { error } = await supabase.from('trade_proposals').insert({
      sender_id: user.id,
      receiver_id: partnerId,
      sender_item_id: selectedMyItem,
      receiver_item_id: selectedPartnerItem,
      status: 'pending'
    });

    if (!error) {
      navigate('/inbox');
    } else {
      setSending(false);
      alert("Error sending proposal. Try again!");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2.5 glass-panel bg-[#1A0B2E]/60 border-[#2D1B4E]">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Propose Trade</h1>
      </header>

      {/* Item Selection Grid */}
      <div className="space-y-10">
        
        {/* Section 1: What you want from them */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
            <Sparkles size={14} className="text-[var(--accent-blue)]" /> Select Their Item
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {partnerItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setSelectedPartnerItem(item.id)}
                className={`min-w-[120px] glass-panel p-4 flex flex-col items-center transition-all ${
                  selectedPartnerItem === item.id ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/10 scale-105' : 'bg-[#1A0B2E]/40 border-[#2D1B4E]'
                }`}
              >
                <div className="w-16 h-16 mb-2"><img src={item.image_url} className="w-full h-full object-contain" /></div>
                <span className="text-[8px] font-black uppercase truncate w-full text-center">{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex justify-center opacity-20"><ArrowLeftRight size={32} /></div>

        {/* Section 2: What you are giving them */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
            <CheckCircle2 size={14} className="text-[var(--accent-pink)]" /> Select Your Item
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {myItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setSelectedMyItem(item.id)}
                className={`min-w-[120px] glass-panel p-4 flex flex-col items-center transition-all ${
                  selectedMyItem === item.id ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 scale-105' : 'bg-[#1A0B2E]/40 border-[#2D1B4E]'
                }`}
              >
                <div className="w-16 h-16 mb-2"><img src={item.image_url} className="w-full h-full object-contain" /></div>
                <span className="text-[8px] font-black uppercase truncate w-full text-center">{item.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-32 left-6 right-6">
        <button 
          onClick={sendProposal}
          disabled={!selectedMyItem || !selectedPartnerItem || sending}
          className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl transition-all ${
            selectedMyItem && selectedPartnerItem 
              ? 'bg-[var(--accent)] text-[var(--bg-app)]' 
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] opacity-50'
          }`}
        >
          {sending ? <Sparkles className="animate-spin" size={18} /> : <Send size={18} />}
          {sending ? 'Sending Transmission...' : 'Send Trade Request'}
        </button>
      </div>
    </div>
  );
}
