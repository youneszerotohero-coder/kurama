import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CartProvider, useCart } from '@/context/CartContext'
import { SEARCH_EVENT, openSearch } from '@/components/layout/searchBus'
import { StoreProvider } from '@/context/StoreContext'
import { scrollToTarget } from '@/lib/motion'
import Header, { HEADER_SPACER } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition, { runPageTransition } from '@/components/layout/PageTransition'
import CartToast from '@/components/CartToast'
import ProtectedRoute from '@/components/ProtectedRoute'
import HomePage from '@/pages/home/HomePage'

// Everything but the home page is split out, so the first visit ships as little JavaScript as possible
const pages = {
  shop: () => import('@/pages/ShopPage'),
  product: () => import('@/pages/ProductPage'),
  compare: () => import('@/pages/ComparePage'),
  checkout: () => import('@/pages/CheckoutPage'),
  auth: () => import('@/pages/AuthPage'),
  profile: () => import('@/pages/ProfilePage'),
  notFound: () => import('@/pages/NotFound'),
  adminLayout: () => import('@/pages/admin/AdminLayout'),
  adminDashboard: () => import('@/pages/admin/Dashboard'),
  adminProducts: () => import('@/pages/admin/Products'),
  adminOrders: () => import('@/pages/admin/Orders'),
  adminClients: () => import('@/pages/admin/Clients'),
  adminSettings: () => import('@/pages/admin/Settings'),
  adminShipping: () => import('@/pages/admin/ShippingRates'),
}

const SearchOverlay = lazy(() => import('@/components/layout/SearchOverlay'))
const Cart = lazy(() => import('@/components/Cart'))
const ShopPage = lazy(pages.shop)
const ProductPage = lazy(pages.product)
const ComparePage = lazy(pages.compare)
const CheckoutPage = lazy(pages.checkout)
const AuthPage = lazy(pages.auth)
const ProfilePage = lazy(pages.profile)
const NotFound = lazy(pages.notFound)
const AdminLayout = lazy(pages.adminLayout)
const AdminDashboard = lazy(pages.adminDashboard)
const AdminProducts = lazy(pages.adminProducts)
const AdminOrders = lazy(pages.adminOrders)
const AdminClients = lazy(pages.adminClients)
const AdminSettings = lazy(pages.adminSettings)
const AdminShippingRates = lazy(pages.adminShipping)

const isAdminPath = (p) => p.startsWith('/admin')
const isBarePath = (p) => isAdminPath(p) || p === '/login'

/** Loads the code of the page we are heading to (while the curtain covers the screen). */
function preloadFor(pathname) {
  if (pathname === '/') return null
  if (pathname.startsWith('/shop')) return pages.shop()
  if (pathname.startsWith('/product/')) return pages.product()
  if (pathname.startsWith('/compare')) return pages.compare()
  if (pathname.startsWith('/checkout')) return pages.checkout()
  if (pathname.startsWith('/login')) return pages.auth()
  if (pathname.startsWith('/profile')) return pages.profile()
  if (isAdminPath(pathname)) return pages.adminLayout()
  return pages.notFound()
}

const PageFallback = () => <div className="min-h-[100svh]" />

// Each lazy page gets its own boundary; the home page has none, so its prerendered HTML hydrates in one pass
const lazyPage = (Component) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
)

/** Search overlay and cart drawer are only needed on demand: load them on first use or when idle. */
function Overlays() {
  const { isCartOpen } = useCart()
  const [search, setSearch] = useState(false)
  const [cart, setCart] = useState(false)

  useEffect(() => {
    const onSearch = () => setSearch(true)
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(e.target?.tagName) || e.target?.isContentEditable
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener(SEARCH_EVENT, onSearch)
    window.addEventListener('keydown', onKey)
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 3000))
    const cancel = window.cancelIdleCallback || clearTimeout
    const id = idle(() => (setSearch(true), setCart(true)), { timeout: 5000 })
    return () => {
      window.removeEventListener(SEARCH_EVENT, onSearch)
      window.removeEventListener('keydown', onKey)
      cancel(id)
    }
  }, [])

  useEffect(() => {
    if (isCartOpen) setCart(true)
  }, [isCartOpen])

  return (
    <Suspense fallback={null}>
      {cart && <Cart />}
      {search && <SearchOverlay />}
    </Suspense>
  )
}

