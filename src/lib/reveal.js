import { useEffect } from 'react'
import { prefersReducedMotion } from './motion'

/** Kept for pages that time their entrance (slightly longer right after a route change). */
export const intro = { delay: 0.15 }

let observer = null
let queue = []
let frame = 0

/* Elements entering together cascade (60 ms apart) instead of popping in at once */
function flush() {
  frame = 0
  queue.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 8) * 60}ms`
    el.classList.add('rv-in')
    el.addEventListener('transitionend', () => (el.style.transitionDelay = ''), { once: true })
  })
  queue = []
}

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        observer.unobserve(entry.target)
        queue.push(entry.target)
      })
      if (queue.length && !frame) frame = requestAnimationFrame(flush)
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  return observer
}

/**
 * Scroll reveals scoped to `root`: every [data-reveal] element fades up when it enters the
 * viewport. Re-scans when `deps` change (content arriving from the API).
 */
export function useReveals(root, deps = []) {
  useEffect(() => {
    const scope = root.current
    if (!scope) return
    const items = scope.querySelectorAll('[data-reveal]:not([data-rv])')
    if (!items.length) return
    const reduce = prefersReducedMotion() || typeof IntersectionObserver === 'undefined'
    const io = reduce ? null : getObserver()
    items.forEach((el) => {
      el.setAttribute('data-rv', '')
      if (reduce) return
      // Already above the fold or scrolled past: no animation
      if (el.getBoundingClientRect().bottom < 0) return
      el.classList.add('rv')
      io.observe(el)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
