import { useCallback, useEffect, useRef } from 'react'
import { prefersReducedMotion, jumpTo, EASE_OUT } from '@/lib/motion'
import { intro } from '@/lib/reveal'

/*
  Route change: a slim progress bar runs along the top while the next page's code loads,
  the current page fades out, then the new page rises into place. Quick enough for shopping.
*/

const controller = { run: null }

/** Calls `swap` once the next page is ready (`ready` may be a promise), animating around it. */
export function runPageTransition(_label, swap, ready) {
  if (controller.run) controller.run(swap, ready)
  else
    Promise.resolve(ready).finally(() => {
      swap()
      jumpTo(0)
    })
}

export default function PageTransition() {
  const bar = useRef(null)
  const token = useRef(0)

  const run = useCallback((swap, ready) => {
    const id = ++token.current
    const el = bar.current
    const page = document.querySelector('[data-page]')
    const reduce = prefersReducedMotion()

    el.getAnimations().forEach((a) => a.cancel())
    el.style.visibility = 'visible'
    el.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(0.72)', opacity: 1 }], { duration: 1200, easing: EASE_OUT, fill: 'forwards' })

    const leaveAnim = reduce || !page ? null : page.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-12px)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' })
    // Never let navigation depend on an animation finishing (paused in background tabs)
    const leave = leaveAnim ? Promise.race([leaveAnim.finished.catch(() => {}), new Promise((r) => setTimeout(r, 260))]) : Promise.resolve()

    Promise.all([leave, Promise.resolve(ready).catch(() => {})]).then(() => {
      if (id !== token.current) return leaveAnim?.cancel()
      intro.delay = 0.08
      swap()
      jumpTo(0)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          // The same element may survive the swap (e.g. product → product): drop the fade-out
          leaveAnim?.cancel()
          if (id !== token.current) return
          const next = document.querySelector('[data-page]')
          if (next && !reduce) next.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: EASE_OUT })
          el.getAnimations().forEach((a) => a.cancel())
          el.animate(
            [
              { transform: 'scaleX(0.72)', opacity: 1 },
              { transform: 'scaleX(1)', opacity: 1, offset: 0.5 },
              { transform: 'scaleX(1)', opacity: 0 },
            ],
            { duration: 650, easing: 'ease-out', fill: 'forwards' },
          ).finished
            .then(() => {
              el.style.visibility = 'hidden'
              intro.delay = 0.15
            })
            .catch(() => {})
        }),
      )
    })
  }, [])

  useEffect(() => {
    controller.run = run
    return () => {
      if (controller.run === run) controller.run = null
    }
  }, [run])

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-x-0 top-0 z-[10000] h-[3px] origin-left bg-gradient-to-r from-forest via-volt-600 to-volt shadow-[0_0_12px_rgba(154,240,126,0.7)] rtl:origin-right"
    />
  )
}
