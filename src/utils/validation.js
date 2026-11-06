const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(\+62|62|0)[0-9]{9,12}$/

export const validators = {
  email(value) {
    if (!value?.trim()) return { valid: false, error: 'Email wajib diisi' }
    if (!EMAIL_PATTERN.test(value.trim())) return { valid: false, error: 'Format email tidak valid' }
    return { valid: true }
  },
  password(value) {
    if (!value) return { valid: false, error: 'Password wajib diisi' }
    if (value.length < 8) return { valid: false, error: 'Password minimal 8 karakter' }
    return { valid: true }
  },
  phone(value) {
    if (!value?.trim()) return { valid: false, error: 'Nomor telepon wajib diisi' }
    if (!PHONE_PATTERN.test(value.replace(/[\s-]/g, ''))) {
      return { valid: false, error: 'Format nomor telepon tidak valid' }
    }
    return { valid: true }
  },
  required(value, label) {
    if (typeof value !== 'string' || !value.trim()) {
      return { valid: false, error: `${label} wajib diisi` }
    }
    return { valid: true }
  },
  date(value) {
    if (!value) return { valid: false, error: 'Tanggal wajib dipilih' }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { valid: false, error: 'Format tanggal tidak valid' }
    const parsed = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      return { valid: false, error: 'Format tanggal tidak valid' }
    }
    return { valid: true }
  },
  sanitize(value) {
    return String(value ?? '').replace(/\u0000/g, '').trim()
  },
}

export function validateBookingForm(input) {
  const errors = {}
  const nameResult = validators.required(input.userName, 'Nama')
  const emailResult = validators.email(input.userEmail)
  const phoneResult = validators.phone(input.userPhone)
  const dateResult = validators.date(input.visitDate)

  if (!nameResult.valid) errors.userName = nameResult.error
  if (!emailResult.valid) errors.userEmail = emailResult.error
  if (!phoneResult.valid) errors.userPhone = phoneResult.error
  if (!dateResult.valid) errors.visitDate = dateResult.error
  return { valid: Object.keys(errors).length === 0, errors }
}
