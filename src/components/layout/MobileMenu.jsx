import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, ChevronRight, Home, Store, Percent, GitCompare, User, Heart, Phone } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { lockScroll, unlockScroll } from '@/lib/motion'
import { categoryLabel, formatNumber } from '@/lib/format'
import LanguageSwitch from './LanguageSwitch'
import { Logo, cn } from '@/components/ui/Btn'

/** Mobile navigation drawer: main links, every category, language and contact. */
export default function MobileMenu({ accountHref }) {
  const { t } = useTranslation()
  const { categories } = useStore()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const location = useLocation()

  useEffect(() => setMounted(true), [])

  useEffect(() => setOpen(false), [location.pathname, location.search])
  useEffect(() => {
    if (!open) return
    lockScroll('menu')
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      unlockScroll('menu')
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const links = [
    [Home, '/', t('nav.home')],
    [Store, '/shop', t('nav.shop')],
    [Percent, '/shop?promo=1', t('home.tabPromo', 'Promotions')],
    [Heart, '/shop?fav=1', t('shop.favoritesOnly')],
    [GitCompare, '/compare', t('nav.compare', 'Comparer')],
    [User, accountHref, t('ui.account', 'Mon compte')],
  ]
  const phone = t('store.phone')

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={t('ui.openMenu', 'Ouvrir le menu')}
        className="-ms-2 flex size-11 items-center justify-center rounded-full text-ink-900/88 hover:bg-ink-900/[0.07]"
      >
        <Menu className="size-5" />
      </button>

      {mounted &&
        createPortal(
        <div id="mobile-menu" className={cn('fixed inset-0 z-[150]', open ? 'visible' : 'invisible delay-500')} aria-hidden={!open}>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className={cn('absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
          />
          <nav
            aria-label={t('ui.mainNav', 'Navigation principale')}
           
            className={cn(
              'absolute inset-y-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-white shadow-[0_0_60px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-[var(--ease-osmo)] ltr:left-0 rtl:right-0',
              open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full',
            )}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Link to="/" className="group" onClick={() => setOpen(false)}>
                <Logo />
              </Link>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('ui.closeMenu', 'Fermer le menu')} className="flex size-10 items-center justify-center rounded-full bg-ink-900/[0.06]">
                <X className="size-4" />
              </button>
            </div>

            <ul className="px-3">
              {links.map(([Icon, to, label], i) => (
                <li key={to + label} className={cn('transition-[opacity,transform] duration-500', open ? 'translate-x-0 opacity-100' : 'opacity-0 ltr:-translate-x-4 rtl:translate-x-4')} style={{ transitionDelay: open ? `${80 + i * 35}ms` : '0ms' }}>
                  <Link to={to} onClick={() => setOpen(false)} className="flex h-12 items-center gap-3 rounded-xl px-3 text-[1rem] text-ink-900/88 hover:bg-ink-900/[0.05]">
                    <Icon className="size-[1.1rem] text-forest" /> {label}
                  </Link>
                </li>
              ))}
            </ul>

            {categories.length > 0 && (
              <div className="mt-4 border-t border-ink-900/[0.07] px-3 pt-4">
                <p className="px-3 pb-2 text-[0.78rem] text-ink-900/65">{t('nav.categories')}</p>
                <ul>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setOpen(false)} className="flex h-11 items-center justify-between gap-3 rounded-xl px-3 text-ink-900/80 hover:bg-ink-900/[0.05] hover:text-ink-900">
                        <span className="truncate">{categoryLabel(t, c.name)}</span>
                        <span className="flex items-center gap-1 text-[0.78rem] text-ink-900/62">
                          {formatNumber(c._count?.products ?? 0)} <ChevronRight className="size-3.5 rtl:rotate-180" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto space-y-3 border-t border-ink-900/[0.07] p-5">
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-ink-900/75" dir="ltr">
                <Phone className="size-4 text-forest" /> {phone}
              </a>
              <LanguageSwitch className="flex w-fit" />
            </div>
          </nav>
        </div>,
        document.body,
      )}
    </div>
  )
}
