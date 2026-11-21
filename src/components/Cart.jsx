import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Plus, Minus, Trash2, ShoppingBag, Download, Truck, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { lockScroll, unlockScroll } from '@/lib/motion'
import { formatDA, sizeName } from '@/lib/format'
import Btn, { cn } from '@/components/ui/Btn'

export default function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { minFreeDelivery } = useStore()
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, updateCartItemSpecs, cartCount, cartTotal } = useCart()
  const [pdfBusy, setPdfBusy] = useState(false)

  const progress = minFreeDelivery > 0 ? Math.min(cartTotal / minFreeDelivery, 1) : 1
  const remaining = Math.max(0, minFreeDelivery - cartTotal)
  const close = () => setIsCartOpen(false)

  useEffect(() => {
    if (!isCartOpen) return
    lockScroll('cart')
    const onKey = (e) => e.key === 'Escape' && setIsCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      unlockScroll('cart')
      window.removeEventListener('keydown', onKey)
    }
  }, [isCartOpen, setIsCartOpen])

  const proforma = async () => {
    setPdfBusy(true)
    try {
      const { downloadProforma } = await import('@/lib/proforma')
      await downloadProforma({
        items: cartItems,
        total: cartTotal,
        shippingThreshold: minFreeDelivery,
        labels: { contact: `${t('store.phone')} — ${t('store.address')}` },
      })
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className={cn('fixed inset-0 z-[140]', isCartOpen ? 'visible' : 'invisible delay-500')} aria-hidden={!isCartOpen}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={cn('absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-500', isCartOpen ? 'opacity-100' : 'opacity-0')}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
       
        className={cn(
          'absolute inset-y-0 flex w-full flex-col bg-white shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-[var(--ease-osmo)] sm:inset-y-2 sm:w-[min(30rem,calc(100%-1rem))] sm:rounded-[1.75rem] sm:ring-hair ltr:right-0 rtl:left-0 sm:ltr:right-2 sm:rtl:left-2',
          isCartOpen ? 'translate-x-0' : 'ltr:translate-x-[110%] rtl:-translate-x-[110%]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <div>
            <p className="eyebrow flex items-center gap-2 text-ink-900/65">
              <span className="live-dot" /> {t('cart.title')}
            </p>
            <p className="display mt-2 text-[2rem] leading-none tracking-[-0.04em] text-ink-900">
              {t('ui.cart', 'Panier')} <span className="text-forest tabular">({cartCount})</span>
            </p>
          </div>
          <button type="button" onClick={close} className="flex size-11 items-center justify-center rounded-full bg-ink-900/[0.06] text-ink-900/75 ring-hair hover:text-ink-900" aria-label={t('ui.close', 'Fermer')}>
            <X className="size-4" />
          </button>
        </div>

        {/* Free delivery meter */}
        {cartItems.length > 0 && (
          <div className="mx-6 mb-4 rounded-2xl bg-ink-900/[0.035] p-4 ring-hair">
            <p className="flex items-center gap-2 text-[0.88rem] text-ink-900/80">
              <Truck className={cn('size-4', progress >= 1 ? 'text-forest' : 'text-ink-900/65')} />
              {progress >= 1 ? (
                <span className="text-forest">{t('cart.freeShipping')}</span>
              ) : (
                <span>
                  {t('cart.addMorePrefix')}
                  <span className="tabular text-ink-900">{formatDA(remaining)}</span>
                  {t('cart.addMoreSuffix')}
                </span>
              )}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-900/10">
              <div
                className="h-full origin-left rounded-full bg-gradient-to-r from-forest to-volt shadow-[0_0_12px_rgba(154,240,126,0.5)] transition-transform duration-700 ease-[var(--ease-osmo)] rtl:origin-right"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <span className="flex size-20 items-center justify-center rounded-full bg-ink-900/[0.04] ring-hair">
                <ShoppingBag className="size-7 text-ink-900/65" />
              </span>
              <p className="display mt-6 text-2xl text-ink-900">{t('cart.empty')}</p>
              <p className="mt-2 max-w-xs text-[0.92rem] text-ink-900/60">{t('cart.emptySubtitle')}</p>
              <Btn variant="volt" chip className="mt-8" onClick={() => (close(), navigate('/shop'))}>
                {t('cart.continue')}
              </Btn>
            </div>
          ) : (
            <ul className="divide-y divide-ink-900/[0.07]">
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="flex gap-4 py-4">
                  <Link to={`/product/${item.id}`} onClick={close} className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper">
                    <img src={item.image} alt={item.name} width="80" height="80" loading="lazy" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${item.id}`} onClick={close} className="line-clamp-2 text-[0.95rem] leading-snug text-ink-900 hover:text-forest">
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="-me-1 flex size-8 shrink-0 items-center justify-center rounded-full text-ink-900/65 transition-colors hover:bg-[#ff6b5e]/10 hover:text-[#d93025]"
                        aria-label={t('ui.remove', 'Retirer')}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {(item.sizes?.length > 1 || item.colors?.length > 1) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.sizes?.length > 1 && (
                          <select
                            value={item.size}
                            onChange={(e) => updateCartItemSpecs(item.cartItemId, e.target.value, undefined)}
                            aria-label={t('product.size')}
                            className="h-8 rounded-full bg-ink-900/[0.05] px-3 text-[0.78rem] text-ink-900/85 ring-hair focus:outline-none"
                          >
                            {item.sizes.map((s) => (
                              <option key={sizeName(s)} value={sizeName(s)}>
                                {sizeName(s)}
                              </option>
                            ))}
                          </select>
                        )}
                        {item.colors?.length > 1 && (
                          <select
                            value={item.color}
                            onChange={(e) => updateCartItemSpecs(item.cartItemId, undefined, e.target.value)}
                            aria-label={t('product.color')}
                            className="h-8 rounded-full bg-ink-900/[0.05] px-3 text-[0.78rem] text-ink-900/85 ring-hair focus:outline-none"
                          >
                            {item.colors.map((c) => (
                              <option key={c.name || c} value={c.name || c}>
                                {c.name || c}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    {item.sizes?.length <= 1 && item.size && <p className="eyebrow mt-2 text-ink-900/65">{item.size}</p>}

                    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div className="flex h-9 items-center rounded-full bg-ink-900/[0.05] ring-hair">
                        <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="flex size-9 items-center justify-center text-ink-900/65 hover:text-ink-900" aria-label="−">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="tabular w-7 text-center text-[0.9rem] text-ink-900">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="flex size-9 items-center justify-center text-ink-900/65 hover:text-ink-900" aria-label="+">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-end leading-tight">
                        <span className="tabular block text-ink-900">{formatDA(item.price * item.quantity)}</span>
                        {item.promotionPercentage > 0 && (
                          <span className="tabular text-[0.78rem] text-ink-900/62 line-through">{formatDA((item.priceOriginal || item.price) * item.quantity)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-ink-900/[0.08] p-6">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-ink-900/60">{t('cart.subtotal')}</span>
              <span className="display tabular text-[1.9rem] tracking-[-0.04em] text-ink-900">{formatDA(cartTotal)}</span>
            </div>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-900/65">{t('cart.invoicing')}</p>
            <div className="mt-5 grid gap-2">
              <Btn variant="volt" size="lg" chip className="w-full justify-between ps-7" onClick={() => (close(), navigate('/checkout'))}>
                {t('cart.checkout')}
              </Btn>
              <Btn variant="ghost" size="md" className="w-full" onClick={proforma} disabled={pdfBusy} icon={pdfBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}>
                {t('cart.downloadProforma')}
              </Btn>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
