import { getSupabaseClient } from '../lib/supabase.js'
import { logError } from '../utils/errorHandler.js'

export class RealtimeManager {
  channels = new Map()
  retries = new Map()

  subscribe(channelName, table, callback, options = {}) {
    this.unsubscribe(channelName)
    const channel = getSupabaseClient()
      .channel(channelName)
      .on('postgres_changes', {
        event: options.event ?? '*',
        schema: 'public',
        table,
        ...(options.filter ? { filter: options.filter } : {}),
      }, callback)
      .subscribe((status, error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          logError(`Realtime subscription ${channelName}`, error ?? new Error(status))
          this.scheduleRetry(channelName, table, callback, options)
        } else if (status === 'SUBSCRIBED') {
          this.clearRetry(channelName)
        }
      })
    this.channels.set(channelName, channel)
    return () => this.unsubscribe(channelName)
  }

  scheduleRetry(channelName, table, callback, options) {
    if (this.retries.has(channelName)) return
    const attempt = (options.retryAttempt ?? 0) + 1
    if (attempt > 3) {
      console.error(`Realtime subscription ${channelName} stopped after 3 retries.`)
      return
    }
    const timer = setTimeout(() => {
      this.retries.delete(channelName)
      this.unsubscribe(channelName)
      this.subscribe(channelName, table, callback, { ...options, retryAttempt: attempt })
    }, Math.min(1000 * (2 ** (attempt - 1)), 8000))
    this.retries.set(channelName, timer)
  }

  clearRetry(channelName) {
    const timer = this.retries.get(channelName)
    if (timer) clearTimeout(timer)
    this.retries.delete(channelName)
  }

  subscribeToBookings(callback) {
    return this.subscribe('bookings_changes', 'bookings', callback)
  }

  subscribeToTicketPricing(callback, channelName = 'ticket_pricing_changes') {
    return this.subscribe(channelName, 'ticket_pricing', callback)
  }

  subscribeToFacilities(callback) {
    return this.subscribe('facilities_changes', 'facilities', callback)
  }

  subscribeToGallery(callback) {
    return this.subscribe('gallery_changes', 'gallery_images', callback)
  }

  subscribeToPromotions(callback) {
    return this.subscribe('promotions_changes', 'promotions', callback)
  }

  unsubscribe(channelName) {
    this.clearRetry(channelName)
    const channel = this.channels.get(channelName)
    if (channel) {
      this.channels.delete(channelName)
      void getSupabaseClient().removeChannel(channel)
    }
  }

  unsubscribeAll() {
    for (const channelName of this.channels.keys()) this.unsubscribe(channelName)
    for (const channelName of this.retries.keys()) this.clearRetry(channelName)
  }
}

export const realtimeManager = new RealtimeManager()
