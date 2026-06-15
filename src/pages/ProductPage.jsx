import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  Heart, 
  Share2, 
  Plus, 
  Minus,
  Check,
  ChevronDown,
  User,
  Phone,
  MapPin,
  Building,
  Zap,
  GitCompare,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/ProductCard'
import api from '@/lib/api'

export default function ProductPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Direct checkout states
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: ''
  })
  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    wilaya: false,
    commune: false,
    submit: null
  })
  const [isOrderSuccess, setIsOrderSuccess] = useState(false)
  const [territories, setTerritories] = useState([])
  const [shippingType, setShippingType] = useState('home') // 'home' or 'desk'

  // Fetch territories & pre-fill profile details
  useEffect(() => {
    const loadTerritoriesAndProfile = async () => {
      try {
        const territoriesData = await api.getTerritories().catch(() => [])
        const rawTerritories = territoriesData.data || territoriesData || []
        setTerritories(rawTerritories)
      } catch (err) {
        console.error('Failed to fetch territories:', err)
      }

      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser)
          setOrderForm({
            name: u.name || u.fullName || '',
            phone: u.phone || '',
            wilaya: u.wilaya || '',
            commune: u.commune || ''
          })
        } catch (e) {
          console.error(e)
        }
      }
    }

    loadTerritoriesAndProfile()
  }, [])

  // Fetch product detail and related products on mount or ID change
  useEffect(() => {
    window.scrollTo(0, 0)
    
    const loadProductData = async () => {
      setLoading(true)
      try {
        const data = await api.getProduct(id)
        
        const mapped = {
          ...data,
          price: Number(data.priceSold),
          originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
          category: data.category?.name || data.category,
          brand: data.brand?.name || data.brand,
          gamme: data.gamme?.name || data.gamme,
          colors: Array.isArray(data.colors) ? data.colors : [{ name: 'Default', hex: '#FFFFFF' }],
          sizes: Array.isArray(data.sizes) ? data.sizes : ['Standard'],
          images: Array.isArray(data.images) && data.images.length ? data.images : [data.image || '/p1.jpg'],
          details: Array.isArray(data.details) ? data.details : []
        }

        setProduct(mapped)
        setSelectedImage(0)
        setSelectedSize(mapped.sizes[0] || 'Standard')
        setSelectedColor(mapped.colors[0]?.name || 'Default')
        setQuantity(1)

        // Fetch related products (e.g. products in same category)
        const related = await api.getProducts({ category: mapped.category })
        const mappedRelated = related
          .filter(p => p.id !== mapped.id)
          .slice(0, 4)
          .map(p => ({
            ...p,
            price: Number(p.priceSold),
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
            category: p.category?.name || p.category,
            brand: p.brand?.name || p.brand,
            gamme: p.gamme?.name || p.gamme
          }))
        setRelatedProducts(mappedRelated)
      } catch (err) {
        console.error('Error fetching product detail:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProductData()
  }, [id])

  // Compute specification-specific pricing
  let basePrice = product ? product.price : 0
  let originalPrice = product ? product.originalPrice : null

  if (product && Array.isArray(product.sizes) && selectedSize) {
    const matchedSize = product.sizes.find(s => s && (s.name === selectedSize || s === selectedSize))
    if (matchedSize && typeof matchedSize === 'object' && matchedSize.priceSold !== undefined) {
      const promoMultiplier = 1 - (Number(product.promotionPercentage || 0) / 100)
      basePrice = Number(matchedSize.priceSold) * promoMultiplier
      if (Number(product.promotionPercentage || 0) > 0) {
        originalPrice = Number(matchedSize.priceSold)
      }
    }
  }

  const productCost = basePrice * quantity

  // Find active shipping rate matching the selected wilaya
  const selectedWilayaData = territories.find(t => {
    const optionName = `${t.name} (${t.code})`;
    return optionName === orderForm.wilaya || 
      orderForm.wilaya.toLowerCase().includes(t.name.toLowerCase()) ||
      (orderForm.wilaya.includes(`(${t.code})`))
  });

  const getShippingFee = (wilayaName, type = shippingType) => {
    if (!wilayaName) return 600
    if (selectedWilayaData) {
      if (type === 'desk') {
        return Number(selectedWilayaData.desk_price)
      }
      return Number(selectedWilayaData.home_price)
    }
    // Fallback static pricing
    if (wilayaName.includes('Algiers') || wilayaName.includes('Alger') || wilayaName.includes('16')) return type === 'desk' ? 250 : 400
    if (wilayaName.includes('Blida') || wilayaName.includes('09')) return type === 'desk' ? 350 : 500
    if (wilayaName.includes('Oran') || wilayaName.includes('Constantine')) return type === 'desk' ? 450 : 700
    return type === 'desk' ? 600 : 900
  }
  const shippingCost = getShippingFee(orderForm.wilaya)
  const totalCost = productCost + shippingCost

  const handleAction = async (type) => {
    const errors = {
      name: !orderForm.name.trim(),
      phone: !orderForm.phone.trim(),
      wilaya: !orderForm.wilaya.trim(),
      commune: !orderForm.commune.trim(),
      submit: null
    }

    setFormErrors(errors)

    if (errors.name || errors.phone || errors.wilaya || errors.commune) {
      document.getElementById('order-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (type === 'cart') {
      addToCart(product, quantity, selectedSize, selectedColor)
    } else if (type === 'buy') {
      setIsSubmitting(true)
      try {
        const orderData = {
          clientName: orderForm.name,
          clientPhone: orderForm.phone,
          fullName: orderForm.name,
          phone: orderForm.phone,
          wilaya: orderForm.wilaya,
          commune: orderForm.commune,
          shippingType: shippingType,
          addressDetails: `${orderForm.commune}, ${orderForm.wilaya}`,
          items: [{
            productId: Number(product.id),
            quantity: Number(quantity),
            size: selectedSize || null,
            color: selectedColor || null
          }]
        }
        await api.createOrder(orderData)
        setIsSubmitting(false)
        setIsOrderSuccess(true)
      } catch (err) {
        setIsSubmitting(false)
        setFormErrors(prev => ({
          ...prev,
          submit: err.message || 'Failed to place order.'
        }))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-6 bg-foreground/5 rounded w-1/4 mb-8" />
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-4">
              <div className="w-full aspect-square rounded-3xl bg-foreground/5" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-foreground/5" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-4 bg-foreground/5 rounded w-1/6" />
              <div className="h-12 bg-foreground/5 rounded w-3/4" />
              <div className="h-6 bg-foreground/5 rounded w-1/3" />
              <div className="h-10 bg-foreground/5 rounded w-1/2" />
              <div className="h-[200px] bg-foreground/5 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Product not found</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-kurima-muted mb-8">
          <Link to="/" className="hover:text-kurima-orange transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-kurima-orange transition-colors">{product.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Image Gallery */}
          <div className="space-y-4 w-full max-w-full overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-full aspect-square rounded-3xl overflow-hidden bg-kurima-dark border border-white/5 relative group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-background/40 backdrop-blur-md flex items-center justify-center text-foreground/70 hover:text-red-500 transition-all border border-border"
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <Badge className="absolute top-6 left-6 bg-kurima-orange text-black font-bold px-4 py-1.5 rounded-full">
                {product.tag}
              </Badge>
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-kurima-orange' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-kurima-orange font-bold tracking-widest text-sm uppercase mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="mb-2">
                <span className="text-xs text-kurima-muted font-bold tracking-wider">
                  Ref: {product.ref || `REF-P${product.id}`}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">
                    {typeof basePrice === 'number' ? basePrice.toLocaleString() : basePrice} DA
                  </span>
                  {originalPrice && (
                    <span className="text-lg sm:text-xl text-kurima-muted line-through">
                      {typeof originalPrice === 'number' ? originalPrice.toLocaleString() : originalPrice} DA
                    </span>
                  )}
                </div>
                <Separator orientation="vertical" className="h-8 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-kurima-orange text-kurima-orange" />
                  ))}
                  <span className="text-xs sm:text-sm text-kurima-muted ml-2">(48 {t('productPage.reviews', 'Reviews')})</span>
                </div>
              </div>
              {/* Color Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">{t('product.color')}: <span className="text-kurima-muted ml-2">{selectedColor}</span></h3>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${
                        selectedColor === color.name ? 'border-kurima-orange scale-110' : 'border-transparent'
                      }`}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('product.size')}</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => {
                    const sizeName = typeof size === 'object' ? size.name : size
                    return (
                      <button
                        key={sizeName}
                        onClick={() => setSelectedSize(sizeName)}
                        className={`min-w-[60px] px-4 h-12 rounded-xl font-bold transition-all border-2 flex flex-col items-center justify-center cursor-pointer ${
                          selectedSize === sizeName 
                            ? 'bg-kurima-orange border-kurima-orange text-black' 
                            : 'bg-foreground/5 border-border text-foreground/60 hover:border-foreground/20'
                        }`}
                      >
                        <span className="text-xs">{sizeName}</span>
                        {typeof size === 'object' && size.priceSold !== undefined && (
                          <span className={`text-[8px] font-black mt-0.5 ${selectedSize === sizeName ? 'text-black/80' : 'text-kurima-muted'}`}>
                            {Number(size.priceSold).toLocaleString()} DA
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Compare & Fiche Technique Buttons side-by-side right under specifications */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
                  <Button
                    onClick={() => navigate(`/compare?p1=${product.id}`)}
                    className="flex-1 bg-kurima-orange border-kurima-orange text-black font-extrabold rounded-full py-4 text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-kurima-orange-light hover:border-kurima-orange-light shadow-lg shadow-kurima-orange/20"
                  >
                    <GitCompare className="w-4 h-4 text-black" />
                    {t('productPage.compareToOthers', 'Compare with other products')}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      alert('Fiche Technique (Technical Datasheet) chargée avec succès.')
                    }}
                    className="flex-1 bg-kurima-orange border-kurima-orange text-black font-extrabold rounded-full py-4 text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-kurima-orange-light hover:border-kurima-orange-light shadow-lg shadow-kurima-orange/20"
                  >
                    <FileText className="w-4 h-4 text-black" />
                    Fiche Technique
                  </Button>
                </div>
              </div>

              {/* Direct COD Order Form right under specs */}
              <div id="order-form-section" className="mt-8 bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(235,94,40,0.03),transparent_40%)]" />
                
                <div className="relative mb-6">
                  <Badge className="bg-kurima-orange text-black font-extrabold mb-2 uppercase tracking-widest text-[8px]">
                    {t('productPage.fastCod', 'Fast COD Checkout')}
                  </Badge>
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                    {t('productPage.orderDirectly', 'Order Directly')}
                  </h3>
                  <p className="text-kurima-muted text-[11px] leading-relaxed">
                    {t('productPage.codSubtitle', 'Fill out your delivery info to purchase this item instantly.')}
                  </p>
                </div>

                <div className="relative space-y-4 text-left rtl:text-right">
                  {/* Full Name */}
                  <div className="flex flex-col relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                      {t('productPage.fullName', 'Full Name')} <span className="text-kurima-orange">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                      <input
                        type="text"
                        placeholder={t('productPage.namePlaceholder', 'Your Full Name')}
                        value={orderForm.name}
                        onChange={(e) => {
                          setOrderForm({ ...orderForm, name: e.target.value })
                          setFormErrors({ ...formErrors, name: false })
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                          formErrors.name ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                        }`}
                      />
                    </div>
                    {formErrors.name && (
                      <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider text-left rtl:text-right">{t('productPage.nameRequired', 'Name is required')}</span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                      {t('productPage.phoneNumber', 'Phone Number')} <span className="text-kurima-orange">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder={t('productPage.phonePlaceholder', '05 / 06 / 07 XX XX XX XX')}
                        value={orderForm.phone}
                        onChange={(e) => {
                          setOrderForm({ ...orderForm, phone: e.target.value })
                          setFormErrors({ ...formErrors, phone: false })
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                          formErrors.phone ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider text-left rtl:text-right">{t('productPage.phoneRequired', 'Phone is required')}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Wilaya Select */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('productPage.wilaya', 'Wilaya')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative w-full">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                        <select
                          value={orderForm.wilaya}
                          onChange={(e) => {
                            const nextWilaya = e.target.value;
                            setOrderForm({ ...orderForm, wilaya: nextWilaya, commune: '' })
                            setFormErrors({ ...formErrors, wilaya: false, commune: false })
                            const nextWilayaData = territories.find(t => `${t.name} (${t.code})` === nextWilaya);
                            if (nextWilayaData && !nextWilayaData.desk_active && shippingType === 'desk') {
                              setShippingType('home');
                            }
                          }}
                          className={`w-full appearance-none pl-11 pr-8 py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer ${
                            formErrors.wilaya ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                          }`}
                        >
                          <option value="" className="bg-background text-foreground/30">{t('productPage.wilaya', 'Wilaya')}</option>
                          {territories.map(tObj => {
                            const optionValue = `${tObj.name} (${tObj.code})`;
                            return (
                              <option key={tObj.code} value={optionValue} className="bg-background text-foreground">
                                {tObj.name} ({tObj.code})
                              </option>
                            )
                          })}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      {formErrors.wilaya && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider text-left rtl:text-right">{t('productPage.required', 'Required')}</span>
                      )}
                    </div>

                    {/* Commune */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('productPage.commune', 'Commune')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                        {territories.length > 0 ? (
                          <>
                            <select
                              value={orderForm.commune}
                              onChange={(e) => {
                                setOrderForm({ ...orderForm, commune: e.target.value })
                                setFormErrors({ ...formErrors, commune: false })
                              }}
                              disabled={!orderForm.wilaya}
                              className={`w-full appearance-none pl-11 pr-8 py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                formErrors.commune ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                              }`}
                            >
                              <option value="" className="bg-background text-foreground/30">{t('productPage.commune', 'Commune')}</option>
                              {(selectedWilayaData?.communes || []).map(c => (
                                <option key={c.id} value={c.name} className="bg-background text-foreground">
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </>
                        ) : (
                          <input
                            type="text"
                            placeholder={t('productPage.commune', 'Commune')}
                            value={orderForm.commune}
                            onChange={(e) => {
                              setOrderForm({ ...orderForm, commune: e.target.value })
                              setFormErrors({ ...formErrors, commune: false })
                            }}
                            className={`w-full pl-11 pr-4 py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/20 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                              formErrors.commune ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                            }`}
                          />
                        )}
                      </div>
                      {formErrors.commune && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider text-left rtl:text-right">{t('productPage.required', 'Required')}</span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="flex flex-col mt-4">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-2 text-left rtl:text-right">
                      {t('checkout.deliveryType', 'Delivery Method')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Home option */}
                      <button
                        type="button"
                        onClick={() => setShippingType('home')}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                          shippingType === 'home'
                            ? 'border-kurima-orange bg-kurima-orange/[0.03] text-foreground ring-1 ring-kurima-orange/20'
                            : 'border-border/80 bg-foreground/[0.01] text-foreground/75 hover:bg-foreground/[0.02]'
                        }`}
                      >
                        <Truck className="w-5 h-5 mb-1.5 text-kurima-orange" />
                        <span className="text-xs font-bold">{t('checkout.homeDelivery', 'Home Delivery')}</span>
                        {selectedWilayaData && (
                          <span className="text-[10px] font-semibold text-kurima-muted mt-0.5">
                            {Number(selectedWilayaData.home_price).toLocaleString()} DA
                          </span>
                        )}
                      </button>

                      {/* Stop desk option */}
                      <button
                        type="button"
                        onClick={() => setShippingType('desk')}
                        disabled={selectedWilayaData && !selectedWilayaData.desk_active}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          shippingType === 'desk'
                            ? 'border-kurima-orange bg-kurima-orange/[0.03] text-foreground ring-1 ring-kurima-orange/20'
                            : 'border-border/80 bg-foreground/[0.01] text-foreground/75 hover:bg-foreground/[0.02]'
                        }`}
                      >
                        <Building className="w-5 h-5 mb-1.5 text-kurima-orange" />
                        <span className="text-xs font-bold">{t('checkout.stopDesk', 'Stop Desk')}</span>
                        {selectedWilayaData && (
                          <span className="text-[10px] font-semibold text-kurima-muted mt-0.5">
                            {selectedWilayaData.desk_active 
                              ? `${Number(selectedWilayaData.desk_price).toLocaleString()} DA` 
                              : t('checkout.unavailable', 'Unavailable')}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quantity selector inside form */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted text-left rtl:text-right">{t('productPage.quantity', 'Quantity')}</span>
                    <div className="flex items-center bg-background border border-foreground/10 rounded-full px-3 py-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1 text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1 text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Cost details directly in the form */}
                  <div className="bg-background/40 border border-foreground/10 rounded-2xl p-4 mt-2 space-y-2 text-left rtl:text-right">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-kurima-muted">{t('productPage.prodPrice', 'Product Price:')}</span>
                      <span className="font-semibold text-foreground">{productCost.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-kurima-muted">{t('productPage.shippingFee', 'Shipping Fee:')}</span>
                      <span className="font-semibold text-black dark:text-kurima-orange">{shippingCost.toLocaleString()} DA</span>
                    </div>
                    <div className="h-[1px] bg-foreground/10 my-1" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{t('productPage.total', 'Total:')}</span>
                      <span className="font-black text-black dark:text-kurima-orange text-sm">{totalCost.toLocaleString()} DA</span>
                    </div>
                  </div>

                  {/* Action buttons attached to the bottom of the form */}
                  <div className="flex flex-col gap-3 pt-3">
                    {/* Add to Cart & Add to Favorites side-by-side */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAction('cart')}
                        className="flex-1 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground font-bold rounded-full py-4 text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {t('productPage.addToCart', 'Add to Cart')}
                      </Button>
                      <Button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex-1 font-bold rounded-full py-4 text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 border ${
                          isLiked 
                            ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' 
                            : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        {isLiked ? t('productPage.liked', 'Liked') : t('productPage.addToFavorites', 'Favorites')}
                      </Button>
                    </div>

                    {/* Buy Now under them */}
                    <Button
                      onClick={() => handleAction('buy')}
                      disabled={isSubmitting}
                      className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold rounded-full py-4 text-xs shadow-lg shadow-kurima-orange/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black text-black animate-pulse" />
                      {isSubmitting ? 'Placing Order...' : t('productPage.buyNow', 'Buy Now')}
                    </Button>

                    {formErrors.submit && (
                      <span className="text-[10px] text-kurima-orange font-bold text-center block uppercase tracking-wider mt-2">
                        {formErrors.submit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                {[
                  { icon: Truck, label: t('product.freeShipping') },
                  { icon: Shield, label: t('product.securePayment') },
                  { icon: RotateCcw, label: t('product.easyReturns') },
                  { icon: Share2, label: t('productPage.share', 'Share') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-kurima-muted">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Technical Details Section */}
        <div className="mt-24">
          <Separator className="bg-white/5 mb-16" />
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-2xl font-black text-foreground mb-6">{t('product.features')}</h2>
              <ul className="space-y-4">
                {product.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 text-kurima-muted">
                    <Check className="w-5 h-5 text-kurima-orange shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-black text-foreground mb-6">{t('product.description')}</h2>
              <div className="prose prose-invert max-w-none text-kurima-muted">
                <p className="mb-4 text-lg leading-relaxed">
                  Quality matters. That's why we've engineered the {product.name} to withstand the complexities of modern living. From the reinforced stitching to the intentional pocket placement, this piece is designed for your daily movement.
                </p>
                <p className="text-lg leading-relaxed">
                  The material is curated specifically for breathability without compromising protection, ensuring you stay comfortable, no matter the environment.
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Related Products */}
        <div className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-foreground">{t('product.related')}</h2>
            <Link to="/" className="text-kurima-orange font-bold hover:underline flex items-center gap-2">
              {t('product.viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
      {/* Success Dialog Modal */}
      <AnimatePresence>
        {isOrderSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderSuccess(false)}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed top-1/2 left-1/2 z-[110] w-[92%] max-w-md bg-background p-8 rounded-3xl border border-kurima-orange/20 shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-kurima-orange/10 flex items-center justify-center mb-6 text-kurima-orange">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-wide">{t('productPage.successTitle', 'Order Placed!')}</h3>
              <p className="text-kurima-muted text-sm leading-relaxed mb-6">
                {t('productPage.successText', 'We will contact you shortly to confirm your direct shipment.')}
              </p>
              <Button
                onClick={() => {
                  setIsOrderSuccess(false)
                  setOrderForm({ name: '', phone: '', wilaya: '', commune: '' })
                }}
                className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold py-3.5 rounded-xl cursor-pointer"
              >
                {t('productPage.continueShopping', 'Continue Shopping')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
