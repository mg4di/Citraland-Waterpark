import { createClient } from '@supabase/supabase-js';
import { getPublicEnvironment } from './env.js';

let client;

export function getSupabaseClient() {
  if (client) return client;

  const { supabaseUrl, supabaseAnonKey } = getPublicEnvironment();
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      // Implicit: tautan reset dari email berisi token di URL, bukan kode PKCE
      // yang butuh verifier di browser peminta. Dengan begitu tautan tetap
      // berlaku saat dibuka dari aplikasi Gmail atau browser/perangkat lain.
      flowType: 'implicit',
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    db: { schema: 'public' },
  });
  return client;
}
