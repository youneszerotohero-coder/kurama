import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatDA } from '@/lib/format'

/** "Added to cart" confirmation with quick access to the cart and checkout. */
export default function CartToast() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lastAdded, dismissLastAdded, setIsCartOpen, cartCount, cartTotal } = useCart()

  useEffect(() => {
    if (!lastAdded) return
    const id = setTimeout(dismissLastAdded, 4500)
    return () => clearTimeout(id)
  }, [lastAdded, dismissLastAdded])

  if (!lastAdded) return null

  return (
    <div
      key={lastAdded.key}
      role="status"
      className="fixed bottom-4 z-[130] w-[min(24rem,calc(100%-2rem))] animate-[toast-in_0.6s_var(--ease-out-expo)] overflow-hidden rounded-2xl bg-paper shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-ink-900/10 ltr:right-4 rtl:left-4"
    >
      <div className="flex items-center gap-3 p-3">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
          {lastAdded.image && <img src={lastAdded.image} alt="" width="56" height="56" className="h-full w-full object-contain p-1 mix-blend-multiply" />}
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-volt text-ink-900 ring-2 ring-ink-800">
            <Check className="size-3.5" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8rem] text-forest">{t('ui.added', 'Ajouté au panier')}</p>
          <p className="truncate text-[0.92rem] text-ink-900">{lastAdded.name}</p>
          <p className="tabular text-[0.78rem] text-ink-900/65">
            {cartCount} {t('profile.items')} · {formatDA(cartTotal)}
          </p>
        </div>
        <button type="button" onClick={dismissLastAdded} className="flex size-8 items-center justify-center self-start rounded-full text-ink-900/65 hover:bg-ink-900/[0.08] hover:text-ink-900" aria-label={t('ui.close', 'Fermer')}>
          <X className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-px bg-ink-900/[0.06]">
        <button type="button" onClick={() => (dismissLastAdded(), setIsCartOpen(true))} className="h-11 bg-paper text-[0.88rem] text-ink-900 hover:bg-paper-200">
          {t('ui.viewCart', 'Voir le panier')}
        </button>
        <button type="button" onClick={() => (dismissLastAdded(), navigate('/checkout'))} className="h-11 bg-volt text-[0.88rem] font-medium text-ink-900 hover:bg-volt-300">
          {t('cart.checkout')}
        </button>
      </div>
      <span className="absolute bottom-0 left-0 h-0.5 animate-[spot-progress_4.5s_linear_forwards] bg-volt/60" />
    </div>
  )
}
