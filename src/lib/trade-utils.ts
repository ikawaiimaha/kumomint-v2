import { supabase } from './supabase';

export const initiateTradeOffer = async (
  senderId: string,
  receiverId: string,
  senderInvId: string,
  receiverInvId: string
) => {
  // 1. Double check eligibility and padlocks
  const { data: invItem, error: invError } = await supabase
    .from('inventory')
    .select('is_padlocked, created_at')
    .eq('id', senderInvId)
    .single();

  if (invError || !invItem) throw new Error("Item not found in inventory.");
  if (invItem.is_padlocked) throw new Error("This item is padlocked and cannot be traded.");

  // 2. Enforce the 14-day rule for Direct Exchange
  const daysSinceAcquired = Math.floor(
    (new Date().getTime() - new Date(invItem.created_at).getTime()) / (1000 * 3600 * 24)
  );
  if (daysSinceAcquired < 14) throw new Error("Item is still in the 14-day lock period.");

  // 3. Insert the trade record as 'pending'
  [span_5](start_span)// No coins or fees are deducted here[span_5](end_span)
  const { data, error } = await supabase
    .from('trades')
    .insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      sender_inventory_id: senderInvId,
      receiver_inventory_id: receiverInvId,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
