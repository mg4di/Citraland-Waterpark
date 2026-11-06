import { getSupabaseClient } from '../lib/supabase.js'
import { logError, mapSupabaseError } from '../utils/errorHandler.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function failure(error, context) {
  logError(context, error)
  return { success: false, error: mapSupabaseError(error).message }
}

function extensionFor(file) {
  if (file.type === 'image/jpeg') return 'jpg'
  if (file.type === 'image/png') return 'png'
  return 'webp'
}

export const galleryService = {
  async getPublishedImages() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('gallery_images')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true })
      if (error) return failure(error, 'Get published gallery')
      return { success: true, images: data ?? [] }
    } catch (error) {
      return failure(error, 'Get published gallery')
    }
  },

  async getAllImages() {
    try {
      const { data, error } = await getSupabaseClient()
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(500)
      if (error) return failure(error, 'Get gallery')
      return { success: true, images: data ?? [] }
    } catch (error) {
      return failure(error, 'Get gallery')
    }
  },

  async uploadImage(file, caption = '', displayOrder = 0) {
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'Pilih gambar JPG, PNG, atau WebP berukuran maksimal 5 MB.' }
    }
    try {
      const supabase = getSupabaseClient()
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(file)}`
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) return failure(uploadError, 'Upload gallery image')

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
      const { data, error } = await supabase
        .from('gallery_images')
        .insert({
          image_url: urlData.publicUrl,
          caption: String(caption).trim() || null,
          display_order: Number.isInteger(Number(displayOrder)) ? Number(displayOrder) : 0,
          status: 'published',
          storage_path: path,
        })
        .select('*')
        .single()
      if (error) {
        const { error: removeError } = await supabase.storage.from('gallery').remove([path])
        if (removeError) logError('Remove unreferenced gallery upload', removeError)
        return failure(error, 'Save gallery image')
      }
      return { success: true, image: data }
    } catch (error) {
      return failure(error, 'Upload gallery image')
    }
  },

  async deleteImage(imageId) {
    try {
      const supabase = getSupabaseClient()
      const { data: image, error: lookupError } = await supabase
        .from('gallery_images')
        .select('image_id, storage_path')
        .eq('image_id', imageId)
        .single()
      if (lookupError) return failure(lookupError, 'Find gallery image')

      const { error: archiveError } = await supabase
        .from('gallery_images')
        .update({ status: 'archived' })
        .eq('image_id', imageId)
      if (archiveError) return failure(archiveError, 'Archive gallery image')

      if (image.storage_path) {
        const { error: removeError } = await supabase.storage.from('gallery').remove([image.storage_path])
        if (removeError) return failure(removeError, 'Remove gallery storage file')
      }
      return { success: true }
    } catch (error) {
      return failure(error, 'Delete gallery image')
    }
  },

  async updateImageOrder(imageId, displayOrder) {
    if (!Number.isInteger(Number(displayOrder))) {
      return { success: false, error: 'Urutan gambar tidak valid.' }
    }
    try {
      const { data, error } = await getSupabaseClient()
        .from('gallery_images')
        .update({ display_order: Number(displayOrder) })
        .eq('image_id', imageId)
        .select('*')
        .single()
      if (error) return failure(error, 'Update gallery order')
      return { success: true, image: data }
    } catch (error) {
      return failure(error, 'Update gallery order')
    }
  },
}
