import { useState, useEffect } from 'react'
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
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/ProductCard'

// Mock product data (in a real app, this would come from an API or shared state)
const products = [
  {
    id: 1,
    name: 'Smart Circuit Breaker Pro',
    price: '38,500',
    originalPrice: '45,000',
    images: ['/product-1.png', '/bg1.jpg', '/product-2.png'],
    category: 'Smart Power Grid',
    tag: 'Top Rated',
    description: 'A state-of-the-art smart circuit breaker designed for comprehensive residential and commercial grid management. Featuring remote power tracking, sub-millisecond fault detection, and seamless cloud integration for optimal energy efficiency and absolute safety.',
    details: [
      'Advanced water & dust resistant housing',
      'IoT-enabled remote control & scheduling',
      'Real-time voltage, current & leakage diagnostics',
      'ISO9001 and CE certified components',
    ],
    sizes: ['16A', '32A', '63A', '100A'],
    colors: [
      { name: 'Tech Matte White', hex: '#F3F4F6' },
      { name: 'Industrial Gray', hex: '#4B5563' },
    ]
  },
  {
    id: 2,
    name: 'Intelligent Energy Monitor',
    price: '18,900',
    images: ['/product-2.png', '/bg2.jpg', '/product-3.png'],
    category: 'Energy Monitors',
    tag: 'New Tech',
    description: "Get absolute transparency over your building's electricity usage. The Intelligent Energy Monitor hooks directly into your distribution board to track real-time consumption trends, identify high-load devices, and deliver AI-powered energy-saving recommendations straight to your smartphone.",
    details: [
      'Precision micro-sensors for non-invasive clamping',
      'Sub-second consumption refresh rate',
      'Supports single-phase and three-phase grids',
      'Secure 256-bit SSL cloud storage connection',
    ],
    sizes: ['Single-Phase', 'Three-Phase'],
    colors: [
      { name: 'Midnight Onyx', hex: '#111827' },
      { name: 'Polar Ice Blue', hex: '#E0F2FE' },
    ]
  },
  {
    id: 3,
    name: 'Heavy Duty Copper Cable',
    price: '14,500',
    images: ['/product-3.png', '/bg1.jpg', '/product-4.png'],
    category: 'Industrial Cables',
    tag: 'High Demand',
    description: 'High-conductivity flame-retardant multi-core copper wiring designed for high-stress industrial machinery, main supply lines, and solar grid hookups. Built to handle extreme temperatures without performance degradation.',
    details: [
      '99.9% pure electrolyte-grade copper cores',
      'Double PVC protective outer sheath',
      'Flame retardant & zero halogen emissions',
      'Highly flexible and easy to pull through conduits',
    ],
    sizes: ['4mm²', '6mm²', '10mm²', '16mm²'],
    colors: [
      { name: 'Standard Black', hex: '#000000' },
      { name: 'Safety Red', hex: '#EF4444' },
    ]
  },
  {
    id: 4,
    name: 'Premium Double Wall Switch',
    price: '9,500',
    originalPrice: '12,000',
    images: ['/product-4.png', '/bg2.jpg', '/product-1.png'],
    category: 'Switches & Sockets',
    tag: 'Bulk Deal',
    description: 'Architectural dual wall switches crafted from anodized brushed aluminum. Combines tactile spring-back switches with built-in surge protection and subtle LED indicator halos that look stunning in luxury offices and smart homes.',
    details: [
      'Premium brushed aluminum faceplate',
      'Tactile mechanical feedback with premium click',
      'Subtle cyan halo backlight indicating active state',
      'Scratch-resistant & anti-fingerprint coating',
    ],
    sizes: ['Standard 86mm', 'Double 146mm'],
    colors: [
      { name: 'Anodized Silver', hex: '#D1D5DB' },
      { name: 'Midnight Charcoal', hex: '#1F2937' },
    ]
  }
]

