// src/lib/api.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Item {
  id: string;
  name: string;
  image_url: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  main_category: string;
  sub_category: string;
  collection_type: string;
  character_tag: string;
  is_signature: boolean;
}

export const fetchCatalogItems = async ({ searchTerm = '', category = 'All', page = 0 }): Promise<Item[]> => {
  const ITEMS_PER_PAGE = 48; 
  let query = supabase.from('items').select('*');

  if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
  if (category !== 'All') query = query.eq('main_category', category);

  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
  
  return data as Item[];
};
