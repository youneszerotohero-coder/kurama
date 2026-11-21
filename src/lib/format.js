/* Pricing & display helpers shared by the storefront */

export const sizeName = (s) => (s && typeof s === 'object' ? s.name : s) || ''

export const promoOf = (p) => Math.max(0, Math.min(100, Number(p?.promotionPercentage || 0)))

/** Price of a product for a given specification, before promotion. */
export function basePrice(product, size) {
  if (!product) return 0
  const fallback = Number(product.priceSold ?? product.price ?? 0)
  if (!size || !Array.isArray(product.sizes)) return fallback
  const name = sizeName(size)
  const match = product.sizes.find((s) => s && typeof s === 'object' && s.name === name)
  return match && Number(match.priceSold) > 0 ? Number(match.priceSold) : fallback
}

/** Price actually charged (promotion applied). */
export const finalPrice = (product, size) => {
  const b = basePrice(product, size)
  const promo = promoOf(product)
  return promo > 0 ? Math.round(b * (1 - promo / 100) * 100) / 100 : b
}

/** Lowest charged price across the product's specifications ("from" price). */
export function fromPrice(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter((s) => s && typeof s === 'object' && Number(s.priceSold) > 0) : []
  if (!sizes.length) return { price: finalPrice(product), original: promoOf(product) > 0 ? basePrice(product) : null, varies: false }
  const prices = sizes.map((s) => ({ price: finalPrice(product, s), original: basePrice(product, s) }))
  const min = prices.reduce((a, b) => (b.price < a.price ? b : a))
  const varies = prices.some((p) => p.price !== min.price)
  return { price: min.price, original: promoOf(product) > 0 ? min.original : null, varies }
}

const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
// French grouping uses a narrow no-break space that many fonts lack: use a regular no-break space
export const formatNumber = (n) => nf.format(Math.round(Number(n) || 0)).replace(/[\u202f\u2009]/g, '\u00a0')
// Wrapped in a bidi isolate so amounts keep their order inside Arabic sentences
export const formatDA = (n) => `\u2066${formatNumber(n)} DA\u2069`

/** Category names are stored as slugs ("distribution"): make them presentable. */
export const titleCase = (s = '') => String(s).charAt(0).toUpperCase() + String(s).slice(1)

/** Translated category label, falling back to a title-cased name. */
export const categoryLabel = (t, name) => (name ? t(`shop.${name}`, { defaultValue: titleCase(name) }) : '')

export const TAG_KEYS = {
  BEST_SELLER: 'tags.bestSeller',
  NEW: 'tags.new',
  TRENDING: 'tags.trending',
  SALE: 'tags.sale',
}

/** Image to show for a product (with a neutral fallback). */
export const productImage = (p) => p?.image || (Array.isArray(p?.images) && p.images[0]) || '/img/bundle-480.webp'

/** True when an image comes from the admin (uploaded) or an external URL. */
export const isUploaded = (src) => typeof src === 'string' && (src.startsWith('/api/media/') || /^https?:\/\//.test(src) || src.startsWith('data:'))

export const slugify = (s = '') =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
