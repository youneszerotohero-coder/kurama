import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal, X, Heart, PackageOpen } from 'lucide-react'
import api from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { useFavorites } from '@/lib/favorites'
import { setSeo } from '@/lib/seo'
import { lockScroll, unlockScroll } from '@/lib/motion'
import { categoryLabel, finalPrice, formatDA, formatNumber, fromPrice, promoOf } from '@/lib/format'
import Page, { SplitWords, useIntro } from '@/components/layout/Page'
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import Btn, { cn } from '@/components/ui/Btn'

const PAGE = 24

const SORTS = {
  featured: () => 0,
  'price-asc': (a, b) => fromPrice(a).price - fromPrice(b).price,
  'price-desc': (a, b) => fromPrice(b).price - fromPrice(a).price,
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  name: (a, b) => String(a.name).localeCompare(String(b.name)),
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-ink-900/[0.08] py-6 first:pt-0">
      <p className="eyebrow mb-4 text-ink-900/65">{title}</p>
      {children}
    </div>
  )
}

function Option({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start text-[0.93rem] transition-colors duration-300',
        active ? 'bg-volt text-ink-900' : 'text-ink-900/75 hover:bg-ink-900/[0.05] hover:text-ink-900',
      )}
    >
      <span className="truncate">{label}</span>
      {count != null && <span className={cn('eyebrow', active ? 'text-ink-900/60' : 'text-ink-900/62')}>{formatNumber(count)}</span>}
    </button>
  )
}

