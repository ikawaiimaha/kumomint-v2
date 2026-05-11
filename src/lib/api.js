import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const fetchCatalogItems = async ({ searchTerm = '', category = 'All', page = 0 }) => {
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
  
  return data;
};