export default function ProductPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find(p => p.id === parseInt(id)) || products[0]
  const { addToCart } = useCart()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

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
    commune: false
  })
  const [isOrderSuccess, setIsOrderSuccess] = useState(false)

  const WILAYAS = [
    'Algiers (16)', 'Oran (31)', 'Constantine (25)', 'Blida (09)', 'Sétif (19)', 
    'Annaba (23)', 'Tizi Ouzou (15)', 'Bejaia (06)', 'Tlemcen (13)', 'Ghardaia (47)', 'Chlef (02)'
  ]

  const basePrice = typeof product.price === 'number' 
    ? product.price 
    : parseInt(product.price.replace(/,/g, ''))
  const productCost = basePrice * quantity

  const getShippingFee = (wilayaName) => {
    if (!wilayaName) return 600
    if (wilayaName.includes('Algiers')) return 400
    if (wilayaName.includes('Blida')) return 500
    if (wilayaName.includes('Oran') || wilayaName.includes('Constantine')) return 700
    return 900
  }
  const shippingCost = getShippingFee(orderForm.wilaya)
  const totalCost = productCost + shippingCost

  const handleAction = (type) => {
    const errors = {
      name: !orderForm.name.trim(),
      phone: !orderForm.phone.trim(),
      wilaya: !orderForm.wilaya.trim(),
      commune: !orderForm.commune.trim()
    }

    setFormErrors(errors)

    if (errors.name || errors.phone || errors.wilaya || errors.commune) {
      document.getElementById('order-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (type === 'cart') {
      addToCart(product, quantity, selectedSize, selectedColor)
    } else if (type === 'buy') {
      setIsOrderSuccess(true)
    }
  }

  // Scroll to top on mount or product change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!product) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Product not found</div>

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
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">{product.price} DA</span>
                  {product.originalPrice && (
                    <span className="text-lg sm:text-xl text-kurima-muted line-through">{product.originalPrice} DA</span>
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
                  <button className="text-xs text-kurima-orange hover:underline font-bold">{t('product.sizeGuide')}</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[60px] h-12 rounded-xl font-bold transition-all border-2 flex items-center justify-center ${
                        selectedSize === size 
                          ? 'bg-kurima-orange border-kurima-orange text-black' 
                          : 'bg-foreground/5 border-border text-foreground/60 hover:border-foreground/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
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
                            setOrderForm({ ...orderForm, wilaya: e.target.value })
                            setFormErrors({ ...formErrors, wilaya: false })
                          }}
                          className={`w-full appearance-none pl-11 pr-8 py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer ${
                            formErrors.wilaya ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                          }`}
                        >
                          <option value="" className="bg-background text-foreground/30">{t('productPage.wilaya', 'Wilaya')}</option>
                          {WILAYAS.map(w => (
                            <option key={w} value={w} className="bg-background text-foreground">
                                {w.split(' ')[0]}
                            </option>
                          ))}
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
                      </div>
                      {formErrors.commune && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider text-left rtl:text-right">{t('productPage.required', 'Required')}</span>
                      )}
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
                      <span className="font-semibold text-kurima-orange">{shippingCost.toLocaleString()} DA</span>
                    </div>
                    <div className="h-[1px] bg-foreground/10 my-1" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{t('productPage.total', 'Total:')}</span>
                      <span className="font-black text-kurima-orange text-sm">{totalCost.toLocaleString()} DA</span>
                    </div>
                  </div>

                  {/* Action buttons attached to the bottom of the form */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <Button
                      onClick={() => handleAction('cart')}
                      className="w-full sm:flex-1 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground font-bold rounded-full py-4 text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {t('productPage.addToCart', 'Add to Cart')}
                    </Button>
                    <Button
                      onClick={() => handleAction('buy')}
                      className="w-full sm:flex-1 bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold rounded-full py-4 text-xs shadow-lg shadow-kurima-orange/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black text-black animate-pulse" />
                      {t('productPage.buyNow', 'Buy Now')}
                    </Button>
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
            {products.map((p, i) => (
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
