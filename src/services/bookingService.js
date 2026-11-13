import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'
import { validators, validateBookingForm } from '../utils/validation.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const bookingService = {
  generateBookingCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const bytes = crypto.getRandomValues(new Uint8Array(6))
    return `BH-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`
  },

  validateVisitDate(visitDate, ticketType) {
    const dateValidation = validators.date(visitDate)
    if (!dateValidation.valid) return dateValidation
    if (visitDate < localDateString()) {
      return { valid: false, error: 'Tanggal kunjungan tidak boleh di masa lalu.' }
    }
    const day = new Date(`${visitDate}T00:00:00.000Z`).getUTCDay()
    if (day === 1) return { valid: false, error: 'Hari Senin tutup. Pilih hari lain.' }
    if (ticketType === 'weekday' && (day < 2 || day > 5)) {
      return { valid: false, error: 'Tiket weekday hanya berlaku Selasa-Jumat.' }
    }
    if (ticketType === 'weekend' && day !== 0 && day !== 6) {
      return { valid: false, error: 'Tiket weekend hanya berlaku Sabtu-Minggu.' }
    }
    return { valid: true }
  },

  async createBooking(input) {
    const formValidation = validateBookingForm(input)
    if (!formValidation.valid) {
      return { success: false, error: Object.values(formValidation.errors)[0], errors: formValidation.errors }
    }
    if (!input.ticketTypes || typeof input.ticketTypes !== 'object') {
      return { success: false, error: 'Pilih minimal satu jenis tiket.' }
    }

    const selected = Object.entries(input.ticketTypes).filter(([, ticket]) => ticket?.qty > 0)
    if (selected.length !== 1) return { success: false, error: 'Pilih satu jenis tiket sesuai tanggal kunjungan.' }
    const [ticketType, selection] = selected[0]
    if (!['weekday', 'weekend'].includes(ticketType) || !Number.isInteger(selection.qty) || selection.qty > 10) {
      return { success: false, error: 'Jumlah tiket tidak valid.' }
    }
    const dateValidation = this.validateVisitDate(input.visitDate, ticketType)
    if (!dateValidation.valid) return { success: false, error: dateValidation.error }
    const email = validators.sanitize(input.userEmail).toLowerCase()
    if (!EMAIL_PATTERN.test(email)) return { success: false, error: 'Format email tidak valid.' }

    try {
      const supabase = getSupabaseClient()
      const { data: pricing, error: pricingError } = await supabase
        .from('ticket_pricing')
        .select('price')
        .eq('ticket_type', ticketType)
        .eq('status', 'active')
        .maybeSingle()
      if (pricingError) return failure(pricingError, 'Get current ticket price')
      if (!pricing) return { success: false, error: 'Jenis tiket tidak tersedia.' }

      const price = Math.round(Number(pricing.price))
      const booking = {
        booking_code: this.generateBookingCode(),
        user_name: validators.sanitize(input.userName),
        user_email: email,
        user_phone: input.userPhone.replace(/[\s-]/g, ''),
        visit_date: input.visitDate,
        ticket_types: { [ticketType]: { qty: selection.qty, price } },
        total_amount: price * selection.qty,
        payment_status: 'pending',
      }
      const { data, error } = await supabase.from('bookings').insert(booking).select('*').single()
      if (error) return failure(error, 'Create booking')
      return { success: true, booking: data }
    } catch (error) {
      return failure(error, 'Create booking')
    }
  },

  async updatePaymentStatus(bookingId, status, midtrans = {}) {
    if (!['paid', 'failed', 'cancelled', 'refunded'].includes(status)) {
      return { success: false, error: 'Status pembayaran tidak valid.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('bookings')
        .update({
          payment_status: status,
          midtrans_transaction_id: midtrans.transactionId ?? null,
          midtrans_payment_type: midtrans.paymentType ?? null,
          payment_method: midtrans.paymentType ?? null,
        })
        .eq('booking_id', bookingId)
        .select('*')
        .single()
      if (error) return failure(error, 'Update booking payment status')
      return { success: true, booking: data }
    } catch (error) {
      return failure(error, 'Update booking payment status')
    }
  },

  async deleteBooking(bookingId) {
    try {
      const { error } = await getSupabaseClient()
        .from('bookings')
        .delete()
        .eq('booking_id', bookingId)
      if (error) return failure(error, 'Delete booking')
      return { success: true }
    } catch (error) {
      return failure(error, 'Delete booking')
    }
  },

  async expireUnusedBookings() {
    try {
      const { data, error } = await getSupabaseClient().rpc('expire_unused_bookings')
      if (error) {
        logError('Expire unused bookings', error)
        return { success: false, error: mapSupabaseError(error).message }
      }
      return { success: true, expired: Number(data ?? 0) }
    } catch (error) {
      logError('Expire unused bookings', error)
      return { success: false, error: mapSupabaseError(error).message }
    }
  },

  async cancelOwnBooking(bookingCode) {
    if (!bookingCode) return { success: false, error: 'Kode booking tidak valid.' }
    try {
      const { data, error } = await getSupabaseClient().rpc('cancel_own_booking', {
        p_booking_code: bookingCode,
      })
      if (error) {
        logError('Cancel own booking', error)
        const message = String(error.message ?? '').toLowerCase()
        if (message.includes('not found')) {
          return { success: false, error: 'Pesanan tidak ditemukan.' }
        }
        if (message.includes('not allowed')) {
          return { success: false, error: 'Anda hanya dapat membatalkan pesanan akun sendiri.' }
        }
        if (message.includes('only pending')) {
          return { success: false, error: 'Hanya pesanan yang menunggu pembayaran yang dapat dibatalkan.' }
        }
        if (message.includes('already used')) {
          return { success: false, error: 'Tiket ini sudah dipakai sehingga tidak dapat dibatalkan.' }
        }
        if (message.includes('already cancelled')) {
          return { success: false, error: 'Pesanan ini sudah dibatalkan.' }
        }
        if (message.includes('authentication required') || error.code === '42501') {
          return { success: false, error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' }
        }
        return { success: false, error: mapSupabaseError(error).message }
      }
      return { success: true, booking: data }
    } catch (error) {
      return failure(error, 'Cancel own booking')
    }
  },

  async getBookingByCode(bookingCode) {
    try {
      const { data, error } = await getSupabaseClient()
        .from('bookings')
        .select('*')
        .eq('booking_code', bookingCode)
        .maybeSingle()
      if (error) return failure(error, 'Get booking by code')
      if (!data) return { success: false, error: 'Booking tidak ditemukan.' }
      return { success: true, booking: data }
    } catch (error) {
      return failure(error, 'Get booking by code')
    }
  },

  async getUserBookings(userEmail) {
    try {
      const { data: authData, error: authError } = await getSupabaseClient().auth.getUser()
      if (authError) return failure(authError, 'Verify booking history access')
      if (authData.user?.email?.toLowerCase() !== userEmail?.toLowerCase()) {
        return { success: false, error: 'Anda hanya dapat melihat riwayat booking akun sendiri.' }
      }
      const { data, error } = await getSupabaseClient()
        .from('bookings')
        .select('*')
        .eq('user_email', authData.user.email.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) return failure(error, 'Get user bookings')
      return { success: true, bookings: data ?? [] }
    } catch (error) {
      return failure(error, 'Get user bookings')
    }
  },

  async getAllBookings(filters = {}) {
    try {
      let query = getSupabaseClient()
        .from('bookings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'cancelled') {
          query = query.or('payment_status.eq.cancelled,cancelled_at.not.is.null')
        } else {
          query = query.eq('payment_status', filters.status).is('cancelled_at', null)
        }
      }
      const searchTerm = String(filters.searchTerm ?? '').replace(/[^\p{L}\p{N}@._ -]/gu, '').trim()
      if (searchTerm) {
        query = query.or([
          `booking_code.ilike.%${searchTerm}%`,
          `user_name.ilike.%${searchTerm}%`,
          `user_email.ilike.%${searchTerm}%`,
        ].join(','))
      }
      if (filters.dateFrom) query = query.gte('visit_date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('visit_date', filters.dateTo)
      const pageSize = Math.min(Math.max(Number(filters.pageSize) || 500, 1), 1000)
      const page = Math.max(Number(filters.page) || 1, 1)
      const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1)
      if (error) return failure(error, 'Get all bookings')
      return { success: true, bookings: data ?? [], count: count ?? 0 }
    } catch (error) {
      return failure(error, 'Get all bookings')
    }
  },

  async getDashboardStats(dateFrom, dateTo) {
    try {
      const { data, error } = await getSupabaseClient().rpc('admin_booking_statistics', {
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null,
      })
      if (error) return failure(error, 'Get booking dashboard statistics')
      return { success: true, stats: data }
    } catch (error) {
      return failure(error, 'Get booking dashboard statistics')
    }
  },
}
