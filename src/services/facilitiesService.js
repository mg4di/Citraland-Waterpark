import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

export const facilitiesService = {
  async getActiveFacilities() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('facilities')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true })
      if (error) return failure(error, 'Get active facilities')
      return { success: true, facilities: data ?? [] }
    } catch (error) {
      return failure(error, 'Get active facilities')
    }
  },

  async getAllFacilities() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('facilities')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(500)
      if (error) return failure(error, 'Get facilities')
      return { success: true, facilities: data ?? [] }
    } catch (error) {
      return failure(error, 'Get facilities')
    }
  },

  async createFacility(input) {
    const facility = {
      facility_name: String(input?.facility_name ?? '').trim(),
      description: String(input?.description ?? '').trim(),
      icon: String(input?.icon ?? '').trim(),
      display_order: Number(input?.display_order),
      status: 'active',
    }
    if (!facility.facility_name || !facility.description || !facility.icon ||
      !Number.isInteger(facility.display_order)) {
      return { success: false, error: 'Periksa kembali data fasilitas.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('facilities')
        .insert(facility)
        .select('*')
        .single()
      if (error) return failure(error, 'Create facility')
      return { success: true, facility: data }
    } catch (error) {
      return failure(error, 'Create facility')
    }
  },

  async updateFacility(facilityId, input) {
    const changes = {}
    for (const [source, target] of [
      ['facility_name', 'facility_name'],
      ['description', 'description'],
      ['icon', 'icon'],
    ]) {
      if (input?.[source] !== undefined) changes[target] = String(input[source]).trim()
    }
    if (input?.display_order !== undefined) {
      const displayOrder = Number(input.display_order)
      if (!Number.isInteger(displayOrder)) return { success: false, error: 'Urutan fasilitas tidak valid.' }
      changes.display_order = displayOrder
    }
    if (input?.status !== undefined) {
      if (!['active', 'inactive'].includes(input.status)) {
        return { success: false, error: 'Status fasilitas tidak valid.' }
      }
      changes.status = input.status
    }
    if (!Object.keys(changes).length) return { success: false, error: 'Tidak ada perubahan untuk disimpan.' }
    try {
      const { data, error } = await getSupabaseClient()
        .from('facilities')
        .update(changes)
        .eq('facility_id', facilityId)
        .select('*')
        .single()
      if (error) return failure(error, 'Update facility')
      return { success: true, facility: data }
    } catch (error) {
      return failure(error, 'Update facility')
    }
  },

  async deleteFacility(facilityId) {
    return this.updateFacility(facilityId, { status: 'inactive' })
  },
}
