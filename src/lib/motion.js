/*
  Motion helpers built on the platform (CSS transitions, IntersectionObserver and the
  Web Animations API) — no animation library in the main bundle.
*/

export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const EASE_OSMO = 'cubic-bezier(0.625, 0.05, 0, 1)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ */
/* Scroll locking (drawers, dialogs)                                   */
/* ------------------------------------------------------------------ */
const locks = new Set()

export function lockScroll(key) {
  locks.add(key)
  document.documentElement.classList.add('is-locked')
}

export function unlockScroll(key) {
  locks.delete(key)
  if (!locks.size) document.documentElement.classList.remove('is-locked')
}

/** Jump instantly (used between pages). */
export function jumpTo(y = 0) {
  window.scrollTo({ top: y, left: 0, behavior: 'instant' })
}

/** Smoothly scroll to a selector, element or the top, leaving room for the fixed header. */
export function scrollToTarget(target, { offset = 130 } = {}) {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
  if (target === '#' || target === 0 || target == null) {
    window.scrollTo({ top: 0, behavior })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior })
}

/**
 * Animates the given elements in sequence with the Web Animations API.
 * `from` is the starting keyframe; elements end in their natural state.
 */
export function stagger(elements, from, { duration = 800, step = 60, delay = 0, easing = EASE_OUT } = {}) {
  if (prefersReducedMotion()) return []
  return Array.from(elements || []).map((el, i) =>
    el.animate([from, {}], { duration, delay: delay + i * step, easing, fill: 'backwards' }),
  )
}
