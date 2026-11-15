import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'
import { validators } from '../utils/validation.js'

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

export const usersService = {
  async getOverview({ search = '', status = 'all' } = {}) {
    try {
      const { data, error } = await getSupabaseClient().rpc('admin_users_overview', {
        p_search: String(search ?? '').trim() || null,
        p_status: status && status !== 'all' ? status : null,
      })
      if (error) return failure(error, 'Get admin users overview')
      return {
        success: true,
        stats: data?.stats ?? { total: 0, active: 0, inactive: 0, new_this_month: 0, new_prev_month: 0 },
        users: data?.users ?? [],
      }
    } catch (error) {
      return failure(error, 'Get admin users overview')
    }
  },

  async updateStatus(userId, status) {
    if (!['active', 'inactive'].includes(status)) {
      return { success: false, error: 'Status pengguna tidak valid.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('users')
        .update({ status })
        .eq('user_id', userId)
        .select('user_id, status')
        .single()
      if (error) return failure(error, 'Update user status')
      return { success: true, user: data }
    } catch (error) {
      return failure(error, 'Update user status')
    }
  },

  async updateProfile(userId, { fullName, phone }) {
    const name = validators.sanitize(fullName)
    if (!name) return { success: false, error: 'Nama lengkap wajib diisi.' }
    const normalizedPhone = String(phone ?? '').replace(/[^\d+\-\s()]/g, '').trim()
    try {
      const { data, error } = await getSupabaseClient()
        .from('users')
        .update({ full_name: name, phone: normalizedPhone || null })
        .eq('user_id', userId)
        .select('user_id, full_name, phone, status')
        .single()
      if (error) return failure(error, 'Update user profile')
      return { success: true, user: data }
    } catch (error) {
      return failure(error, 'Update user profile')
    }
  },
}
