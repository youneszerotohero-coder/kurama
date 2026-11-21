import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, FileText, Truck, ArrowRight, Percent, Sparkles, LayoutGrid } from 'lucide-react'
import { prefersReducedMotion, stagger } from '@/lib/motion'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { cn } from '@/components/ui/Btn'
import { categoryLabel, formatDA, fromPrice, productImage, promoOf } from '@/lib/format'

const SLIDE_MS = 6000

/* Three product shots arranged on the banner, each gently floating */
function Composition({ products, sticker }) {
  const [main, left, right] = products
  const img = (p, cls, delay, priority) =>
    p && (
      <img
        key={p.id}
        data-visual
        src={productImage(p)}
        alt=""
        width="360"
        height="360"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('absolute object-contain mix-blend-multiply motion-safe:animate-[float_6s_ease-in-out_infinite]', cls)}
        style={{ animationDelay: delay }}
      />
    )
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {img(left, 'top-[6%] w-[38%] ltr:left-[2%] rtl:right-[2%]', '-1.5s')}
      {img(right, 'bottom-[4%] w-[36%] ltr:right-[0%] rtl:left-[0%]', '-3s')}
      {img(main, 'top-[12%] left-[19%] w-[62%]', '0s', true)}
      {sticker && (
        <span data-visual className="absolute top-[8%] flex size-[5.5rem] -rotate-12 flex-col items-center justify-center rounded-full bg-ink-900 text-center text-white shadow-xl ltr:right-[8%] rtl:left-[8%] sm:size-24">
          <span className="text-[0.65rem] text-white/70">{sticker.label}</span>
          <span className="px-1 text-[0.95rem] leading-tight font-bold text-volt">{sticker.value}</span>
        </span>
      )}
    </div>
  )
}

