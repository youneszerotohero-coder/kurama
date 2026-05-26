import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartCount,
    cartTotal,
  } = useCart()

  const SHIPPING_THRESHOLD = 15000
  const progressPercent = Math.min((cartTotal / SHIPPING_THRESHOLD) * 100, 100)
  const remainingForFreeShipping = SHIPPING_THRESHOLD - cartTotal

  const formatPrice = (val) => {
    return new Intl.NumberFormat().format(val)
  }

  // Sidebar container animation variants
  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { 
      x: '100%',
      transition: { 
        type: 'spring', 
        stiffness: 350, 
        damping: 35 
      }
    }
  }

  // Individual item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Cart Sidebar Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md md:max-w-lg h-full bg-background/95 dark:bg-[#080d1a]/98 backdrop-blur-2xl border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-kurima-orange" />
                <h2 className="text-lg font-black uppercase tracking-wider text-foreground">
                  {t('cart.title', 'Your Quote Request')}
                </h2>
                {cartCount > 0 && (
                  <span className="bg-kurima-orange text-black font-extrabold text-xs px-2.5 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-foreground/60 hover:text-kurima-orange transition-colors cursor-pointer rounded-full hover:bg-foreground/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            {cartItems.length > 0 && (
              <div className="px-6 py-4 bg-kurima-orange/5 border-b border-kurima-orange/10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
                  {progressPercent >= 100 ? (
                    <span className="flex items-center gap-1.5 text-kurima-orange">
                      <Truck className="w-4 h-4 animate-bounce" />
                      {t('cart.freeShipping', 'Your order qualifies for Free Bulk Shipping!')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-foreground/50" />
                      {t('cart.addMorePrefix', 'Add ')}<span className="text-kurima-orange font-black">{formatPrice(remainingForFreeShipping)} DA</span>{t('cart.addMoreSuffix', ' more for free bulk delivery.')}
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-kurima-orange rounded-full shadow-glow shadow-kurima-orange/20"
                  />
                </div>
              </div>
            )}

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin flex flex-col">
              <AnimatePresence initial={false}>
                {cartItems.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-foreground/[0.03] border border-border flex items-center justify-center mb-6">
                      <ShoppingBag className="w-8 h-8 text-foreground/30" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-foreground mb-2">
                      {t('cart.empty', 'Your Cart is Empty')}
                    </h3>
                    <p className="text-sm text-kurima-muted max-w-xs mb-8">
                      {t('cart.emptySubtitle', 'Add premium electrical equipment, smart switches or cables from our showroom to start building your quote.')}
                    </p>
                    <Button
                      onClick={() => {
                        setIsCartOpen(false)
                        navigate('/')
                      }}
                      className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-bold px-6 py-5 rounded-full text-sm uppercase tracking-wider"
                    >
                      {t('cart.continue', 'Browse Showroom')}
                    </Button>
                  </motion.div>
                ) : (
                  /* Cart Items List */
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.cartItemId}
                        variants={itemVariants}
                        layout
                        className="flex gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-border/80 hover:border-kurima-orange/30 hover:bg-foreground/[0.04] transition-all duration-300 relative group"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-foreground/5 border border-border/40 shrink-0 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-foreground truncate group-hover:text-kurima-orange transition-colors">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="p-1 text-foreground/40 hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-foreground/5 shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-kurima-orange font-bold uppercase tracking-wider mt-0.5">
                              {item.category || 'Electrical Equipment'}
                            </p>
                            
                            {/* Variant tags */}
                            {(item.size || item.color) && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.size && (
                                  <span className="text-[9px] font-black uppercase bg-foreground/5 text-foreground/60 px-2 py-0.5 rounded border border-border/40">
                                    {t('cart.spec', 'Spec: ')}{item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[9px] font-black uppercase bg-foreground/5 text-foreground/60 px-2 py-0.5 rounded border border-border/40">
                                    {t('cart.enclosure', 'Enclosure: ')}{item.color}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Price & Quantity Control */}
                          <div className="flex items-center justify-between gap-4 mt-3">
                            <span className="font-black text-sm text-kurima-orange">
                              {formatPrice(item.price * item.quantity)} DA
                            </span>

                            <div className="flex items-center bg-foreground/[0.04] border border-border/60 rounded-lg px-2 py-1 shrink-0">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="p-1 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-bold text-xs text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-1 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="px-6 py-6 bg-foreground/[0.01] border-t border-border flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
                    {t('cart.subtotal', 'Estimated Subtotal')}
                  </span>
                  <span className="text-xl font-black text-foreground">
                    {formatPrice(cartTotal)} DA
                  </span>
                </div>

                <p className="text-[11px] text-kurima-muted leading-normal">
                  {t('cart.invoicing', 'Invoicing and customized bulk logistics discounts are applied upon submitting your engineering quote request.')}
                </p>

                <div className="grid gap-3 mt-2">
                  <Button
                    onClick={() => {
                      setIsCartOpen(false)
                      navigate('/checkout')
                    }}
                    className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-black py-6 rounded-full text-base uppercase tracking-wider shadow-lg shadow-kurima-orange/10 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    {t('cart.checkout', 'Proceed to Checkout')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] text-kurima-muted font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-kurima-orange" />
                    {t('cart.warranty', 'Secure Corporate Energy Procurement Warranty')}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
