/**
 * Turns a picked image file into a compact data URL before it is sent to the API:
 * resized to fit `max` pixels and re-encoded as WebP (PNG transparency is kept).
 * A 4 MB phone photo typically ends up around 80–150 KB.
 */
export async function compressImage(file, { max = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('Not an image')
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return readAsDataUrl(file)

  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  let out = canvas.toDataURL('image/webp', quality)
  // Browsers without WebP encoding fall back to PNG: use JPEG for photos instead
  if (!out.startsWith('data:image/webp')) out = file.type === 'image/png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality)
  return out
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Approximate size in KB of a data URL (for display). */
export const dataUrlKB = (v) => (typeof v === 'string' && v.startsWith('data:') ? Math.round((v.length * 0.75) / 1024) : null)
