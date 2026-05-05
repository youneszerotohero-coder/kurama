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
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'

// Mock product data (in a real app, this would come from an API or shared state)
const products = [
  {
    id: 1,
    name: 'Midnight Tech Jacket',
    price: '38,500',
    originalPrice: '45,000',
    images: ['/product-1.png', '/hero-1.png', '/product-2.png'],
    category: 'Outerwear',
    tag: 'Best Seller',
    description: 'A premium layer for the modern urban environment. The Midnight Tech Jacket combines utility with high-fashion aesthetics. Featuring water-resistant fabric and a structured silhouette designed for daily performance.',
    details: [
      'Premium water-resistant nylon blend',
      'Internal utility pockets',
      'Adjustable cuffs and hem',
      'Embroidered logo on chest',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Onyx', hex: '#0A0A0A' },
      { name: 'Slate', hex: '#1A1A1A' },
    ]
  },
  {
    id: 2,
    name: 'Premium Fleece Hoodie',
    price: '18,900',
    images: ['/product-2.png', '/hero-2.png', '/product-3.png'],
    category: 'Hoodies',
    tag: 'New',
    description: 'Elevate your daily comfort with the Premium Fleece Hoodie. Heavyweight cotton fleece meets modern tailoring for ultimate durability and a perfect fit.',
    details: [
      '450GSM heavyweight cotton',
      'Reinforced stitching at stress points',
      'Oversized comfort hood',
      'Hidden kangaroo pocket',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Dark Gray', hex: '#141414' },
      { name: 'Midnight', hex: '#0A0A0A' },
    ]
  },
  // Add more as needed
]

export default function ProductPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find(p => p.id === parseInt(id)) || products[0]
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!product) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Product not found</div>

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
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
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-kurima-dark border border-white/5 relative group"
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

              <Badge className="absolute top-6 left-6 bg-kurima-orange text-white font-bold px-4 py-1.5 rounded-full">
                {product.tag}
              </Badge>
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
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
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-foreground">{product.price} DA</span>
                  {product.originalPrice && (
                    <span className="text-xl text-kurima-muted line-through">{product.originalPrice} DA</span>
                  )}
                </div>
                <Separator orientation="vertical" className="h-8 bg-white/10" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-kurima-orange text-kurima-orange" />
                  ))}
                  <span className="text-sm text-kurima-muted ml-2">(48 Reviews)</span>
                </div>
              </div>

              <p className="text-kurima-muted text-lg leading-relaxed mb-10">
                {product.description}
              </p>

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
                          ? 'bg-kurima-orange border-kurima-orange text-white' 
                          : 'bg-foreground/5 border-border text-foreground/60 hover:border-foreground/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center bg-kurima-dark border border-white/10 rounded-full px-4 h-14">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button className="flex-1 bg-kurima-orange hover:bg-kurima-orange-light text-white font-black text-lg rounded-full h-14 shadow-2xl shadow-kurima-orange/20 transition-all active:scale-95">
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  {t('product.addToCart')}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                {[
                  { icon: Truck, label: t('product.freeShipping') },
                  { icon: Shield, label: t('product.securePayment') },
                  { icon: RotateCcw, label: t('product.easyReturns') },
                  { icon: Share2, label: 'Share' },
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
              <motion.div
                key={p.id}
                whileHover={{ y: -10 }}
                className="group relative cursor-pointer"
                onClick={() => {
                  window.scrollTo(0, 0)
                  navigate(`/product/${p.id}`)
                }}
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-kurima-dark border border-white/5 mb-4">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-foreground group-hover:text-kurima-orange transition-colors">{p.name}</h3>
                <p className="text-kurima-orange font-bold">{p.price} DA</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
