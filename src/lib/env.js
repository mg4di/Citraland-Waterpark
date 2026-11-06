const REQUIRED_PUBLIC_ENV = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_MIDTRANS_CLIENT_KEY',
  'VITE_MIDTRANS_IS_SANDBOX',
]

export function getPublicEnvironment() {
  const env = import.meta.env
  const missing = REQUIRED_PUBLIC_ENV.filter((key) => !env[key]?.trim())
  if (missing.length) {
    throw new Error(
      `Konfigurasi environment tidak lengkap. Isi ${missing.join(', ')} berdasarkan .env.example.`,
    )
  }
  if (!env.VITE_SUPABASE_URL.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL harus menggunakan HTTPS.')
  }
  if (!['true', 'false'].includes(env.VITE_MIDTRANS_IS_SANDBOX)) {
    throw new Error('VITE_MIDTRANS_IS_SANDBOX harus bernilai "true" atau "false".')
  }

  return {
    supabaseUrl: env.VITE_SUPABASE_URL,
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY,
    midtransClientKey: env.VITE_MIDTRANS_CLIENT_KEY,
    midtransIsSandbox: env.VITE_MIDTRANS_IS_SANDBOX === 'true',
  }
}

export function hasSupabaseEnvironment() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}
