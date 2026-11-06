import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

export const promotionService = {
  async validatePromoCode(promoCode, totalAmount = 0) {
    const code = String(promoCode ?? '').trim().toUpperCase()
    if (!code) return { success: false, error: 'Masukkan kode promo.' }
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return { success: false, error: 'Total pemesanan tidak valid.' }
    }
    try {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await getSupabaseClient()
        .from('promotions')
        .select('*')
        .eq('promo_code', code)
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle()
      if (error) return failure(error, 'Validate promotion')
      if (!data) return { success: false, error: 'Kode promo tidak valid atau sudah kedaluwarsa.' }
      const discountAmount = this.calculateDiscount(
        totalAmount,
        data.discount_type,
        Number(data.discount_amount),
      )
      return { success: true, promotion: data, discountAmount, discountedTotal: totalAmount - discountAmount }
    } catch (error) {
      return failure(error, 'Validate promotion')
    }
  },

  calculateDiscount(totalAmount, discountType, discountAmount) {
    if (!Number.isFinite(totalAmount) || totalAmount <= 0 ||
      !Number.isFinite(discountAmount) || discountAmount < 0) return 0
    if (discountType === 'percentage') {
      return Math.min(totalAmount, Math.round((totalAmount * discountAmount) / 100))
    }
    if (discountType === 'nominal') return Math.min(totalAmount, discountAmount)
    return 0
  },

  async getAllPromotions() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) return failure(error, 'Get promotions')
      return { success: true, promotions: data ?? [] }
    } catch (error) {
      return failure(error, 'Get promotions')
    }
  },

  async createPromotion(promotion) {
    const code = String(promotion?.promo_code ?? '').trim().toUpperCase()
    const discount = Number(promotion?.discount_amount)
    if (!/^[A-Z0-9_-]{2,64}$/.test(code)) return { success: false, error: 'Kode promo tidak valid.' }
    if (!['percentage', 'nominal'].includes(promotion.discount_type) ||
      !Number.isFinite(discount) || discount < 0 ||
      (promotion.discount_type === 'percentage' && discount > 100)) {
      return { success: false, error: 'Nilai diskon tidak valid.' }
    }
    if (!promotion.start_date || !promotion.end_date || promotion.end_date < promotion.start_date) {
      return { success: false, error: 'Rentang tanggal promosi tidak valid.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('promotions')
        .insert({
          promo_code: code,
          discount_type: promotion.discount_type,
          discount_amount: discount,
          start_date: promotion.start_date,
          end_date: promotion.end_date,
          status: promotion.status ?? 'active',
        })
        .select('*')
        .single()
      if (error) return failure(error, 'Create promotion')
      return { success: true, promotion: data }
    } catch (error) {
      return failure(error, 'Create promotion')
    }
  },

  async updatePromotionStatus(promoId, status) {
    if (!['active', 'inactive', 'expired'].includes(status)) {
      return { success: false, error: 'Status promosi tidak valid.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('promotions')
        .update({ status })
        .eq('promo_id', promoId)
        .select('*')
        .single()
      if (error) return failure(error, 'Update promotion status')
      return { success: true, promotion: data }
    } catch (error) {
      return failure(error, 'Update promotion status')
    }
  },
}