export default function Hero({ products }) {
  const { t } = useTranslation()
  const { categories, minFreeDelivery } = useStore()
  const { setIsCartOpen, cartCount } = useCart()
  const root = useRef(null)
  const touch = useRef(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const firstRender = useRef(true)

  const slides = useMemo(() => {
    const list = (products || []).filter((p) => p.inStock !== false)
    const deals = list.filter((p) => promoOf(p) > 0 || p.tag === 'SALE')
    const best = deals.reduce((m, p) => Math.max(m, promoOf(p)), 0)
    const topCat = [...categories].sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))[0]
    const inCat = topCat ? list.filter((p) => String(p.category).toLowerCase() === topCat.name.toLowerCase()) : []
    const minOf = (arr) => (arr.length ? Math.min(...arr.map((p) => fromPrice(p).price)) : 0)

    // The first slide is static: it paints immediately (fast LCP) while the catalogue loads
    const out = [
      {
        id: 'welcome',
        bg: 'bg-gradient-to-br from-[#c8f7b4] via-[#e3fbd8] to-[#f4fdf0]',
        icon: Sparkles,
        chip: t('home.heroEyebrow2', 'Livraison partout en Algérie, paiement à la réception'),
        title: `${t('home.h1a', 'Le matériel électrique pro,')} ${t('home.h1b', 'livré chez vous.')}`,
        sub: t('home.heroLead2', ''),
        cta: t('home.ctaShop', 'Explorer la boutique'),
        to: '/shop',
        items: [],
        image: true,
      },
    ]
    if (deals.length) {
      out.push({
        id: 'deals',
        bg: 'bg-gradient-to-br from-[#c8f7b4] via-[#e3fbd8] to-[#f4fdf0]',
        icon: Percent,
        chip: t('home.tabPromo', 'Promotions'),
        title: best > 0 ? t('home.dealsUpTo', 'Jusqu’à −{{n}}%', { n: Math.round(best) }) : t('home.dealsBest', 'Les meilleurs prix'),
        sub: t('home.slideDealsSub', 'Sur une sélection de disjoncteurs, câbles et appareillage. Stocks limités.'),
        cta: t('home.ctaPromo', 'Voir les promos'),
        to: '/shop?promo=1',
        items: deals.slice(0, 3),
        sticker: best > 0 ? { label: t('home.upTo', 'jusqu’à'), value: `−${Math.round(best)}%` } : null,
      })
    }
    if (list.length) {
      out.push({
        id: 'new',
        bg: 'bg-gradient-to-br from-[#ecebe3] via-[#f4f3ee] to-[#fbfaf7]',
        icon: Sparkles,
        chip: t('home.newTitle', 'Nouveautés'),
        title: t('home.slideNewTitle', 'Nouveautés en stock'),
        sub: t('home.slideNewSub', 'Les dernières références arrivées chez ElectroHub, prêtes à être expédiées.'),
        cta: t('home.ctaShop', 'Explorer la boutique'),
        to: '/shop',
        items: list.slice(0, 3),
        sticker: { label: t('ui.from', 'À partir de'), value: formatDA(minOf(list.slice(0, 3))) },
      })
    }
    if (topCat && inCat.length) {
      out.push({
        id: 'cat',
        bg: 'bg-gradient-to-br from-[#dcefe6] via-[#ecf6f1] to-[#f7fbf9]',
        icon: LayoutGrid,
        chip: topCat.parentCategory || t('ui.category', 'Catégorie'),
        title: categoryLabel(t, topCat.name),
        sub: t('home.slideCatSub', '{{count}} références sélectionnées chez les plus grandes marques.', { count: topCat._count?.products || inCat.length }),
        cta: t('ui.seeProducts', 'Voir les produits'),
        to: `/shop?category=${encodeURIComponent(topCat.name)}`,
        items: inCat.slice(0, 3),
        sticker: { label: t('ui.from', 'À partir de'), value: formatDA(minOf(inCat)) },
      })
    }
    return out
  }, [products, categories, t])

  const count = slides.length
  const current = Math.min(index, count - 1)
  const slide = slides[current]

  useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion()) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS)
    return () => clearTimeout(id)
  }, [index, paused, count])

  // Slide change: copy rises, products pop in one after another (the first slide paints instantly)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const el = root.current
    if (!el) return
    const anims = [
      ...stagger(el.querySelectorAll('[data-copy] > *'), { opacity: 0, transform: 'translateY(26px)' }, { duration: 800, step: 60 }),
      ...stagger(el.querySelectorAll('[data-visual]'), { opacity: 0, scale: '0.7' }, { duration: 900, step: 80, delay: 50 }),
    ]
    return () => anims.forEach((a) => a.cancel())
  }, [current])

  const go = (d) => setIndex((i) => (i + d + count) % count)
  const titleCls = 'mt-5 text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-ink-900'

  return (
    <section aria-label={t('home.heroAria', 'À la une')} className="container-x pt-4 pb-4 md:pt-6">
      <h1 className="sr-only">
        ElectroHub — {t('home.h1a', 'Le matériel électrique pro,')} {t('home.h1b', 'livré chez vous.')}
      </h1>
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        {/* Banner carousel */}
        <div
          ref={root}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return
            const dx = e.changedTouches[0].clientX - touch.current
            const rtl = document.documentElement.dir === 'rtl'
            if (Math.abs(dx) > 50) go(dx < 0 !== rtl ? 1 : -1)
            touch.current = null
          }}
          aria-roledescription="carousel"
          className={cn('relative isolate overflow-hidden rounded-[1.75rem] lg:col-span-8', slide.bg)}
        >
          <div aria-hidden="true" className="grid-lines-dark pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_80%_80%_at_70%_40%,#000_10%,transparent_70%)]" />
          <div className="grid min-h-[27rem] items-center gap-2 p-6 pb-16 sm:p-9 sm:pb-16 md:grid-cols-2 lg:min-h-[31rem] lg:p-11 lg:pb-16">
            <div data-copy key={`c-${slide.id}`} className="relative z-10 max-w-[30rem]">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[0.82rem] font-medium text-ink-900 shadow-sm backdrop-blur">
                <slide.icon className="size-3.5 text-forest" /> {slide.chip}
              </p>
              <p className={titleCls}>{slide.title}</p>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-900/70">{slide.sub}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to={slide.to} className="group flex h-12 items-center gap-2 rounded-full bg-ink-900 ps-6 pe-5 text-[0.95rem] font-medium text-white transition-colors hover:bg-forest">
                  {slide.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                </Link>
                <Link to="/shop" className="flex h-12 items-center rounded-full bg-white/70 px-5 text-[0.95rem] font-medium text-ink-900 ring-1 ring-ink-900/10 backdrop-blur transition-colors hover:bg-white">
                  {t('ui.allProducts', 'Tous les produits')}
                </Link>
              </div>
            </div>

            <div key={`v-${slide.id}`} className="relative mx-auto h-[10.5rem] w-full max-w-[17rem] sm:h-[18rem] sm:max-w-none md:h-full md:min-h-[24rem]">
              {slide.image ? (
                <img
                  data-visual
                  src="/img/bundle-735.webp"
                  srcSet="/img/bundle-480.webp 480w, /img/bundle-735.webp 735w"
                  sizes="(min-width: 768px) 34vw, 272px"
                  alt=""
                  width="735"
                  height="490"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-contain mix-blend-multiply motion-safe:animate-[float_7s_ease-in-out_infinite]"
                />
              ) : (
                <Composition products={slide.items} sticker={slide.sticker} />
              )}
            </div>
          </div>

          {/* Controls */}
          {count > 1 && (
            <div className="absolute inset-x-6 bottom-5 z-20 flex items-center gap-3 sm:inset-x-9 lg:inset-x-11">
              <div className="flex flex-1 gap-1.5" role="tablist" aria-label={t('home.heroAria', 'À la une')}>
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === current}
                    aria-label={s.chip}
                    onClick={() => setIndex(i)}
                    className="relative h-1.5 max-w-24 flex-1 overflow-hidden rounded-full bg-ink-900/15"
                  >
                    {i === current && (
                      <span
                        key={`${current}-${paused}`}
                        className="absolute inset-y-0 start-0 rounded-full bg-ink-900"
                        style={paused ? { width: '100%' } : { animation: `spot-progress ${SLIDE_MS}ms linear forwards` }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => go(-1)} className="flex size-10 items-center justify-center rounded-full bg-white text-ink-900 shadow-sm hover:bg-ink-900 hover:text-white" aria-label={t('ui.prev', 'Précédent')}>
                <ChevronLeft className="size-4 rtl:rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} className="flex size-10 items-center justify-center rounded-full bg-white text-ink-900 shadow-sm hover:bg-ink-900 hover:text-white" aria-label={t('ui.next', 'Suivant')}>
                <ChevronRight className="size-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* Side tiles */}
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:gap-4">
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-paper p-6 ring-hair">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-forest shadow-sm">
              <FileText className="size-5" />
            </span>
            <span className="mt-6 block">
              <span className="block text-[1.35rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900">{t('home.tileProTitle', 'Devis proforma en 1 clic')}</span>
              <span className="mt-1.5 block text-[0.92rem] text-ink-900/65">{t('home.proText', 'Composez votre panier et téléchargez un proforma PDF en un clic.')}</span>
            </span>
            {cartCount > 0 ? (
              <button type="button" onClick={() => setIsCartOpen(true)} className="mt-4 flex w-fit items-center gap-1.5 text-[0.9rem] font-medium text-forest">
                {t('home.proCtaCart', 'Ouvrir mon panier')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </button>
            ) : (
              <Link to="/shop" className="mt-4 flex w-fit items-center gap-1.5 text-[0.9rem] font-medium text-forest">
                {t('home.proCta', 'Composer mon devis')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
            )}
            <FileText aria-hidden="true" className="pointer-events-none absolute -bottom-6 size-36 rotate-12 text-ink-900/[0.04] ltr:-right-4 rtl:-left-4" />
          </div>

          <Link to="/shop" className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-volt p-6 text-ink-900">
            <span className="flex size-11 items-center justify-center rounded-full bg-ink-900 text-volt">
              <Truck className="size-5" />
            </span>
            <span className="mt-6 block">
              <span className="block text-[1.35rem] leading-tight font-semibold tracking-[-0.03em]">{t('home.tileShipTitle', 'Livraison offerte dès {{amount}}', { amount: formatDA(minFreeDelivery) })}</span>
              <span className="mt-1.5 block text-[0.92rem] text-ink-900/75">{t('home.tileShipText', 'Dans les 58 wilayas, à domicile ou en stop desk. Paiement à la livraison.')}</span>
            </span>
            <span className="mt-4 flex items-center gap-1.5 text-[0.9rem] font-semibold">
              {t('home.ctaShop', 'Explorer la boutique')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
            <Truck aria-hidden="true" className="pointer-events-none absolute -bottom-6 size-36 -rotate-6 text-ink-900/[0.06] ltr:-right-4 rtl:-left-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
