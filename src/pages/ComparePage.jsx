import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  Plus, 
  ShoppingBag, 
  Star, 
  ArrowRightLeft, 
  ChevronRight, 
  Trash2,
  AlertTriangle,
  Info,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import api from '@/lib/api'

export default function ComparePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()

  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts()
        const mappedData = data.map(p => ({
          ...p,
          price: Number(p.priceSold),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          category: p.category?.name || p.category,
          brand: p.brand?.name || p.brand,
          gamme: p.gamme?.name || p.gamme,
          positives: p.positives || [],
          negatives: p.negatives || [],
          details: p.details || []
        }))
        setProductsList(mappedData)
      } catch (err) {
        console.error('Error fetching products for comparison:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const p1Id = searchParams.get('p1') ? parseInt(searchParams.get('p1')) : null
  const p2Id = searchParams.get('p2') ? parseInt(searchParams.get('p2')) : null

  const product1 = productsList.find(p => p.id === p1Id) || null
  const product2 = productsList.find(p => p.id === p2Id) || null

  const [activeSlot, setActiveSlot] = useState(null) // 'p1' or 'p2' to indicate which slot is choosing a product
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectorSearchQuery, setSelectorSearchQuery] = useState('')

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSelectProduct = (product) => {
    if (activeSlot === 'p1') {
      setSearchParams({
        p1: product.id,
        ...(p2Id ? { p2: p2Id } : {})
      })
    } else if (activeSlot === 'p2') {
      setSearchParams({
        ...(p1Id ? { p1: p1Id } : {}),
        p2: product.id
      })
    }
    setIsSelectorOpen(false)
    setActiveSlot(null)
    setSelectorSearchQuery('')
  }

  const handleRemoveProduct = (slot) => {
    if (slot === 'p1') {
      setSearchParams(p2Id ? { p2: p2Id } : {})
    } else if (slot === 'p2') {
      setSearchParams(p1Id ? { p1: p1Id } : {})
    }
  }

  const openSelector = (slot) => {
    setActiveSlot(slot)
    setSelectorSearchQuery('')
    setIsSelectorOpen(true)
  }

  // Filter out already selected products from selector list
  const availableProducts = productsList.filter(p => {
    if (activeSlot === 'p1') return p.id !== p2Id
    if (activeSlot === 'p2') return p.id !== p1Id
    return true
  })

  const searchedAvailableProducts = availableProducts.filter(p => {
    const q = selectorSearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
  })

  // Format pricing
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toLocaleString() : price
  }

  return (
    <div className="min-h-screen bg-kurima-black text-foreground pt-24 pb-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-kurima-muted mb-8">
          <Link to="/" className="hover:text-kurima-orange transition-colors">{t('nav.home', 'Home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-kurima-orange transition-colors">{t('nav.shop', 'Shop')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{t('compare.title', 'Compare Products')}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <div className="h-[2px] w-10 bg-kurima-orange mb-4" />
          <h1 className="text-3xl sm:text-5xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-kurima-orange" />
            {t('compare.heading', 'Compare Solutions')}
          </h1>
          <p className="text-kurima-muted mt-3 max-w-2xl text-sm sm:text-base">
            {t('compare.subtitle', 'Side-by-side analysis of product technical details, pricing, strengths, and drawbacks to help you engineer the perfect energy solution.')}
          </p>
        </div>

        {/* Main Compare Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
          
          {/* Divider Arrow for Desktop */}
          {product1 && product2 && (
            <div className="hidden md:flex absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-kurima-orange border border-kurima-orange/20 items-center justify-center text-black shadow-lg shadow-kurima-orange/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          )}

          {/* Slot 1 */}
          <div className="flex flex-col h-full">
            {product1 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 relative overflow-hidden shadow-xl"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveProduct('p1')}
                  className="absolute top-4 right-4 p-2 rounded-full bg-foreground/5 hover:bg-red-500/10 text-foreground/45 hover:text-red-500 transition-colors border border-border"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Meta */}
                <div className="flex gap-4 items-center mb-6 pr-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-kurima-gray border border-white/5 shrink-0">
                    <img src={product1.image} alt={product1.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Badge className="bg-kurima-orange/10 border border-kurima-orange/30 text-kurima-orange text-[9px] uppercase tracking-widest font-black mb-1.5">
                      {product1.brand}
                    </Badge>
                    <h3 className="text-base font-black text-foreground hover:text-kurima-orange transition-colors line-clamp-1">
                      <Link to={`/product/${product1.id}`}>{product1.name}</Link>
                    </h3>
                    <p className="text-xs text-kurima-muted mt-0.5">{product1.category.toUpperCase()}</p>
                  </div>
                </div>

                <Separator className="bg-white/5 mb-6" />

                {/* Info List */}
                <div className="space-y-6 flex-1">
                  
                  {/* Pricing Comparison */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted block mb-1">{t('compare.pricing', 'Pricing')}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-kurima-orange">{formatPrice(product1.price)} DA</span>
                      {product1.originalPrice && (
                        <span className="text-sm text-kurima-muted line-through">{formatPrice(product1.originalPrice)} DA</span>
                      )}
                    </div>
                    {product1.originalPrice && (
                      <span className="text-[10px] text-green-500 font-bold">
                        {t('compare.save', 'Save')} {Math.round(((product1.originalPrice - product1.price) / product1.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted block mb-1">{t('compare.satisfaction', 'Customer Satisfaction')}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-kurima-orange">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-sm font-extrabold text-foreground">{product1.rating} / 5.0</span>
                    </div>
                  </div>

                  {/* Positives (PROS) */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 block mb-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      {t('compare.positives', 'Positives (Pros)')}
                    </span>
                    <ul className="space-y-2">
                      {product1.positives?.map((pos, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                          <span>{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Negatives (CONS) */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-2 flex items-center gap-1">
                      <X className="w-3.5 h-3.5 text-red-500" />
                      {t('compare.negatives', 'Negatives (Cons)')}
                    </span>
                    <ul className="space-y-2">
                      {product1.negatives?.map((neg, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          <span>{neg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted block mb-2 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-kurima-orange" />
                      {t('compare.specs', 'Key Specifications')}
                    </span>
                    <ul className="space-y-1.5 bg-background/40 border border-foreground/5 p-3.5 rounded-2xl">
                      {product1.details?.map((detail, i) => (
                        <li key={i} className="text-[11px] text-kurima-muted border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={() => addToCart(product1, 1)}
                    disabled={!product1.inStock}
                    className="flex-1 bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold rounded-full py-4 text-xs shadow-lg shadow-kurima-orange/10"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t('productPage.addToCart', 'Add to Cart')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/product/${product1.id}`)}
                    className="border-white/10 hover:border-kurima-orange hover:bg-foreground/5 text-foreground rounded-full px-5 text-xs font-bold"
                  >
                    {t('compare.details', 'Details')}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div 
                onClick={() => openSelector('p1')}
                className="flex-1 border-2 border-dashed border-foreground/10 hover:border-kurima-orange/50 bg-foreground/[0.005] hover:bg-kurima-orange/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[400px] group"
              >
                <div className="w-16 h-16 rounded-full bg-foreground/5 group-hover:bg-kurima-orange/10 group-hover:scale-105 transition-all flex items-center justify-center text-foreground/40 group-hover:text-kurima-orange mb-6 border border-border">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 uppercase tracking-wide">{t('compare.addProduct1', 'Add Product 1')}</h3>
                <p className="text-xs text-kurima-muted max-w-xs leading-relaxed">
                  {t('compare.descSlot1', 'Click to select an electrical device or automation solution to configure slot 1.')}
                </p>
              </div>
            )}
          </div>

          {/* Slot 2 */}
          <div className="flex flex-col h-full">
            {product2 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 relative overflow-hidden shadow-xl"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveProduct('p2')}
                  className="absolute top-4 right-4 p-2 rounded-full bg-foreground/5 hover:bg-red-500/10 text-foreground/45 hover:text-red-500 transition-colors border border-border"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Meta */}
                <div className="flex gap-4 items-center mb-6 pr-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-kurima-gray border border-white/5 shrink-0">
                    <img src={product2.image} alt={product2.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Badge className="bg-kurima-orange/10 border border-kurima-orange/30 text-kurima-orange text-[9px] uppercase tracking-widest font-black mb-1.5">
                      {product2.brand}
                    </Badge>
                    <h3 className="text-base font-black text-foreground hover:text-kurima-orange transition-colors line-clamp-1">
                      <Link to={`/product/${product2.id}`}>{product2.name}</Link>
                    </h3>
                    <p className="text-xs text-kurima-muted mt-0.5">{product2.category.toUpperCase()}</p>
                  </div>
                </div>

                <Separator className="bg-white/5 mb-6" />

                {/* Info List */}
                <div className="space-y-6 flex-1">
                  
                  {/* Pricing Comparison */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted block mb-1">{t('compare.pricing', 'Pricing')}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-kurima-orange">{formatPrice(product2.price)} DA</span>
                      {product2.originalPrice && (
                        <span className="text-sm text-kurima-muted line-through">{formatPrice(product2.originalPrice)} DA</span>
                      )}
                    </div>
                    {product2.originalPrice && (
                      <span className="text-[10px] text-green-500 font-bold">
                        {t('compare.save', 'Save')} {Math.round(((product2.originalPrice - product2.price) / product2.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted block mb-1">{t('compare.satisfaction', 'Customer Satisfaction')}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-kurima-orange">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-sm font-extrabold text-foreground">{product2.rating} / 5.0</span>
                    </div>
                  </div>

                  {/* Positives (PROS) */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 block mb-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      {t('compare.positives', 'Positives (Pros)')}
                    </span>
                    <ul className="space-y-2">
                      {product2.positives?.map((pos, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                          <span>{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Negatives (CONS) */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-2 flex items-center gap-1">
                      <X className="w-3.5 h-3.5 text-red-500" />
                      {t('compare.negatives', 'Negatives (Cons)')}
                    </span>
                    <ul className="space-y-2">
                      {product2.negatives?.map((neg, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          <span>{neg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted block mb-2 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-kurima-orange" />
                      {t('compare.specs', 'Key Specifications')}
                    </span>
                    <ul className="space-y-1.5 bg-background/40 border border-foreground/5 p-3.5 rounded-2xl">
                      {product2.details?.map((detail, i) => (
                        <li key={i} className="text-[11px] text-kurima-muted border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={() => addToCart(product2, 1)}
                    disabled={!product2.inStock}
                    className="flex-1 bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold rounded-full py-4 text-xs shadow-lg shadow-kurima-orange/10"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t('productPage.addToCart', 'Add to Cart')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/product/${product2.id}`)}
                    className="border-white/10 hover:border-kurima-orange hover:bg-foreground/5 text-foreground rounded-full px-5 text-xs font-bold"
                  >
                    {t('compare.details', 'Details')}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div 
                onClick={() => openSelector('p2')}
                className="flex-1 border-2 border-dashed border-foreground/10 hover:border-kurima-orange/50 bg-foreground/[0.005] hover:bg-kurima-orange/[0.01] rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[400px] group"
              >
                <div className="w-16 h-16 rounded-full bg-foreground/5 group-hover:bg-kurima-orange/10 group-hover:scale-105 transition-all flex items-center justify-center text-foreground/40 group-hover:text-kurima-orange mb-6 border border-border">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 uppercase tracking-wide">{t('compare.addProduct2', 'Add Product 2')}</h3>
                <p className="text-xs text-kurima-muted max-w-xs leading-relaxed">
                  {t('compare.descSlot2', 'Click to select an electrical device or automation solution to configure slot 2.')}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Visual Product Selector Drawer / Modal */}
      <AnimatePresence>
        {isSelectorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSelectorOpen(false)
                setActiveSlot(null)
                setSelectorSearchQuery('')
              }}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed top-1/2 left-1/2 z-[110] w-[92%] max-w-xl bg-background border border-foreground/10 rounded-3xl p-6 sm:p-8 max-h-[80vh] overflow-y-auto shadow-2xl flex flex-col scrollbar-thin"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5 text-kurima-orange" />
                    {t('compare.selectSolution', 'Select Solution')}
                  </h3>
                  <p className="text-xs text-kurima-muted mt-1">
                    {t('compare.chooseCatalog', 'Choose from our catalog to compare parameters.')}
                  </p>
                </div>
                 <button
                  onClick={() => {
                    setIsSelectorOpen(false)
                    setActiveSlot(null)
                    setSelectorSearchQuery('')
                  }}
                  className="p-2 rounded-full hover:bg-foreground/5 text-foreground/45 hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {availableProducts.length > 0 && (
                <div className="relative mb-5 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                  <input
                    type="text"
                    value={selectorSearchQuery}
                    onChange={(e) => setSelectorSearchQuery(e.target.value)}
                    placeholder={t('search.placeholder', 'Search products...')}
                    className="w-full pl-10 pr-9 py-2.5 bg-foreground/[0.02] border border-foreground/10 rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/30 focus:outline-none focus:border-kurima-orange transition-all"
                  />
                  {selectorSearchQuery && (
                    <button
                      onClick={() => setSelectorSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {availableProducts.length === 0 ? (
                <div className="text-center py-12 text-kurima-muted">
                  <AlertTriangle className="w-8 h-8 text-kurima-orange mx-auto mb-4" />
                  <p className="text-sm font-semibold">{t('compare.noProducts', 'No other products available for comparison.')}</p>
                </div>
              ) : searchedAvailableProducts.length === 0 ? (
                <div className="text-center py-12 text-kurima-muted">
                  <Search className="w-8 h-8 text-kurima-orange mx-auto mb-4" />
                  <p className="text-sm font-semibold">{t('shop.noMatchTitle', 'No Products Match')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-1">
                  {searchedAvailableProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex gap-4 items-center p-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5 hover:border-kurima-orange/45 hover:bg-kurima-orange/[0.02] cursor-pointer transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-kurima-gray border border-white/5 shrink-0 transition-transform group-hover:scale-105">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase text-kurima-orange/80 tracking-widest">{product.brand}</span>
                        <h4 className="text-xs font-black text-foreground group-hover:text-kurima-orange transition-colors truncate mt-0.5">{product.name}</h4>
                        <p className="text-[10px] text-kurima-muted mt-0.5">{formatPrice(product.price)} DA</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
