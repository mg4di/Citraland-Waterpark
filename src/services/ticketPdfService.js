import { jsPDF } from 'jspdf'
import {
  formatDateID,
  formatRupiah,
  getPaymentMethodLabel,
  getPaymentStatusMeta,
  getTicketLines,
  getUsageStatusMeta,
} from './ticketService.js'

const OCEAN = [0, 151, 167]
const SLATE = [15, 23, 42]
const MUTED = [100, 116, 139]
const LIGHT = [241, 245, 249]

function drawLabelValue(doc, label, value, x, y, maxWidth = 110) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(label.toUpperCase(), x, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...SLATE)
  const lines = doc.splitTextToSize(String(value || '-'), maxWidth)
  doc.text(lines, x, y + 5)
  return y + 5 + lines.length * 5
}

export function createTicketPdf(booking, qrDataUrl) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2

  // Header band
  doc.setFillColor(...OCEAN)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('CITRALAND WATERPARK', margin, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('E-TICKET · Denpasar, Bali', margin, 25)
  doc.setFontSize(8)
  doc.text('Tunjukkan QR code ini di pintu masuk', margin, 31)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('KODE BOOKING', pageWidth - margin, 18, { align: 'right' })
  doc.setFontSize(16)
  doc.text(booking.booking_code || '-', pageWidth - margin, 26, { align: 'right' })

  // QR code
  const qrSize = 52
  const qrX = pageWidth - margin - qrSize
  const qrY = 52
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  } else {
    doc.setDrawColor(...MUTED)
    doc.rect(qrX, qrY, qrSize, qrSize)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('QR tidak tersedia', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' })
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Scan di pintu masuk', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' })

  // Visitor details
  let y = 54
  const leftWidth = contentWidth - qrSize - 12
  y = drawLabelValue(doc, 'Nama pengunjung', booking.user_name, margin, y, leftWidth)
  y += 4
  y = drawLabelValue(doc, 'Email', booking.user_email, margin, y, leftWidth)
  y += 4
  y = drawLabelValue(doc, 'Nomor telepon', booking.user_phone, margin, y, leftWidth)
  y += 4
  y = drawLabelValue(doc, 'Tanggal kunjungan', formatDateID(booking.visit_date), margin, y, leftWidth)

  // Divider
  y = Math.max(y + 8, qrY + qrSize + 14)
  doc.setDrawColor(226, 232, 240)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageWidth - margin, y)
  doc.setLineDashPattern([], 0)

  // Ticket lines
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('DETAIL TIKET', margin, y)
  y += 7

  const lines = getTicketLines(booking)
  doc.setFontSize(10)
  for (const line of lines) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...SLATE)
    doc.text(`${line.name} × ${line.quantity}`, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(formatRupiah(line.subtotal), pageWidth - margin, y, { align: 'right' })
    y += 7
  }

  if (!lines.length) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text('Detail tiket tidak tersedia', margin, y)
    y += 7
  }

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
  const discount = Math.max(0, subtotal - Number(booking.total_amount))
  if (discount > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text('Diskon promo', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...SLATE)
    doc.text(`-${formatRupiah(discount)}`, pageWidth - margin, y, { align: 'right' })
    y += 7
  }

  // Total
  y += 2
  doc.setFillColor(...LIGHT)
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...SLATE)
  doc.text('Total pembayaran', margin + 5, y + 10)
  doc.setFontSize(14)
  doc.setTextColor(...OCEAN)
  doc.text(formatRupiah(booking.total_amount), pageWidth - margin - 5, y + 10, { align: 'right' })
  y += 24

  // Payment and usage status
  const payment = getPaymentStatusMeta(booking.payment_status)
  const usage = getUsageStatusMeta(booking)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Status pembayaran', margin, y)
  doc.text('Status tiket', margin + contentWidth / 2, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...SLATE)
  doc.text(payment.label, margin, y + 6)
  doc.text(usage.label, margin + contentWidth / 2, y + 6)
  y += 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Metode pembayaran', margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SLATE)
  doc.text(getPaymentMethodLabel(booking), margin, y + 6)
  y += 16

  // Footer
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  const notes = [
    'Tiket berlaku untuk satu kali kunjungan dan tidak dapat dipindahtangankan.',
    'Jam operasional: 09.00 – 17.00 WIB. Senin tutup.',
    'Anak dengan tinggi di bawah 85 cm gratis.',
    'Simpan e-ticket ini dan tunjukkan QR code kepada petugas di gerbang.',
  ]
  for (const note of notes) {
    doc.text(`- ${note}`, margin, y)
    y += 5
  }

  doc.setFontSize(7)
  doc.text(
    `Diterbitkan ${new Date().toLocaleString('id-ID')} · Citraland Waterpark Denpasar`,
    pageWidth / 2,
    287,
    { align: 'center' },
  )

  return doc
}

export function downloadTicketPdf(booking, qrDataUrl) {
  const doc = createTicketPdf(booking, qrDataUrl)
  doc.save(`${booking.booking_code || 'e-ticket'}-e-ticket.pdf`)
}
