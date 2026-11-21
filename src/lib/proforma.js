import { formatNumber } from './format'

/**
 * Generates the proforma PDF for the current cart. jsPDF is loaded on demand,
 * so it never weighs on the first page load.
 */
export async function downloadProforma({ items, total, shippingThreshold, labels = {} }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const ink = [10, 12, 11]
  const volt = [154, 240, 126]
  const text = [20, 20, 20]
  const muted = [110, 110, 105]
  const ref = `PRO-${Date.now().toString().slice(-6)}`

  // Header band
  doc.setFillColor(...ink)
  doc.rect(0, 0, 210, 42, 'F')
  doc.setFillColor(...volt)
  doc.circle(22, 21, 7, 'F')
  doc.setFillColor(...ink)
  doc.triangle(23.2, 15.5, 18.6, 22.2, 22, 22.2, 'F')
  doc.triangle(22, 20, 21.2, 26.6, 25.6, 19.9, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('ELECTRO', 33, 21)
  doc.setTextColor(...volt)
  doc.text('HUB', 33 + doc.getTextWidth('ELECTRO'), 21)
  doc.setTextColor(200, 200, 195)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(labels.tagline || 'Matériel électrique professionnel — Algérie', 33, 28)
  if (labels.contact) doc.text(labels.contact, 33, 33)

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('FACTURE PROFORMA', 196, 19, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Réf. ${ref}`, 196, 26, { align: 'right' })
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 196, 31, { align: 'right' })

  // Table header
  let y = 58
  doc.setTextColor(...text)
  doc.setFillColor(241, 240, 234)
  doc.rect(14, y - 6, 182, 9, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('Désignation', 17, y)
  doc.text('Référence', 104, y)
  doc.text('P.U. (DA)', 140, y, { align: 'right' })
  doc.text('Qté', 154, y, { align: 'right' })
  doc.text('Total (DA)', 193, y, { align: 'right' })

  y += 10
  doc.setFont('helvetica', 'normal')
  items.forEach((item) => {
    if (y > 262) {
      doc.addPage()
      y = 22
    }
    const spec = [item.size, item.color].filter(Boolean).join(' / ')
    const name = doc.splitTextToSize(`${item.name}${spec ? ` (${spec})` : ''}`, 84)
    doc.setTextColor(...text)
    doc.text(name, 17, y)
    doc.setTextColor(...muted)
    doc.text(String(item.ref || `REF-P${item.id}`), 104, y)
    doc.setTextColor(...text)
    doc.text(formatNumber(item.price), 140, y, { align: 'right' })
    doc.text(String(item.quantity), 154, y, { align: 'right' })
    doc.text(formatNumber(item.price * item.quantity), 193, y, { align: 'right' })
    y += 5 * name.length + 3
    doc.setDrawColor(230, 228, 220)
    doc.line(14, y - 4, 196, y - 4)
  })

  if (y > 238) {
    doc.addPage()
    y = 22
  }

  const shipping = total >= shippingThreshold ? 0 : null
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text('Sous-total', 150, y, { align: 'right' })
  doc.text(`${formatNumber(total)} DA`, 193, y, { align: 'right' })
  y += 6
  doc.text('Livraison', 150, y, { align: 'right' })
  doc.text(shipping === 0 ? 'Offerte' : 'Selon wilaya', 193, y, { align: 'right' })
  y += 9
  doc.setFillColor(...ink)
  doc.roundedRect(110, y - 6, 86, 10, 2, 2, 'F')
  doc.setTextColor(...volt)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL ESTIMÉ', 115, y)
  doc.text(`${formatNumber(total)} DA`, 193, y, { align: 'right' })

  y += 22
  doc.setTextColor(...muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  const terms = [
    'Conditions :',
    '1. Ce document est une estimation commerciale et ne constitue pas une facture définitive.',
    '2. Prix en dinars algériens (DA), valables 15 jours à compter de la date d’émission.',
    '3. Frais de livraison calculés selon la wilaya au moment de la commande. Paiement à la livraison.',
  ]
  terms.forEach((line, i) => doc.text(line, 14, y + i * 5))

  doc.save(`proforma-electrohub-${ref}.pdf`)
}
