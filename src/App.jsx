'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Heart,
  Eye,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const navLinks = [
  { label: 'New Arrivals', href: '#new' },
  { label: 'Collections', href: '#collections' },
  { label: 'Men', href: '#men' },
  { label: 'Women', href: '#women' },
  { label: 'Accessories', href: '#accessories' },
]

const heroSlides = [
  {
    image: '/hero-1.png',
    subtitle: 'SS26 Collection',
    title: 'Strategy\nMeets Style',
    cta: 'Explore Collection',
    href: '#collections',
  },
  {
    image: '/hero-2.png',
    title: 'Bold Moves,\nBold Fashion',
    subtitle: 'Limited Edition',
    cta: 'Shop Now',
    href: '#new',
  },
]

const featuredProducts = [
  {
    id: 1,
    name: 'Midnight Rook Jacket',
    price: 289,
    originalPrice: 349,
    image: '/product-1.png',
    tag: 'Best Seller',
    category: 'Outerwear',
  },
  {
    id: 2,
    name: 'Castle Siege Hoodie',
    price: 159,
    image: '/product-2.png',
    tag: 'New',
    category: 'Hoodies',
  },
  {
    id: 3,
    name: 'Endgame Slim Pants',
    price: 129,
    image: '/product-3.png',
    tag: 'Trending',
    category: 'Bottoms',
  },
  {
    id: 4,
    name: 'Grand Master Accessories',
    price: 89,
    originalPrice: 119,
    image: '/product-4.png',
    tag: 'Sale',
    category: 'Accessories',
  },
]

const collections = [
  {
    name: 'The Opening',
    description: 'Where every move counts. Foundation pieces for the strategic wardrobe.',
    image: '/hero-1.png',
    items: 24,
  },
  {
    name: 'Endgame',
    description: 'Final touches that define victory. Statement pieces with lasting impact.',
    image: '/hero-2.png',
    items: 18,
  },
]

const marqueeText = 'FREE SHIPPING ON ORDERS OVER $150  •  NEW SS26 COLLECTION  •  STRATEGY MEETS STYLE  •  KURIMA  •  '

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $150' },
  { icon: Shield, title: 'Secure Payment', desc: '256-bit SSL encryption' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Star, title: 'Premium Quality', desc: 'Curated materials' },
]

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function Navbar() {
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
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
                <img
                  src="/kurima-logo.png"
                  alt="KURAMA"
                  className="w-32 object-contain p-1"
                />
            </a>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-white/70 hover:text-kurima-orange transition-colors duration-300 tracking-wide uppercase"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-white/70 hover:text-kurima-orange transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-kurima-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-white/70 hover:text-kurima-orange transition-colors"
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
                <span className="text-2xl font-black tracking-[0.2em] text-white">
                  KUR<span className="text-kurima-orange">I</span>MA
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center px-8 gap-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-3xl font-bold text-white/90 hover:text-kurima-orange transition-colors tracking-wide"
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
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [])
  const prev = useCallback(() => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length), [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = heroSlides[current]

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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
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
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-8 whitespace-pre-line">
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
                    className="border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full"
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
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-kurima-orange hover:border-kurima-orange/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? 'w-8 bg-kurima-orange' : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-kurima-orange hover:border-kurima-orange/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-[10px] tracking-widest uppercase rotate-90 translate-y-6">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-kurima-orange/60 to-transparent" />
      </motion.div>
    </section>
  )
}

