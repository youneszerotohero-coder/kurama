import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Minus, Plus, Check, Truck, ShieldCheck, Banknote, Star, Share2, GitCompare, X, Zap, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { toggleFavorite, useIsFavorite } from '@/lib/favorites'
import { setJsonLd, setSeo, absoluteUrl } from '@/lib/seo'
import { TAG_KEYS, basePrice, categoryLabel, finalPrice, formatDA, promoOf, productImage, sizeName } from '@/lib/format'
import Page, { SplitWords, useIntro } from '@/components/layout/Page'
import ProductCard from '@/components/ProductCard'
import { flyToCart } from '@/lib/flyToCart'
import DeliveryFields, { useDelivery } from '@/components/DeliveryFields'
import Btn, { cn } from '@/components/ui/Btn'
import SectionHead from '@/pages/home/SectionHead'

function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(null)
  const src = images[active] || images[0]

  useEffect(() => setActive(0), [images])

  return (
    <div className="lg:sticky lg:top-6">
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-paper"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          key={src}
          data-gallery-img
          src={src}
          alt={name}
          width="900"
          height="900"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-contain p-[8%] mix-blend-multiply transition-transform duration-300 ease-out"
          style={zoom ? { transform: 'scale(1.9)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(10,12,11,0.06)]" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <li key={img + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${name} — ${i + 1}`}
                aria-pressed={active === i}
                className={cn(
                  'block aspect-square w-full overflow-hidden rounded-xl bg-paper transition-[box-shadow,opacity] duration-300',
                  active === i ? 'shadow-[0_0_0_2px_var(--color-volt)]' : 'opacity-60 hover:opacity-100',
                )}
              >
                <img src={img} alt="" width="120" height="120" loading="lazy" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Stars({ value = 5 }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn('size-3.5', i < Math.round(value) ? 'fill-forest text-forest' : 'text-ink-900/50')} />
      ))}
    </span>
  )
}