function Filters({ params, set, brands, ranges, priceCeil, favCount }) {
  const { t } = useTranslation()
  const brand = params.get('brand') || ''
  const gamme = params.get('gamme') || ''
  const max = Number(params.get('max')) || 0
  const fav = params.get('fav') === '1'

  return (
    <div>
      <FilterGroup title={t('shop.selectManufacturer')}>
        <div className="max-h-72 space-y-0.5 overflow-y-auto pe-1">
          <Option active={!brand} onClick={() => set({ brand: null, gamme: null })} label={t('shop.allManufacturers')} />
          {brands.map((b) => (
            <Option
              key={b.id}
              active={brand.toLowerCase() === b.name.toLowerCase()}
              onClick={() => set({ brand: b.name, gamme: null })}
              label={b.name}
              count={b._count?.products}
            />
          ))}
        </div>
      </FilterGroup>

      {ranges.length > 0 && (
        <FilterGroup title={t('shop.selectGamme')}>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => set({ gamme: null })}
              className={cn('h-9 rounded-full px-3.5 text-[0.85rem] ring-hair transition-colors', !gamme ? 'bg-ink-900 text-white' : 'text-ink-900/75 hover:text-ink-900')}
            >
              {t('shop.allGammes')}
            </button>
            {ranges.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => set({ gamme: g.name, brand: g.brand?.name || brand || null })}
                className={cn(
                  'h-9 rounded-full px-3.5 text-[0.85rem] ring-hair transition-colors',
                  gamme.toLowerCase() === g.name.toLowerCase() ? 'bg-ink-900 text-white' : 'text-ink-900/75 hover:text-ink-900',
                )}
              >
                {g.name}
                {!brand && g.brand?.name ? <span className="opacity-50"> · {g.brand.name}</span> : null}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {priceCeil > 0 && (
        <FilterGroup title={t('shop.maxBudget')}>
          <div className="flex items-baseline justify-between">
            <span className="display tabular text-[1.4rem] tracking-[-0.03em] text-ink-900">{max ? formatDA(max) : t('ui.noLimit', 'Sans limite')}</span>
            {max > 0 && (
              <button type="button" onClick={() => set({ max: null })} className="eyebrow text-forest">
                {t('ui.reset', 'Réinitialiser')}
              </button>
            )}
          </div>
          <input
            type="range"
            min={0}
            max={priceCeil}
            step={Math.max(100, Math.round(priceCeil / 100 / 100) * 100)}
            value={max || priceCeil}
            onChange={(e) => {
              const v = Number(e.target.value)
              set({ max: v >= priceCeil ? null : String(v) })
            }}
            aria-label={t('shop.maxBudget')}
            className="mt-4 w-full accent-[#9af07e]"
          />
          <div className="eyebrow mt-2 flex justify-between text-ink-900/62">
            <span>0 DA</span>
            <span>{formatDA(priceCeil)}</span>
          </div>
        </FilterGroup>
      )}

      <FilterGroup title={t('shop.favoritesOnly')}>
        <button
          type="button"
          role="switch"
          aria-checked={fav}
          onClick={() => set({ fav: fav ? null : '1' })}
          className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-start text-ink-900/80 hover:bg-ink-900/[0.04]"
        >
          <span className="flex items-center gap-2.5">
            <Heart className={cn('size-4', fav ? 'fill-[#ff8a80] text-[#d93025]' : 'text-ink-900/65')} />
            {t('shop.favoritesDesc')} <span className="eyebrow text-ink-900/62">({favCount})</span>
          </span>
          <span className={cn('relative h-6 w-10 shrink-0 rounded-full transition-colors', fav ? 'bg-volt' : 'bg-ink-900/15')}>
            <span className={cn('absolute top-1 size-4 rounded-full bg-ink-900 transition-[inset-inline-start] duration-300', fav ? 'start-5' : 'start-1')} />
          </span>
        </button>
      </FilterGroup>
    </div>
  )
}

export default function ShopPage() {
  const { t } = useTranslation()
  const scope = useRef(null)
  const [params, setParams] = useSearchParams()
  const { categories, brands, gammes } = useStore()
  const favorites = useFavorites()

  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const gamme = params.get('gamme') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || 'featured'
  const max = Number(params.get('max')) || 0
  const fav = params.get('fav') === '1'
  const promoOnly = params.get('promo') === '1'

  const [query, setQuery] = useState(search)
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(PAGE)
  const [sheet, setSheet] = useState(false)

  useIntro(scope, [category])

  /** Updates some search params (null removes them). */
  const set = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v == null || v === '' ? next.delete(k) : next.set(k, v)))
    setParams(next, { replace: true })
  }

  // Keep the search box and the URL in sync (debounced)
  useEffect(() => setQuery(search), [search])
  useEffect(() => {
    if (query === search) return
    const id = setTimeout(() => set({ search: query.trim() || null }), 320)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Server-side filters
  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .getProducts({ category: category || undefined, brand: brand || undefined, gamme: gamme || undefined, search: search || undefined })
      .then((data) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false))
    setVisible(PAGE)
    return () => {
      alive = false
    }
  }, [category, brand, gamme, search])

  useEffect(() => {
    const label = category ? categoryLabel(t, category) : brand || t('nav.shop')
    setSeo({
      title: label,
      description: category
        ? t('shop.seoCategory', '{{name}} : toutes les références au meilleur prix, livrées dans les 58 wilayas avec paiement à la livraison.', { name: label })
        : undefined,
      path: '/shop' + (category ? `?category=${encodeURIComponent(category)}` : ''),
    })
  }, [category, brand, t])

  useEffect(() => {
    if (!sheet) return
    lockScroll('filters')
    return () => unlockScroll('filters')
  }, [sheet])

  // Client-side refinements (price, favourites, sort)
  const priceCeil = useMemo(() => {
    const top = Math.max(0, ...(products || []).map((p) => finalPrice(p)))
    return top > 0 ? Math.ceil(top / 1000) * 1000 : 0
  }, [products])

  const list = useMemo(() => {
    let out = [...(products || [])]
    if (max) out = out.filter((p) => fromPrice(p).price <= max)
    if (fav) out = out.filter((p) => favorites.includes(Number(p.id)))
    if (promoOnly) out = out.filter((p) => promoOf(p) > 0 || p.tag === 'SALE')
    if (SORTS[sort] && sort !== 'featured') out.sort(SORTS[sort])
    return out
  }, [products, max, fav, promoOnly, favorites, sort])

  const ranges = useMemo(() => {
    const cat = categories.find((c) => c.name.toLowerCase() === category.toLowerCase())
    return gammes.filter((g) => (!cat || g.categoryId === cat.id) && (!brand || g.brand?.name?.toLowerCase() === brand.toLowerCase()))
  }, [gammes, categories, category, brand])

  const chips = [
    brand && { key: 'brand', label: brand, clear: { brand: null, gamme: null } },
    gamme && { key: 'gamme', label: gamme, clear: { gamme: null } },
    search && { key: 'search', label: `« ${search} »`, clear: { search: null } },
    max && { key: 'max', label: `≤ ${formatDA(max)}`, clear: { max: null } },
    fav && { key: 'fav', label: t('shop.favoritesOnly'), clear: { fav: null } },
    promoOnly && { key: 'promo', label: t('home.tabPromo', 'Promotions'), clear: { promo: null } },
  ].filter(Boolean)

  const resetAll = () => setParams(new URLSearchParams(category ? { category } : {}), { replace: true })
  const title = category ? categoryLabel(t, category) : promoOnly ? t('home.tabPromo', 'Promotions') : fav ? t('shop.favoritesOnly') : brand || t('ui.catalogue', 'Le catalogue')
  const totalAll = categories.reduce((n, c) => n + (c._count?.products || 0), 0)
  const filterProps = { params, set, brands, ranges, priceCeil, favCount: favorites.length }

  return (
    <Page deps={[products]}>
      <main id="main" ref={scope} className="relative pt-6 pb-24 md:pt-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] overflow-hidden">
          <div className="grid-lines-dark absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_30%_0%,#000_10%,transparent_70%)]" />
          <div className="absolute -top-40 left-[20%] h-[30rem] w-[50rem] bg-[radial-gradient(closest-side,rgba(154,240,126,0.09),transparent)]" />
        </div>

        <div className="container-x relative">
          {/* Header */}
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p data-intro className="mb-4 flex items-center gap-2 text-[0.85rem] text-ink-900/65">
                <Link to="/" className="hover:text-ink-900">
                  {t('nav.home')}
                </Link>
                <span>/</span>
                <Link to="/shop" className="hover:text-ink-900">
                  {t('nav.shop')}
                </Link>
                {category && (
                  <>
                    <span>/</span>
                    <span className="text-ink-900/85">{title}</span>
                  </>
                )}
              </p>
              <h1 key={title} className="text-[clamp(2rem,4vw,3.4rem)] leading-[1] font-semibold tracking-[-0.045em]">
                <SplitWords text={title} />
              </h1>
            </div>
            <p data-intro className="text-[0.98rem] text-ink-900/60 lg:col-span-4 lg:text-end">
              {t('shop.lead', 'Filtrez par marque, gamme ou budget : chaque référence est livrée dans les 58 wilayas, payée à la livraison.')}
            </p>
          </div>

          {/* Category pills */}
          <nav data-intro aria-label={t('nav.categories')} className="-mx-[clamp(1rem,3.4vw,3rem)] mt-7 overflow-x-auto px-[clamp(1rem,3.4vw,3rem)] no-scrollbar">
            <ul className="flex w-max gap-2">
              <li>
                <Link
                  to="/shop"
                  className={cn('flex h-11 items-center gap-2 rounded-full px-5 text-[0.93rem] ring-hair transition-colors', !category ? 'bg-volt text-ink-900' : 'bg-ink-900/[0.04] text-ink-900/75 hover:text-ink-900')}
                >
                  {t('shop.allCategories')}
                  <span className={cn('eyebrow', !category ? 'text-ink-900/60' : 'text-ink-900/62')}>{formatNumber(totalAll)}</span>
                </Link>
              </li>
              {categories.map((c) => {
                const active = c.name.toLowerCase() === category.toLowerCase()
                return (
                  <li key={c.id}>
                    <Link
                      to={`/shop?category=${encodeURIComponent(c.name)}`}
                      className={cn('flex h-11 items-center gap-2 rounded-full px-5 text-[0.93rem] ring-hair transition-colors', active ? 'bg-volt text-ink-900' : 'bg-ink-900/[0.04] text-ink-900/75 hover:text-ink-900')}
                    >
                      {categoryLabel(t, c.name)}
                      <span className={cn('eyebrow', active ? 'text-ink-900/60' : 'text-ink-900/62')}>{formatNumber(c._count?.products ?? 0)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
            {/* Desktop filters */}
            <aside aria-label={t('shop.refineSearch')} className="hidden lg:block">
              <div className="sticky top-32">
                <div className="mb-6 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-ink-900">
                    <SlidersHorizontal className="size-4 text-forest" /> {t('shop.refineSearch')}
                  </p>
                  {chips.length > 0 && (
                    <button type="button" onClick={resetAll} className="eyebrow text-forest">
                      {t('shop.clearAll')}
                    </button>
                  )}
                </div>
                <Filters {...filterProps} />
              </div>
            </aside>

            <div className="min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="relative min-w-[14rem] flex-1">
                  <span className="sr-only">{t('shop.searchPlaceholder')}</span>
                  <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-900/65 ltr:left-4 rtl:right-4" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('shop.searchPlaceholder')}
                    className="field rounded-full ltr:pl-11 rtl:pr-11"
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">{t('ui.sortBy', 'Trier par')}</span>
                  <select value={sort} onChange={(e) => set({ sort: e.target.value === 'featured' ? null : e.target.value })} className="field w-auto rounded-full pe-9">
                    <option value="featured">{t('shop.sortFeatured')}</option>
                    <option value="price-asc">{t('shop.sortPriceAsc')}</option>
                    <option value="price-desc">{t('shop.sortPriceDesc')}</option>
                    <option value="rating">{t('shop.sortRating')}</option>
                    <option value="name">{t('ui.sortName', 'Nom (A → Z)')}</option>
                  </select>
                </label>
                <Btn variant="ghost" size="md" className="h-12 lg:hidden" onClick={() => setSheet(true)} icon={<SlidersHorizontal className="size-4" />}>
                  {t('shop.filters')} {chips.length ? `(${chips.length})` : ''}
                </Btn>
              </div>

              <div className="mt-5 flex min-h-9 flex-wrap items-center gap-2">
                <p className="eyebrow me-2 text-ink-900/65" aria-live="polite">
                  {loading ? t('ui.loading', 'Chargement…') : t('ui.resultCount', '{{count}} produits', { count: list.length })}
                </p>
                {chips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => set(c.clear)}
                    className="flex h-8 items-center gap-1.5 rounded-full bg-ink-900/[0.06] ps-3 pe-2 text-[0.82rem] text-ink-900/85 ring-hair hover:bg-ink-900/[0.1]"
                  >
                    {c.label} <X className="size-3.5 text-ink-900/60" />
                  </button>
                ))}
              </div>

              {/* Grid */}
              {loading && !products ? (
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <div className="mt-6 flex flex-col items-center rounded-[1.5rem] bg-ink-900/[0.03] px-6 py-20 text-center ring-hair">
                  <span className="flex size-16 items-center justify-center rounded-full bg-ink-900/[0.05]">
                    <PackageOpen className="size-7 text-ink-900/65" />
                  </span>
                  <p className="display mt-6 text-[1.8rem] tracking-[-0.03em] text-ink-900">{t('shop.noMatchTitle')}</p>
                  <p className="mt-2 max-w-md text-ink-900/60">{t('shop.noMatchText')}</p>
                  <Btn variant="volt" chip className="mt-8" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                    {t('shop.resetFilters')}
                  </Btn>
                </div>
              ) : (
                <>
                  <div className={cn('mt-6 grid grid-cols-2 gap-3 transition-opacity duration-300 md:grid-cols-3 md:gap-4 xl:grid-cols-4', loading && 'opacity-50')}>
                    {list.slice(0, visible).map((p, i) => (
                      <ProductCard key={p.id} product={p} priority={i < 4} />
                    ))}
                  </div>
                  {list.length > visible && (
                    <div className="mt-14 flex flex-col items-center gap-3">
                      <p className="eyebrow text-ink-900/65">
                        {t('ui.shownOf', '{{shown}} sur {{total}}', { shown: Math.min(visible, list.length), total: list.length })}
                      </p>
                      <Btn variant="ghost" size="lg" chip onClick={() => setVisible((v) => v + PAGE)}>
                        {t('ui.loadMore', 'Afficher plus')}
                      </Btn>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter sheet */}
        <div className={cn('fixed inset-0 z-[130] lg:hidden', sheet ? 'visible' : 'invisible delay-500')} aria-hidden={!sheet}>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setSheet(false)}
            className={cn('absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-500', sheet ? 'opacity-100' : 'opacity-0')}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('shop.filterOptions')}
           
            className={cn(
              'absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pt-3 pb-6 ring-hair transition-transform duration-700 ease-[var(--ease-osmo)]',
              sheet ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-ink-900/20" />
            <div className="mb-6 flex items-center justify-between">
              <p className="display text-[1.6rem] tracking-[-0.03em] text-ink-900">{t('shop.filterOptions')}</p>
              <button type="button" onClick={() => setSheet(false)} className="flex size-10 items-center justify-center rounded-full bg-ink-900/[0.06]" aria-label={t('ui.close', 'Fermer')}>
                <X className="size-4" />
              </button>
            </div>
            <Filters {...filterProps} />
            <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-2 bg-white pt-3">
              <Btn variant="ghost" onClick={resetAll}>
                {t('shop.clearAll')}
              </Btn>
              <Btn variant="volt" onClick={() => setSheet(false)}>
                {t('ui.showResults', 'Voir {{count}} produits', { count: list.length })}
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </Page>
  )
}