export default function App() {
  const { t } = useTranslation()
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const shownRef = useRef(location)

  const labelFor = useCallback(
    (loc) => {
      const p = loc.pathname
      const status = t('ui.powerOn', 'Mise sous tension')
      if (p === '/') return { index: '01', eyebrow: 'ElectroHub', title: t('nav.home'), status }
      if (p.startsWith('/shop')) return { index: '02', eyebrow: t('nav.shop'), title: t('ui.catalogue', 'Le catalogue'), status }
      if (p.startsWith('/product/')) return { index: '03', eyebrow: t('ui.productSheet', 'Fiche produit'), title: loc.state?.title || t('ui.productSheet', 'Fiche produit'), status }
      if (p.startsWith('/compare')) return { index: '04', eyebrow: t('nav.compare', 'Comparer'), title: t('compare.heading'), status }
      if (p.startsWith('/checkout')) return { index: '05', eyebrow: t('ui.cart', 'Panier'), title: t('ui.checkoutTitle', 'Validation de commande'), status }
      if (p.startsWith('/login')) return { index: '06', eyebrow: 'ElectroHub', title: t('ui.signIn', 'Espace client'), status }
      if (p.startsWith('/profile')) return { index: '06', eyebrow: 'ElectroHub', title: t('ui.account', 'Mon compte'), status }
      if (isAdminPath(p)) return { index: '⌁', eyebrow: t('ui.secure', 'Espace sécurisé'), title: 'Administration', status }
      return { index: '404', eyebrow: 'ElectroHub', title: t('ui.notFound', 'Page introuvable'), status }
    },
    [t],
  )

  // Route changes: same page (filters, hash) swap instantly, other pages go through the curtain
  useEffect(() => {
    const prev = shownRef.current
    if (location.key === prev.key && location.pathname === prev.pathname && location.search === prev.search) return
    const commit = () => {
      shownRef.current = location
      setShown(location)
    }
    const samePage = location.pathname === prev.pathname
    if (samePage || (isAdminPath(location.pathname) && isAdminPath(prev.pathname))) {
      commit()
      if (location.hash) requestAnimationFrame(() => scrollToTarget(location.hash))
      else if (!samePage) window.scrollTo(0, 0)
      return
    }
    // Started from a task (not from inside React's commit) so the curtain can render its label synchronously
    const id = setTimeout(() => runPageTransition(labelFor(location), commit, preloadFor(location.pathname)), 0)
    if (location.hash) setTimeout(() => scrollToTarget(location.hash), 700)
    return () => clearTimeout(id)
  }, [location, labelFor])

  const admin = isAdminPath(shown.pathname)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // Warm the most visited secondary pages once the browser is idle
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500))
    const cancel = window.cancelIdleCallback || clearTimeout
    const id = idle(() => {
      pages.shop()
      pages.product()
    })
    return () => cancel(id)
  }, [])


  const bare = isBarePath(shown.pathname)

  return (
    <StoreProvider>
      <CartProvider>
        <div className="relative flex min-h-screen w-full max-w-full flex-col bg-white text-ink-900">
          <PageTransition />

          {!bare && <Header />}
          {!bare && <div aria-hidden="true" className={HEADER_SPACER} />}

          <Routes location={shown}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={lazyPage(ShopPage)} />
            <Route path="/product/:id" element={lazyPage(ProductPage)} />
            <Route path="/compare" element={lazyPage(ComparePage)} />
            <Route path="/checkout" element={lazyPage(CheckoutPage)} />
            <Route path="/login" element={lazyPage(AuthPage)} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={lazyPage(ProfilePage)} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={lazyPage(AdminLayout)}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={lazyPage(AdminDashboard)} />
                <Route path="products" element={lazyPage(AdminProducts)} />
                <Route path="orders" element={lazyPage(AdminOrders)} />
                <Route path="clients" element={lazyPage(AdminClients)} />
                <Route path="settings" element={lazyPage(AdminSettings)} />
                <Route path="shipping" element={lazyPage(AdminShippingRates)} />
              </Route>
            </Route>

            <Route path="*" element={lazyPage(NotFound)} />
          </Routes>

          {!bare && <Footer />}
          {!admin && <Overlays />}
          {!admin && <CartToast />}
        </div>
      </CartProvider>
    </StoreProvider>
  )
}
