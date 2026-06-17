import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Download, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'

export default function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    updateCartItemSpecs,
    cartCount,
    cartTotal,
  } = useCart()

  const SHIPPING_THRESHOLD = useMemo(() => {
    const stored = localStorage.getItem('admin_settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.minFreeDelivery !== undefined) {
          return Number(parsed.minFreeDelivery)
        }
      } catch (e) {
        console.error(e)
      }
    }
    return 15000
  }, [])
  const progressPercent = Math.min((cartTotal / SHIPPING_THRESHOLD) * 100, 100)
  const remainingForFreeShipping = SHIPPING_THRESHOLD - cartTotal

  const formatPrice = (val) => {
    return new Intl.NumberFormat().format(val)
  }

  const handleDownloadProforma = () => {
    const doc = new jsPDF()

    // Color Palette
    const primaryColor = [249, 115, 22] // #f97316 (Kurima Orange)
    const textColor = [20, 20, 20]
    const lightGray = [245, 245, 245]

    // Title / Header background banner
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')

    // Title / Header text
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('KURIMA SOLUTIONS', 15, 18)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Premium Smart & Powerful Electrical Solutions', 15, 25)
    doc.text('Contact: contact@kurima.dz | +213 (0) 555 12 34 56', 15, 30)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFORMA INVOICE', 145, 18)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Reference: PRO-${Date.now().toString().slice(-6)}`, 145, 25)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 30)

    // Customer Info Placeholder
    doc.setTextColor(...textColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFORMA TO:', 15, 55)
    doc.setFont('helvetica', 'normal')
    doc.text('Corporate Energy Buyer / Partner', 15, 60)
    doc.text('Request via: Online Showroom platform', 15, 65)

    // Table Header
    doc.setFillColor(...lightGray)
    doc.rect(15, 75, 180, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Product Description', 18, 80)
    doc.text('Reference', 90, 80)
    doc.text('Price (DA)', 130, 80)
    doc.text('Qty', 160, 80)
    doc.text('Total (DA)', 175, 80)

    let yPosition = 90
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)

    cartItems.forEach((item) => {
      // Handle page overflow if we have many items
      if (yPosition > 260) {
        doc.addPage()
        yPosition = 20
      }

      const ref = item.ref || `REF-P${item.id}`
      const nameText = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name
      const specText = (item.size || item.color) ? ` (${item.size || ''}${item.size && item.color ? ' / ' : ''}${item.color || ''})` : ''
      
      doc.text(`${nameText}${specText}`, 18, yPosition)
      doc.text(ref, 90, yPosition)
      doc.text(formatPrice(item.price), 130, yPosition)
      doc.text(item.quantity.toString(), 162, yPosition)
      doc.text(formatPrice(item.price * item.quantity), 175, yPosition)

      doc.setDrawColor(230, 230, 230)
      doc.line(15, yPosition + 4, 195, yPosition + 4)
      yPosition += 10
    })

    // Totals Block
    if (yPosition > 240) {
      doc.addPage()
      yPosition = 20
    }

    yPosition += 5
    doc.setFont('helvetica', 'bold')
    doc.text('Estimated Subtotal:', 130, yPosition)
    doc.text(`${formatPrice(cartTotal)} DA`, 175, yPosition)

    const shippingCost = cartTotal >= SHIPPING_THRESHOLD ? 0 : 1200
    yPosition += 6
    doc.text('Bulk Logistics / Shipping:', 130, yPosition)
    doc.text(shippingCost === 0 ? 'FREE' : `${formatPrice(shippingCost)} DA`, 175, yPosition)

    yPosition += 8
    doc.setFillColor(...primaryColor)
    doc.rect(125, yPosition - 4, 70, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('GRAND TOTAL:', 130, yPosition + 1)
    doc.text(`${formatPrice(cartTotal + shippingCost)} DA`, 175, yPosition + 1)

    // Footer Terms
    yPosition += 25
    doc.setTextColor(120, 120, 120)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Terms & Conditions:', 15, yPosition)
    doc.text('1. This proforma invoice serves as a commercial estimate and does not constitute a final binding contract.', 15, yPosition + 5)
    doc.text('2. All prices are denominated in Algerian Dinars (DA) and are valid for a period of 15 days from the date of issuance.', 15, yPosition + 10)
    doc.text('3. Corporate discounts and customized tax exemptions (if applicable) will be evaluated upon final submission of the quote.', 15, yPosition + 15)

    doc.save(`proforma_invoice_${Date.now().toString().slice(-6)}.pdf`)
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
                    <span className="flex items-center gap-1.5 text-black dark:text-kurima-orange">
                      <Truck className="w-4 h-4 animate-bounce" />
                      {t('cart.freeShipping', 'Your order qualifies for Free Bulk Shipping!')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-foreground/50" />
                      {t('cart.addMorePrefix', 'Add ')}<span className="text-black dark:text-kurima-orange font-black">{formatPrice(remainingForFreeShipping)} DA</span>{t('cart.addMoreSuffix', ' more for free bulk delivery.')}
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
                                {item.size && item.sizes && item.sizes.length > 0 ? (
                                  <div className="relative">
                                    <select
                                      value={item.size}
                                      onChange={(e) => updateCartItemSpecs(item.cartItemId, e.target.value, undefined)}
                                      className="text-[9px] font-black uppercase bg-foreground/5 hover:bg-foreground/10 text-foreground/75 px-2 py-1 pr-6 rounded border border-border/40 focus:outline-none focus:border-kurima-orange appearance-none cursor-pointer"
                                    >
                                      {item.sizes.map((s, idx) => {
                                        const szName = typeof s === 'object' ? s.name : s
                                        return (
                                          <option key={idx} value={szName} className="bg-background text-foreground text-xs">
                                            {t('cart.spec', 'Spec: ')}{szName}
                                          </option>
                                        )
                                      })}
                                    </select>
                                    <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50" />
                                  </div>
                                ) : item.size ? (
                                  <span className="text-[9px] font-black uppercase bg-foreground/5 text-foreground/60 px-2 py-1 rounded border border-border/40">
                                    {t('cart.spec', 'Spec: ')}{item.size}
                                  </span>
                                ) : null}

                                {item.color && item.colors && item.colors.length > 0 ? (
                                  <div className="relative">
                                    <select
                                      value={item.color}
                                      onChange={(e) => updateCartItemSpecs(item.cartItemId, undefined, e.target.value)}
                                      className="text-[9px] font-black uppercase bg-foreground/5 hover:bg-foreground/10 text-foreground/75 px-2 py-1 pr-6 rounded border border-border/40 focus:outline-none focus:border-kurima-orange appearance-none cursor-pointer"
                                    >
                                      {item.colors.map((c, idx) => {
                                        const colName = typeof c === 'object' ? c.name : c
                                        return (
                                          <option key={idx} value={colName} className="bg-background text-foreground text-xs">
                                            {t('cart.enclosure', 'Enclosure: ')}{colName}
                                          </option>
                                        )
                                      })}
                                    </select>
                                    <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50" />
                                  </div>
                                ) : item.color ? (
                                  <span className="text-[9px] font-black uppercase bg-foreground/5 text-foreground/60 px-2 py-1 rounded border border-border/40">
                                    {t('cart.enclosure', 'Enclosure: ')}{item.color}
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Price & Quantity Control */}
                          <div className="flex items-center justify-between gap-4 mt-3">
                            <div className="flex flex-col text-left rtl:text-right">
                              <span className="font-black text-sm text-black dark:text-kurima-orange">
                                {formatPrice(item.price * item.quantity)} DA
                              </span>
                              {item.promotionPercentage > 0 && (
                                <span className="text-[10px] text-kurima-muted line-through font-mono mt-0.5">
                                  {formatPrice((item.priceOriginal || item.price) * item.quantity)} DA
                                </span>
                              )}
                            </div>

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

                  <Button
                    onClick={handleDownloadProforma}
                    className="w-full bg-transparent border border-white/10 hover:border-kurima-orange hover:bg-kurima-orange/5 text-foreground hover:text-kurima-orange font-bold py-5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    {t('cart.downloadProforma', 'Download Proforma (PDF)')}
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