function MarqueeBanner() {
  return (
    <div className="bg-kurima-orange py-3 overflow-hidden">
      <div className="flex animate-[scroll_20s_linear_infinite]">
        <div className="flex shrink-0 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="text-white font-bold text-sm tracking-widest whitespace-nowrap">
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
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
            product.tag === 'Sale'
              ? 'bg-red-600 text-white'
              : product.tag === 'New'
              ? 'bg-kurima-orange text-white'
              : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
          }`}
        >
          {product.tag}
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
            Add to Cart
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
          {product.category}
        </p>
        <h3 className="font-bold text-white text-base mb-2 group-hover:text-kurima-orange transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-kurima-orange font-bold text-lg">${product.price}</span>
          {product.originalPrice && (
            <span className="text-white/40 line-through text-sm">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function FeaturedProducts() {
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              New Arrivals
            </h2>
            <p className="text-kurima-muted mt-3 text-base">
              The latest drops from our SS26 collection. Every piece tells a story.
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Our Collections
          </h2>
          <p className="text-kurima-muted mt-3 max-w-lg mx-auto">
            Curated sets designed for those who play the long game. Two worlds. One vision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="group relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-kurima-orange/0 group-hover:bg-kurima-orange/10 transition-colors duration-500" />
              <div className="absolute bottom-8 left-8 right-8">
                <Badge className="bg-kurima-orange text-white font-semibold mb-3">
                  {col.items} Pieces
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">{col.name}</h3>
                <p className="text-white/70 text-sm sm:text-base mb-4 max-w-sm">{col.description}</p>
                <div className="flex items-center gap-2 text-kurima-orange font-semibold text-sm group-hover:gap-3 transition-all">
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '200+', label: 'Unique Designs' },
    { value: '35+', label: 'Countries Shipped' },
    { value: '4.9', label: 'Average Rating' },
  ]

  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-kurima-orange mb-1">
                {stat.value}
              </div>
              <div className="text-kurima-muted text-sm tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-kurima-orange/30 transition-colors group"
            >
              <div className="w-14 h-14 rounded-full bg-kurima-orange/10 flex items-center justify-center mb-4 group-hover:bg-kurima-orange/20 transition-colors">
                <feat.icon className="w-6 h-6 text-kurima-orange" />
              </div>
              <h3 className="font-bold text-white mb-1">{feat.title}</h3>
              <p className="text-kurima-muted text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-kurima-orange/5 via-transparent to-kurima-orange/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kurima-orange/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Join the <span className="text-kurima-orange">Movement</span>
            </h2>
            <p className="text-kurima-muted mb-8 text-base sm:text-lg">
              Get early access to new drops, exclusive offers, and style inspiration delivered straight to your inbox.
            </p>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-kurima-orange/10 border border-kurima-orange/30 rounded-2xl p-6"
              >
                <p className="text-kurima-orange font-semibold text-lg">Welcome to KURIMA!</p>
                <p className="text-white/60 text-sm mt-1">Check your inbox for a special welcome gift.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full px-6 py-6 text-base focus:border-kurima-orange focus:ring-kurima-orange/20"
                  required
                />
                <Button
                  type="submit"
                  className="bg-kurima-orange hover:bg-kurima-orange-light text-white font-bold rounded-full px-8 py-6 text-base"
                >
                  Subscribe <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            )}
            <p className="text-white/30 text-xs mt-4">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-kurima-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <img src="/kurima-logo.png" alt="KURIMA" className="w-32 object-contain p-1" />

            </div>
            <p className="text-kurima-muted text-sm leading-relaxed mb-4">
              Strategy meets style. Premium streetwear for the bold and the calculating.
            </p>
            <div className="flex gap-3">
              {[Camera, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-kurima-orange hover:border-kurima-orange/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide text-sm uppercase">Shop</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-kurima-muted text-sm hover:text-kurima-orange transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide text-sm uppercase">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Sustainability', 'Press'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-kurima-muted text-sm hover:text-kurima-orange transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide text-sm uppercase">Help</h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-kurima-muted text-sm hover:text-kurima-orange transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-white/5 my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-kurima-muted text-xs">
          <p>2026 KURAMA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-kurima-orange transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-kurima-orange transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-kurima-black">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MarqueeBanner />
        <FeaturedProducts />
        <CollectionsSection />
        <StatsSection />
        <FeaturesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
