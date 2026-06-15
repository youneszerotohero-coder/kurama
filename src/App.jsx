import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  ShoppingBag,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Camera,
  Send,
  Mail,
  MapPin,
  Phone,
  Clock,
  Heart,
  Eye,
  Plus,
  Minus,
  ChevronDown,
  Search,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MotionCarousel } from '@/components/animate-ui/components/community/motion-carousel'
import LogoLoop from '@/components/LogoLoop'
import ProductPage from '@/pages/ProductPage'
import ShopPage from '@/pages/ShopPage'
import CheckoutPage from '@/pages/CheckoutPage'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import ComparePage from '@/pages/ComparePage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/Products'
import AdminOrders from '@/pages/admin/Orders'
import AdminClients from '@/pages/admin/Clients'
import AdminSettings from '@/pages/admin/Settings'
import AdminShippingRates from '@/pages/admin/ShippingRates'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ThemeTogglerButton as ThemeToggler } from '@/components/animate-ui/components/buttons/theme-toggler'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CartProvider, useCart } from '@/context/CartContext'
import Cart from '@/components/Cart'
import api from '@/lib/api'

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

// megaCategories and megaBrands are now dynamically loaded from the database in the Navbar component.

const getNavLinks = (t) => [
  { label: t('nav.home'), href: '/' },
  { label: t('nav.brands'), href: '#brands', hasBrandsMegaMenu: true },
  { label: t('nav.categories'), href: '#categories', hasMegaMenu: true },
  { label: t('nav.shop'), href: '/shop' },
  { label: t('nav.compare', 'Compare'), href: '/compare' },
]

const getHeroSlides = (t) => [
  {
    image: '/bg1.jpg',
    subtitle: t('hero.SS26'),
    title: t('hero.precision'),
    cta: t('hero.explore'),
    href: '#collections',
  },
  {
    image: '/bg2.jpg',
    title: t('hero.bold'),
    subtitle: t('hero.limited'),
    cta: t('hero.shopNow'),
    href: '#new',
  },
]


// Collections/gammes are now dynamically fetched from the database.

const brands = [
  'SIEMENS', 'SCHNEIDER', 'ABB', 'LEGRAND', 'PHILIPS', 'EATON', 'GENERAL ELECTRIC', 'HONEYWELL', 'ALSTOM', 'TESLA'
]

// const marqueeText = 'FREE SHIPPING ON ORDERS OVER 15,000 DA  •  NEW SS26 COLLECTION  •  PRECISION MEETS STYLE  •  KURIMA  •  '

const features = [
  { icon: Truck, title: 'product.freeShipping', desc: 'product.freeShippingDesc' },
  { icon: Shield, title: 'product.securePayment', desc: 'product.securePaymentDesc' },
  { icon: RotateCcw, title: 'product.easyReturns', desc: 'product.easyReturnsDesc' },
  { icon: Star, title: 'product.quality', desc: 'product.qualityDesc' },
]

