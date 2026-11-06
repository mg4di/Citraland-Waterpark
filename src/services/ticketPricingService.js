import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

export const ticketPricingService = {
  async getActivePricing() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('ticket_pricing')
        .select('*')
        .eq('status', 'active')
        .order('ticket_type', { ascending: true })
      if (error) return failure(error, 'Get active ticket pricing')
      return { success: true, pricing: data ?? [] }
    } catch (error) {
      return failure(error, 'Get active ticket pricing')
    }
  },

  async getAllPricing() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('ticket_pricing')
        .select('*')
        .order('ticket_type', { ascending: true })
      if (error) return failure(error, 'Get ticket pricing')
      return { success: true, pricing: data ?? [] }
    } catch (error) {
      return failure(error, 'Get ticket pricing')
    }
  },

  async getPricingByType(ticketType) {
    try {
      const { data, error } = await getSupabaseClient()
        .from('ticket_pricing')
        .select('*')
        .eq('ticket_type', ticketType)
        .eq('status', 'active')
        .maybeSingle()
      if (error) return failure(error, 'Get ticket price')
      if (!data) return { success: false, error: 'Harga tiket tidak ditemukan.' }
      return { success: true, pricing: data }
    } catch (error) {
      return failure(error, 'Get ticket price')
    }
  },

  async updatePrice(ticketId, newPrice) {
    return this.updatePricing(ticketId, { price: newPrice })
  },

  async updatePricing(ticketId, changes) {
    const updates = {}
    if (changes?.price !== undefined) {
      if (!Number.isFinite(changes.price) || changes.price < 0) {
        return { success: false, error: 'Harga tidak boleh negatif.' }
      }
      updates.price = changes.price
    }
    if (changes?.status !== undefined) {
      if (!['active', 'inactive'].includes(changes.status)) {
        return { success: false, error: 'Status harga tiket tidak valid.' }
      }
      updates.status = changes.status
    }
    if (!Object.keys(updates).length) {
      return { success: false, error: 'Tidak ada perubahan untuk disimpan.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('ticket_pricing')
        .update(updates)
        .eq('ticket_id', ticketId)
        .select('*')
        .single()
      if (error) return failure(error, 'Update ticket pricing')
      return { success: true, pricing: data }
    } catch (error) {
      return failure(error, 'Update ticket pricing')
    }
  },

  async setPricingStatus(ticketId, status) {
    if (!['active', 'inactive'].includes(status)) {
      return { success: false, error: 'Status harga tiket tidak valid.' }
    }
    return this.updatePricing(ticketId, { status })
  },
}
