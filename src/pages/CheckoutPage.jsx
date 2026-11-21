import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Loader2, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { setSeo } from '@/lib/seo'
import { formatDA } from '@/lib/format'
import Page, { SplitWords, useIntro } from '@/components/layout/Page'
import DeliveryFields, { useDelivery } from '@/components/DeliveryFields'
import Btn from '@/components/ui/Btn'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const scope = useRef(null)
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart } = useCart()
  const { minFreeDelivery } = useStore()
  const delivery = useDelivery(cartTotal, minFreeDelivery)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)

  useIntro(scope, [order])
  useEffect(() => setSeo({ title: t('ui.checkoutTitle', 'Validation de commande'), noindex: true }), [t])

  const submit = async (e) => {
    e.preventDefault()
    if (!delivery.validate()) {
      const first = document.querySelector('[aria-invalid="true"]')
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      first?.focus({ preventScroll: true })
      return
    }
    setSubmitting(true)
    try {
      const res = await api.createOrder({
        ...delivery.payload(),
        items: cartItems.map((i) => ({ productId: Number(i.id), quantity: Number(i.quantity), size: i.size || null, color: i.color || null })),
      })
      delivery.remember()
      setOrder({ ...res, total: cartTotal + (delivery.fee || 0) })
      clearCart()
      window.scrollTo(0, 0)
    } catch (err) {
      delivery.setErrors((x) => ({ ...x, submit: err.message }))
    } finally {
      setSubmitting(false)
    }
  }

  if (order) {
    return (
      <Page key="done">
        <main id="main" ref={scope} className="relative flex min-h-[70svh] items-center overflow-hidden py-16">
          <div aria-hidden="true" className="grid-lines-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_20%,transparent_75%)]" />
          <div className="container-x relative max-w-3xl text-center">
            <span data-intro className="mx-auto flex size-20 items-center justify-center rounded-full bg-volt text-ink-900 shadow-[0_0_70px_rgba(154,240,126,0.45)]">
              <Check className="size-9" />
            </span>
            <h1 className="mt-8 text-[clamp(2.2rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.045em]">
              <SplitWords text={t('checkout.orderConfirmed')} />
            </h1>
            {order.orderId && (
              <p data-intro className="eyebrow mt-6 text-forest">
                {t('ui.orderNo', 'Commande')} {order.orderId} · {formatDA(order.total)}
              </p>
            )}
            <p data-intro className="mx-auto mt-5 max-w-lg text-lead text-ink-900/65">
              {t('productPage.successText')}
            </p>
            <div data-intro className="mt-10 flex flex-wrap justify-center gap-2.5">
              <Btn to="/shop" variant="volt" size="lg" chip>
                {t('productPage.continueShopping')}
              </Btn>
              <Btn to="/profile" variant="ghost" size="lg">
                {t('profile.orderHistory')}
              </Btn>
            </div>
          </div>
        </main>
      </Page>
    )
  }

  return (
    <Page key="form">
      <main id="main" ref={scope} className="pt-6 pb-24 md:pt-9">
        <div className="container-x">
          <p data-intro className="mb-4 flex items-center gap-2 text-[0.85rem] text-ink-900/65">
            <Link to="/shop" className="hover:text-ink-900">
              {t('nav.shop')}
            </Link>
            <span>/</span>
            <span className="text-ink-900/85">{t('cart.checkout')}</span>
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.2rem)] leading-[1] font-semibold tracking-[-0.045em]">
            <SplitWords text={t('ui.checkoutTitle', 'Validation de commande')} />
          </h1>

          {cartItems.length === 0 ? (
            <div data-intro className="mt-8 flex flex-col items-center rounded-[1.75rem] bg-ink-900/[0.03] px-6 py-20 text-center ring-hair">
              <span className="flex size-16 items-center justify-center rounded-full bg-ink-900/[0.05]">
                <ShoppingBag className="size-7 text-ink-900/65" />
              </span>
              <p className="display mt-6 text-[1.8rem] tracking-[-0.03em] text-ink-900">{t('cart.empty')}</p>
              <p className="mt-2 max-w-md text-ink-900/60">{t('cart.emptySubtitle')}</p>
              <Btn to="/shop" variant="volt" chip className="mt-8">
                {t('cart.continue')}
              </Btn>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-12">
              <section data-intro aria-labelledby="ship-title" className="rounded-[1.75rem] bg-ink-900/[0.03] p-6 ring-hair sm:p-8 lg:col-span-7">
                <p className="eyebrow mb-2 flex items-center gap-2 text-forest">
                  <span className="live-dot" /> {t('checkout.codBadge')}
                </p>
                <h2 id="ship-title" className="display text-[2rem] tracking-[-0.04em] text-ink-900">
                  {t('checkout.shippingDetails')}
                </h2>
                <p className="mt-2 mb-8 text-ink-900/62">{t('checkout.shippingSubtitle')}</p>
                <DeliveryFields delivery={delivery} />
              </section>

              <aside data-intro aria-labelledby="sum-title" className="rounded-[1.75rem] bg-white p-6 ring-hair sm:p-8 lg:sticky lg:top-32 lg:col-span-5">
                <h2 id="sum-title" className="flex items-baseline justify-between">
                  <span className="display text-[1.6rem] tracking-[-0.03em] text-ink-900">{t('checkout.orderSummary')}</span>
                  <span className="eyebrow text-ink-900/65">
                    {cartCount} {t('profile.items')}
                  </span>
                </h2>

                <ul className="mt-5 max-h-[22rem] divide-y divide-ink-900/[0.07] overflow-y-auto pe-1">
                  {cartItems.map((item) => (
                    <li key={item.cartItemId} className="flex gap-3 py-3.5">
                      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                        <img src={item.image} alt="" width="64" height="64" loading="lazy" className="h-full w-full object-contain p-1 mix-blend-multiply" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[0.92rem] text-ink-900">{item.name}</p>
                        <p className="eyebrow mt-1 truncate text-ink-900/65">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex h-8 items-center rounded-full bg-ink-900/[0.05] ring-hair">
                            <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="flex size-8 items-center justify-center text-ink-900/65 hover:text-ink-900" aria-label="−">
                              <Minus className="size-3" />
                            </button>
                            <span className="tabular w-6 text-center text-[0.85rem]">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="flex size-8 items-center justify-center text-ink-900/65 hover:text-ink-900" aria-label="+">
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <span className="tabular text-[0.92rem] text-ink-900">{formatDA(item.price * item.quantity)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.cartItemId)} className="self-start p-1 text-ink-900/62 hover:text-[#d93025]" aria-label={t('ui.remove', 'Retirer')}>
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <dl className="mt-4 space-y-2.5 border-t border-ink-900/[0.08] pt-5 text-[0.93rem]">
                  <div className="flex justify-between text-ink-900/65">
                    <dt>{t('checkout.itemsSubtotal')}</dt>
                    <dd className="tabular text-ink-900">{formatDA(cartTotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-900/65">
                    <dt>{t('checkout.shippingLogistics')}</dt>
                    <dd className="tabular text-ink-900">
                      {delivery.fee === 0 ? <span className="text-forest">{t('checkout.free')}</span> : delivery.fee != null ? formatDA(delivery.fee) : t('ui.chooseWilaya', 'Choisir la wilaya')}
                    </dd>
                  </div>
                  {!delivery.free && minFreeDelivery > cartTotal && (
                    <p className="eyebrow text-ink-900/65">
                      {t('cart.addMorePrefix')}
                      {formatDA(minFreeDelivery - cartTotal)}
                      {t('cart.addMoreSuffix')}
                    </p>
                  )}
                  <div className="flex items-baseline justify-between border-t border-ink-900/[0.08] pt-4">
                    <dt className="text-ink-900">{t('checkout.estimatedTotal')}</dt>
                    <dd className="display tabular text-[2rem] tracking-[-0.04em] text-forest">{formatDA(cartTotal + (delivery.fee || 0))}</dd>
                  </div>
                </dl>

                {delivery.errors.submit && (
                  <p role="alert" className="mt-4 rounded-xl bg-[#ff6b5e]/10 px-4 py-3 text-[0.9rem] text-[#d93025]">
                    {delivery.errors.submit}
                  </p>
                )}

                <Btn
                  type="submit"
                  variant="volt"
                  size="lg"
                  chip={!submitting}
                  disabled={submitting}
                  className="mt-6 w-full justify-between ps-7"
                  icon={submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                >
                  {submitting ? t('ui.sending', 'Envoi…') : t('checkout.confirmOrder')}
                </Btn>
                <p className="eyebrow mt-4 flex items-center justify-center gap-2 text-center text-ink-900/65">
                  <ShieldCheck className="size-3.5 text-forest" /> {t('checkout.fulfillmentGuarantee')}
                </p>
              </aside>
            </form>
          )}
        </div>
      </main>
    </Page>
  )
}
