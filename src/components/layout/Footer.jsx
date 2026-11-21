import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Truck, Banknote, ShieldCheck, FileText, Phone, MapPin, Clock, ArrowUp } from 'lucide-react'
import { scrollToTarget } from '@/lib/motion'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { Logo } from '@/components/ui/Btn'
import LanguageSwitch from './LanguageSwitch'
import { categoryLabel, formatDA } from '@/lib/format'

export default function Footer() {
  const { t } = useTranslation()
  const { categories, brands, minFreeDelivery } = useStore()
  const { setIsCartOpen } = useCart()
  const phone = t('store.phone')
  const tel = `tel:${phone.replace(/\s+/g, '')}`

  const perks = [
    [Truck, t('ui.r1', 'Livraison 58 wilayas'), t('footer2.p1', 'Offerte dès {{amount}}', { amount: formatDA(minFreeDelivery) })],
    [Banknote, t('ui.r2', 'Paiement à la livraison'), t('footer2.p2', 'En espèces, sans avance')],
    [ShieldCheck, t('ui.r3', 'Garantie constructeur'), t('footer2.p3', 'Produits neufs et d’origine')],
    [FileText, t('footer2.proforma', 'Devis proforma'), t('footer2.p4', 'PDF en un clic depuis le panier')],
  ]

  const linkCls = 'text-[0.93rem] text-ink-900/65 transition-colors hover:text-ink-900'

  return (
    <footer className="relative z-30 mt-auto bg-paper text-ink-900">
      {/* Reassurance */}
      <div className="border-y border-ink-900/[0.08] bg-white">
        <ul className="container-x grid grid-cols-2 gap-px lg:grid-cols-4">
          {perks.map(([Icon, title, text]) => (
            <li key={title} className="flex items-center gap-3.5 py-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-volt/25 text-forest">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-medium text-ink-900">{title}</span>
                <span className="block text-[0.82rem] text-ink-900/65">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-x grid grid-cols-2 gap-10 py-14 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <Link to="/" className="group inline-block">
            <Logo size="lg" />
          </Link>
          <p className="mt-5 max-w-sm text-[0.93rem] leading-relaxed text-ink-900/60">{t('footer.tagline')}</p>
          <ul className="mt-6 space-y-2.5 text-[0.92rem] text-ink-900/70">
            <li>
              <a href={tel} className="flex items-center gap-2.5 hover:text-ink-900" dir="ltr">
                <Phone className="size-4 text-forest" /> {phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-forest" /> {t('store.address')}
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-forest" /> {t('store.weekdays')} · {t('store.friday')}
            </li>
          </ul>
        </div>

        <nav aria-label={t('nav.categories')} className="md:col-span-3">
          <p className="mb-4 text-[0.95rem] font-medium">{t('nav.categories')}</p>
          <ul className="space-y-2.5">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${encodeURIComponent(c.name)}`} className={linkCls}>
                  {categoryLabel(t, c.name)}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="text-[0.93rem] text-forest hover:text-volt-300">
                {t('ui.allProducts', 'Tous les produits')} →
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('footer.help')} className="md:col-span-2">
          <p className="mb-4 text-[0.95rem] font-medium">{t('footer2.service', 'Service client')}</p>
          <ul className="space-y-2.5">
            <li>
              <Link to="/#faq" className={linkCls}>
                {t('footer.faq')}
              </Link>
            </li>
            <li>
              <button type="button" onClick={() => setIsCartOpen(true)} className={linkCls}>
                {t('footer2.proforma', 'Devis proforma')}
              </button>
            </li>
            <li>
              <Link to="/compare" className={linkCls}>
                {t('nav.compare', 'Comparer')}
              </Link>
            </li>
            <li>
              <a href={tel} className={linkCls}>
                {t('footer.contact')}
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('ui.account', 'Mon compte')} className="md:col-span-3">
          <p className="mb-4 text-[0.95rem] font-medium">{t('ui.account', 'Mon compte')}</p>
          <ul className="space-y-2.5">
            <li>
              <Link to="/login" className={linkCls}>
                {t('auth.signIn')} / {t('auth.signUp')}
              </Link>
            </li>
            <li>
              <Link to="/profile" className={linkCls}>
                {t('profile.orderHistory')}
              </Link>
            </li>
            <li>
              <Link to="/shop?fav=1" className={linkCls}>
                {t('shop.favoritesOnly')}
              </Link>
            </li>
          </ul>
          {brands.length > 0 && (
            <>
              <p className="mt-7 mb-3 text-[0.95rem] font-medium">{t('nav.brands')}</p>
              <ul className="flex flex-wrap gap-1.5">
                {brands.slice(0, 8).map((b) => (
                  <li key={b.id}>
                    <Link to={`/shop?brand=${encodeURIComponent(b.name)}`} className="block rounded-full px-3 py-1.5 text-[0.8rem] text-ink-900/65 ring-hair hover:bg-ink-900 hover:text-white">
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </div>

      <div className="border-t border-ink-900/[0.06]">
        <div className="container-x flex flex-col gap-4 py-6 text-[0.85rem] text-ink-900/65 md:flex-row md:items-center md:justify-between">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-3">
            <LanguageSwitch className="flex" />
            <button
              type="button"
              onClick={() => scrollToTarget(0)}
              className="flex size-10 items-center justify-center rounded-full bg-ink-900/[0.06] text-ink-900/75 transition-colors hover:bg-volt hover:text-ink-900"
              aria-label={t('footer2.top', 'Retour en haut')}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
