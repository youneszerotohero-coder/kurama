import { Fragment, useLayoutEffect, useRef } from 'react'
import { stagger } from '@/lib/motion'
import { intro, useReveals } from '@/lib/reveal'

/**
 * Every view renders inside <Page>: it is the element the route transition animates,
 * and it wires the scroll reveals for its content.
 */
export default function Page({ children, deps = [], className = '' }) {
  const root = useRef(null)
  useReveals(root, deps)
  return (
    <div ref={root} data-page className={className}>
      {children}
    </div>
  )
}

/** Words that fade up one after another on page entry ([data-intro-word]). */
export function SplitWords({ text = '', className = '', wordClassName = '' }) {
  const words = String(text).split(' ').filter(Boolean)
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={className}>
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span data-intro-word className={`inline-block ${wordClassName}`}>
              {w}
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </span>
    </>
  )
}

/** Entrance for a page header: words fade up in sequence, then [data-intro] blocks follow. */
export function useIntro(scope, deps = []) {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const base = intro.delay * 1000
    const words = el.querySelectorAll('[data-intro-word]')
    const anims = [
      ...stagger(words, { opacity: 0, transform: 'translateY(0.35em)' }, { duration: 900, step: 35, delay: base }),
      ...stagger(el.querySelectorAll('[data-intro]'), { opacity: 0, transform: 'translateY(18px)' }, { duration: 900, step: 50, delay: base + 100 }),
    ]
    return () => anims.forEach((a) => a.cancel())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
