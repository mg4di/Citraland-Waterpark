import { getPublicEnvironment } from '../lib/env.js'
import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'

const SNAP_SCRIPT_ID = 'midtrans-snap-script'
let snapScriptPromise

function failure(error, context, fallback = 'Pembayaran gagal diinisialisasi. Silakan coba lagi.') {
  logError(context, error)
  return { success: false, error: fallback || error?.message }
}

async function getFunctionErrorMessage(error, fallback) {
  const response = error?.context
  if (response && typeof response.clone === 'function') {
    try {
      const body = await response.clone().json()
      if (typeof body?.error === 'string' && body.error.trim()) return body.error
      if (typeof body?.message === 'string' && body.message.trim()) return body.message
    } catch {
      // Some gateway errors are plain text instead of JSON.
    }

    if (response.status === 404) {
      return 'Edge Function pembayaran belum di-deploy ke proyek Supabase.'
    }
    if (response.status === 401 || response.status === 403) {
      return 'Permintaan ditolak Supabase. Periksa konfigurasi dan deployment Edge Function.'
    }
  }
  if (error?.name === 'FunctionsFetchError') {
    return 'Tidak dapat terhubung ke Edge Function Supabase. Periksa koneksi dan URL proyek.'
  }
  return fallback
}

export const paymentService = {
  loadSnapScript() {
    if (window.snap?.pay) return Promise.resolve()
    if (snapScriptPromise) return snapScriptPromise

    let config
    try {
      config = getPublicEnvironment()
    } catch (error) {
      return Promise.reject(error)
    }

    snapScriptPromise = new Promise((resolve, reject) => {
      let script = document.getElementById(SNAP_SCRIPT_ID)
      if (script && script.dataset.clientKey !== config.midtransClientKey) {
        script.remove()
        script = null
      }

      if (script?.dataset.loaded === 'true') {
        script.remove()
        script = null
      }

      const onLoad = () => {
        window.clearTimeout(timeoutId)
        if (!window.snap?.pay) {
          script?.remove()
          reject(new Error('Script Midtrans termuat, tetapi Snap.pay tidak tersedia. Periksa client key dan mode Sandbox/Production.'))
          return
        }
        if (script) script.dataset.loaded = 'true'
        resolve()
      }
      const onError = () => {
        window.clearTimeout(timeoutId)
        script?.remove()
        reject(new Error('Gagal memuat Midtrans Snap. Periksa koneksi, domain Snap, dan konfigurasi client key.'))
      }
      const timeoutId = window.setTimeout(() => {
        script?.remove()
        reject(new Error('Waktu habis saat memuat Midtrans Snap. Periksa koneksi atau pemblokir script di browser.'))
      }, 15000)

      if (!script) {
        script = document.createElement('script')
        script.id = SNAP_SCRIPT_ID
        script.src = config.midtransIsSandbox
          ? 'https://app.sandbox.midtrans.com/snap/snap.js'
          : 'https://app.midtrans.com/snap/snap.js'
        script.dataset.clientKey = config.midtransClientKey
        script.async = true
      }
      script.addEventListener('load', onLoad, { once: true })
      script.addEventListener('error', onError, { once: true })
      if (!script.isConnected) document.head.appendChild(script)
      if (window.snap?.pay) onLoad()
    }).catch((error) => {
      snapScriptPromise = undefined
      throw error
    })

    return snapScriptPromise
  },

  async createTransaction(paymentInput) {
    try {
      const { data, error } = await getSupabaseClient().functions.invoke(
        'midtrans-create-transaction',
        { body: paymentInput },
      )
      if (error) {
        logError('Create Midtrans transaction', error)
        return {
          success: false,
          error: data?.error ?? await getFunctionErrorMessage(
            error,
            'Edge Function gagal membuat transaksi. Periksa secret Midtrans dan log Supabase.',
          ),
        }
      }
      if (!data?.success || !data.snap_token || !data.booking_code) {
        return { success: false, error: data?.error ?? 'Pembayaran gagal diinisialisasi. Silakan coba lagi.' }
      }
      return {
        success: true,
        snap_token: data.snap_token,
        redirect_url: data.redirect_url,
        booking_code: data.booking_code,
        booking_id: data.booking_id,
        total_amount: data.total_amount,
      }
    } catch (error) {
      const mapped = mapSupabaseError(error)
      return failure(error, 'Create Midtrans transaction', mapped.message)
    }
  },

  async resumeTransaction(bookingCode) {
    try {
      const { data, error } = await getSupabaseClient().functions.invoke(
        'midtrans-resume-transaction',
        { body: { bookingCode } },
      )
      if (error) {
        logError('Resume Midtrans transaction', error)
        return {
          success: false,
          error: data?.error ?? await getFunctionErrorMessage(
            error,
            'Gagal melanjutkan pembayaran. Silakan coba lagi.',
          ),
        }
      }
      if (!data?.success || !data.snap_token || !data.booking_code) {
        return { success: false, error: data?.error ?? 'Gagal melanjutkan pembayaran. Silakan coba lagi.' }
      }
      return {
        success: true,
        snap_token: data.snap_token,
        redirect_url: data.redirect_url,
        booking_code: data.booking_code,
        booking_id: data.booking_id,
        total_amount: data.total_amount,
      }
    } catch (error) {
      const mapped = mapSupabaseError(error)
      return failure(error, 'Resume Midtrans transaction', mapped.message)
    }
  },

  async getBookingStatus(bookingCode, email) {
    try {
      const { data, error } = await getSupabaseClient().functions.invoke('booking-status', {
        body: { bookingCode, email },
      })
      if (error) {
        logError('Get booking payment status', error)
        return {
          success: false,
          error: data?.error ?? await getFunctionErrorMessage(error, 'Gagal memeriksa status pembayaran.'),
        }
      }
      return { success: true, payment_status: data.payment_status }
    } catch (error) {
      return failure(error, 'Get booking payment status', 'Gagal memeriksa status pembayaran.')
    }
  },

  async pollBookingStatus(bookingCode, email, options = {}) {
    const maxAttempts = Math.min(Math.max(options.maxAttempts ?? 30, 1), 60)
    const intervalMs = Math.max(options.intervalMs ?? 2000, 500)
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (options.signal?.aborted) return { success: false, error: 'Pemeriksaan status dibatalkan.' }
      const result = await this.getBookingStatus(bookingCode, email)
      if (result.success && result.payment_status !== 'pending') return result
      if (!result.success) return result
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
    return { success: true, payment_status: 'pending', timedOut: true }
  },

  async displaySnapPopup(snapToken, callbacks = {}) {
    await this.loadSnapScript()
    if (!window.snap?.pay) throw new Error('Midtrans Snap tidak tersedia setelah script dimuat.')
    window.snap.pay(snapToken, {
      onSuccess: (result) => callbacks.onSuccess?.(result),
      onPending: (result) => callbacks.onPending?.(result),
      onError: (result) => callbacks.onError?.(result),
      onClose: () => callbacks.onClose?.(),
    })
  },

  async initiatePayment(paymentInput, callbacks = {}) {
    const transaction = await this.createTransaction(paymentInput)
    if (!transaction.success) {
      callbacks.onError?.(transaction.error)
      return transaction
    }
    try {
      await this.displaySnapPopup(transaction.snap_token, {
        onSuccess: (result) => callbacks.onSuccess?.(transaction, result),
        onPending: (result) => callbacks.onPending?.(transaction, result),
        onError: (result) => callbacks.onError?.('Pembayaran gagal. Silakan coba lagi.', result),
        onClose: () => callbacks.onClose?.(transaction),
      })
      return transaction
    } catch (error) {
      logError('Display Midtrans Snap popup', error)
      const message = error instanceof Error
        ? error.message
        : 'Pembayaran gagal diinisialisasi. Silakan coba lagi.'
      callbacks.onError?.(message, error)
      return { success: false, error: message }
    }
  },
}
