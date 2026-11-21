import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ShoppingCart, User, Heart, ChevronDown, Menu as MenuIcon, Truck, Banknote, Phone, Percent, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { useFavorites } from '@/lib/favorites'
import { Logo, cn } from '@/components/ui/Btn'
import LanguageSwitch from './LanguageSwitch'
import MobileMenu from './MobileMenu'
import { categoryLabel, formatDA, formatNumber, isUploaded } from '@/lib/format'
import { openSearch } from './searchBus'

/** Height reserved under the fixed header: announcement 36 + main bar 64/72 + bottom row 56/48. */
export const HEADER_SPACER = 'h-[156px]'

function useCurrentUser() {
  const location = useLocation()
  const [user, setUser] = useState(null)
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('currentUser') || 'null'))
    } catch {
      setUser(null)
    }
  }, [location.pathname])
  return user
}

/** Hover-intent dropdown state. */
function useHoverPanel() {
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const show = () => {
    clearTimeout(timer.current)
    setOpen(true)
  }
  const hide = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), 150)
  }
  const close = () => {
    clearTimeout(timer.current)
    setOpen(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  return { open, show, hide, close }
}

function CategoriesPanel({ onNavigate }) {
  const { t } = useTranslation()
  const { categories, gammes } = useStore()
  const [active, setActive] = useState(null)
  const current = categories.find((c) => c.id === active) || categories[0]
  const ranges = useMemo(() => gammes.filter((g) => g.categoryId === current?.id), [gammes, current])

  if (!categories.length) return <p className="p-8 text-ink-900/60">{t('ui.loading', 'Chargement…')}</p>

  return (
    <div className="grid grid-cols-12">
      <ul className="col-span-4 max-h-[26rem] overflow-y-auto border-e border-ink-900/[0.07] bg-[#fafaf8] p-2">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              onMouseEnter={() => setActive(c.id)}
              onFocus={() => setActive(c.id)}
              onClick={onNavigate}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-[0.93rem] transition-colors duration-150',
                current?.id === c.id ? 'bg-white font-medium text-ink-900 shadow-sm ring-hair' : 'text-ink-900/70 hover:text-ink-900',
              )}
            >
              <span className="truncate">{categoryLabel(t, c.name)}</span>
              <span className="tabular text-[0.78rem] text-ink-900/60">{c._count?.products ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="col-span-8 p-6">
        <div className="mb-5 flex items-center justify-between gap-6">
          <div>
            <p className="text-[0.8rem] text-forest">{current?.parentCategory || t('ui.category', 'Catégorie')}</p>
            <p className="mt-0.5 text-[1.45rem] font-semibold tracking-[-0.03em] text-ink-900">{categoryLabel(t, current?.name)}</p>
          </div>
          <Link
            to={`/shop?category=${encodeURIComponent(current?.name || '')}`}
            onClick={onNavigate}
            className="group flex h-10 items-center gap-2 rounded-full bg-ink-900 px-4 text-[0.88rem] font-medium text-white hover:bg-forest"
          >
            {t('ui.seeProducts', 'Voir les produits')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </div>
        {ranges.length ? (
          <ul className="grid grid-cols-2 gap-2">
            {ranges.slice(0, 8).map((g) => (
              <li key={g.id}>
                <Link
                  to={`/shop?category=${encodeURIComponent(current.name)}&brand=${encodeURIComponent(g.brand?.name || '')}&gamme=${encodeURIComponent(g.name)}`}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-xl p-2.5 ring-hair transition-colors hover:bg-paper"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper text-[0.8rem] font-semibold text-ink-900">
                    {isUploaded(g.image) ? <img src={g.image} alt="" width="40" height="40" loading="lazy" className="h-full w-full object-contain mix-blend-multiply" /> : g.name.slice(0, 2)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.92rem] text-ink-900">{g.name}</span>
                    <span className="text-[0.78rem] text-ink-900/65">{g.brand?.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-paper p-5 text-ink-900/65">{t('ui.categoryPanelEmpty', 'Découvrez toute la sélection de cette catégorie dans la boutique.')}</p>
        )}
      </div>
    </div>
  )
}

function BrandsPanel({ onNavigate }) {
  const { t } = useTranslation()
  const { brands } = useStore()
  if (!brands.length) return <p className="p-8 text-ink-900/60">{t('ui.loading', 'Chargement…')}</p>
  return (
    <ul className="grid grid-cols-3 gap-2 p-4 xl:grid-cols-4">
      {brands.map((b) => (
        <li key={b.id}>
          <Link to={`/shop?brand=${encodeURIComponent(b.name)}`} onClick={onNavigate} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-hair transition-colors hover:bg-paper">
            <span className="min-w-0">
              <span className="block truncate font-semibold tracking-[-0.01em] text-ink-900">{b.name}</span>
              <span className="text-[0.78rem] text-ink-900/65">
                {formatNumber(b._count?.products ?? 0)} {t('ui.productsWord', 'produits')}
                {b.origin ? ` · ${b.origin}` : ''}
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-ink-900/50 rtl:rotate-180" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const { setIsCartOpen, cartCount, cartTotal } = useCart()
  const { minFreeDelivery } = useStore()
  const favorites = useFavorites()
  const user = useCurrentUser()
  const [scrolled, setScrolled] = useState(false)
  const [rowHidden, setRowHidden] = useState(false)
  const lastY = useRef(0)
  const cats = useHoverPanel()
  const brands = useHoverPanel()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 36)
      if (Math.abs(y - lastY.current) > 6) {
        setRowHidden(y > 240 && y > lastY.current)
        lastY.current = y
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    cats.close()
    brands.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  const accountHref = user ? (user.role === 'ADMIN' ? '/admin' : '/profile') : '/login'
  const panelOpen = cats.open || brands.open
  const phone = t('store.phone')
  const firstName = user ? (user.name || user.fullName || '').split(' ')[0] : ''

  const link = ({ isActive }) =>
    cn(
      'relative flex h-full items-center px-3 text-[0.92rem] transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-volt after:transition-transform after:duration-300 hover:text-ink-900 hover:after:scale-x-100',
      isActive ? 'font-medium text-ink-900 after:scale-x-100' : 'text-ink-900/70',
    )

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white">
        {t('ui.skip', 'Aller au contenu')}
      </a>

      <header className={cn('fixed inset-x-0 top-0 z-[100] transition-transform duration-500 ease-[var(--ease-out-expo)]', scrolled && '-translate-y-9')}>
        {/* Announcement bar */}
        <div className="h-9 bg-ink-900 text-white/85">
          <div className="container-x flex h-full items-center justify-between gap-4 text-[0.8rem]">
            <p className="flex min-w-0 items-center gap-2 truncate">
              <Truck className="size-3.5 shrink-0 text-volt" />
              <span className="truncate">{t('ui.announce', 'Livraison offerte dès {{amount}} · 58 wilayas', { amount: formatDA(minFreeDelivery) })}</span>
            </p>
            <p className="hidden items-center gap-2 md:flex">
              <Banknote className="size-3.5 text-volt" /> {t('ui.r2', 'Paiement à la livraison')}
            </p>
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hidden items-center gap-2 hover:text-white sm:flex" dir="ltr">
              <Phone className="size-3.5 text-volt" /> {phone}
            </a>
          </div>
        </div>

        {/* Main bar */}
        <div className={cn('relative z-20 bg-white transition-shadow duration-300', scrolled ? 'shadow-[0_1px_0_rgba(10,12,11,0.08),0_10px_30px_-20px_rgba(10,12,11,0.3)]' : 'shadow-[0_1px_0_rgba(10,12,11,0.08)]')}>
          <div className="container-x flex h-16 items-center gap-3 lg:h-[4.5rem] lg:gap-8">
            <MobileMenu accountHref={accountHref} />
            <Link to="/" className="group shrink-0" aria-label={t('ui.homeAria', 'ElectroHub — accueil')}>
              <Logo />
            </Link>

            <button
              type="button"
              onClick={openSearch}
              className="group hidden h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f3f3f0] ps-4 pe-1.5 text-start transition-[background-color,box-shadow] hover:bg-[#ededea] hover:shadow-[inset_0_0_0_1px_rgba(10,12,11,0.12)] md:flex"
            >
              <Search className="size-[1.1rem] shrink-0 text-ink-900/62 group-hover:text-forest" />
              <span className="min-w-0 flex-1 truncate text-[0.95rem] text-ink-900/65">{t('search.placeholder')}</span>
              <span className="flex h-9 items-center rounded-lg bg-ink-900 px-4 text-[0.88rem] font-medium text-white transition-colors group-hover:bg-forest">{t('search.btn')}</span>
            </button>

            <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
              <button type="button" onClick={openSearch} className="flex size-11 items-center justify-center rounded-full text-ink-900 hover:bg-ink-900/[0.05] md:hidden" aria-label={t('search.btn')}>
                <Search className="size-5" />
              </button>
              <Link to={accountHref} className="hidden h-11 items-center gap-2.5 rounded-xl px-2.5 text-ink-900 hover:bg-ink-900/[0.05] sm:flex">
                <User className="size-[1.35rem]" strokeWidth={1.75} />
                <span className="sr-only xl:hidden">{t('ui.account', 'Mon compte')}</span>
                <span className="hidden text-start leading-tight xl:block">
                  <span className="block text-[0.72rem] text-ink-900/65">{user ? `${t('ui.hello', 'Bonjour')} ${firstName}` : t('ui.signIn', 'Espace client')}</span>
                  <span className="block text-[0.88rem] font-medium">{t('ui.account', 'Mon compte')}</span>
                </span>
              </Link>
              <Link to="/shop?fav=1" className="relative hidden size-11 items-center justify-center rounded-xl text-ink-900 hover:bg-ink-900/[0.05] sm:flex" aria-label={t('shop.favoritesOnly')}>
                <Heart className="size-[1.35rem]" strokeWidth={1.75} />
                {favorites.length > 0 && (
                  <span className="tabular absolute top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e5483b] px-1 text-[0.65rem] font-semibold text-white ltr:right-1 rtl:left-1">{favorites.length}</span>
                )}
              </Link>
              <button
                type="button"
                data-cart-target
                onClick={() => setIsCartOpen(true)}
                className="flex h-11 items-center gap-2.5 rounded-xl px-2.5 text-ink-900 hover:bg-ink-900/[0.05]"
              >
                <span className="sr-only lg:hidden">{t('ui.cart', 'Panier')}</span>
                <span className="relative">
                  <ShoppingCart className="size-[1.35rem]" strokeWidth={1.75} />
                  <span data-cart-count className="tabular absolute -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-volt px-1 text-[0.65rem] font-bold text-ink-900 ltr:-right-2.5 rtl:-left-2.5">
                    {cartCount}
                  </span>
                </span>
                <span className="hidden text-start leading-tight lg:block">
                  <span className="block text-[0.72rem] text-ink-900/65">{t('ui.cart', 'Panier')}</span>
                  <span className="tabular block text-[0.88rem] font-semibold">{formatDA(cartTotal)}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: mobile search / desktop navigation */}
        <div className={cn('relative z-10 bg-white shadow-[0_1px_0_rgba(10,12,11,0.08)] transition-transform duration-500 ease-[var(--ease-out-expo)]', rowHidden && !panelOpen && '-translate-y-full')}>
          <div className="container-x flex h-14 items-center md:hidden">
            <button type="button" onClick={openSearch} className="flex h-10 w-full items-center gap-3 rounded-xl bg-[#f3f3f0] px-4 text-start text-[0.9rem] text-ink-900/65">
              <Search className="size-4 text-forest" /> <span className="truncate">{t('search.placeholder')}</span>
            </button>
          </div>

          <nav aria-label={t('ui.mainNav', 'Navigation principale')} className="container-x relative hidden h-14 items-stretch md:flex lg:h-12">
            <div className="flex items-stretch" onMouseEnter={() => (brands.close(), cats.show())} onMouseLeave={cats.hide}>
              <button
                type="button"
                aria-expanded={cats.open}
                onClick={() => (cats.open ? cats.close() : (brands.close(), cats.show()))}
                className={cn('flex items-center gap-2 pe-4 text-[0.92rem] font-semibold whitespace-nowrap transition-colors', cats.open ? 'text-forest' : 'text-ink-900 hover:text-forest')}
              >
                <MenuIcon className="size-[1.1rem]" />
                {t('shop.allCategories')}
                <ChevronDown className={cn('size-4 transition-transform duration-300', cats.open && 'rotate-180')} />
              </button>
            </div>
            <span className="my-3.5 w-px bg-ink-900/10" aria-hidden="true" />
            <ul className="flex items-stretch ps-1">
              <li>
                <NavLink to="/" end className={link}>
                  {t('nav.home')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" end className={link}>
                  {t('nav.shop')}
                </NavLink>
              </li>
              <li className="flex items-stretch" onMouseEnter={() => (cats.close(), brands.show())} onMouseLeave={brands.hide}>
                <button
                  type="button"
                  aria-expanded={brands.open}
                  onClick={() => (brands.open ? brands.close() : (cats.close(), brands.show()))}
                  className={cn('flex items-center gap-1 px-3 text-[0.92rem] transition-colors', brands.open ? 'text-ink-900' : 'text-ink-900/70 hover:text-ink-900')}
                >
                  {t('nav.brands')}
                  <ChevronDown className={cn('size-3.5 transition-transform duration-300', brands.open && 'rotate-180')} />
                </button>
              </li>
              <li>
                <NavLink to="/compare" className={link}>
                  {t('nav.compare', 'Comparer')}
                </NavLink>
              </li>
              <li>
                <Link to="/shop?promo=1" className="flex h-full items-center gap-1.5 px-3 text-[0.92rem] font-semibold text-[#c62828] hover:text-[#a51f1f]">
                  <Percent className="size-4" /> {t('home.tabPromo', 'Promotions')}
                </Link>
              </li>
            </ul>
            <div className="ms-auto flex items-center">
              <LanguageSwitch className="flex scale-90" />
            </div>

            {/* Dropdowns */}
            <div
              onMouseEnter={cats.open ? cats.show : brands.show}
              onMouseLeave={cats.open ? cats.hide : brands.hide}
              className={cn(
                'absolute inset-x-[clamp(1rem,3.4vw,3rem)] top-full pt-2 transition-[opacity,transform,visibility] duration-200 ease-out',
                panelOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
              )}
            >
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_70px_-25px_rgba(10,12,11,0.35)] ring-1 ring-ink-900/[0.08]">
                {cats.open && <CategoriesPanel onNavigate={cats.close} />}
                {brands.open && <BrandsPanel onNavigate={brands.close} />}
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
