import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ruwwjeyodhjzlcaymsjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3dqZXlvZGhqemxjYXltc2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTQxOTIsImV4cCI6MjA5MzM3MDE5Mn0.2PgereVNrN05WIJAINOmPxZHFS8zQyqX5VgalcipiAo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getTraderProfile(userId: string) {
  const { data, error } = await supabase
    .from('traders')
    .select('id, username, display_name, role')
    .eq('id', userId)
    .maybeSingle();

  return { data, error };
}