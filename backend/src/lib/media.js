import crypto from 'node:crypto';

/**
 * Images are stored in the database as data URLs (base64). Sending them inside every JSON
 * response made the catalogue extremely heavy, so API responses now carry short, cacheable
 * URLs instead (/api/media/...), and the browser fetches each image once.
 *
 * The `v` query parameter is a hash of the stored value: when an image changes, its URL
 * changes too, which lets the media route answer with a one-year immutable cache.
 */

export const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:');

const hash = (v) => crypto.createHash('md5').update(v).digest('hex').slice(0, 10);

/** `key` is "main" for the primary image, or the index inside `images`. */
export const mediaUrl = (type, id, key, value) =>
  isDataUrl(value) ? `/api/media/${type}/${id}/${key}?v=${hash(value)}` : value;

const MEDIA_RE = /^\/api\/media\/(product|category|brand|gamme)\/(\d+)\/(main|\d+)(?:\?.*)?$/;

/** Splits a media URL back into its parts (or null when it is not one of ours). */
export const parseMediaUrl = (v) => {
  if (typeof v !== 'string') return null;
  const m = v.match(MEDIA_RE);
  return m ? { type: m[1], id: Number(m[2]), key: m[3] } : null;
};

/** Value stored for a given key of a record. */
export const storedValue = (record, key) => {
  if (!record) return null;
  if (key === 'main') return record.image ?? null;
  const i = Number(key);
  return Array.isArray(record.images) ? record.images[i] ?? null : null;
};

/**
 * When the admin saves a record it sends back the URLs it received. Turn any of our own
 * media URLs back into the value that is actually stored, so nothing is lost.
 */
export const resolveIncoming = (value, type, current) => {
  const ref = parseMediaUrl(value);
  if (!ref || ref.type !== type || !current || ref.id !== current.id) return value;
  return storedValue(current, ref.key) ?? value;
};

export const decodeDataUrl = (v) => {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(v);
  if (!m) return null;
  const mime = m[1] || 'application/octet-stream';
  const buffer = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]));
  return { mime, buffer };
};

const stripSize = (s) => {
  if (!s || typeof s !== 'object') return s;
  // eslint-disable-next-line no-unused-vars
  const { priceBought, ...rest } = s;
  return rest;
};

const serializeRef = (type, item) =>
  item && typeof item === 'object' ? { ...item, image: mediaUrl(type, item.id, 'main', item.image) } : item;

/**
 * Shapes a product for the API.
 *  - images become media URLs
 *  - the public shape never exposes the purchase price (priceBought), not even per variant
 */
export const serializeProduct = (p, { admin = false } = {}) => {
  if (!p) return p;
  const out = {
    ...p,
    image: mediaUrl('product', p.id, 'main', p.image),
    category: serializeRef('category', p.category),
    brand: serializeRef('brand', p.brand),
    gamme: serializeRef('gamme', p.gamme),
  };
  // The main photo is usually also the first gallery image: give identical images the same URL
  if (Array.isArray(p.images)) out.images = p.images.map((img, i) => (img === p.image ? out.image : mediaUrl('product', p.id, i, img)));
  if (!admin) {
    delete out.priceBought;
    if (Array.isArray(out.sizes)) out.sizes = out.sizes.map(stripSize);
  }
  return out;
};

export const serializeTaxon = (type) => (item) => {
  if (!item) return item;
  const out = { ...item, image: mediaUrl(type, item.id, 'main', item.image) };
  if (item.brand) out.brand = serializeRef('brand', item.brand);
  if (item.category) out.category = serializeRef('category', item.category);
  return out;
};
