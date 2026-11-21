const SITE = 'ElectroHub'
export const DEFAULT_TITLE = 'ElectroHub — Matériel électrique professionnel en Algérie'
export const DEFAULT_DESCRIPTION =
  'ElectroHub : disjoncteurs, tableaux, câbles, appareillage et domotique des plus grandes marques. Livraison dans les 58 wilayas, paiement à la livraison et devis proforma instantané.'

const clip = (text = '', max = 158) => {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

function upsert(selector, create, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const meta = (key, value, prop = 'name') =>
  upsert(
    `meta[${prop}="${key}"]`,
    () => {
      const m = document.createElement('meta')
      m.setAttribute(prop, key)
      return m
    },
    'content',
    value,
  )

export const absoluteUrl = (url) => {
  if (!url) return url
  try {
    return new URL(url, window.location.origin).href
  } catch {
    return url
  }
}

/** Keeps title, description, canonical and social tags in sync with the current view. */
export function setSeo({ title, description, image, path, noindex = false, type = 'website' } = {}) {
  const fullTitle = title ? `${title} — ${SITE}` : DEFAULT_TITLE
  const desc = clip(description || DEFAULT_DESCRIPTION)
  const url = window.location.origin + (path ?? window.location.pathname)
  const img = absoluteUrl(image || '/og-image.jpg')

  document.title = fullTitle
  meta('description', desc)
  meta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  meta('og:type', type, 'property')
  meta('og:title', fullTitle, 'property')
  meta('og:description', desc, 'property')
  meta('og:url', url, 'property')
  meta('og:image', img, 'property')
  meta('twitter:title', fullTitle)
  meta('twitter:description', desc)
  meta('twitter:image', img)
  upsert(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement('link')
      l.rel = 'canonical'
      return l
    },
    'href',
    url,
  )
}

/** Replaces (or adds) a JSON-LD block identified by `id`. */
export function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}
