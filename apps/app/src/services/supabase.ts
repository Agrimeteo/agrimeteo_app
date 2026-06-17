import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
);

export const syncSupabaseSession = async (accessToken: string, refreshToken: string) => {
  if (!isSupabaseConfigured) {
    return;
  }

  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
};
