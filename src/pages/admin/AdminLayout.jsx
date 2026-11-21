import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Boxes, Truck, Users, Settings, MapPin, LogOut, Store, Plus, Menu, X } from 'lucide-react'
import api from '@/lib/api'
import { setSeo } from '@/lib/seo'
import { formatDA } from '@/lib/format'
import { Logo, cn } from '@/components/ui/Btn'

const MENU = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Catalogue', icon: Boxes },
  { path: '/admin/orders', label: 'Orders', icon: Truck },
  { path: '/admin/shipping', label: 'Shipping rates', icon: MapPin },
  { path: '/admin/clients', label: 'Clients', icon: Users },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState(null)
  const [stock, setStock] = useState(null)

  useEffect(() => {
    setSeo({ title: 'Administration', noindex: true })
    api.getMe().then(setMe).catch(() => {})
    api
      .adminGetProducts()
      .then((list) => setStock(list.reduce((sum, p) => sum + Number(p.priceSold) * Number(p.quantity || 0), 0)))
      .catch(() => {})
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  const active = MENU.find((m) => location.pathname.startsWith(m.path)) || MENU[0]

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-ink-900">
      {/* Mobile overlay */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={cn('fixed inset-0 z-[90] bg-ink-900/40 backdrop-blur-sm transition-opacity lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-[95] flex w-[17rem] flex-col bg-white p-4 shadow-[inset_-1px_0_0_rgba(10,12,11,0.06)] transition-transform duration-500 ease-[var(--ease-osmo)] ltr:left-0 rtl:right-0',
          open ? 'translate-x-0' : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2 pt-2 pb-6">
          <Link to="/admin/dashboard" className="group">
            <Logo />
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full bg-ink-900/[0.06] lg:hidden" aria-label="Close menu">
            <X className="size-4" />
          </button>
        </div>

        <Link
          to="/admin/products?new=product"
          className="group/btn mb-6 flex h-12 items-center justify-between rounded-full bg-volt ps-5 pe-1.5 font-medium text-ink-900 transition-colors hover:bg-volt-300"
        >
          New product
          <span className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-volt transition-transform duration-500 group-hover/btn:rotate-90">
            <Plus className="size-4" />
          </span>
        </Link>

        <p className="eyebrow mb-2 px-3 text-ink-900/62">Manage</p>
        <nav className="space-y-1">
          {MENU.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-2xl px-3 text-[0.93rem] transition-colors duration-300',
                  isActive ? 'bg-ink-900/[0.08] text-ink-900 shadow-[inset_0_0_0_1px_rgba(10,12,11,0.08)]' : 'text-ink-900/65 hover:bg-ink-900/[0.04] hover:text-ink-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('flex size-8 items-center justify-center rounded-xl', isActive ? 'bg-volt text-ink-900' : 'bg-ink-900/[0.04]')}>
                    <item.icon className="size-4" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="rounded-2xl bg-ink-900/[0.03] p-4 ring-hair">
            <p className="eyebrow text-ink-900/65">Stock value (retail)</p>
            <p className="display tabular mt-2 text-[1.4rem] tracking-[-0.03em] text-forest">{stock == null ? '—' : formatDA(stock)}</p>
          </div>
          <Link to="/" className="flex h-11 items-center gap-3 rounded-2xl px-3 text-[0.9rem] text-ink-900/65 hover:bg-ink-900/[0.04] hover:text-ink-900">
            <Store className="size-4" /> View store
          </Link>
          <button type="button" onClick={logout} className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-[0.9rem] text-ink-900/65 hover:bg-[#ff6b5e]/10 hover:text-[#d93025]">
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 lg:ps-[17rem]">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 bg-white/85 px-4 backdrop-blur-xl sm:px-8 [box-shadow:inset_0_-1px_0_rgba(10,12,11,0.08)]">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="flex size-10 items-center justify-center rounded-full bg-ink-900/[0.06] lg:hidden" aria-label="Open menu">
              <Menu className="size-4" />
            </button>
            <p className="eyebrow flex items-center gap-2 text-ink-900/65">
              <span className="live-dot" /> Admin <span>/</span> <span className="text-ink-900">{active.label}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-ink-900/[0.04] px-3 py-1.5 text-[0.82rem] text-ink-900/65 ring-hair sm:block">{me?.fullName || 'Admin'}</span>
          </div>
        </header>

        <main className="p-4 sm:p-8">
          <Suspense fallback={<div className="skeleton h-64 rounded-[1.5rem]" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
