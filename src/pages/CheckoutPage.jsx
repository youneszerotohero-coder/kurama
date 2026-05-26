import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  ChevronDown, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  Zap, 
  ArrowLeft,
  ShieldCheck,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { 
    cartItems, 
    cartTotal, 
    clearCart 
  } = useCart()

  const getWilayaName = (w) => {
    if (!w) return ''
    const raw = w.split(' ')[0]
    const number = w.match(/\(\d+\)/)?.[0] || ''
    
    const wilayaKeys = {
      'Algiers': t('productPage.algiers', 'Algiers'),
      'Oran': t('productPage.oran', 'Oran'),
      'Constantine': t('productPage.constantine', 'Constantine'),
      'Blida': t('productPage.blida', 'Blida'),
      'Setif': t('productPage.setif', 'Sétif'),
      'Sétif': t('productPage.setif', 'Sétif'),
      'Annaba': t('productPage.annaba', 'Annaba'),
      'Tizi': t('productPage.tizi', 'Tizi Ouzou'),
      'Bejaia': t('productPage.bejaia', 'Bejaia'),
      'Tlemcen': t('productPage.tlemcen', 'Tlemcen'),
      'Ghardaia': t('productPage.ghardaia', 'Ghardaia'),
      'Chlef': t('productPage.chlef', 'Chlef')
    }
    
    const translatedName = wilayaKeys[raw] || raw
    return `${translatedName} ${number}`
  }

  // Form states
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const WILAYAS = [
    'Algiers (16)', 'Oran (31)', 'Constantine (25)', 'Blida (09)', 'Sétif (19)', 
    'Annaba (23)', 'Tizi Ouzou (15)', 'Bejaia (06)', 'Tlemcen (13)', 'Ghardaia (47)', 'Chlef (02)'
  ]

  const SHIPPING_THRESHOLD = 15000

  const getShippingFee = (wilayaName) => {
    if (cartTotal >= SHIPPING_THRESHOLD) return 0
    if (!wilayaName) return 600
    if (wilayaName.includes('Algiers')) return 400
    if (wilayaName.includes('Blida')) return 500
    if (wilayaName.includes('Oran') || wilayaName.includes('Constantine')) return 700
    return 900
  }

  const shippingCost = getShippingFee(orderForm.wilaya)
  const totalCost = cartTotal + shippingCost

  const handleConfirmOrder = (e) => {
    e.preventDefault()
    
    const errors = {
      name: !orderForm.name.trim(),
      phone: !orderForm.phone.trim(),
      wilaya: !orderForm.wilaya.trim(),
      commune: !orderForm.commune.trim()
    }

    setFormErrors(errors)

    if (Object.values(errors).some(err => err)) {
      // Find the first error element and scroll to it
      const firstError = Object.keys(errors).find(key => errors[key])
      const el = document.getElementsByName(firstError)[0]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
      return
    }

    // Success flow - save order history and current user
    const newOrderId = `EH-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const currentDate = new Date().toISOString().split('T')[0]
    
    // 1. Construct new order object
    const newOrder = {
      orderId: newOrderId,
      date: currentDate,
      items: cartItems.map(item => ({
        id: item.id || 1,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.size || '',
        color: item.color || ''
      })),
      total: totalCost,
      shippingCost: shippingCost,
      status: 'pending',
      shippingAddress: `${orderForm.commune}, ${getWilayaName(orderForm.wilaya)}`
    }

    // 2. Load existing orders and prepend the new one
    let existingOrders = []
    const storedOrders = localStorage.getItem('orderHistory')
    if (storedOrders) {
      try {
        existingOrders = JSON.parse(storedOrders)
      } catch (e) {
        console.error('Failed to parse existing orders', e)
      }
    } else {
      existingOrders = [
        {
          orderId: 'EH-2026-8941',
          date: '2026-05-18',
          items: [
            {
              id: 1,
              name: 'Smart Circuit Breaker Pro',
              price: 38500,
              quantity: 2,
              image: '/p1.jpg',
              size: '40A Tri-Phase',
              color: 'Industrial Black'
            }
          ],
          total: 77000,
          shippingCost: 0,
          status: 'delivered',
          shippingAddress: 'Hydra, Algiers (16)'
        }
      ]
    }
    
    const updatedOrders = [newOrder, ...existingOrders]
    localStorage.setItem('orderHistory', JSON.stringify(updatedOrders))

    // 3. Save current user to localStorage (sync profile details)
    const storedUser = localStorage.getItem('currentUser')
    let parsedUser = {
      name: orderForm.name,
      phone: orderForm.phone,
      email: `${orderForm.phone.replace(/\s+/g, '')}@electrohub.dz`,
      company: 'ElectroTech Solutions DZ',
      wilaya: orderForm.wilaya,
      commune: orderForm.commune
    }
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        parsedUser = {
          ...u,
          name: orderForm.name,
          phone: orderForm.phone,
          wilaya: orderForm.wilaya,
          commune: orderForm.commune
        }
      } catch (e) {
        console.error('Failed parsing existing user', e)
      }
    }
    localStorage.setItem('currentUser', JSON.stringify(parsedUser))

    setIsOrderSuccess(true)
  }

  return (
    <div className="min-h-screen bg-kurima-black text-foreground pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-kurima-muted mb-8 uppercase tracking-widest font-semibold">
          <Link to="/" className="hover:text-kurima-orange transition-colors">{t('nav.home', 'Home')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-kurima-orange transition-colors">{t('nav.shop', 'Shop')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{t('cart.checkout', 'Checkout')}</span>
        </div>

        {cartItems.length === 0 && !isOrderSuccess ? (
          /* Empty State */
          <div className="text-center py-20 bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-foreground/30" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tight">{t('cart.empty', 'Your Cart is Empty')}</h2>
            <p className="text-sm text-kurima-muted mb-8 leading-relaxed">
              {t('cart.emptySubtitle', 'Add premium electrical solutions or smart switches from our showroom to place your direct COD order.')}
            </p>
            <Link to="/shop">
              <Button className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-8 py-5 h-auto rounded-full text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-kurima-orange/15">
                {t('cart.continue', 'Browse Showroom')}
              </Button>
            </Link>
          </div>
        ) : (
          /* Checkout Grid Layout */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Shipping details COD Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(235,94,40,0.02),transparent_40%)]" />
                
                <div className="relative mb-6">
                  <Badge className="bg-kurima-orange text-black font-extrabold mb-2 uppercase tracking-widest text-[9px]">
                    {t('checkout.codBadge', 'Direct Cash On Delivery')}
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                    {t('checkout.shippingDetails', 'Shipping Details')}
                  </h2>
                  <p className="text-kurima-muted text-xs leading-relaxed mt-1">
                    {t('checkout.shippingSubtitle', 'Fill in your logistics information. You will pay in cash upon receiving your packages.')}
                  </p>
                </div>

                <form onSubmit={handleConfirmOrder} className="relative space-y-4 text-left rtl:text-right">
                  {/* Full Name */}
                  <div className="flex flex-col relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                      {t('productPage.fullName', 'Full Name')} <span className="text-kurima-orange">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
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
                        name="phone"
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

                  <div className="grid grid-cols-2 gap-3">
                    {/* Wilaya Select */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('productPage.wilaya', 'Wilaya')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative w-full">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                        <select
                          name="wilaya"
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
                              {getWilayaName(w)}
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
                          name="commune"
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

                  {/* Summary cost attached inside the form */}
                  <div className="bg-background/40 border border-foreground/10 rounded-2xl p-4 mt-6 space-y-2 text-left rtl:text-right">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-kurima-muted">{t('checkout.itemsSubtotal', 'Items Subtotal:')}</span>
                      <span className="font-semibold text-foreground">{cartTotal.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-kurima-muted">{t('checkout.shippingLogistics', 'Shipping logistics:')}</span>
                      {shippingCost === 0 ? (
                        <span className="font-black text-[10px] text-green-500 uppercase tracking-wider">{t('checkout.freeShippingBadge', 'FREE Shipping')}</span>
                      ) : (
                        <span className="font-semibold text-kurima-orange">{shippingCost.toLocaleString()} DA</span>
                      )}
                    </div>
                    <div className="h-[1px] bg-foreground/10 my-1" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{t('productPage.total', 'Total:')}</span>
                      <span className="font-black text-kurima-orange text-base">{totalCost.toLocaleString()} DA</span>
                    </div>
                  </div>

                  {/* Single checkout action button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold rounded-full py-5 text-sm shadow-lg shadow-kurima-orange/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Zap className="w-4 h-4 fill-black text-black animate-pulse" />
                      {t('checkout.confirmOrder', 'Confirm Order')}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="flex items-center gap-3 justify-center text-xs text-kurima-muted font-bold">
                <ShieldCheck className="w-4 h-4 text-kurima-orange" />
                <span>{t('checkout.fulfillmentGuarantee', '100% Genuine Electrical Parts & Secure Fulfillment')}</span>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-6">
                {t('checkout.orderSummary', 'Order Summary')} ({cartItems.length})
              </h3>
              
              <div className="divide-y divide-foreground/5 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin space-y-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 pt-4 first:pt-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-foreground/5 border border-border/40 shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between text-left rtl:text-right">
                      <div>
                        <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                        <div className="flex gap-1.5 mt-1">
                          {item.size && (
                            <span className="text-[8px] font-black uppercase bg-foreground/5 text-foreground/55 px-1.5 py-0.5 rounded">
                              {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[8px] font-black uppercase bg-foreground/5 text-foreground/55 px-1.5 py-0.5 rounded">
                              {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-kurima-muted">{t('cart.qty', 'Qty:')} {item.quantity}</span>
                        <span className="font-black text-kurima-orange">{(item.price * item.quantity).toLocaleString()} DA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Shipping Alert banner if close to threshold */}
              {cartTotal < SHIPPING_THRESHOLD && (
                <div className="mt-6 p-4 bg-kurima-orange/5 border border-kurima-orange/10 rounded-2xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-kurima-orange shrink-0 animate-bounce" />
                  <span className="text-[10px] sm:text-xs text-foreground/80 font-medium text-left rtl:text-right leading-relaxed">
                    {t('cart.addMorePrefix', 'Add ')}<span className="font-extrabold text-kurima-orange">{(SHIPPING_THRESHOLD - cartTotal).toLocaleString()} DA</span>{t('cart.addMoreSuffix', ' more for free bulk delivery.')}
                  </span>
                </div>
              )}

              <Separator className="bg-foreground/10 my-6" />

              <div className="space-y-3 text-left rtl:text-right">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-kurima-muted">{t('checkout.itemsSubtotal', 'Items Subtotal:')}</span>
                  <span className="font-bold text-foreground">{cartTotal.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-kurima-muted">{t('checkout.algerianShipping', 'Algerian Shipping:')}</span>
                  {shippingCost === 0 ? (
                    <span className="font-black text-[10px] text-green-500 uppercase tracking-wider">{t('checkout.free', 'FREE')}</span>
                  ) : (
                    <span className="font-bold text-foreground">{shippingCost.toLocaleString()} DA</span>
                  )}
                </div>
                <Separator className="bg-foreground/10 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-foreground">{t('checkout.estimatedTotal', 'Estimated Total:')}</span>
                  <span className="text-lg font-black text-kurima-orange">{totalCost.toLocaleString()} DA</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/shop" className="text-xs font-bold text-kurima-orange hover:underline flex items-center gap-1 justify-center">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('checkout.returnShowroom', 'Return to Showroom')}
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Checkout Success Popup Dialog */}
      <AnimatePresence>
        {isOrderSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOrderSuccess(false)
                clearCart()
                navigate('/')
              }}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm cursor-pointer"
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
              <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-wide">{t('checkout.orderConfirmed', 'Order Confirmed!')}</h3>
              <p className="text-kurima-muted text-sm leading-relaxed mb-6">
                {t('productPage.successText', 'We will contact you shortly to confirm your direct shipment.')}
              </p>
              <Button
                onClick={() => {
                  setIsOrderSuccess(false)
                  clearCart()
                  navigate('/')
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
