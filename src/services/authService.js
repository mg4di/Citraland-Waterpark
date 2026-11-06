import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'
import { validators } from '../utils/validation.js'

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

export const authService = {
  async register(email, password, fullName) {
    const normalizedEmail = validators.sanitize(email).toLowerCase()
    const normalizedName = validators.sanitize(fullName)
    if (!normalizedName) return { success: false, error: 'Nama lengkap wajib diisi' }
    const emailValidation = validators.email(normalizedEmail)
    if (!emailValidation.valid) return { success: false, error: emailValidation.error }
    const passwordValidation = validators.password(password)
    if (!passwordValidation.valid) return { success: false, error: passwordValidation.error }

    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { full_name: normalizedName } },
      })
      if (error) return failure(error, 'User registration')
      if (!data.user) return { success: false, error: 'Gagal membuat akun. Silakan coba lagi.' }
      return { success: true, user: data.user, session: data.session ?? undefined }
    } catch (error) {
      return failure(error, 'User registration')
    }
  },

  async login(email, password, isAdmin = false) {
    const normalizedEmail = validators.sanitize(email).toLowerCase()
    const emailValidation = validators.email(normalizedEmail)
    if (!emailValidation.valid || !password) {
      return { success: false, error: 'Email atau password salah' }
    }

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (error) {
        logError(isAdmin ? 'Admin authentication' : 'User authentication', error)
        if (error.code === 'email_not_confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email akun belum dikonfirmasi. Konfirmasi email di Supabase Auth sebelum masuk.',
          }
        }
        return { success: false, error: 'Email atau password salah. Pastikan akun dibuat di proyek Supabase yang sama dengan aplikasi.' }
      }
      if (!data.user || !data.session) {
        return { success: false, error: 'Gagal masuk. Silakan coba lagi.' }
      }

      if (isAdmin) {
        const { data: admin, error: adminError } = await supabase
          .from('admin_users')
          .select('admin_id, role')
          .eq('email', normalizedEmail)
          .maybeSingle()
        if (adminError) {
          logError('Verify admin role after login', adminError)
          const { error: signOutError } = await supabase.auth.signOut()
          if (signOutError) logError('Admin login cleanup', signOutError)
          return {
            success: false,
            error: 'Login berhasil, tetapi akses admin gagal diverifikasi. Periksa migrasi dan kebijakan RLS tabel admin_users.',
          }
        }
        if (!admin) {
          const { error: signOutError } = await supabase.auth.signOut()
          if (signOutError) logError('Admin login cleanup', signOutError)
          return {
            success: false,
            error: 'Email dan password benar, tetapi email ini belum terdaftar sebagai admin di public.admin_users.',
          }
        }
        return { success: true, user: data.user, session: data.session, admin }
      }
      return { success: true, user: data.user, session: data.session }
    } catch (error) {
      return failure(error, isAdmin ? 'Admin login' : 'User login')
    }
  },

  async logout() {
    try {
      const { error } = await getSupabaseClient().auth.signOut()
      if (error) return failure(error, 'Logout')
      return { success: true }
    } catch (error) {
      return failure(error, 'Logout')
    }
  },

  async getSession() {
    try {
      const { data, error } = await getSupabaseClient().auth.getSession()
      if (error) return failure(error, 'Get session')
      return { success: true, session: data.session }
    } catch (error) {
      return failure(error, 'Get session')
    }
  },

  async getUser() {
    try {
      const { data, error } = await getSupabaseClient().auth.getUser()
      if (error) return failure(error, 'Get user')
      return { success: true, user: data.user }
    } catch (error) {
      return failure(error, 'Get user')
    }
  },

  async getAdminProfile() {
    try {
      const supabase = getSupabaseClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) return failure(authError, 'Get admin profile user')
      if (!authData.user?.email) {
        return { success: false, error: 'Sesi admin tidak ditemukan.' }
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('full_name, role')
        .eq('email', authData.user.email.toLowerCase())
        .maybeSingle()
      if (error) return failure(error, 'Get admin profile')
      if (!data) return { success: false, error: 'Profil admin tidak ditemukan.' }
      return { success: true, admin: data }
    } catch (error) {
      return failure(error, 'Get admin profile')
    }
  },

  async isAdmin() {
    try {
      const supabase = getSupabaseClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user?.email) return false
      const { data, error } = await supabase
        .from('admin_users')
        .select('admin_id')
        .eq('email', authData.user.email.toLowerCase())
        .maybeSingle()
      if (error) {
        logError('Verify admin access', error)
        return false
      }
      return Boolean(data)
    } catch (error) {
      logError('Verify admin access', error)
      return false
    }
  },

  onAuthStateChange(callback) {
    return getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null, session)
    })
  },
}
