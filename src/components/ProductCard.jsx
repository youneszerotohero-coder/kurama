import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { flyToCart } from '@/lib/flyToCart'
import { toggleFavorite, useIsFavorite } from '@/lib/favorites'
import { cn } from '@/components/ui/Btn'
import { TAG_KEYS, categoryLabel, formatDA, fromPrice, promoOf, productImage } from '@/lib/format'

/** Catalogue card: product shot on a light tile, badges, rating, price and quick add. */
function ProductCard({ product, reveal = true, className = '', priority = false }) {
  const { t } = useTranslation()
  const { addToCart } = useCart()
  const liked = useIsFavorite(product.id)
  const { price, original, varies } = fromPrice(product)
  const promo = promoOf(product)
  const out = product.inStock === false || Number(product.quantity) === 0
  const tag = TAG_KEYS[product.tag]
  const href = `/product/${product.id}`
  const rating = Number(product.rating) || 5

  const add = (e) => {
    flyToCart(e.currentTarget.closest('article')?.querySelector('img'))
    addToCart(product, 1)
  }

  return (
    // The reveal animation lives on the wrapper so it never fights the card's hover lift
    <div className={cn('h-full', className)} data-reveal={reveal ? '' : undefined}>
    <article className="group/card relative flex h-full flex-col rounded-[1.4rem] bg-white p-2 ring-hair transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(154,240,126,0.25),inset_0_0_0_1px_rgba(154,240,126,0.25)]">
      <div className="relative">
        <Link to={href} state={{ title: product.name }} className="block" aria-label={product.name}>
          <div className="relative aspect-square overflow-hidden rounded-[1.1rem] bg-paper">
            <img
              src={productImage(product)}
              alt={product.name}
              width="400"
              height="400"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-contain p-[10%] mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:scale-[1.08]"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute top-2.5 flex flex-col items-start gap-1.5 ltr:left-2.5 rtl:right-2.5">
          {promo > 0 && <span className="rounded-full bg-volt px-2.5 py-1 text-[0.75rem] font-bold text-ink-900">−{Math.round(promo)}%</span>}
          {tag && <span className="rounded-full bg-ink-900/85 px-2.5 py-1 text-[0.72rem] font-medium text-white backdrop-blur">{t(tag)}</span>}
          {out && <span className="rounded-full bg-[#ff6b5e] px-2.5 py-1 text-[0.72rem] font-semibold text-ink-900">{t('ui.outOfStock', 'Rupture')}</span>}
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={liked}
          aria-label={liked ? t('productPage.liked', 'Retirer des favoris') : t('productPage.addToFavorites', 'Ajouter aux favoris')}
          className={cn(
            'absolute top-2.5 flex size-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-[color,transform] duration-300 hover:scale-110 ltr:right-2.5 rtl:left-2.5',
            liked ? 'text-[#e5483b]' : 'text-ink-900/65 hover:text-ink-900',
          )}
        >
          <Heart className={cn('size-4', liked && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pt-3.5 pb-2">
        <p className="truncate text-[0.78rem] text-ink-900/65">
          {product.brand ? <span className="font-semibold text-forest">{product.brand}</span> : null}
          {product.brand && product.category ? ' · ' : ''}
          {categoryLabel(t, product.category)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.6em] text-[0.98rem] leading-[1.3] tracking-[-0.01em] text-ink-900">
          <Link to={href} state={{ title: product.name }} className="hover:text-forest">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-1 text-[0.78rem] text-ink-900/65" aria-label={`${rating.toFixed(1)} / 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn('size-3', i < Math.round(rating) ? 'fill-forest text-forest' : 'text-ink-900/50')} />
          ))}
          <span className="ms-1 tabular">{rating.toFixed(1)}</span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="min-w-0 leading-tight">
            {varies && <span className="block text-[0.72rem] text-ink-900/65">{t('ui.from', 'À partir de')}</span>}
            <span className="tabular block text-[1.2rem] font-semibold tracking-[-0.02em] text-ink-900">{formatDA(price)}</span>
            {original ? <span className="tabular text-[0.8rem] text-ink-900/65 line-through">{formatDA(original)}</span> : null}
          </p>
          <button
            type="button"
            disabled={out}
            onClick={add}
            aria-label={`${t('productPage.addToCart', 'Ajouter au panier')} — ${product.name}`}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-volt px-3.5 text-[0.85rem] font-medium text-ink-900 transition-[background-color,transform] duration-300 hover:bg-volt-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden xl:inline">{t('ui.add', 'Ajouter')}</span>
          </button>
        </div>
      </div>
    </article>
    </div>
  )
}

export default memo(ProductCard)

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-[1.4rem] bg-white p-2 ring-hair">
      <div className="skeleton aspect-square rounded-[1.1rem]" />
      <div className="space-y-2.5 px-2.5 pt-4 pb-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-6 w-2/5 rounded" />
      </div>
    </div>
  )
}
