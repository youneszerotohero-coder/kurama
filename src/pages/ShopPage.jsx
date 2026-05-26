import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Check, 
  ShoppingBag, 
  X, 
  Sparkles, 
  PackageOpen, 
  Eye,
  Heart,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'
import ProductCard from '@/components/ProductCard'

// Mock products database for a premium shop experience
const SHOP_PRODUCTS = [
  {
    id: 1,
    name: 'Smart Circuit Breaker Pro',
    price: 38500,
    originalPrice: 45000,
    image: '/p1.jpg',
    tag: 'tags.bestSeller',
    category: 'distribution',
    brand: 'SIEMENS',
    inStock: true,
    rating: 4.9,
    description: 'Next-generation intelligent breaker with instant load monitoring and mobile control.',
    sizes: ['16A', '32A', '63A', '100A']
  },
  {
    id: 2,
    name: 'Intelligent Energy Monitor',
    price: 18900,
    image: '/p2.jpg',
    tag: 'tags.new',
    category: 'smart',
    brand: 'SCHNEIDER',
    inStock: true,
    rating: 4.8,
    description: 'Hook directly to your distribution board for AI-powered load monitoring and suggestions.',
    sizes: ['Single-Phase', 'Three-Phase']
  },
  {
    id: 3,
    name: 'Heavy Duty Copper Cable',
    price: 14500,
    image: '/p3.jpg',
    tag: 'tags.trending',
    category: 'cabling',
    brand: 'LEGRAND',
    inStock: true,
    rating: 4.7,
    description: 'Ultra-pure insulated copper wires built to handle extreme thermal currents.',
    sizes: ['4mm²', '6mm²', '10mm²', '16mm²']
  },
  {
    id: 4,
    name: 'Premium Double Wall Switch',
    price: 9500,
    originalPrice: 12000,
    image: '/p4.jpg',
    tag: 'tags.sale',
    category: 'cabling',
    brand: 'LEGRAND',
    inStock: true,
    rating: 4.6,
    description: 'Glass-touch sensory panels that match elegant modern residential architecture.',
    sizes: ['Standard 86mm', 'Double 146mm']
  },
  {
    id: 5,
    name: 'Solar Panel 450W Mono',
    price: 42000,
    image: '/bg1.jpg',
    tag: 'tags.trending',
    category: 'renewable',
    brand: 'SIEMENS',
    inStock: true,
    rating: 4.9,
    description: 'Monocrystalline high-efficiency photovoltaic panels with heavy weathering tolerance.',
    sizes: ['Standard']
  },
  {
    id: 6,
    name: 'Lithium Battery Storage 5kWh',
    price: 245000,
    originalPrice: 280000,
    image: '/bg2.jpg',
    tag: 'tags.bestSeller',
    category: 'renewable',
    brand: 'ABB',
    inStock: true,
    rating: 5.0,
    description: 'High discharge life smart lithium iron phosphate home battery cells.',
    sizes: ['5kWh Cabinet', '10kWh Cabinet']
  },
  {
    id: 7,
    name: 'Smart Wi-Fi Meter Pro',
    price: 12800,
    image: '/product-1.png',
    tag: 'tags.new',
    category: 'smart',
    brand: 'SCHNEIDER',
    inStock: false,
    rating: 4.5,
    description: 'Intelligent wireless utility tracker syncing real-time voltage stats over standard MQTT.',
    sizes: ['Single-Phase']
  },
  {
    id: 8,
    name: 'Industrial Contactor 40A',
    price: 15400,
    image: '/product-2.png',
    category: 'distribution',
    brand: 'ABB',
    inStock: true,
    rating: 4.7,
    description: 'Heavy duty modular power contactor for commercial pump systems and mechanical loads.',
    sizes: ['220V Coil', '380V Coil']
  },
  {
    id: 9,
    name: 'Surge Protection Device',
    price: 8900,
    image: '/product-3.png',
    tag: 'tags.sale',
    category: 'distribution',
    brand: 'EATON',
    inStock: true,
    rating: 4.8,
    description: 'Class II transient voltage suppressor safeguarding complex server arrays.',
    sizes: ['20kA', '40kA']
  },
  {
    id: 10,
    name: 'Solar Grid-Tie Inverter 5kW',
    price: 189000,
    image: '/product-4.png',
    category: 'renewable',
    brand: 'PHILIPS',
    inStock: false,
    rating: 4.9,
    description: 'State-of-the-art dual-MPPT smart inverter feed monitoring.',
    sizes: ['5kW Wall-Mount']
  }
]

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'distribution', label: 'Power Distribution' },
  { id: 'smart', label: 'Smart Grid & Automation' },
  { id: 'cabling', label: 'Industrial Cabling' },
  { id: 'renewable', label: 'Renewable Energy' }
]

