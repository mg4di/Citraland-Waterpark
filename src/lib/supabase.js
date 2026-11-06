import { createClient } from '@supabase/supabase-js'
import { getPublicEnvironment } from './env.js'

let client

export function getSupabaseClient() {
  if (client) return client

  const { supabaseUrl, supabaseAnonKey } = getPublicEnvironment()
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      flowType: 'pkce',
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    db: { schema: 'public' },
  })
  return client
}