function DetailTabs({ product, details, positives, negatives }) {
  const { t } = useTranslation()
  const tabs = [
    { id: 'desc', label: t('product.description') },
    details.length > 0 && { id: 'specs', label: t('product.features') },
    (positives.length > 0 || negatives.length > 0) && { id: 'pros', label: t('ui.prosCons', 'Points forts & limites') },
    { id: 'delivery', label: t('ui.deliveryTab', 'Livraison & paiement') },
  ].filter(Boolean)
  const [tab, setTab] = useState('desc')

  return (
    <section aria-label={t('product.description')} className="mt-14 md:mt-20">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-ink-900/[0.08] no-scrollbar">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`tab-${x.id}`}
            aria-selected={tab === x.id}
            aria-controls={`panel-${x.id}`}
            onClick={() => setTab(x.id)}
            className={cn('-mb-px shrink-0 border-b-2 px-4 py-3.5 text-[0.95rem] transition-colors', tab === x.id ? 'border-volt text-ink-900' : 'border-transparent text-ink-900/60 hover:text-ink-900')}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab} className="animate-[toast-in_0.5s_var(--ease-out-expo)] py-8">
        {tab === 'desc' && (
          <p className="max-w-3xl text-[1.05rem] leading-[1.7] whitespace-pre-line text-ink-900/80">{product.description || t('ui.noDescription', 'La fiche détaillée de ce produit arrive bientôt.')}</p>
        )}
        {tab === 'specs' && (
          <dl className="max-w-3xl divide-y divide-ink-900/[0.07] overflow-hidden rounded-2xl ring-hair">
            {details.map((d, i) => {
              const [k, ...v] = String(d).split(':')
              return v.length ? (
                <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3.5 odd:bg-ink-900/[0.025]">
                  <dt className="text-ink-900/60">{k.trim()}</dt>
                  <dd className="text-ink-900">{v.join(':').trim()}</dd>
                </div>
              ) : (
                <div key={i} className="flex gap-3 px-5 py-3.5 text-ink-900/85 odd:bg-ink-900/[0.025]">
                  <dt className="sr-only">{i + 1}</dt>
                  <dd className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-forest" /> {d}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}
        {tab === 'pros' && (
          <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
            {positives.length > 0 && (
              <div className="rounded-2xl bg-volt/20 p-6 shadow-[inset_0_0_0_1px_rgba(154,240,126,0.2)]">
                <p className="mb-4 flex items-center gap-2 text-forest">
                  <ThumbsUp className="size-4" /> {t('compare.positives')}
                </p>
                <ul className="space-y-3 text-ink-900/85">
                  {positives.map((x, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="mt-1 size-3.5 shrink-0 text-forest" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {negatives.length > 0 && (
              <div className="rounded-2xl bg-ink-900/[0.03] p-6 ring-hair">
                <p className="mb-4 flex items-center gap-2 text-ink-900/65">
                  <ThumbsDown className="size-4" /> {t('compare.negatives')}
                </p>
                <ul className="space-y-3 text-ink-900/70">
                  {negatives.map((x, i) => (
                    <li key={i} className="flex gap-3">
                      <X className="mt-1 size-3.5 shrink-0 text-ink-900/65" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {tab === 'delivery' && (
          <ul className="grid max-w-4xl gap-3 sm:grid-cols-3">
            {[
              [Truck, t('ui.r1', 'Livraison 58 wilayas'), t('ui.d1', 'À domicile ou en stop desk. Le tarif s’affiche dès que vous choisissez votre wilaya.')],
              [Banknote, t('ui.r2', 'Paiement à la livraison'), t('ui.d2', 'Vous réglez en espèces à la réception, après vérification du colis.')],
              [ShieldCheck, t('ui.r3', 'Garantie constructeur'), t('ui.d3', 'Produit neuf et d’origine. En cas de défaut, nous organisons l’échange.')],
            ].map(([Icon, title, text]) => (
              <li key={title} className="rounded-2xl bg-ink-900/[0.03] p-5 ring-hair">
                <Icon className="size-5 text-forest" />
                <p className="mt-3 text-ink-900">{title}</p>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-900/60">{text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function ProductPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const scope = useRef(null)
  const { addToCart } = useCart()
  const { minFreeDelivery } = useStore()
  const liked = useIsFavorite(id)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [status, setStatus] = useState('loading')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [express, setExpress] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  useIntro(scope, [product?.id])

  useEffect(() => {
    let alive = true
    setStatus('loading')
    api
      .getProduct(id)
      .then(async (p) => {
        if (!alive) return
        setProduct(p)
        setSize(sizeName(p.sizes?.[0]) || '')
        setColor(p.colors?.[0]?.name || '')
        setQty(1)
        setStatus('ready')
        const rel = await api.getProducts({ category: p.category, limit: 8 }).catch(() => [])
        if (alive) setRelated((rel || []).filter((r) => r.id !== p.id).slice(0, 4))
      })
      .catch(() => alive && setStatus('missing'))
    return () => {
      alive = false
    }
  }, [id])

  const price = product ? finalPrice(product, size) : 0
  const original = product && promoOf(product) > 0 ? basePrice(product, size) : null
  const subtotal = price * qty
  const delivery = useDelivery(subtotal, minFreeDelivery)
  const out = product && (product.inStock === false || Number(product.quantity) <= 0)
  const lowStock = product && !out && Number(product.quantity) <= 5
  const images = useMemo(() => {
    if (!product) return []
    const list = Array.isArray(product.images) && product.images.length ? product.images : [productImage(product)]
    return [...new Set([product.image, ...list].filter(Boolean))]
  }, [product])

  // SEO: title, description, Product structured data
  useEffect(() => {
    if (!product) return
    setSeo({
      title: product.name,
      description: product.description || `${product.name} — ${product.brand || ''} ${categoryLabel(t, product.category)}`,
      image: product.image,
      type: 'product',
    })
    setJsonLd('ld-product', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.ref,
      mpn: product.ref,
      image: images.map(absoluteUrl),
      description: product.description,
      category: product.category,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'DZD',
        price: finalPrice(product).toFixed(2),
        availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'ElectroHub' },
      },
    })
    return () => setJsonLd('ld-product', null)
  }, [product, images, out, t])

  const addToCartNow = () => {
    if (!product) return
    flyToCart(document.querySelector('[data-gallery-img]'))
    addToCart(product, qty, size, color)
  }

  const placeOrder = async () => {
    if (!delivery.validate()) {
      document.getElementById('express')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true)
    try {
      const res = await api.createOrder({
        ...delivery.payload(),
        items: [{ productId: Number(product.id), quantity: qty, size: size || null, color: color || null }],
      })
      delivery.remember()
      setOrder(res)
    } catch (err) {
      delivery.setErrors((e) => ({ ...e, submit: err.message }))
    } finally {
      setSubmitting(false)
    }
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      /* dismissed */
    }
  }

  if (status === 'missing') {
    return (
      <Page key="missing">
        <main id="main" className="flex min-h-[70svh] items-center pt-6">
          <div className="container-x">
            <p className="eyebrow text-forest">404</p>
            <h1 className="display mt-4 text-h2">{t('ui.productMissing', 'Produit introuvable')}</h1>
            <Btn to="/shop" variant="volt" chip className="mt-8">
              {t('nav.shop')}
            </Btn>
          </div>
        </main>
      </Page>
    )
  }

  if (!product) {
    return (
      <Page key="loading">
        <main id="main" className="pt-6 pb-24 md:pt-9" aria-busy="true">
          <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="skeleton aspect-square rounded-[1.5rem]" />
            <div className="space-y-4">
              <div className="skeleton h-3 w-1/4 rounded" />
              <div className="skeleton h-14 w-4/5 rounded-xl" />
              <div className="skeleton h-10 w-1/3 rounded-xl" />
              <div className="skeleton mt-10 h-48 rounded-[1.5rem]" />
            </div>
          </div>
        </main>
      </Page>
    )
  }

  const tag = TAG_KEYS[product.tag]
  const colors = Array.isArray(product.colors) ? product.colors.filter((c) => c?.name) : []
  const sizes = Array.isArray(product.sizes) ? product.sizes.filter((s) => sizeName(s)) : []
  const details = Array.isArray(product.details) ? product.details.filter(Boolean) : []
  const positives = Array.isArray(product.positives) ? product.positives.filter(Boolean) : []
  const negatives = Array.isArray(product.negatives) ? product.negatives.filter(Boolean) : []

  return (
    <Page key={`p-${product.id}`} deps={[product.id, related]}>
      <main id="main" ref={scope} className="pt-6 pb-28 md:pt-9">
        <div className="container-x">
          {/* Breadcrumbs */}
          <nav data-intro aria-label={t('ui.breadcrumb', 'Fil d’Ariane')} className="eyebrow mb-8 flex flex-wrap items-center gap-2 text-ink-900/65">
            <Link to="/" className="hover:text-ink-900">
              {t('nav.home')}
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-ink-900">
              {t('nav.shop')}
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-ink-900">
                  {categoryLabel(t, product.category)}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="max-w-[16rem] truncate text-ink-900/80">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Gallery images={images} name={product.name} />
            </div>

            <div className="lg:col-span-6">
              <div data-intro className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <Link to={`/shop?brand=${encodeURIComponent(product.brand)}`} className="eyebrow rounded-full bg-volt px-2.5 py-1.5 text-ink-900">
                    {product.brand}
                  </Link>
                )}
                {product.gamme && <span className="eyebrow rounded-full bg-ink-900/[0.06] px-2.5 py-1.5 text-ink-900/75 ring-hair">{product.gamme}</span>}
                {tag && <span className="eyebrow rounded-full bg-ink-900/[0.06] px-2.5 py-1.5 text-ink-900/75 ring-hair">{t(tag)}</span>}
              </div>

              <h1 className="mt-4 text-[clamp(1.8rem,3.2vw,2.9rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-ink-900">
                <SplitWords text={product.name} />
              </h1>

              <div data-intro className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9rem] text-ink-900/60">
                <span className="eyebrow">
                  {t('ui.ref', 'Réf.')} <span className="text-ink-900/85">{product.ref}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Stars value={Number(product.rating) || 5} />
                  <span className="tabular">{(Number(product.rating) || 5).toFixed(1)}</span>
                </span>
                <span className={cn('eyebrow flex items-center gap-2', out ? 'text-[#d93025]' : 'text-forest')}>
                  {!out && <span className="live-dot" />}
                  {out ? t('ui.outOfStock', 'Rupture') : lowStock ? t('ui.lowStock', 'Plus que {{n}} en stock', { n: product.quantity }) : t('ui.inStock', 'En stock')}
                </span>
              </div>

              {/* Price */}
              <div data-intro className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2 border-y border-ink-900/[0.08] py-6">
                <span className="display tabular text-[clamp(2.4rem,4vw,3.4rem)] leading-none tracking-[-0.05em] text-ink-900">{formatDA(price)}</span>
                {original && (
                  <>
                    <span className="tabular pb-1 text-[1.1rem] text-ink-900/65 line-through">{formatDA(original)}</span>
                    <span className="eyebrow mb-1.5 rounded-full bg-volt px-2.5 py-1.5 text-ink-900">−{Math.round(promoOf(product))}%</span>
                  </>
                )}
                <span className="eyebrow w-full text-ink-900/65">{t('ui.priceNote', 'Prix TTC · paiement à la livraison')}</span>
              </div>

              {/* Specifications */}
              {sizes.length > 0 && (
                <div data-intro className="mt-7">
                  <p className="eyebrow mb-3 text-ink-900/60">
                    {t('product.size')} : <span className="text-ink-900">{size}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const n = sizeName(s)
                      const p = typeof s === 'object' && Number(s.priceSold) > 0 ? finalPrice(product, s) : null
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSize(n)}
                          aria-pressed={size === n}
                          className={cn(
                            'flex min-h-12 flex-col items-center justify-center rounded-2xl px-4 py-2 ring-hair transition-colors duration-300',
                            size === n ? 'bg-ink-900 text-white' : 'bg-ink-900/[0.03] text-ink-900/80 hover:bg-ink-900/[0.07] hover:text-ink-900',
                          )}
                        >
                          <span className="text-[0.93rem]">{n}</span>
                          {p != null && <span className="tabular text-[0.72rem] opacity-60">{formatDA(p)}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div data-intro className="mt-6">
                  <p className="eyebrow mb-3 text-ink-900/60">
                    {t('product.color')} : <span className="text-ink-900">{color}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        aria-label={c.name}
                        aria-pressed={color === c.name}
                        onClick={() => setColor(c.name)}
                        className={cn('flex size-11 items-center justify-center rounded-full ring-hair transition-shadow', color === c.name && 'shadow-[0_0_0_2px_var(--color-volt)]')}
                      >
                        <span className="size-8 rounded-full shadow-[inset_0_0_0_1px_rgba(10,12,11,0.2)]" style={{ backgroundColor: c.hex || '#888' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div data-intro className="mt-8 flex flex-wrap items-center gap-2.5">
                <div className="flex h-14 items-center rounded-full bg-ink-900/[0.05] ring-hair">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-14 items-center justify-center text-ink-900/65 hover:text-ink-900" aria-label="−">
                    <Minus className="size-4" />
                  </button>
                  <span className="tabular w-8 text-center text-ink-900" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(Math.max(1, Number(product.quantity) || 99), q + 1))}
                    className="flex size-14 items-center justify-center text-ink-900/65 hover:text-ink-900"
                    aria-label="+"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Btn variant="volt" size="lg" chip disabled={out} onClick={addToCartNow} className="flex-1 justify-between ps-7">
                  {t('productPage.addToCart')}
                </Btn>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product.id)}
                  aria-pressed={liked}
                  aria-label={liked ? t('productPage.liked', 'Retirer des favoris') : t('productPage.addToFavorites', 'Ajouter aux favoris')}
                  className={cn('flex size-14 items-center justify-center rounded-full ring-hair transition-colors', liked ? 'bg-[#ff6b5e]/15 text-[#d93025]' : 'bg-ink-900/[0.05] text-ink-900/75 hover:text-ink-900')}
                >
                  <Heart className={cn('size-5', liked && 'fill-current')} />
                </button>
              </div>

              <div data-intro className="mt-2.5 grid grid-cols-2 gap-2.5">
                <Btn variant="ghost" size="md" disabled={out} onClick={() => setExpress((v) => !v)} icon={<Zap className="size-4 text-forest" />} aria-expanded={express} aria-controls="express">
                  {t('productPage.buyNow')}
                </Btn>
                <Btn to={`/compare?p1=${product.id}`} variant="ghost" size="md" icon={<GitCompare className="size-4" />}>
                  {t('nav.compare', 'Comparer')}
                </Btn>
              </div>

              {/* Express order (cash on delivery) */}
              <div id="express" className="collapse-grid" data-open={express}>
                <div>
                  <div className="mt-4 rounded-[1.5rem] bg-ink-900/[0.03] p-5 ring-hair sm:p-6">
                    <p className="eyebrow mb-1 flex items-center gap-2 text-forest">
                      <span className="live-dot" /> {t('productPage.fastCod')}
                    </p>
                    <p className="mb-6 text-ink-900/62">{t('productPage.codSubtitle')}</p>
                    <DeliveryFields delivery={delivery} />
                    <dl className="mt-6 space-y-2 border-t border-ink-900/[0.08] pt-5 text-[0.93rem]">
                      <div className="flex justify-between text-ink-900/65">
                        <dt>
                          {t('productPage.prodPrice')} ({qty}×)
                        </dt>
                        <dd className="tabular text-ink-900">{formatDA(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between text-ink-900/65">
                        <dt>{t('productPage.shippingFee')}</dt>
                        <dd className="tabular text-ink-900">{delivery.fee === 0 ? t('checkout.free') : delivery.fee != null ? formatDA(delivery.fee) : '—'}</dd>
                      </div>
                      <div className="flex items-baseline justify-between pt-2">
                        <dt className="text-ink-900">{t('productPage.total')}</dt>
                        <dd className="display tabular text-[1.7rem] tracking-[-0.04em] text-forest">{formatDA(subtotal + (delivery.fee || 0))}</dd>
                      </div>
                    </dl>
                    {delivery.errors.submit && <p className="mt-3 text-[0.9rem] text-[#d93025]">{delivery.errors.submit}</p>}
                    <Btn
                      variant="volt"
                      size="lg"
                      chip={!submitting}
                      disabled={submitting}
                      onClick={placeOrder}
                      className="mt-5 w-full justify-between ps-7"
                      icon={submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    >
                      {submitting ? t('ui.sending', 'Envoi…') : t('checkout.confirmOrder')}
                    </Btn>
                  </div>
                </div>
              </div>

              {/* Reassurance */}
              <ul data-intro className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  [Truck, t('ui.r1', 'Livraison 58 wilayas')],
                  [Banknote, t('ui.r2', 'Paiement à la livraison')],
                  [ShieldCheck, t('ui.r3', 'Garantie constructeur')],
                ].map(([Icon, label]) => (
                  <li key={label} className="flex items-center gap-3 rounded-2xl bg-ink-900/[0.03] px-4 py-3 text-[0.88rem] text-ink-900/75 ring-hair">
                    <Icon className="size-4 shrink-0 text-forest" /> {label}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={share} className="eyebrow mt-5 flex items-center gap-2 text-ink-900/65 hover:text-ink-900">
                <Share2 className="size-3.5" /> {copied ? t('ui.linkCopied', 'Lien copié') : t('productPage.share')}
              </button>
            </div>
          </div>

          {/* Details: tabs */}
          <DetailTabs product={product} details={details} positives={positives} negatives={negatives} />

          {related.length > 0 && (
            <section aria-labelledby="pdp-related" className="mt-16 md:mt-20">
              <SectionHead
                id="pdp-related"
                title={t('ui.relatedTitle', 'Vous aimerez aussi')}
                subtitle={t('ui.relatedSub', 'D’autres références de la même catégorie.')}
                to={`/shop?category=${encodeURIComponent(product.category || '')}`}
                linkLabel={t('ui.seeAll', 'Tout voir')}
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Mobile sticky bar */}
        <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-full bg-white/90 p-1.5 ps-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] ring-hair backdrop-blur-xl lg:hidden">
          <span className="display tabular flex-1 truncate text-[1.2rem] tracking-[-0.03em] text-ink-900">{formatDA(price)}</span>
          <Btn variant="volt" size="md" chip disabled={out} onClick={addToCartNow}>
            {t('productPage.addToCart')}
          </Btn>
        </div>
      </main>

      {/* Order confirmation */}
      {order && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-ok">
          <button type="button" aria-hidden="true" tabIndex={-1} className="absolute inset-0 bg-ink-900/40 backdrop-blur-md" onClick={() => setOrder(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white p-8 text-center ring-hair">
            <div aria-hidden="true" className="grid-lines-dark absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_50%_0%,#000,transparent_70%)]" />
            <span className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-volt text-ink-900 shadow-[0_0_50px_rgba(154,240,126,0.45)]">
              <Check className="size-7" />
            </span>
            <p id="order-ok" className="display relative mt-6 text-[2rem] tracking-[-0.04em] text-ink-900">
              {t('productPage.successTitle')}
            </p>
            {order.orderId && (
              <p className="eyebrow relative mt-3 text-forest">
                {t('ui.orderNo', 'Commande')} {order.orderId}
              </p>
            )}
            <p className="relative mt-3 text-ink-900/65">{t('productPage.successText')}</p>
            <Btn variant="volt" chip className="relative mt-8 w-full justify-between ps-6" onClick={() => (setOrder(null), setExpress(false))}>
              {t('productPage.continueShopping')}
            </Btn>
          </div>
        </div>
      )}
    </Page>
  )
}
