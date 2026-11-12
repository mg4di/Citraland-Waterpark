import QRCode from 'qrcode'

const PAYMENT_STATUS = {
  paid: { label: 'Lunas', tone: 'emerald' },
  pending: { label: 'Menunggu pembayaran', tone: 'amber' },
  failed: { label: 'Gagal', tone: 'rose' },
  cancelled: { label: 'Dibatalkan', tone: 'slate' },
  refunded: { label: 'Dikembalikan', tone: 'violet' },
}

const USAGE_STATUS = {
  inactive: { label: 'Belum aktif', tone: 'slate' },
  used: { label: 'Sudah digunakan', tone: 'slate' },
  expired: { label: 'Kedaluwarsa', tone: 'rose' },
  today: { label: 'Berlaku hari ini', tone: 'emerald' },
  valid: { label: 'Belum digunakan', tone: 'ocean' },
}

export function formatRupiah(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`
}

export function formatDateID(dateStr) {
  if (!dateStr) return 'Tanggal belum tersedia'
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  const date = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTicketLines(booking) {
  const ticketTypes = booking?.ticket_types ?? {}
  return Object.entries(ticketTypes).map(([type, details]) => {
    const quantity = Number(details?.qty ?? 0)
    const price = Number(details?.price ?? 0)
    return {
      type,
      name: type === 'weekday' ? 'Tiket Weekdays' : 'Tiket Weekend',
      quantity,
      price,
      subtotal: price * quantity,
    }
  })
}

export function getTicketSummary(booking) {
  const lines = getTicketLines(booking)
  if (!lines.length) return 'Tiket'
  return lines.map((line) => `${line.name} × ${line.quantity}`).join(', ')
}

export function getPaymentStatusMeta(status) {
  return PAYMENT_STATUS[status] ?? { label: status || 'Tidak diketahui', tone: 'slate' }
}

export function getUsageStatusMeta(booking) {
  if (booking?.payment_status !== 'paid') return USAGE_STATUS.inactive
  if (booking?.checked_in_at) return USAGE_STATUS.used
  const visitDate = booking?.visit_date
  if (!visitDate) return USAGE_STATUS.valid
  const today = localDateString()
  if (visitDate < today) return USAGE_STATUS.expired
  if (visitDate === today) return USAGE_STATUS.today
  return USAGE_STATUS.valid
}

export function buildQrPayload(booking) {
  const lines = getTicketLines(booking)
  const ticketPart = lines
    .map((line) => `${line.type}:${line.quantity}`)
    .join('+') || 'ticket:0'
  return [
    'CITRALAND',
    booking?.booking_code ?? '',
    booking?.visit_date ?? '',
    ticketPart,
    Math.round(Number(booking?.total_amount ?? 0)),
  ].join('|')
}

export async function generateQrDataUrl(booking) {
  return QRCode.toDataURL(buildQrPayload(booking), {
    width: 512,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

export function getPaymentMethodLabel(booking) {
  const method = booking?.payment_method || booking?.midtrans_payment_type || ''
  const names = {
    bank_transfer: 'Transfer bank',
    credit_card: 'Kartu kredit',
    gopay: 'GoPay',
    shopeepay: 'ShopeePay',
    qris: 'QRIS',
    cstore: 'Gerai retail',
    echannel: 'Pembayaran elektronik',
    akulaku: 'Akulaku',
  }
  return names[method] || method || 'Midtrans'
}