function FloatingLanguageSwitcher() {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex items-center bg-background/90 dark:bg-[#06090F]/90 backdrop-blur-md border border-border p-1.5 rounded-full shadow-2xl">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
            i18n.language === lang.code
              ? 'bg-kurima-orange text-black shadow-lg shadow-kurima-orange/20 scale-105'
              : 'text-foreground/70 hover:text-kurima-orange hover:bg-foreground/5'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { setIsCartOpen, cartCount } = useCart()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState(null)

  const [megaCategories, setMegaCategories] = useState([])
  const [megaBrands, setMegaBrands] = useState([])

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr))
      } catch (e) {
        setCurrentUser(null)
      }
    } else {
      setCurrentUser(null)
    }
  }, [location])

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100)
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Categories Mega Menu States
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('')
  const megaTimeoutRef = useRef(null)
  const rightPaneRef = useRef(null)
  const isScrollingRef = useRef(false)

  // Brands Mega Menu States
  const [isBrandsMegaOpen, setIsBrandsMegaOpen] = useState(false)
  const [activeBrandsTab, setActiveBrandsTab] = useState('')
  const brandsTimeoutRef = useRef(null)
  const rightBrandsPaneRef = useRef(null)
  const isBrandsScrollingRef = useRef(false)

  // Fetch Categories, Brands and Products to build mega menus dynamically
  useEffect(() => {
    const fetchMegaMenuData = async () => {
      try {
        const [products, categories, brands] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getBrands()
        ])

        // Categories Map
        const categoriesMap = {}
        categories.forEach(cat => {
          const name = cat.name || ''
          categoriesMap[name.toLowerCase()] = {
            id: name.toLowerCase(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            icon: name === 'distribution' ? '⚡' : name === 'smart' ? '📱' : name === 'cabling' ? '🔌' : name === 'renewable' ? '☀️' : '⭐',
            items: []
          }
        })

        // Populate Category items
        products.forEach(p => {
          const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : p.category
          const catKey = String(catName || '').toLowerCase()
          if (categoriesMap[catKey]) {
            categoriesMap[catKey].items.push({
              id: p.id,
              name: p.name,
              image: p.image || p.images?.[0] || '/p1.jpg',
              tag: p.tag === 'BEST_SELLER' ? 'hot' : p.tag === 'NEW' ? 'new' : undefined
            })
          }
        })

        // Brands Map
        const brandsMap = {}
        brands.forEach(brand => {
          const name = brand.name || ''
          brandsMap[name.toLowerCase()] = {
            id: name.toLowerCase(),
            name: name,
            icon: name.toUpperCase() === 'SCHNEIDER' ? '🟢' : name.toUpperCase() === 'LEGRAND' ? '🔴' : name.toUpperCase() === 'SIEMENS' ? '🔵' : name.toUpperCase() === 'ABB' ? '🟠' : name.toUpperCase() === 'PHILIPS' ? '💡' : '⚡',
            items: []
          }
        })

        // Populate Brand items
        products.forEach(p => {
          const brandName = typeof p.brand === 'object' && p.brand !== null ? p.brand.name : p.brand
          const brandKey = String(brandName || '').toLowerCase()
          if (brandsMap[brandKey]) {
            brandsMap[brandKey].items.push({
              id: p.id,
              name: p.name,
              image: p.image || p.images?.[0] || '/p1.jpg',
              tag: p.tag === 'BEST_SELLER' ? 'hot' : p.tag === 'NEW' ? 'new' : undefined
            })
          }
        })

        const finalCats = Object.values(categoriesMap).filter(c => c.items.length > 0)
        const finalBrands = Object.values(brandsMap).filter(b => b.items.length > 0)

        setMegaCategories(finalCats)
        setMegaBrands(finalBrands)

        if (finalCats.length > 0) {
          setActiveTab(finalCats[0].id)
        }
        if (finalBrands.length > 0) {
          setActiveBrandsTab(finalBrands[0].id)
        }
      } catch (err) {
        console.error('Error fetching mega menu dynamic data:', err)
      }
    }
    fetchMegaMenuData()
  }, [])

  // Mobile Accordion States
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [mobileActiveGroup, setMobileActiveGroup] = useState(null)
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false)
  const [mobileActiveBrandGroup, setMobileActiveBrandGroup] = useState(null)

  // Categories Hover Handlers
  const handleMouseEnterMega = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current)
    setIsMegaOpen(true)
  }
  const handleMouseLeaveMega = () => {
    megaTimeoutRef.current = setTimeout(() => {
      setIsMegaOpen(false)
    }, 150)
  }
  const handleLeftClick = (catId) => {
    setActiveTab(catId)
    isScrollingRef.current = true
    const container = rightPaneRef.current
    if (container) {
      const element = container.querySelector(`#sec-${catId}`)
      if (element) {
        const containerTop = container.getBoundingClientRect().top
        const elementTop = element.getBoundingClientRect().top
        const scrollTarget = container.scrollTop + (elementTop - containerTop) - 16
        container.scrollTo({ top: scrollTarget, behavior: 'smooth' })
      }
    }
    setTimeout(() => {
      isScrollingRef.current = false
    }, 600)
  }
  const handleRightScroll = () => {
    if (isScrollingRef.current) return
    const container = rightPaneRef.current
    if (!container) return
    const sections = container.querySelectorAll('.section-category')
    const containerTop = container.getBoundingClientRect().top
    let activeId = activeTab
    sections.forEach((sec) => {
      const secTop = sec.getBoundingClientRect().top
      if (secTop - containerTop <= 80) {
        activeId = sec.id.replace('sec-', '')
      }
    })
    setActiveTab(activeId)
  }

  // Brands Hover Handlers
  const handleMouseEnterBrands = () => {
    if (brandsTimeoutRef.current) clearTimeout(brandsTimeoutRef.current)
    setIsBrandsMegaOpen(true)
  }
  const handleMouseLeaveBrands = () => {
    brandsTimeoutRef.current = setTimeout(() => {
      setIsBrandsMegaOpen(false)
    }, 150)
  }
  const handleBrandsLeftClick = (catId) => {
    setActiveBrandsTab(catId)
    isBrandsScrollingRef.current = true
    const container = rightBrandsPaneRef.current
    if (container) {
      const element = container.querySelector(`#brandsec-${catId}`)
      if (element) {
        const containerTop = container.getBoundingClientRect().top
        const elementTop = element.getBoundingClientRect().top
        const scrollTarget = container.scrollTop + (elementTop - containerTop) - 16
        container.scrollTo({ top: scrollTarget, behavior: 'smooth' })
      }
    }
    setTimeout(() => {
      isBrandsScrollingRef.current = false
    }, 600)
  }
  const handleBrandsRightScroll = () => {
    if (isBrandsScrollingRef.current) return
    const container = rightBrandsPaneRef.current
    if (!container) return
    const sections = container.querySelectorAll('.section-brand')
    const containerTop = container.getBoundingClientRect().top
    let activeId = activeBrandsTab
    sections.forEach((sec) => {
      const secTop = sec.getBoundingClientRect().top
      if (secTop - containerTop <= 80) {
        activeId = sec.id.replace('brandsec-', '')
      }
    })
    setActiveBrandsTab(activeId)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || isSearchOpen
            ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/logo.png"
                  alt="ElectroHub"
                  className="w-40 object-contain p-1 filter dark:brightness-110"
                />
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8 h-full">
              {getNavLinks(t).map((link) => (
                <div
                  key={link.label}
                  className="h-full flex items-center"
                  onMouseEnter={() => {
                    if (link.hasMegaMenu) handleMouseEnterMega()
                    if (link.hasBrandsMegaMenu) handleMouseEnterBrands()
                  }}
                  onMouseLeave={() => {
                    if (link.hasMegaMenu) handleMouseLeaveMega()
                    if (link.hasBrandsMegaMenu) handleMouseLeaveBrands()
                  }}
                >
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-sm font-semibold transition-all duration-300 tracking-wide uppercase flex items-center gap-1.5 py-6 border-b-2 border-transparent text-foreground/70 hover:text-kurima-orange cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`text-sm font-semibold transition-all duration-300 tracking-wide uppercase flex items-center gap-1.5 py-6 border-b-2 ${
                        (isMegaOpen && link.hasMegaMenu) || (isBrandsMegaOpen && link.hasBrandsMegaMenu)
                          ? 'text-kurima-orange border-kurima-orange'
                          : 'text-foreground/70 hover:text-kurima-orange border-transparent'
                    }`}
                    >
                      {link.label}
                      {(link.hasMegaMenu || link.hasBrandsMegaMenu) && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                          (isMegaOpen && link.hasMegaMenu) || (isBrandsMegaOpen && link.hasBrandsMegaMenu)
                            ? 'rotate-180 text-kurima-orange' 
                            : 'text-foreground/45'
                        }`} />
                      )}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 transition-all cursor-pointer rounded-full border hover:scale-105 hover:shadow-lg bg-kurima-orange text-black border-kurima-orange shadow-lg shadow-kurima-orange/20"
                aria-label="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link 
                to={currentUser ? "/profile" : "/login"}
                className="p-2 text-foreground/70 hover:text-kurima-orange transition-colors cursor-pointer rounded-full hover:bg-foreground/5"
                aria-label="User Profile"
              >
                <User className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground/70 hover:text-kurima-orange transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-kurima-orange text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-foreground/70 hover:text-kurima-orange transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Sub-Header */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="border-t border-border bg-background/95 dark:bg-[#080d1a]/98 backdrop-blur-2xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                <div className="relative flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/45" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search.placeholder', 'Search smart breakers, heavy duty cables, wiring devices...')}
                      className="w-full pl-12 pr-10 py-3.5 bg-foreground/[0.02] border border-border/80 rounded-2xl text-sm font-semibold text-foreground placeholder-foreground/30 focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/5 text-foreground/45 hover:text-foreground transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Button 
                    className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-black px-6 py-3.5 h-auto rounded-2xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-kurima-orange/5"
                  >
                    {t('search.btn', 'Search')}
                  </Button>
                </div>
                
                {/* Trending searches */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-kurima-muted tracking-widest">{t('search.trending', 'Trending Searches:')}</span>
                  {[
                    { key: 'breakers', defaultVal: 'Smart Breakers' },
                    { key: 'monitors', defaultVal: 'Energy Monitors' },
                    { key: 'cables', defaultVal: 'Copper Cables' },
                    { key: 'switches', defaultVal: 'Double Switches' }
                  ].map((item) => {
                    const term = t(`search.${item.key}`, item.defaultVal)
                    return (
                      <button
                        key={item.key}
                        onClick={() => setSearchQuery(term)}
                        className="text-[10px] font-bold text-foreground/75 hover:text-kurima-orange bg-foreground/[0.03] hover:bg-kurima-orange/5 border border-border/40 hover:border-kurima-orange/30 px-3 py-1 rounded-full transition-all cursor-pointer"
                      >
                        {term}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Mega Menu Dropdown */}
        <AnimatePresence>
          {isMegaOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onMouseEnter={handleMouseEnterMega}
              onMouseLeave={handleMouseLeaveMega}
              className="absolute left-0 right-0 w-full bg-background/95 dark:bg-background/98 backdrop-blur-3xl border-b border-border shadow-2xl z-40 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto flex h-[480px]">
                {/* Left Pane: Category Groups Sidebar */}
                <div className="w-1/4 bg-foreground/[0.015] border-r border-border/80 h-full overflow-y-auto scrollbar-none py-8">
                  <div className="flex flex-col">
                    {megaCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleLeftClick(cat.id)}
                        onMouseEnter={() => handleLeftClick(cat.id)}
                        className={`w-full text-left px-8 py-4 flex items-center justify-between font-semibold transition-all relative ${
                          activeTab === cat.id
                            ? 'text-kurima-orange bg-kurima-orange/5'
                            : 'text-foreground/75 hover:text-foreground hover:bg-foreground/[0.01]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-sm uppercase tracking-wider">{cat.name}</span>
                        </span>
                        {activeTab === cat.id && (
                          <motion.div
                            layoutId="activeCategoryBar"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-kurima-orange"
                          />
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === cat.id ? 'translate-x-1 text-kurima-orange' : 'opacity-30'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Pane: Subcategories Scroll Area */}
                <div 
                  ref={rightPaneRef}
                  onScroll={handleRightScroll}
                  className="w-3/4 p-10 h-full overflow-y-auto pr-6 scrollbar-thin scroll-smooth"
                >
                  {megaCategories.map((cat) => (
                    <div 
                      key={cat.id} 
                      id={`sec-${cat.id}`} 
                      className="section-category mb-12 scroll-mt-6"
                    >
                      <h3 className="text-sm font-black uppercase tracking-widest text-kurima-orange mb-8 flex items-center gap-2 border-b border-border/40 pb-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </h3>
                      
                      <div className="grid grid-cols-5 gap-8">
                        {cat.items.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setIsMegaOpen(false)
                              navigate(`/product/${item.id}`)
                            }}
                            className="flex flex-col items-center group cursor-pointer"
                          >
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-foreground/5 border border-border/80 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 group-hover:border-kurima-orange group-hover:shadow-lg group-hover:shadow-kurima-orange/10">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {item.tag && (
                                <span
                                  className={`absolute -top-1 -right-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md ${
                                    item.tag === 'hot'
                                      ? 'bg-red-500 text-white animate-pulse'
                                      : 'bg-kurima-orange text-black font-extrabold'
                                  }`}
                                >
                                  {item.tag === 'hot' ? '🔥' : '✨'}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-kurima-orange transition-colors uppercase tracking-wider text-center max-w-[120px] line-clamp-2">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brands Mega Menu Dropdown */}
        <AnimatePresence>
          {isBrandsMegaOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onMouseEnter={handleMouseEnterBrands}
              onMouseLeave={handleMouseLeaveBrands}
              className="absolute left-0 right-0 w-full bg-background/95 dark:bg-background/98 backdrop-blur-3xl border-b border-border shadow-2xl z-40 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto flex h-[420px]">
                {/* Left Pane: Brand Sectors Sidebar */}
                <div className="w-1/4 bg-foreground/[0.015] border-r border-border/80 h-full overflow-y-auto scrollbar-none py-8">
                  <div className="flex flex-col">
                    {megaBrands.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleBrandsLeftClick(cat.id)}
                        onMouseEnter={() => handleBrandsLeftClick(cat.id)}
                        className={`w-full text-left px-8 py-4 flex items-center justify-between font-semibold transition-all relative ${
                          activeBrandsTab === cat.id
                            ? 'text-kurima-orange bg-kurima-orange/5'
                            : 'text-foreground/75 hover:text-foreground hover:bg-foreground/[0.01]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-sm uppercase tracking-wider">{cat.name}</span>
                        </span>
                        {activeBrandsTab === cat.id && (
                          <motion.div
                            layoutId="activeBrandBar"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-kurima-orange"
                          />
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeBrandsTab === cat.id ? 'translate-x-1 text-kurima-orange' : 'opacity-30'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Pane: Brands Scroll Area */}
                <div 
                  ref={rightBrandsPaneRef}
                  onScroll={handleBrandsRightScroll}
                  className="w-3/4 p-10 h-full overflow-y-auto pr-6 scrollbar-thin scroll-smooth"
                >
                  {megaBrands.map((cat) => (
                    <div 
                      key={cat.id} 
                      id={`brandsec-${cat.id}`} 
                      className="section-brand mb-12 scroll-mt-6"
                    >
                      <h3 className="text-sm font-black uppercase tracking-widest text-kurima-orange mb-8 flex items-center gap-2 border-b border-border/40 pb-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </h3>
                      
                      <div className="grid grid-cols-5 gap-8">
                        {cat.items.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setIsBrandsMegaOpen(false)
                              navigate(`/product/${item.id}`)
                            }}
                            className="flex flex-col items-center group cursor-pointer"
                          >
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-foreground/5 border border-border/80 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 group-hover:border-kurima-orange group-hover:shadow-lg group-hover:shadow-kurima-orange/10">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {item.tag && (
                                <span
                                  className={`absolute -top-1 -right-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md ${
                                    item.tag === 'hot'
                                      ? 'bg-red-500 text-white animate-pulse'
                                      : 'bg-kurima-orange text-black font-extrabold'
                                  }`}
                                >
                                  {item.tag === 'hot' ? '🔥' : '✨'}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-foreground/80 group-hover:text-kurima-orange transition-colors uppercase tracking-wider text-center max-w-[120px] line-clamp-2">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] bg-background/98 dark:bg-[#06090F]/98 backdrop-blur-2xl border-l border-border"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 h-20">
                <img
                  src="/logo.png"
                  alt="ElectroHub"
                  className="w-36 object-contain filter dark:brightness-110"
                />
                <div className="flex items-center gap-2">
                  <ThemeToggler />
                  <button onClick={() => setMobileOpen(false)} className="p-2 text-foreground">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Mobile Nested Accordion Links */}
              <div className="flex-1 overflow-y-auto py-6 px-8 flex flex-col gap-6 scrollbar-none justify-center">
                {getNavLinks(t).map((link, i) => {
                  if (link.hasBrandsMegaMenu) {
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex flex-col"
                      >
                        <button
                          onClick={() => setMobileBrandsOpen(!mobileBrandsOpen)}
                          className="w-full flex items-center justify-between text-3xl font-bold text-foreground/90 hover:text-kurima-orange transition-colors tracking-wide text-left rtl:text-right py-2"
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            className={`w-6 h-6 transition-transform duration-300 ${
                              mobileBrandsOpen ? 'rotate-180 text-kurima-orange' : 'text-foreground/45'
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {mobileBrandsOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden mt-3 pl-4 flex flex-col gap-4 border-l-2 border-foreground/10"
                            >
                              {megaBrands.map((group) => (
                                <div key={group.id} className="flex flex-col">
                                  <button
                                    onClick={() =>
                                      setMobileActiveBrandGroup(mobileActiveBrandGroup === group.id ? null : group.id)
                                    }
                                    className={`w-full py-2 flex items-center justify-between text-lg font-semibold text-foreground/80 hover:text-kurima-orange text-left rtl:text-right ${
                                      mobileActiveBrandGroup === group.id ? 'text-kurima-orange' : ''
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-xl">{group.icon}</span>
                                      <span>{group.name}</span>
                                    </span>
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform duration-300 ${
                                        mobileActiveBrandGroup === group.id ? 'rotate-180 text-kurima-orange' : 'text-foreground/30'
                                      }`}
                                    />
                                  </button>

                                  <AnimatePresence>
                                    {mobileActiveBrandGroup === group.id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-2 gap-3 py-3 pl-2"
                                      >
                                        {group.items.map((sub, idx) => (
                                          <div
                                            key={idx}
                                            onClick={() => {
                                              setMobileOpen(false)
                                              navigate(`/product/${sub.id}`)
                                            }}
                                            className="flex flex-col items-start gap-1 p-3 rounded-xl bg-foreground/[0.03] active:bg-foreground/[0.07] border border-border/40 cursor-pointer transition-all duration-200"
                                          >
                                            <span className="text-xs font-bold text-foreground/90 uppercase tracking-wider">
                                              {sub.name}
                                            </span>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  }

                  if (link.hasMegaMenu) {
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex flex-col"
                      >
                        <button
                          onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                          className="w-full flex items-center justify-between text-3xl font-bold text-foreground/90 hover:text-kurima-orange transition-colors tracking-wide text-left rtl:text-right py-2"
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            className={`w-6 h-6 transition-transform duration-300 ${
                              mobileCategoriesOpen ? 'rotate-180 text-kurima-orange' : 'text-foreground/45'
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {mobileCategoriesOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden mt-3 pl-4 flex flex-col gap-4 border-l-2 border-foreground/10"
                            >
                              {megaCategories.map((group) => (
                                <div key={group.id} className="flex flex-col">
                                  <button
                                    onClick={() =>
                                      setMobileActiveGroup(mobileActiveGroup === group.id ? null : group.id)
                                    }
                                    className={`w-full py-2 flex items-center justify-between text-lg font-semibold text-foreground/80 hover:text-kurima-orange text-left rtl:text-right ${
                                      mobileActiveGroup === group.id ? 'text-kurima-orange' : ''
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-xl">{group.icon}</span>
                                      <span>{group.name}</span>
                                    </span>
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform duration-300 ${
                                        mobileActiveGroup === group.id ? 'rotate-180 text-kurima-orange' : 'text-foreground/30'
                                      }`}
                                    />
                                  </button>

                                  <AnimatePresence>
                                    {mobileActiveGroup === group.id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-2 gap-3 py-3 pl-2"
                                      >
                                        {group.items.map((sub, idx) => (
                                          <div
                                            key={idx}
                                            onClick={() => {
                                              setMobileOpen(false)
                                              navigate(`/product/${sub.id}`)
                                            }}
                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-foreground/[0.03] active:bg-foreground/[0.07] border border-border/40 cursor-pointer transition-all duration-200"
                                          >
                                            <div className="w-9 h-9 rounded-full overflow-hidden bg-foreground/10 flex-shrink-0">
                                              <img src={sub.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[11px] font-bold text-foreground/85 truncate uppercase tracking-wider">
                                              {sub.name}
                                            </span>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  }

                  if (link.href.startsWith('/')) {
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-3xl font-bold text-foreground/90 hover:text-kurima-orange transition-colors tracking-wide py-2 block text-left rtl:text-right cursor-pointer"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    )
                  }

                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="text-3xl font-bold text-foreground/90 hover:text-kurima-orange transition-colors tracking-wide py-2 text-left rtl:text-right"
                    >
                      {link.label}
                    </motion.a>
                  )
                })}
              </div>

              <div className="px-8 pb-10">
                <Button className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-semibold py-6 text-base rounded-full">
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function HeroSection() {
  const { t } = useTranslation()
  const slides = getHeroSlides(t)
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % slides.length), [slides.length])
  const prev = useCallback(() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r dark:from-background/80 dark:via-background/50 from-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t dark:from-background/70 dark:via-transparent dark:to-background/30 from-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 60 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="h-[2px] bg-kurima-orange mb-6"
                />
                <p className="text-kurima-orange font-semibold tracking-[0.3em] text-sm sm:text-base mb-4 uppercase">
                  {slide.subtitle}
                </p>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] mb-8 whitespace-pre-line">
                  {slide.title}
                </h1>
                <div className="flex flex-col sm:flex-row gap-4" dir="ltr">
                  <Button
                    size="lg"
                    className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-bold px-8 py-6 text-base rounded-full animate-pulse-orange group"
                  >
                    {slide.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border text-foreground hover:bg-foreground/10 font-semibold px-8 py-6 text-base rounded-full"
                  >
                    Watch Lookbook
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-kurima-orange hover:border-kurima-orange/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? 'w-8 bg-kurima-orange' : 'w-3 bg-foreground/30'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-kurima-orange hover:border-kurima-orange/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2 text-foreground/40"
      >
        <span className="text-[10px] tracking-widest uppercase rotate-90 translate-y-6">{t('hero.scroll')}</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-kurima-orange/60 to-transparent" />
      </motion.div>
    </section>
  )
}

function MarqueeBanner() {
  const { t } = useTranslation()

  const marqueeText = useMemo(() => {
    const raw = t('hero.marquee')
    const stored = localStorage.getItem('admin_settings')
    let thresh = 15000
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.minFreeDelivery !== undefined) {
          thresh = Number(parsed.minFreeDelivery)
        }
      } catch (e) {
        console.error(e)
      }
    }
    const formattedThresh = thresh.toLocaleString()
    return raw.replace(/15[,.\s]?000/g, formattedThresh)
  }, [t])

  return (
    <div className="bg-kurima-orange py-3 overflow-hidden">
      <div className="flex animate-[scroll_20s_linear_infinite]">
        <div className="flex shrink-0 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="text-white font-bold text-sm tracking-widest whitespace-nowrap uppercase">
              {marqueeText}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

function ProductCard({ product, index }) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative cursor-pointer flex flex-col h-full rounded-2xl border border-border/80 bg-background/50 hover:border-kurima-orange/60 hover:shadow-lg hover:shadow-kurima-orange/5 transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative h-[200px] overflow-hidden bg-kurima-gray">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Tag */}
        <Badge
          className={`absolute top-4 left-4 font-semibold text-xs tracking-wide ${
            product.tag === 'tags.sale'
              ? 'bg-red-600 text-white'
              : product.tag === 'tags.new'
              ? 'bg-kurima-orange text-black font-extrabold'
              : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
          }`}
        >
          {t(product.tag)}
        </Badge>
        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-500 transition-colors"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        {/* Quick actions */}
        <div
          className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-300 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              addToCart(product, 1)
            }}
            className="flex-1 bg-white text-black hover:bg-kurima-orange hover:text-black font-semibold rounded-full py-5 text-sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('product.addToCart')}
          </Button>
          <Button
            size="icon"
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-kurima-orange rounded-full w-10 h-10"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 flex flex-col justify-between p-5 bg-foreground/[0.015]">
        <div>
          <p className="text-xs text-kurima-muted font-medium tracking-wider uppercase mb-1.5">
            {typeof product.category === 'object' && product.category !== null 
              ? t(product.category.name || '') 
              : t(product.category || '')}
          </p>
          <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-kurima-orange transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>
        <div className="mt-2">
          <p className="text-[10px] text-kurima-muted font-bold mb-0.5">
            Ref: {product.ref || `REF-P${product.id}`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-black dark:text-kurima-orange font-black text-lg">{product.price} DA</span>
            {product.originalPrice && (
              <span className="text-foreground/45 line-through text-xs font-semibold">{product.originalPrice} DA</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function BrandsSection() {
  const [dbBrands, setDbBrands] = useState([])

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await api.getBrands()
        if (data && data.length > 0) {
          setDbBrands(data.map(b => b.name))
        }
      } catch (err) {
        console.error('Error fetching brands for loop:', err)
      }
    }
    fetchBrands()
  }, [])

  const brandsList = dbBrands.length > 0 ? dbBrands : brands

  return (
    <section className="py-12 bg-kurima-black  overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-white/5" />
          <h2 className="text-xs font-bold tracking-[0.4em] text-kurima-orange uppercase whitespace-nowrap">
            Our Brands
          </h2>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>
      </div>
      <LogoLoop
        logos={brandsList.map(name => ({ node: name }))}
        speed={40}
        gap={80}
        logoHeight={40}
        fadeOut={true}
        renderItem={(item) => (
          <span className="text-2xl md:text-4xl font-black text-foreground/20 hover:text-kurima-orange transition-colors cursor-default tracking-tighter">
            {item.node}
          </span>
        )}
      />
    </section>
  )
}

function FeaturedProducts() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.getProducts({ limit: 4 })
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Failed to fetch featured products from backend:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <section id="new" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              className="h-[2px] bg-kurima-orange mb-4"
            />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">
              {t('sections.newArrivals')}
            </h2>
            <p className="text-kurima-muted mt-3 text-base">
              {t('sections.newArrivalsSubtitle')}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/10 text-white hover:border-kurima-orange hover:text-kurima-orange rounded-full px-6 self-start sm:self-auto"
            asChild
          >
            <Link to="/shop">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CollectionsSection() {
  const { t } = useTranslation()
  const [gammes, setGammes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadGammes = async () => {
      try {
        const data = await api.getGammes()
        setGammes(data)
      } catch (err) {
        console.error('Error loading gammes:', err)
      }
    }
    loadGammes()
  }, [])

  if (gammes.length === 0) return null

  // Fallback image map for gammes
  const getGammeImage = (name) => {
    const normalized = name.toLowerCase()
    if (normalized.includes('pro')) return '/p1.jpg'
    if (normalized.includes('classic')) return '/p2.jpg'
    if (normalized.includes('elite')) return '/p3.jpg'
    return '/p4.jpg'
  }

  return (
    <section id="collections" className="py-20 sm:py-28 bg-kurima-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 40 }}
            viewport={{ once: true }}
            className="h-[2px] bg-kurima-orange mx-auto mb-4"
          />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">
            {t('sections.ourCollections')}
          </h2>
          <p className="text-kurima-muted mt-3 max-w-lg mx-auto">
            {t('sections.ourCollectionsSubtitle')}
          </p>
        </div>

        <MotionCarousel
          items={gammes}
          options={{ loop: true, align: 'center' }}
          renderSlide={(col) => (
            <motion.div
              onClick={() => navigate(`/shop?gamme=${col.name}`)}
              className="group relative h-full w-full rounded-3xl overflow-hidden cursor-pointer"
            >
              <img
                src={col.image || getGammeImage(col.name)}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t dark:from-background/80 dark:via-background/20 from-transparent to-transparent" />
              <div className="absolute inset-0 bg-kurima-orange/0 group-hover:bg-kurima-orange/10 transition-colors duration-500" />
              <div className="absolute bottom-8 left-8 right-8 text-left rtl:text-right" dir="auto">
                <Badge className="bg-kurima-orange text-black font-semibold mb-3">
                  {col.brand?.name || 'Exclusive'}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2">{col.name} Series</h3>
                <p className="text-foreground/70 text-sm sm:text-base mb-4 max-w-sm">
                  Explore high-performance {col.category?.name || 'electrical'} equipment from {col.brand?.name || 'leading brand'}.
                </p>
                <div className="flex items-center gap-2 text-kurima-orange font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('product.shopCollection')} <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          )}
        />
      </div>
    </section>
  )
}


function StoreLocator() {
  const { t } = useTranslation()
  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-[2px] w-10 bg-kurima-orange mb-6" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6 uppercase tracking-tighter">
              {t('store.title')}
            </h2>
            <p className="text-kurima-muted text-lg mb-10 max-w-md">
              {t('store.subtitle')}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-kurima-orange/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-kurima-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{t('footer.company')}</h4>
                  <p className="text-kurima-muted">{t('store.address')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-kurima-orange/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-kurima-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{t('footer.contact')}</h4>
                  <p className="text-kurima-muted">{t('store.phone')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-kurima-orange/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-kurima-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{t('store.hours')}</h4>
                  <p className="text-kurima-muted">{t('store.weekdays')}</p>
                  <p className="text-kurima-muted">{t('store.friday')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden border border-border shadow-2xl"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.0583161726!2d3.0333!3d36.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ1JzAwLjAiTiAzwrAwMicwMC4wIkU!5e0!3m2!1sen!2sdz!4v1620250000000!5m2!1sen!2sdz"
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(1) contrast(1.2) invert(var(--map-invert))' }} 
              allowFullScreen="" 
              loading="lazy"
              className="[--map-invert:0] dark:[--map-invert:0.9]"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-[12px] border-background/50 rounded-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}


function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-kurima-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="ElectroHub" className="w-40 object-contain p-1 filter dark:brightness-110" />

            </div>
            <p className="text-kurima-muted text-sm leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              {[Camera, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-foreground/5 border border-border flex items-center justify-center text-foreground/50 hover:text-kurima-orange hover:border-kurima-orange/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-foreground mb-4 tracking-wide text-sm uppercase">{t('footer.shop')}</h4>
            <ul className="space-y-3">
              {[
                { key: 'sections.newArrivals', label: t('sections.newArrivals') },
                { key: 'nav.men', label: t('nav.men') },
                { key: 'nav.women', label: t('nav.women') },
                { key: 'nav.accessories', label: t('nav.accessories') },
                { key: 'tags.sale', label: t('tags.sale') }
              ].map((item) => (
                <li key={item.key}>
                  <a href="#" className="text-kurima-muted text-sm hover:text-kurima-orange transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-4 tracking-wide text-sm uppercase">{t('footer.company')}</h4>
            <ul className="space-y-3">
              {[
                { key: 'about', label: t('footer.about') },
                { key: 'careers', label: t('footer.careers') },
                { key: 'sustainability', label: t('footer.sustainability') },
                { key: 'press', label: t('footer.press') }
              ].map((item) => (
                <li key={item.key}>
                  <a href="#" className="text-kurima-muted text-sm hover:text-kurima-orange transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-foreground mb-4 tracking-wide text-sm uppercase">{t('footer.help')}</h4>
            <ul className="space-y-3">
              {[
                { key: 'faq', label: t('footer.faq') },
                { key: 'shipping', label: t('footer.shipping') },
                { key: 'returns', label: t('footer.returns') },
                { key: 'sizeGuide', label: t('product.sizeGuide') },
                { key: 'contact', label: t('footer.contact') }
              ].map((item) => (
                <li key={item.key}>
                  <a href="#" className="text-kurima-muted text-sm hover:text-kurima-orange transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-white/5 my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-kurima-muted text-xs">
          <p className="text-kurima-muted text-xs">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-kurima-orange transition-colors">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-kurima-orange transition-colors">{t('footer.termsOfService')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import TestimonialsSection from '@/components/TestimonialsSection'

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function App() {
  const location = useLocation()
  const hideNavbarAndFooter = location.pathname === '/login' || location.pathname.startsWith('/admin')

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-kurima-black">
        {!hideNavbarAndFooter && <Navbar />}
        <Routes>
          <Route path="/" element={
            <main className="flex-1">
              <HeroSection />
              <FeaturedProducts />
              <BrandsSection />
              <CollectionsSection />
              <TestimonialsSection />
            </main>
          } />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Protected Client Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="shipping" element={<AdminShippingRates />} />
            </Route>
          </Route>
        </Routes>
        {!hideNavbarAndFooter && <Footer />}
        <Cart />
        {!hideNavbarAndFooter && <FloatingLanguageSwitcher />}
      </div>
    </CartProvider>
  )
}
