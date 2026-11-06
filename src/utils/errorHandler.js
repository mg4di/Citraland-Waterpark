export function mapSupabaseError(error) {
  const message = error?.message?.toLowerCase() ?? ''

  if (error?.code === '23505' || message.includes('already registered')) {
    return { message: 'Email sudah terdaftar', code: 'DUPLICATE' }
  }
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return { message: 'Email atau password salah', code: 'AUTH_INVALID_CREDENTIALS' }
  }
  if (message.includes('email not confirmed')) {
    return { message: 'Email belum diverifikasi. Periksa inbox Anda.', code: 'AUTH_EMAIL_NOT_CONFIRMED' }
  }
  if (error?.code === '42501' || message.includes('permission denied')) {
    return { message: 'Anda tidak memiliki akses untuk melakukan operasi ini.', code: 'PERMISSION_DENIED' }
  }
  if (error?.code === '23514') {
    return { message: 'Data tidak valid. Periksa kembali input Anda.', code: 'INVALID_DATA' }
  }
  if (error?.code === '23503') {
    return { message: 'Data yang dipilih tidak lagi tersedia.', code: 'RELATED_DATA_MISSING' }
  }
  if (
    error?.name === 'TypeError' ||
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('timeout')
  ) {
    return { message: 'Terjadi kesalahan koneksi. Silakan coba lagi.', code: 'NETWORK_ERROR' }
  }
  if (message.includes('jwt') || message.includes('token')) {
    return { message: 'Sesi Anda telah berakhir. Silakan masuk kembali.', code: 'SESSION_EXPIRED' }
  }
  return { message: 'Terjadi kesalahan. Silakan coba lagi.', code: error?.code ?? 'UNKNOWN_ERROR' }
}

export function logError(context, error) {
  console.error(`[${context}]`, error)
}

export function showError(message) {
  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(message, 'error')
  }
}

export async function retryWithBackoff(operation, maxAttempts = 3, baseDelay = 300) {
  let lastError
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (error?.status === 401 || error?.status === 403 || error?.code === '42501') throw error
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, baseDelay * (2 ** attempt)))
      }
    }
  }
  throw lastError
}

export function throwIfError(error, context) {
  if (!error) return
  logError(context, error)
  throw Object.assign(new Error(mapSupabaseError(error).message), { cause: error, code: error.code })
}