const BRANDS = ['All Brands', 'SIEMENS', 'SCHNEIDER', 'LEGRAND', 'ABB', 'EATON', 'PHILIPS']

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured & Best Match' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Customer Rating' }
]

export default function ShopPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Dynamic Localized Lists
  const categoriesList = useMemo(() => [
    { id: 'all', label: t('shop.allCategories', 'All Categories') },
    { id: 'distribution', label: t('shop.distribution', 'Power Distribution') },
    { id: 'smart', label: t('shop.smart', 'Smart Grid & Automation') },
    { id: 'cabling', label: t('shop.cabling', 'Industrial Cabling') },
    { id: 'renewable', label: t('shop.renewable', 'Renewable Energy') }
  ], [t])

  const sortOptionsList = useMemo(() => [
    { id: 'featured', label: t('shop.sortFeatured', 'Featured & Best Match') },
    { id: 'price-asc', label: t('shop.sortPriceAsc', 'Price: Low to High') },
    { id: 'price-desc', label: t('shop.sortPriceDesc', 'Price: High to Low') },
    { id: 'rating', label: t('shop.sortRating', 'Customer Rating') }
  ], [t])

  // State Management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('All Brands')
  const [maxPrice, setMaxPrice] = useState(300000)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [likedProducts, setLikedProducts] = useState([])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Like toggle
  const toggleLike = (productId, e) => {
    e.stopPropagation()
    setLikedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return SHOP_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesBrand = selectedBrand === 'All Brands' || product.brand === selectedBrand
      const matchesPrice = product.price <= maxPrice
      const matchesStock = !onlyInStock || product.inStock

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      return 0 // default sequence
    })
  }, [searchQuery, selectedCategory, selectedBrand, maxPrice, onlyInStock, sortBy])

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedBrand('All Brands')
    setMaxPrice(300000)
    setOnlyInStock(false)
    setSortBy('featured')
  }

  return (
    <div className="min-h-screen bg-kurima-black text-foreground pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        


        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-foreground/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('shop.searchPlaceholder', 'Search gear, breakers...')}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/80 rounded-xl text-xs font-semibold text-foreground placeholder-foreground/30 focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/45 hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Sort Toggle */}
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-foreground/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-foreground font-semibold focus:outline-none cursor-pointer"
              >
                {sortOptionsList.map(opt => (
                  <option key={opt.id} value={opt.id} className="bg-kurima-dark text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Filter Button */}
            <Button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden bg-background border border-border text-foreground hover:bg-foreground/5 px-4 rounded-xl flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('shop.filters', 'Filters')}
            </Button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="flex gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 bg-foreground/[0.015] border border-foreground/10 p-6 rounded-3xl sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-kurima-orange" />
                {t('shop.refineSearch', 'Refine Search')}
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-black text-kurima-orange hover:text-kurima-orange-light uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('shop.clearAll', 'Clear All')}
              </button>
            </div>

            {/* Categories Select */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted mb-3">{t('shop.selectCategory', 'Select Category')}</h4>
              <div className="relative w-full">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-background/40 hover:bg-background/70 border border-foreground/10 rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer shadow-md"
                >
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <Separator className="bg-foreground/10 my-6" />

            {/* Brands Select */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted mb-3">{t('shop.selectManufacturer', 'Select Manufacturer')}</h4>
              <div className="relative w-full">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none bg-background/40 hover:bg-background/70 border border-foreground/10 rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer shadow-md"
                >
                  {BRANDS.map(brand => (
                    <option key={brand} value={brand} className="bg-background text-foreground">
                      {brand === 'All Brands' ? t('shop.allManufacturers', 'All Manufacturers') : brand}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <Separator className="bg-foreground/10 my-6" />

            {/* Price Range Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted">{t('shop.maxBudget', 'Max Budget')}</h4>
                <span className="text-xs font-black text-kurima-orange">{maxPrice.toLocaleString()} DA</span>
              </div>
              <input
                type="range"
                min={5000}
                max={300000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-kurima-orange"
              />
              <div className="flex justify-between text-[9px] text-foreground/45 mt-1.5 font-bold">
                <span>5,000 DA</span>
                <span>300,000 DA</span>
              </div>
            </div>

            <Separator className="bg-foreground/10 my-6" />

            {/* Toggle Availability */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted">{t('shop.inStockOnly', 'In-Stock Only')}</h4>
                <p className="text-[10px] text-foreground/45">{t('shop.inStockDesc', 'Excludes out of stock items')}</p>
              </div>
              <button
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`w-10 h-6 rounded-full p-1 transition-all ${
                  onlyInStock ? 'bg-kurima-orange' : 'bg-foreground/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-all ${
                  onlyInStock ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20 bg-foreground/[0.015] border border-white/5 rounded-3xl p-8"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <PackageOpen className="w-8 h-8 text-foreground/35" />
                  </div>
                  <h3 className="text-xl font-black mb-2 uppercase">{t('shop.noMatchTitle', 'No Products Match')}</h3>
                  <p className="text-kurima-muted max-w-sm mx-auto text-sm mb-6">
                    {t('shop.noMatchText', "We couldn't find any results matching your filter combination. Reset the filters to browse our entire portfolio.")}
                  </p>
                  <Button 
                    onClick={handleResetFilters}
                    className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-bold rounded-full px-6"
                  >
                    {t('shop.resetFilters', 'Reset Filter Parameters')}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed top-1/2 left-1/2 z-[80] w-[92%] max-w-sm bg-background border border-foreground/10 shadow-2xl p-6 rounded-3xl overflow-y-auto max-h-[85vh] scrollbar-none"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-base uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-kurima-orange" />
                  {t('shop.filterOptions', 'Filter Options')}
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-foreground/70 hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Categories Select */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted mb-3">{t('shop.selectCategory', 'Categories')}</h4>
                <div className="relative w-full">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setIsMobileFilterOpen(false)
                    }}
                    className="w-full appearance-none bg-background/40 hover:bg-background/70 border border-foreground/10 rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer shadow-md"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5 my-6" />

              {/* Mobile Brands Select */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted mb-3">{t('shop.selectManufacturer', 'Manufacturers')}</h4>
                <div className="relative w-full">
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value)
                      setIsMobileFilterOpen(false)
                    }}
                    className="w-full appearance-none bg-background/40 hover:bg-background/70 border border-foreground/10 rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer shadow-md"
                  >
                    {BRANDS.map(brand => (
                      <option key={brand} value={brand} className="bg-background text-foreground">
                        {brand === 'All Brands' ? t('shop.allManufacturers', 'All Manufacturers') : brand}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5 my-6" />

              {/* Mobile Price */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted">{t('shop.maxBudget', 'Max Budget')}</h4>
                  <span className="text-xs font-black text-kurima-orange">{maxPrice.toLocaleString()} DA</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={300000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-kurima-orange"
                />
              </div>

              <Separator className="bg-foreground/5 my-6" />

              {/* Mobile Stock */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted">{t('shop.inStockOnly', 'In-Stock Only')}</h4>
                  <p className="text-[10px] text-foreground/45">{t('shop.hideBackorder', 'Hide backordered products')}</p>
                </div>
                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${
                    onlyInStock ? 'bg-kurima-orange' : 'bg-foreground/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-all ${
                    onlyInStock ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <Button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-black py-4 rounded-xl"
              >
                {t('shop.applyFilters', 'Apply Active Filters')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
