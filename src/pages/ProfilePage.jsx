import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Phone, 
  MapPin, 
  Building, 
  Mail, 
  Zap, 
  ShieldCheck, 
  ShoppingBag, 
  ChevronRight, 
  Edit3, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Package, 
  CheckCircle,
  Truck,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'

// Standard Wilaya list for validation and sync
const WILAYAS = [
  'Algiers (16)', 'Oran (31)', 'Constantine (25)', 'Blida (09)', 'Sétif (19)', 
  'Annaba (23)', 'Tizi Ouzou (15)', 'Bejaia (06)', 'Tlemcen (13)', 'Ghardaia (47)', 'Chlef (02)'
]

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'

  // Profile Active Tab State
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'orders'

  // Personal Info form states
  const [userData, setUserData] = useState({
    name: 'Younes Coder',
    phone: '0550123456',
    email: 'younes.coder@electrohub.dz',
    company: 'ElectroTech Solutions DZ',
    wilaya: 'Algiers (16)',
    commune: 'Hydra'
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Orders state
  const [orders, setOrders] = useState([])
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Helper to translate Wilaya names
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

  // Load user data and order history from localStorage
  useEffect(() => {
    window.scrollTo(0, 0)

    // Load or initialize User Data
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse currentUser from localStorage', e)
      }
    } else {
      // Set initial values
      localStorage.setItem('currentUser', JSON.stringify(userData))
    }

    // Load or initialize Order History
    const storedOrders = localStorage.getItem('orderHistory')
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders))
      } catch (e) {
        console.error('Failed to parse orderHistory', e)
      }
    } else {
      // Mock some realistic ElectroHub orders if none exist
      const mockOrders = [
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
            },
            {
              id: 4,
              name: 'Premium Double Wall Switch',
              price: 9500,
              quantity: 5,
              image: '/p4.jpg',
              size: 'Double Gang',
              color: 'Neon Accent'
            }
          ],
          total: 124500,
          shippingCost: 0,
          status: 'delivered', // pending | confirmed | shipped | delivered
          shippingAddress: '12 Rue Sidi Yahia, Hydra, Algiers (16)'
        },
        {
          orderId: 'EH-2026-7452',
          date: '2026-05-24',
          items: [
            {
              id: 3,
              name: 'Heavy Duty Copper Cable',
              price: 14500,
              quantity: 10,
              image: '/p3.jpg',
              size: '16mm² 50m Roll',
              color: 'Insulated Orange'
            }
          ],
          total: 145000,
          shippingCost: 0,
          status: 'shipped',
          shippingAddress: '12 Rue Sidi Yahia, Hydra, Algiers (16)'
        }
      ]
      setOrders(mockOrders)
      localStorage.setItem('orderHistory', JSON.stringify(mockOrders))
    }
  }, [])

  // Form Validation
  const validateForm = () => {
    const errors = {}
    if (!userData.name.trim()) errors.name = t('auth.required', 'Required')
    if (!userData.phone.trim()) {
      errors.phone = t('auth.required', 'Required')
    } else if (!/^(05|06|07)[0-9]{8}$/.test(userData.phone.trim().replace(/\s+/g, ''))) {
      errors.phone = t('auth.phoneError', 'Use format 05/06/07XXXXXXXX')
    }
    if (!userData.email.trim()) {
      errors.email = t('auth.required', 'Required')
    } else if (!/\S+@\S+\.\S+/.test(userData.email.trim())) {
      errors.email = t('profile.emailError', 'Enter a valid email address')
    }
    if (!userData.wilaya) errors.wilaya = t('auth.required', 'Required')
    if (!userData.commune.trim()) errors.commune = t('auth.required', 'Required')

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Save Profile Changes
  const handleSaveChanges = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      localStorage.setItem('currentUser', JSON.stringify(userData))
      
      // Clear success notification after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }, 1200)
  }

  // Handle Logout Simulation
  const handleLogout = () => {
    // We clear current user and session variables, then redirect to login page
    localStorage.removeItem('currentUser')
    // Reset defaults so they can log back in
    navigate('/login')
  }

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
    }
  }

  // Get order status badge and translations
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        label: t('profile.pending', 'Pending Confirmation'),
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        icon: Clock
      },
      confirmed: {
        label: t('profile.confirmed', 'Confirmed & Processing'),
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        icon: Package
      },
      shipped: {
        label: t('profile.shipped', 'Shipped & In Transit'),
        color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        icon: Truck
      },
      delivered: {
        label: t('profile.delivered', 'Delivered'),
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
        icon: CheckCircle
      }
    }

    const item = statusMap[status] || statusMap.pending
    const Icon = item.icon

    return (
      <Badge className={`px-3 py-1 font-bold border flex items-center gap-1.5 rounded-full ${item.color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
      </Badge>
    )
  }

  // Calculate stats
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length

  return (
    <div className="min-h-screen bg-kurima-black text-foreground pt-24 sm:pt-28 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className={`flex items-center gap-2 text-xs sm:text-sm text-kurima-muted mb-8 uppercase tracking-widest font-semibold ${isRtl ? 'justify-start' : 'justify-start'}`}>
          <Link to="/" className="hover:text-kurima-orange transition-colors">{t('nav.home', 'Home')}</Link>
          <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="text-foreground">{t('profile.title', 'Client Profile')}</span>
        </div>

        {/* Dashboard Profile Card */}
        <div className="relative bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl mb-8">
          {/* Neon Radial Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(151,255,0,0.03),transparent_50%)] pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Premium Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-kurima-orange/15 border border-kurima-orange/30 flex items-center justify-center text-kurima-orange shrink-0 shadow-lg shadow-kurima-orange/5 relative group">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-kurima-orange" />
                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-500 border-2 border-background rounded-full flex items-center justify-center" title="Verified Account">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </span>
              </div>
              
              <div className="text-left rtl:text-right">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-foreground">{userData.name}</h1>
                  <Badge className="bg-kurima-orange text-black font-extrabold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md">
                    {t('profile.corporateClient', 'Corporate Client')}
                  </Badge>
                </div>
                <p className="text-kurima-muted text-xs sm:text-sm mt-1 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-kurima-orange fill-kurima-orange animate-pulse" />
                  {t('profile.accountLevel', 'Account Level')}: <span className="text-kurima-orange font-bold">{t('profile.premiumGrid', 'Premium Grid Manager')}</span>
                </p>
              </div>
            </div>

            {/* Logout button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/10 hover:border-red-500/50 text-white hover:text-red-500 rounded-full px-5 py-2.5 h-auto text-[10px] uppercase font-black tracking-widest self-start lg:self-center transition-all cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('profile.logout', 'Logout')}
            </Button>
          </div>

          <Separator className="bg-foreground/10 my-6 sm:my-8" />

          {/* User Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1 */}
            <div className="bg-background/40 border border-foreground/5 p-5 rounded-2xl text-left rtl:text-right group hover:border-kurima-orange/20 transition-all duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">{t('profile.ordersPlaced', 'Orders Placed')}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-foreground">{totalOrders}</span>
                <span className="text-xs text-kurima-orange font-bold uppercase">{t('profile.items', 'items')}</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-background/40 border border-foreground/5 p-5 rounded-2xl text-left rtl:text-right group hover:border-kurima-orange/20 transition-all duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">{t('profile.totalSpent', 'Total Invested')}</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-kurima-orange">{totalSpent.toLocaleString()}</span>
                <span className="text-xs font-bold text-foreground uppercase">DA</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-background/40 border border-foreground/5 p-5 rounded-2xl text-left rtl:text-right group hover:border-kurima-orange/20 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">{t('product.quality', 'Industry Standard')}</span>
                <p className="text-xs text-foreground/80 mt-2 font-bold uppercase tracking-wider flex items-center gap-1.5 text-green-500">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {t('product.qualityDesc', 'ISO9001 & CE Certified')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-foreground/10 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === 'details' ? 'text-kurima-orange' : 'text-kurima-muted hover:text-foreground'
            }`}
          >
            {t('profile.personalInfo', 'Personal Info')}
            {activeTab === 'details' && (
              <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-kurima-orange" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === 'orders' ? 'text-kurima-orange' : 'text-kurima-muted hover:text-foreground'
            }`}
          >
            {t('profile.orderHistory', 'Orders History')} ({orders.length})
            {activeTab === 'orders' && (
              <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-kurima-orange" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'details' ? (
            /* Tab 1: Personal Details Form */
            <motion.div
              key="details-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Form card */}
              <div className="lg:col-span-8 bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(151,255,0,0.015),transparent_40%)] pointer-events-none" />
                
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground mb-1 text-left rtl:text-right">
                  {t('profile.personalInfo', 'Personal Information')}
                </h3>
                <p className="text-kurima-muted text-xs leading-relaxed mb-6 text-left rtl:text-right">
                  {t('profile.personalInfoSubtitle', 'Update your corporate or residential details for faster checkouts and quote generation.')}
                </p>

                <form onSubmit={handleSaveChanges} className="space-y-4 text-left rtl:text-right">
                  {/* Name field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                      {t('profile.fullName', 'Full Name')} <span className="text-kurima-orange">*</span>
                    </label>
                    <div className="relative">
                      <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none`} />
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => {
                          setUserData({ ...userData, name: e.target.value })
                          if (formErrors.name) setFormErrors({ ...formErrors, name: null })
                        }}
                        className={`w-full ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/20 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                          formErrors.name ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                        }`}
                      />
                    </div>
                    {formErrors.name && (
                      <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">{formErrors.name}</span>
                    )}
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email field */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('profile.email', 'Email Address')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative">
                        <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none`} />
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => {
                            setUserData({ ...userData, email: e.target.value })
                            if (formErrors.email) setFormErrors({ ...formErrors, email: null })
                          }}
                          className={`w-full ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/25 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                            formErrors.email ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">{formErrors.email}</span>
                      )}
                    </div>

                    {/* Phone field */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('profile.phone', 'Phone Number')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative">
                        <Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none`} />
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => {
                            setUserData({ ...userData, phone: e.target.value })
                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: null })
                          }}
                          className={`w-full ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/25 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                            formErrors.phone ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">{formErrors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Company Info field */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                      {t('profile.company', 'Company / Contractor Name')}
                    </label>
                    <div className="relative">
                      <Building className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none`} />
                      <input
                        type="text"
                        value={userData.company}
                        onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                        className={`w-full ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-foreground/[0.02] border border-border/80 rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/20 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 focus:border-kurima-orange transition-all`}
                        placeholder="Company name (optional)"
                      />
                    </div>
                  </div>

                  {/* Region Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Wilaya select */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('profile.wilaya', 'Wilaya')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative w-full">
                        <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none`} />
                        <select
                          value={userData.wilaya}
                          onChange={(e) => {
                            setUserData({ ...userData, wilaya: e.target.value })
                            if (formErrors.wilaya) setFormErrors({ ...formErrors, wilaya: null })
                          }}
                          className={`w-full appearance-none ${isRtl ? 'pr-11 pl-8' : 'pl-11 pr-8'} py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all cursor-pointer ${
                            formErrors.wilaya ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                          }`}
                        >
                          <option value="" className="bg-background text-foreground/30">{t('profile.wilaya', 'Wilaya')}</option>
                          {WILAYAS.map(w => (
                            <option key={w} value={w} className="bg-background text-foreground">
                              {getWilayaName(w)}
                            </option>
                          ))}
                        </select>
                        <div className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none text-foreground/45`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      {formErrors.wilaya && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">{formErrors.wilaya}</span>
                      )}
                    </div>

                    {/* Commune field */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1 text-left rtl:text-right">
                        {t('profile.commune', 'Commune')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative">
                        <Building className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none`} />
                        <input
                          type="text"
                          value={userData.commune}
                          onChange={(e) => {
                            setUserData({ ...userData, commune: e.target.value })
                            if (formErrors.commune) setFormErrors({ ...formErrors, commune: null })
                          }}
                          className={`w-full ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 bg-foreground/[0.02] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/20 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 transition-all ${
                            formErrors.commune ? 'border-kurima-orange ring-1 ring-kurima-orange/20' : 'border-border/80 focus:border-kurima-orange'
                          }`}
                        />
                      </div>
                      {formErrors.commune && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">{formErrors.commune}</span>
                      )}
                    </div>
                  </div>

                  {/* Save Status Notifications */}
                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('profile.saveSuccess', 'Profile updated successfully!')}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action button */}
                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-8 py-4 h-auto rounded-full text-xs uppercase tracking-widest shadow-lg shadow-kurima-orange/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          <span>{t('profile.saveChanges', 'Save Changes')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Side Card: Procurement Guarantee */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-6 shadow-xl text-left rtl:text-right relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(151,255,0,0.01),transparent_50%)] pointer-events-none" />
                  
                  <div className="w-12 h-12 rounded-2xl bg-kurima-orange/10 flex items-center justify-center text-kurima-orange mb-6 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  
                  <h4 className="font-black text-sm uppercase tracking-wider text-foreground mb-2">
                    {t('cart.warranty', 'Secure Corporate Procurement')}
                  </h4>
                  
                  <p className="text-kurima-muted text-xs leading-relaxed mb-4">
                    {t('cart.invoicing', 'Invoicing and customized bulk logistics discounts are applied upon submitting your engineering quote request.')}
                  </p>

                  <Separator className="bg-foreground/10 my-4" />

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Truck className="w-5 h-5 text-kurima-orange shrink-0" />
                      <div>
                        <h5 className="text-xs font-black uppercase text-foreground">{t('product.freeShipping', 'Bulk Shipping')}</h5>
                        <p className="text-[10px] text-kurima-muted mt-0.5">{t('product.freeShippingDesc', 'On orders over 15,000 DA')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Zap className="w-5 h-5 text-kurima-orange shrink-0" />
                      <div>
                        <h5 className="text-xs font-black uppercase text-foreground">{t('product.easyReturns', 'Hassle-Free Warranty')}</h5>
                        <p className="text-[10px] text-kurima-muted mt-0.5">{t('product.easyReturnsDesc', '3-Year replacement warranty')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Tab 2: Order History List */
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-left rtl:text-right">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground mb-1">
                  {t('profile.orderHistory', 'Order History')}
                </h3>
                <p className="text-kurima-muted text-xs leading-relaxed">
                  {t('profile.orderHistorySubtitle', 'Track and monitor your ongoing grid equipment shipments and previous completed invoices.')}
                </p>
              </div>

              {orders.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20 bg-foreground/[0.015] border border-foreground/10 rounded-3xl p-8 max-w-xl mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-foreground/30" />
                  </div>
                  <h4 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">{t('profile.noOrders', 'No orders found')}</h4>
                  <p className="text-xs text-kurima-muted mb-8 leading-relaxed">
                    {t('profile.noOrdersSubtitle', "You haven't requested any energy equipment quotes or made COD orders yet.")}
                  </p>
                  <Link to="/shop">
                    <Button className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-8 py-4 h-auto rounded-full text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-kurima-orange/10">
                      {t('cart.continue', 'Browse Showroom')}
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.orderId
                    const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
                    
                    return (
                      <div 
                        key={order.orderId}
                        className="bg-foreground/[0.015] border border-foreground/10 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:border-foreground/20"
                      >
                        {/* Summary Header */}
                        <div 
                          onClick={() => toggleOrderExpansion(order.orderId)}
                          className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none relative"
                        >
                          {/* Left: Metadata */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-left rtl:text-right">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted">{t('profile.orderId', 'Order ID')}</span>
                              <h4 className="text-sm font-black text-foreground uppercase mt-0.5 flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-kurima-orange shrink-0" />
                                {order.orderId}
                              </h4>
                            </div>
                            
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted">{t('profile.date', 'Date')}</span>
                              <p className="text-xs font-semibold text-foreground/80 mt-0.5">{order.date}</p>
                            </div>

                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted">{t('profile.total', 'Total')}</span>
                              <p className="text-sm font-black text-kurima-orange mt-0.5">{(order.total).toLocaleString()} DA</p>
                            </div>
                          </div>

                          {/* Right: Status and Expand button */}
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            {getStatusBadge(order.status)}
                            
                            <div className="w-8 h-8 rounded-full bg-foreground/[0.03] border border-border/40 flex items-center justify-center text-foreground/60 transition-colors">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-foreground/5 bg-foreground/[0.005]"
                            >
                              <div className="p-5 sm:p-6 space-y-6">
                                {/* Items Subgrid */}
                                <div className="space-y-4">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted block mb-2 text-left rtl:text-right">
                                    {t('checkout.orderSummary', 'Items Summary')} ({totalItemsCount})
                                  </span>

                                  <div className="divide-y divide-foreground/5">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        {/* Product image */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-foreground/5 border border-border/40 shrink-0 flex items-center justify-center">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        {/* Specs */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between text-left rtl:text-right">
                                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                            <h5 className="font-bold text-xs text-foreground truncate max-w-xs">{item.name}</h5>
                                            <span className="font-black text-kurima-orange text-xs">{(item.price * item.quantity).toLocaleString()} DA</span>
                                          </div>
                                          
                                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                                            <div className="flex gap-1.5 flex-wrap">
                                              {item.size && (
                                                <span className="text-[8px] font-black uppercase bg-foreground/5 text-foreground/55 px-1.5 py-0.5 rounded">
                                                  {t('cart.spec', 'Spec')}: {item.size}
                                                </span>
                                              )}
                                              {item.color && (
                                                <span className="text-[8px] font-black uppercase bg-foreground/5 text-foreground/55 px-1.5 py-0.5 rounded">
                                                  {t('cart.enclosure', 'Enclosure')}: {item.color}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10px] font-semibold text-kurima-muted">
                                              {item.quantity} x {item.price.toLocaleString()} DA
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <Separator className="bg-foreground/5" />

                                {/* Shipping and payment details subgrid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left rtl:text-right">
                                  {/* Delivery Details */}
                                  <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted block mb-2">
                                      {t('checkout.shippingDetails', 'Logistics Destination')}
                                    </span>
                                    <div className="bg-background/25 border border-foreground/5 rounded-2xl p-4 space-y-2 text-xs">
                                      <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-kurima-orange shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-bold text-foreground">{t('profile.address', 'Shipping Address')}</p>
                                          <p className="text-kurima-muted mt-1 leading-relaxed">{order.shippingAddress}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Invoice Breakdown */}
                                  <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted block mb-2">
                                      {t('checkout.orderSummary', 'Invoicing Details')}
                                    </span>
                                    <div className="bg-background/25 border border-foreground/5 rounded-2xl p-4 space-y-2 text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="text-kurima-muted">{t('checkout.itemsSubtotal', 'Items Subtotal:')}</span>
                                        <span className="font-semibold text-foreground">
                                          {(order.total - (order.shippingCost || 0)).toLocaleString()} DA
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-kurima-muted">{t('checkout.shippingLogistics', 'Shipping Logistics:')}</span>
                                        {order.shippingCost === 0 ? (
                                          <span className="font-black text-[9px] text-green-500 uppercase tracking-wider">{t('checkout.freeShippingBadge', 'FREE Shipping')}</span>
                                        ) : (
                                          <span className="font-semibold text-foreground">{order.shippingCost.toLocaleString()} DA</span>
                                        )}
                                      </div>
                                      <Separator className="bg-foreground/5 my-1.5" />
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-foreground">{t('profile.total', 'Paid amount (COD):')}</span>
                                        <span className="font-black text-kurima-orange text-sm">{order.total.toLocaleString()} DA</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic Tracking Bar for Orders */}
                                <div className="pt-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted block mb-4 text-left rtl:text-right">
                                    {t('profile.status', 'Fulfillment Milestones')}
                                  </span>
                                  
                                  {/* Step Progress Bar */}
                                  <div className="relative w-full py-4 flex justify-between items-center text-center">
                                    {/* Line in the background */}
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-foreground/10 -translate-y-1/2 pointer-events-none" />
                                    
                                    {/* Filled line based on status */}
                                    <div 
                                      className="absolute top-1/2 left-0 h-0.5 bg-kurima-orange -translate-y-1/2 pointer-events-none transition-all duration-500"
                                      style={{
                                        left: isRtl ? 'auto' : '0',
                                        right: isRtl ? '0' : 'auto',
                                        width: 
                                          order.status === 'pending' ? '15%' :
                                          order.status === 'confirmed' ? '50%' :
                                          order.status === 'shipped' ? '80%' : '100%'
                                      }}
                                    />

                                    {/* Node 1: Pending */}
                                    <div className="relative z-10 flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
                                        order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered'
                                          ? 'bg-kurima-orange border-kurima-orange text-black'
                                          : 'bg-kurima-black border-border text-foreground/40'
                                      }`}>
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <span className="text-[8px] sm:text-[9px] font-bold uppercase text-foreground/80 mt-2 block tracking-wider max-w-[80px]">
                                        {t('profile.pending', 'Pending')}
                                      </span>
                                    </div>

                                    {/* Node 2: Confirmed */}
                                    <div className="relative z-10 flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
                                        order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered'
                                          ? 'bg-kurima-orange border-kurima-orange text-black'
                                          : 'bg-kurima-black border-border text-foreground/40'
                                      }`}>
                                        <Package className="w-4 h-4" />
                                      </div>
                                      <span className="text-[8px] sm:text-[9px] font-bold uppercase text-foreground/80 mt-2 block tracking-wider max-w-[80px]">
                                        {t('profile.confirmed', 'Confirmed')}
                                      </span>
                                    </div>

                                    {/* Node 3: Shipped */}
                                    <div className="relative z-10 flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
                                        order.status === 'shipped' || order.status === 'delivered'
                                          ? 'bg-kurima-orange border-kurima-orange text-black'
                                          : 'bg-kurima-black border-border text-foreground/40'
                                      }`}>
                                        <Truck className="w-4 h-4" />
                                      </div>
                                      <span className="text-[8px] sm:text-[9px] font-bold uppercase text-foreground/80 mt-2 block tracking-wider max-w-[80px]">
                                        {t('profile.shipped', 'Shipped')}
                                      </span>
                                    </div>

                                    {/* Node 4: Delivered */}
                                    <div className="relative z-10 flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
                                        order.status === 'delivered'
                                          ? 'bg-kurima-orange border-kurima-orange text-black'
                                          : 'bg-kurima-black border-border text-foreground/40'
                                      }`}>
                                        <CheckCircle className="w-4 h-4" />
                                      </div>
                                      <span className="text-[8px] sm:text-[9px] font-bold uppercase text-foreground/80 mt-2 block tracking-wider max-w-[80px]">
                                        {t('profile.delivered', 'Delivered')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
