import { ArrowRightLeft, Sparkles } from 'lucide-react';
import HeartTier from './HeartTier';

// This matches the data structure returning from our Supabase SQL function
export interface MatchData {
  partner_username: string;
  partner_avatar: string;
  your_wish_item_name: string;
  your_wish_image: string;
  your_wish_heart_tier: number;
  their_wish_item_name: string;
  their_wish_image: string;
  their_wish_heart_tier: number;
}

export default function MatchCard({ match }: { match: MatchData }) {
  const isDreamMatch = match.your_wish_heart_tier === 4;

  return (
    <div className={`relative w-[300px] shrink-0 rounded-[24px] border bg-white p-4 shadow-sm transition-all hover:shadow-md ${isDreamMatch ? 'border-[#FFB5C5] shadow-[#FFB5C5]/20' : 'border-[rgba(165,214,200,0.3)]'}`}>
      
      {/* Dream Item Banner */}
      {isDreamMatch && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-[#FF98B8] to-[#FF6B9E] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm z-10 whitespace-nowrap">
          <Sparkles size={10} /> Dream Match Found!
        </div>
      )}

      {/* Partner Header */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[12px] overflow-hidden shrink-0">
          {match.partner_avatar ? <img src={match.partner_avatar} className="w-full h-full object-cover" alt="" /> : match.partner_username.charAt(0)}
        </div>
        <p className="text-[13px] font-bold text-[#2E2A28] truncate">
          {match.partner_username} <span className="text-gray-400 font-normal">wants to trade!</span>
        </p>
      </div>

      {/* The Trade Comparison */}
      <div className="bg-gray-50 rounded-[18px] p-3 flex items-center justify-between relative">
        
        {/* What You Get */}
        <div className="flex-1 flex flex-col items-center text-center min-w-0">
          <p className="text-[10px] uppercase font-bold text-[#4E927E] mb-2">You Get</p>
          <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden mb-2 shrink-0">
            <img src={match.your_wish_image} className="w-full h-full object-cover" alt="" />
          </div>
          <p className="text-[10px] font-semibold text-[#2E2A28] mb-2 truncate w-full px-1">{match.your_wish_item_name}</p>
          <HeartTier tier={match.your_wish_heart_tier} />
        </div>

        {/* Swap Icon */}
        <div className="w-8 h-8 shrink-0 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm">
          <ArrowRightLeft size={14} />
        </div>

        {/* What They Get */}
        <div className="flex-1 flex flex-col items-center text-center min-w-0">
          <p className="text-[10px] uppercase font-bold text-[#E18E47] mb-2">They Get</p>
          <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden mb-2 shrink-0">
            <img src={match.their_wish_image} className="w-full h-full object-cover" alt="" />
          </div>
          <p className="text-[10px] font-semibold text-[#2E2A28] mb-2 truncate w-full px-1">{match.their_wish_item_name}</p>
          <HeartTier tier={match.their_wish_heart_tier} />
        </div>

      </div>

      <button className="w-full mt-4 bg-[linear-gradient(135deg,#A5D6C8,#82C9B2)] text-[#2E2A28] py-2.5 rounded-[14px] font-bold text-[13px] hover:scale-[1.02] transition-transform">
        Send Trade Offer
      </button>
    </div>
  );
}
