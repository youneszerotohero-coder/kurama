import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  Settings,
  Activity,
  ChevronRight,
  LogOut,
  User,
  MapPin
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stockValuation, setStockValuation] = useState(0)
  const [adminUsername, setAdminUsername] = useState('admin')

  // Calculate quick stock valuation on load/route change
  useEffect(() => {
    const loadAdminSnapshot = async () => {
      try {
        const [products, me] = await Promise.all([
          api.adminGetProducts(),
          api.getMe(),
        ])

        setStockValuation(
          products.reduce((sum, product) => sum + (Number(product.priceSold) * Number(product.quantity)), 0)
        )
        setAdminUsername(me.fullName || adminUsername)
      } catch (e) {
        console.error('Failed to load admin layout snapshot:', e)
      }
    }

    loadAdminSnapshot()
  }, [location.pathname])

  const menuItems = [
    { id: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', path: '/admin/products', label: 'Showroom Catalog', icon: ShoppingBag },
    { id: 'orders', path: '/admin/orders', label: 'Orders Logistics', icon: Truck },
    { id: 'shipping', path: '/admin/shipping', label: 'Shipping Rates', icon: MapPin },
    { id: 'clients', path: '/admin/clients', label: 'Client Accounts', icon: Users },
    { id: 'settings', path: '/admin/settings', label: 'Global Settings', icon: Settings }
  ]

  // Detect which section is active
  const activeItem = menuItems.find(item => location.pathname === item.path) || menuItems[0]

  return (
    <div className="min-h-screen bg-kurima-black text-foreground flex">
      {/* ─────────────────────────────────────────────
          SIDEBAR DRAW PANEL (DESKTOP & MOBILE TRANSITION)
          ───────────────────────────────────────────── */}
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[98] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-card border-r border-border z-[99] lg:z-40 transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:block'
        }`}
      >
        <div className="h-full flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            <div className="px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-kurima-muted">Admin System</span>
              <h2 className="text-sm font-black uppercase text-foreground mt-0.5 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-kurima-orange rounded-full animate-pulse shadow-md shadow-kurima-orange/50" />
                Control Center
              </h2>
            </div>

            <Separator className="bg-foreground/5" />

            <nav className="space-y-1.5">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path)
                      setSidebarOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-2xl font-bold text-xs uppercase tracking-wider relative transition-all ${
                      isActive
                        ? 'text-black bg-kurima-orange shadow-lg shadow-kurima-orange/20'
                        : 'text-foreground/70 hover:text-foreground hover:bg-foreground/[0.03]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeAdminPanelBar"
                        className="absolute right-2 w-1.5 h-1.5 bg-black rounded-full"
                      />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="space-y-4">
            {/* Quick Stats Footer inside Sidebar */}
            <div className="bg-foreground/[0.02] border border-border/60 p-4 rounded-2xl">
              <span className="text-[9px] font-black uppercase tracking-widest text-kurima-muted block mb-1">Stock Valuation</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-kurima-orange">{stockValuation.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-foreground">DA</span>
              </div>
              <p className="text-[9px] text-kurima-muted mt-1 leading-tight">Asset value in warehouse catalog</p>
            </div>

            {/* Exit/Profile links */}
            <Link
              to="/profile"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.05] border border-border text-xs font-bold text-foreground/80 hover:text-foreground transition-all"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-kurima-orange" />
                <span>Client Profile View</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT PANEL
          ───────────────────────────────────────────── */}
      <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
        {/* Sub Header for breadcrumbs and mobile hamburger */}
        <div className="bg-card/40 backdrop-blur-md border-b border-border py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 bg-foreground/5 rounded-full hover:bg-foreground/10 text-foreground transition-colors"
            >
              <Activity className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 text-xs text-kurima-muted font-bold uppercase tracking-wider">
              <span>Admin</span>
              <span>/</span>
              <span className="text-foreground">{activeItem.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] font-mono text-kurima-muted uppercase tracking-wider bg-foreground/[0.03] border border-border/40 px-3 py-1.5 rounded-full">
              Operator: <span className="text-foreground font-extrabold">{adminUsername}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Nested Routes Content Panel */}
        <div className="p-6 sm:p-8 flex-1 space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
