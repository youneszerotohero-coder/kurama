import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import { cn } from '@/components/ui/Btn'
import SectionHead from './SectionHead'

/** Horizontally scrolling product carousel with arrow controls (swipe on touch screens). */
export default function ProductRail({ id, title, subtitle, products, loading, to, linkLabel, tabs, tab, onTab }) {
  const { t } = useTranslation()
  const track = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const measure = () => {
    const el = track.current
    if (!el) return
    const x = Math.abs(el.scrollLeft)
    setEdges({ start: x < 8, end: x + el.clientWidth >= el.scrollWidth - 8 })
  }

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [products, tab])

  const scroll = (dir) => {
    const el = track.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrow = 'flex size-10 items-center justify-center rounded-full bg-ink-900/[0.06] text-ink-900 ring-hair transition-colors hover:bg-ink-900 hover:text-white disabled:pointer-events-none disabled:opacity-30'

  return (
    <section aria-labelledby={id} className="container-x py-10 md:py-14">
      <SectionHead id={id} title={title} subtitle={subtitle} to={to} linkLabel={linkLabel}>
        <button type="button" onClick={() => scroll(-1)} disabled={edges.start} className={arrow} aria-label={t('ui.prev', 'Précédent')}>
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </button>
        <button type="button" onClick={() => scroll(1)} disabled={edges.end} className={arrow} aria-label={t('ui.next', 'Suivant')}>
          <ChevronRight className="size-4 rtl:rotate-180" />
        </button>
      </SectionHead>

      {tabs && (
        <div role="tablist" className="-mt-2 mb-6 flex gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => onTab(x.id)}
              className={cn('h-9 shrink-0 rounded-full px-4 text-[0.88rem] ring-hair transition-colors', tab === x.id ? 'bg-volt text-ink-900' : 'text-ink-900/70 hover:text-ink-900')}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={track}
        onScroll={measure}
        className="-mx-[clamp(1rem,3.4vw,3rem)] flex snap-x snap-mandatory scroll-px-[clamp(1rem,3.4vw,3rem)] gap-3 overflow-x-auto px-[clamp(1rem,3.4vw,3rem)] pb-3 no-scrollbar md:gap-4"
      >
        {loading && !products?.length
          ? Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[calc((100%-4rem)/5)]">
                <ProductCardSkeleton />
              </div>
            ))
          : (products || []).map((p, i) => (
              <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[calc((100%-4rem)/5)]">
                <ProductCard product={p} priority={i < 2} reveal={false} />
              </div>
            ))}
      </div>
      {!loading && !products?.length && <p className="text-ink-900/65">{t('home.selEmpty', 'Les produits arrivent très bientôt.')}</p>}
    </section>
  )
}
