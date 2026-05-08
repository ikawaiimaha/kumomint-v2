// src/hooks/useInventory.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useInventory(userId: string | undefined) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data: items } = await supabase.from('inventory').select('*, items(*)').eq('trader_id', userId);
    setData(items || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}
