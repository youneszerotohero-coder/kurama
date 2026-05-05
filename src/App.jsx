import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MotionCarousel } from '@/components/animate-ui/components/community/motion-carousel'
import LogoLoop from '@/components/LogoLoop'
import ProductPage from '@/pages/ProductPage'
import { ThemeTogglerButton as ThemeToggler } from '@/components/animate-ui/components/buttons/theme-toggler'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const getNavLinks = (t) => [
  { label: t('nav.home'), href: '/' },
  { label: t('nav.collections'), href: '#collections' },
  { label: t('nav.accessories'), href: '#' },
]

const getHeroSlides = (t) => [
  {
    image: '/hero-1.jpg',
    subtitle: t('hero.SS26'),
    title: t('hero.precision'),
    cta: t('hero.explore'),
    href: '#collections',
  },
  {
    image: '/hero-2.png',
    title: t('hero.bold'),
    subtitle: t('hero.limited'),
    cta: t('hero.shopNow'),
    href: '#new',
  },
  {
    image: '/hero-3.jpg',
    title: t('hero.own'),
    subtitle: t('hero.modern'),
    cta: t('hero.shopNow'),
    href: '#new',
  },
]

const featuredProducts = [
  {
    id: 1,
    name: 'Midnight Tech Jacket',
    price: '38,500',
    originalPrice: '45,000',
    image: '/product-1.png',
    tag: 'tags.bestSeller',
    category: 'categories.outerwear',
  },
  {
    id: 2,
    name: 'Premium Fleece Hoodie',
    price: '18,900',
    image: '/product-2.png',
    tag: 'tags.new',
    category: 'categories.hoodies',
  },
  {
    id: 3,
    name: 'Essential Slim Pants',
    price: '14,500',
    image: '/product-3.png',
    tag: 'tags.trending',
    category: 'categories.bottoms',
  },
  {
    id: 4,
    name: 'Signature Accessories',
    price: '9,500',
    originalPrice: '12,000',
    image: '/product-4.png',
    tag: 'tags.sale',
    category: 'categories.accessories',
  },
]

const collections = [
  {
    name: 'collectionsData.essentialsName',
    description: 'collectionsData.essentialsDesc',
    image: '/hero-1.png',
    items: 24,
  },
  {
    name: 'collectionsData.modernistName',
    description: 'collectionsData.modernistDesc',
    image: '/hero-3.jpg',
    items: 32,
  },
  {
    name: 'collectionsData.enduringName',
    description: 'collectionsData.enduringDesc',
    image: '/hero-2.png',
    items: 18,
  },
  {
    name: 'collectionsData.eliteName',
    description: 'collectionsData.eliteDesc',
    image: '/product-1.png',
    items: 12,
  },
]

const brands = [
  'LUXE', 'URBAN', 'CORE', 'PRIME', 'ELITE', 'NEXUS', 'VANTAGE', 'SIGNATURE', 'ZENITH', 'APEX'
]

// const marqueeText = 'FREE SHIPPING ON ORDERS OVER 15,000 DA  •  NEW SS26 COLLECTION  •  PRECISION MEETS STYLE  •  KURIMA  •  '

const features = [
  { icon: Truck, title: 'product.freeShipping', desc: 'product.freeShippingDesc' },
  { icon: Shield, title: 'product.securePayment', desc: 'product.securePaymentDesc' },
  { icon: RotateCcw, title: 'product.easyReturns', desc: 'product.easyReturnsDesc' },
  { icon: Star, title: 'product.quality', desc: 'product.qualityDesc' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-foreground/70 hover:text-kurima-orange transition-colors cursor-pointer">
          <Globe className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border z-[100]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              i18n.language === lang.code ? 'text-kurima-orange font-bold' : 'text-foreground'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/kurima-logo.png"
                  alt="KURAMA"
                  className="w-32 object-contain p-1"
                />
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              {getNavLinks(t).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground/70 hover:text-kurima-orange transition-colors duration-300 tracking-wide uppercase"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggler />
              <button className="relative p-2 text-foreground/70 hover:text-kurima-orange transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-kurima-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
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
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 h-20">
                <span className="text-2xl font-black tracking-[0.2em] text-foreground">
                  KUR<span className="text-kurima-orange">I</span>MA
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center px-8 gap-6">
                {getNavLinks(t).map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-3xl font-bold text-foreground/90 hover:text-kurima-orange transition-colors tracking-wide"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
              <div className="px-8 pb-10">
                <Button className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-white font-semibold py-6 text-base rounded-full">
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30" />
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-kurima-orange hover:bg-kurima-orange-light text-white font-bold px-8 py-6 text-base rounded-full animate-pulse-orange group"
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
  return (
    <div className="bg-kurima-orange py-3 overflow-hidden">
      <div className="flex animate-[scroll_20s_linear_infinite]">
        <div className="flex shrink-0 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="text-white font-bold text-sm tracking-widest whitespace-nowrap uppercase">
              {t('hero.marquee')}
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-kurima-gray">
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
              ? 'bg-kurima-orange text-white'
              : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
          }`}
        >
          {t(product.tag)}
        </Badge>
        {/* Like button */}
        <button
          onClick={() => setLiked(!liked)}
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
          <Button className="flex-1 bg-white text-black hover:bg-kurima-orange hover:text-white font-semibold rounded-full py-5 text-sm">
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
      <div className="mt-4 px-1">
        <p className="text-xs text-kurima-muted font-medium tracking-wider uppercase mb-1">
          {t(product.category)}
        </p>
          <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-kurima-orange transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-kurima-orange font-bold text-lg">{product.price} DA</span>
            {product.originalPrice && (
              <span className="text-foreground/40 line-through text-sm">{product.originalPrice} DA</span>
            )}
          </div>
      </div>
    </motion.div>
  )
}

function BrandsSection() {
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
        logos={brands.map(name => ({ node: name }))}
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
          >
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CollectionsSection() {
  const { t } = useTranslation()
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
          items={collections}
          options={{ loop: true, align: 'center' }}
          renderSlide={(col) => (
            <motion.div
              className="group relative h-full w-full rounded-3xl overflow-hidden cursor-pointer"
            >
              <img
                src={col.image}
                alt={t(col.name)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-kurima-orange/0 group-hover:bg-kurima-orange/10 transition-colors duration-500" />
              <div className="absolute bottom-8 left-8 right-8">
                <Badge className="bg-kurima-orange text-white font-semibold mb-3">
                  {col.items} {t('product.pieces')}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2">{t(col.name)}</h3>
                <p className="text-foreground/70 text-sm sm:text-base mb-4 max-w-sm">{t(col.description)}</p>
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
                <img src="/kurima-logo.png" alt="KURIMA" className="w-32 object-contain p-1" />

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
  return (
    <div className="min-h-screen flex flex-col bg-kurima-black">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <main className="flex-1">
            <HeroSection />
            <MarqueeBanner />
            <FeaturedProducts />
            <BrandsSection />
            <CollectionsSection />
            <TestimonialsSection />
            <StoreLocator />
          </main>
        } />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
