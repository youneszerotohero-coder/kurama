import { prefersReducedMotion } from './motion'

const bump = (target) => {
  const badge = target.querySelector('[data-cart-count]') || target
  badge.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' })
}

/**
 * Add-to-cart feedback: a copy of the product image flies in an arc to the header cart,
 * then the cart counter gives a little bump. (Web Animations API, no library.)
 */
export function flyToCart(source) {
  const target = document.querySelector('[data-cart-target]')
  if (!target) return
  if (!source || prefersReducedMotion()) return bump(target)
  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  if (!from.width || to.bottom < 0) return bump(target)

  const size = Math.min(from.width, from.height, 200)
  const ghost = document.createElement('div')
  ghost.setAttribute('aria-hidden', 'true')
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: 9999,
    pointerEvents: 'none',
    borderRadius: '1.25rem',
    background: '#f1f0ea',
    boxShadow: '0 20px 50px -10px rgba(10,12,11,0.35), 0 0 0 2px #9af07e',
    overflow: 'hidden',
  })
  const img = document.createElement('img')
  img.src = source.currentSrc || source.src
  Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', padding: '8%' })
  ghost.appendChild(img)
  document.body.appendChild(ghost)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  // Quadratic curve that rises before dropping into the cart
  const lift = -Math.max(80, Math.abs(dy) * 0.35)
  const frames = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12
    const x = dx * t
    const y = 2 * (1 - t) * t * lift + t * t * dy
    const s = t < 0.2 ? 1 - t * 2.2 : 0.56 - (t - 0.2) * 0.55
    return { transform: `translate(${x}px, ${y}px) scale(${s.toFixed(3)})`, opacity: t > 0.9 ? (1 - t) * 10 : 1, borderRadius: t > 0.5 ? '50%' : '1.25rem' }
  })
  const anim = ghost.animate(frames, { duration: 850, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards' })
  anim.finished.finally(() => {
    ghost.remove()
    bump(target)
  })
}
