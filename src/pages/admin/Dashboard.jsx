import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Coins,
  Activity,
  Users,
  Layers,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    profitMade: 0,
    averageOrderValue: 0,
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
  })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsData, clientsData, ordersData, statsData] = await Promise.all([
          api.adminGetProducts(),
          api.adminGetClients(),
          api.adminGetOrders(),
          api.getDashboardStats(),
        ])

        setProducts(productsData)
        setClients(clientsData)
        setOrders(
          ordersData.map((order) => ({
            ...order,
            total: Number(order.total),
            shippingFee: Number(order.shippingFee),
            date: new Date(order.date).toISOString().split('T')[0],
            status: order.status.toLowerCase(),
          }))
        )
        setStats({
          totalRevenue: Number(statsData.totalRevenue || 0),
          profitMade: Number(statsData.profitMade || 0),
          averageOrderValue: Number(statsData.averageOrderValue || 0),
          pendingOrdersCount: Number(statsData.pendingOrdersCount || 0),
          totalOrdersCount: Number(statsData.totalOrdersCount || 0),
        })
      } catch (e) {
        console.error('Failed to load admin dashboard from backend:', e)
      }
    }

    loadDashboard()
  }, [])

  // Calculations
  const activeClientsCount = clients.filter(c => c.approved).length
  const lowStockProducts = products.filter(p => p.quantity <= 10)

  // Recent order list limits
  const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4)

  const getStatusColor = (status) => {
    const maps = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
    return maps[status] || maps.pending
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 animate-fade-in-up"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales */}
        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden group hover:border-kurima-orange/20 transition-all duration-300 shadow-xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(151,255,0,0.015),transparent_50%)] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">Total Sales Revenue</span>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-2">{stats.totalRevenue.toLocaleString()} DA</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-kurima-orange/10 flex items-center justify-center text-kurima-orange">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-green-500 font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this month</span>
          </div>
        </div>

        {/* Average order */}
        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden group hover:border-kurima-orange/20 transition-all duration-300 shadow-xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(151,255,0,0.015),transparent_50%)] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">Profit made</span>
              <h3 className="text-2xl sm:text-3xl font-black text-kurima-orange mt-2">{stats.profitMade.toLocaleString()} DA</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-kurima-orange/10 flex items-center justify-center text-kurima-orange">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-kurima-muted font-bold uppercase tracking-wider">
            <span>Active client carts</span>
          </div>
        </div>

        {/* Active clients */}
        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden group hover:border-kurima-orange/20 transition-all duration-300 shadow-xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(151,255,0,0.015),transparent_50%)] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">Approved Partners</span>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-2">{activeClientsCount} Clients</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-kurima-orange/10 flex items-center justify-center text-kurima-orange">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-green-500 font-bold uppercase tracking-wider">
            <span>100% verification rate</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card border border-border p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/20 transition-all duration-300 shadow-xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(239,68,68,0.015),transparent_50%)] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-kurima-muted">Low Stock Warnings</span>
              <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-foreground'}`}>
                {lowStockProducts.length} Items
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-red-500/10 text-red-500' : 'bg-foreground/5 text-foreground/40'}`}>
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-wider text-kurima-muted">
            <span>Reorder threshold &lt; 10 units</span>
          </div>
        </div>
      </div>

      {/* Grid 2 Column for Analytics SVG and recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Premium Analytics SVG Diagram */}
        <div className="lg:col-span-7 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-left">
            <h4 className="text-sm font-black uppercase tracking-wider text-foreground">Revenue Analytics & Trend</h4>
            <p className="text-[11px] text-kurima-muted mt-1">Real-time COD & Corporate procurement sales cycles (SS26)</p>
          </div>
          
          {/* Decorative interactive graphic */}
          <div className="h-64 bg-foreground/[0.01] border border-foreground/5 rounded-2xl flex flex-col justify-between p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(151,255,0,0.03),transparent_60%)] pointer-events-none" />
            
            {/* SVG Chart */}
            <div className="w-full h-44 absolute bottom-8 left-0 right-0 px-2">
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#97ff00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#97ff00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                
                {/* Area Fill */}
                <path
                  d="M 0 130 C 50 110, 100 80, 150 90 C 200 100, 250 50, 300 40 C 350 30, 400 110, 450 60 C 475 35, 500 20, 500 20 L 500 150 L 0 150 Z"
                  fill="url(#gradient-chart)"
                />
                
                {/* Line */}
                <path
                  d="M 0 130 C 50 110, 100 80, 150 90 C 200 100, 250 50, 300 40 C 350 30, 400 110, 450 60 C 475 35, 500 20, 500 20"
                  fill="none"
                  stroke="#97ff00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(151,255,0,0.4)]"
                />
                
                {/* Glow Nodes */}
                <circle cx="300" cy="40" r="5" fill="#97ff00" className="animate-pulse" />
                <circle cx="500" cy="20" r="5" fill="#97ff00" />
              </svg>
            </div>

            {/* Chart bottom labels */}
            <div className="flex justify-between text-[8px] font-mono text-kurima-muted mt-auto border-t border-foreground/5 pt-2 uppercase tracking-widest z-10">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (Current)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-foreground/[0.015] border border-border/60 p-3 rounded-xl">
              <span className="text-[8px] font-black uppercase text-kurima-muted">Gross Margin</span>
              <p className="text-sm font-black text-foreground mt-1">42.8%</p>
            </div>
            <div className="bg-foreground/[0.015] border border-border/60 p-3 rounded-xl">
              <span className="text-[8px] font-black uppercase text-kurima-muted">Total Stock Units</span>
              <p className="text-sm font-black text-foreground mt-1">
                {products.reduce((sum, p) => sum + p.quantity, 0)} units
              </p>
            </div>
            <div className="bg-foreground/[0.015] border border-border/60 p-3 rounded-xl">
              <span className="text-[8px] font-black uppercase text-kurima-muted">Total Orders</span>
              <p className="text-sm font-black text-foreground mt-1">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Alert Feed */}
        <div className="lg:col-span-5 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <h4 className="text-sm font-black uppercase tracking-wider text-foreground">Recent Orders</h4>
                <p className="text-[11px] text-kurima-muted mt-1">Ongoing corporate delivery streams</p>
              </div>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-[9px] font-black uppercase tracking-widest text-kurima-orange hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Logistics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-foreground/5">
              {recentOrders.map(order => (
                <div key={order.orderId} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-foreground/[0.03] border border-border/40 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-kurima-orange" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-foreground truncate">{order.clientName}</h5>
                      <p className="text-[9px] text-kurima-muted font-mono uppercase mt-0.5">{order.orderId} • {order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-foreground">{order.total.toLocaleString()} DA</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Level Warning Banner */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mt-4">
              <Layers className="w-4 h-4 animate-bounce shrink-0" />
              <span>Warning: {lowStockProducts.length} items have critically low stock levels!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
