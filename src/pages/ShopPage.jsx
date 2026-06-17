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
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '@/components/ProductCard'

import api from '@/lib/api'

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
  const [searchParams, setSearchParams] = useSearchParams()

  // Dynamic filter options state
  const [dbCategories, setDbCategories] = useState([])
  const [dbBrands, setDbBrands] = useState([])
  const [dbGammes, setDbGammes] = useState([])

  // State Management
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all')
  const [selectedBrand, setSelectedBrand] = useState(() => searchParams.get('brand') || 'All Brands')
  const [selectedGamme, setSelectedGamme] = useState(() => searchParams.get('gamme') || 'All Gammes')
  const [maxPrice, setMaxPrice] = useState(300000)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Sync state with URL params
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const brand = searchParams.get('brand') || 'All Brands'
    const gamme = searchParams.get('gamme') || 'All Gammes'
    
    setSearchQuery(search)
    setSelectedCategory(category)
    setSelectedBrand(brand)
    setSelectedGamme(gamme)
  }, [searchParams])

  // Update URL search parameters when filters change
  useEffect(() => {
    const newParams = {}
    if (searchQuery) newParams.search = searchQuery
    if (selectedCategory !== 'all') newParams.category = selectedCategory
    if (selectedBrand !== 'All Brands') newParams.brand = selectedBrand
    if (selectedGamme !== 'All Gammes') newParams.gamme = selectedGamme
    setSearchParams(newParams, { replace: true })
  }, [searchQuery, selectedCategory, selectedBrand, selectedGamme, setSearchParams])

  // Live Products State
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Localized Lists
  const categoriesList = useMemo(() => {
    const list = [{ id: 'all', label: t('shop.allCategories', 'All Categories') }]
    dbCategories.forEach(cat => {
      const name = typeof cat === 'string' ? cat : (cat?.name || '')
      const id = typeof cat === 'string' ? cat : (cat?.name || '')
      if (name) {
        list.push({
          id: id,
          label: t(`shop.${name}`, name.charAt(0).toUpperCase() + name.slice(1))
        })
      }
    })
    return list
  }, [dbCategories, t])

  const brandsList = useMemo(() => {
    const names = dbBrands.map(b => typeof b === 'string' ? b : (b?.name || ''))
    return ['All Brands', ...names].filter(Boolean)
  }, [dbBrands])

  const gammesList = useMemo(() => {
    const filtered = selectedBrand === 'All Brands'
      ? dbGammes
      : dbGammes.filter(g => {
          const bName = typeof g.brand === 'object' && g.brand !== null ? g.brand.name : g.brand
          return String(bName || '').toLowerCase() === selectedBrand.toLowerCase()
        })
    const names = filtered.map(g => typeof g === 'string' ? g : (g?.name || ''))
    return names.filter(Boolean)
  }, [dbGammes, selectedBrand])

  const sortOptionsList = useMemo(() => [
    { id: 'featured', label: t('shop.sortFeatured', 'Featured & Best Match') },
    { id: 'price-asc', label: t('shop.sortPriceAsc', 'Price: Low to High') },
    { id: 'price-desc', label: t('shop.sortPriceDesc', 'Price: High to Low') },
    { id: 'rating', label: t('shop.sortRating', 'Customer Rating') }
  ], [t])

  // Scroll to top and fetch dynamic lists
  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchFilters = async () => {
      try {
        const [cats, brs, gms] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
          api.getGammes()
        ])
        if (cats && cats.length) setDbCategories(cats)
        if (brs && brs.length) setDbBrands(brs)
        if (gms && gms.length) setDbGammes(gms)
      } catch (err) {
        console.error('Error fetching filter values:', err)
      }
    }
    fetchFilters()
  }, [])

  // Fetch products from backend whenever filters or search query changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryParams = {
          search: searchQuery || undefined,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          brand: selectedBrand === 'All Brands' ? undefined : selectedBrand,
          gamme: selectedGamme === 'All Gammes' ? undefined : selectedGamme,
          maxPrice: maxPrice,
          sort: sortBy
        }
        const data = await api.getProducts(queryParams)
        // Convert prices to numbers safely
        let mappedData = data.map(p => ({
          ...p,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null
        }))

        // Filter by favorites locally if onlyFavorites is true
        if (onlyFavorites) {
          try {
            const favs = JSON.parse(localStorage.getItem('kurama_favorites') || '[]')
            mappedData = mappedData.filter(p => favs.includes(Number(p.id)))
          } catch (e) {
            console.error(e)
          }
        }

        setProducts(mappedData)
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchProducts()
    }, 250) // debounce search inputs slightly

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, selectedCategory, selectedBrand, selectedGamme, maxPrice, onlyFavorites, sortBy])

  // Reset selected gamme if the selected brand changes and the current gamme is not in the filtered gammes list
  useEffect(() => {
    if (dbGammes.length > 0 && selectedGamme !== 'All Gammes' && !gammesList.includes(selectedGamme)) {
      setSelectedGamme('All Gammes')
    }
  }, [selectedBrand, gammesList, selectedGamme, dbGammes])

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedBrand('All Brands')
    setSelectedGamme('All Gammes')
    setMaxPrice(300000)
    setOnlyFavorites(false)
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
              className="lg:hidden bg-kurima-orange text-black hover:bg-kurima-orange-light px-5 py-3 h-auto rounded-xl flex items-center gap-2 font-black shadow-lg shadow-kurima-orange/20 border-0 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-black font-black" />
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
                  {brandsList.map(brand => (
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

            {/* Gamme Select */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted mb-3">{t('shop.selectGamme', 'Select Range')}</h4>
              <div className="relative w-full">
                <select
                  value={selectedGamme}
                  onChange={(e) => setSelectedGamme(e.target.value)}
                  className="w-full appearance-none bg-background/40 hover:bg-background/70 border border-foreground/10 rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer shadow-md"
                >
                  <option value="All Gammes" className="bg-background text-foreground">
                    {t('shop.allGammes', 'All Ranges')}
                  </option>
                  {gammesList.map(gamme => (
                    <option key={gamme} value={gamme} className="bg-background text-foreground">
                      {gamme}
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
                <span className="text-xs font-black text-black dark:text-kurima-orange">{maxPrice.toLocaleString()} DA</span>
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

            {/* Toggle Favorites */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted">{t('shop.favoritesOnly', 'Favorites Only')}</h4>
                <p className="text-[10px] text-foreground/45">{t('shop.favoritesDesc', 'Show only liked products')}</p>
              </div>
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`w-10 h-6 rounded-full p-1 transition-all ${
                  onlyFavorites ? 'bg-kurima-orange' : 'bg-foreground/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-all ${
                  onlyFavorites ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-foreground/[0.03] border border-border/80 rounded-2xl h-[360px] flex flex-col justify-between p-5">
                      <div className="h-[180px] bg-foreground/5 rounded-xl mb-4" />
                      <div className="space-y-3 flex-1 flex flex-col justify-end">
                        <div className="h-3 bg-foreground/5 rounded w-1/4" />
                        <div className="h-5 bg-foreground/5 rounded w-3/4" />
                        <div className="h-3 bg-foreground/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
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
                  {products.map((product, i) => (
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
                    {brandsList.map(brand => (
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

              {/* Mobile Gammes Select */}
              <div className="mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted mb-3">{t('shop.selectGamme', 'Ranges')}</h4>
                <div className="relative w-full">
                  <select
                    value={selectedGamme}
                    onChange={(e) => {
                      setSelectedGamme(e.target.value)
                      setIsMobileFilterOpen(false)
                    }}
                    className="w-full appearance-none bg-background/40 hover:bg-background/70 border border-foreground/10 rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer shadow-md"
                  >
                    <option value="All Gammes" className="bg-background text-foreground">
                      {t('shop.allGammes', 'All Ranges')}
                    </option>
                    {gammesList.map(gamme => (
                      <option key={gamme} value={gamme} className="bg-background text-foreground">
                        {gamme}
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
                  <span className="text-xs font-black text-black dark:text-kurima-orange">{maxPrice.toLocaleString()} DA</span>
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

              {/* Mobile Favorites */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-kurima-muted">{t('shop.favoritesOnly', 'Favorites Only')}</h4>
                  <p className="text-[10px] text-foreground/45">{t('shop.favoritesDesc', 'Show only liked products')}</p>
                </div>
                <button
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${
                    onlyFavorites ? 'bg-kurima-orange' : 'bg-foreground/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black transition-all ${
                    onlyFavorites ? 'translate-x-4' : 'translate-x-0'
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
