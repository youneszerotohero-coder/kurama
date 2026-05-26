import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  Eye,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  CreditCard,
  ShoppingBag
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('orderHistory')
    if (stored) {
      try {
        setOrders(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Update order status inline
  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = orders.map(order => {
      if (order.orderId === orderId) {
        return { ...order, status: newStatus }
      }
      return order
    })
    setOrders(updated)
    localStorage.setItem('orderHistory', JSON.stringify(updated))

    // Update selected modal details if open
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const getStatusBadgeStyles = (status) => {
    const maps = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
    return maps[status] || 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-fade-in-up"
    >
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Orders & Logistics</h3>
          <p className="text-[11px] text-kurima-muted mt-1">Manage corporate client orders, shipment status, and print invoices</p>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-foreground/[0.015] border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-kurima-muted">
                <th className="p-5">Order ID</th>
                <th className="p-5">Order Date</th>
                <th className="p-5">Client Name</th>
                <th className="p-5">Contact Phone</th>
                <th className="p-5">Destination (Wilaya)</th>
                <th className="p-5 text-right">Invoice Sum</th>
                <th className="p-5 text-center">Logistics Status</th>
                <th className="p-5 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-semibold text-foreground/80">
              {orders.map(order => (
                <tr key={order.orderId} className="hover:bg-foreground/[0.005] transition-colors">
                  <td className="p-5 font-mono font-bold text-kurima-orange uppercase">{order.orderId}</td>
                  <td className="p-5 text-kurima-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.date}
                    </span>
                  </td>
                  <td className="p-5 text-foreground">{order.clientName}</td>
                  <td className="p-5 font-mono text-foreground/70">{order.clientPhone}</td>
                  <td className="p-5 text-foreground/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-kurima-orange" />
                      {order.wilaya}
                    </span>
                  </td>
                  <td className="p-5 text-right text-foreground font-mono font-bold">{order.total.toLocaleString()} DA</td>
                  <td className="p-5 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                      className={`text-[9px] font-black uppercase border rounded-full px-3 py-1 cursor-pointer focus:outline-none transition-all ${getStatusBadgeStyles(
                        order.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl transition-all cursor-pointer text-foreground/60"
                      title="Inspect Order Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-kurima-muted uppercase tracking-widest text-[10px]">
                    No corporate client orders currently logged in database streams.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          ORDER INVOICE DETAIL VIEW MODAL
          ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh] text-left"
            >
              {/* Dismiss button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute right-6 top-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start flex-wrap gap-4 border-b border-foreground/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-kurima-orange">Corporate Invoice</span>
                    <h3 className="text-lg font-black uppercase text-foreground font-mono">ID: {selectedOrder.orderId}</h3>
                    <p className="text-[10px] text-kurima-muted font-mono">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${getStatusBadgeStyles(
                      selectedOrder.status
                    )}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Grid info client and shipping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-foreground/5 pb-4">
                  {/* Client Info */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-kurima-muted">Customer Details</span>
                    <div className="space-y-1.5 font-semibold text-foreground/80">
                      <p className="flex items-center gap-2 text-foreground font-extrabold">
                        <User className="w-3.5 h-3.5 text-kurima-orange shrink-0" />
                        <span>{selectedOrder.clientName}</span>
                      </p>
                      {selectedOrder.clientEmail && (
                        <p className="pl-5 text-kurima-muted">{selectedOrder.clientEmail}</p>
                      )}
                      <p className="flex items-center gap-2 font-mono">
                        <Phone className="w-3.5 h-3.5 text-kurima-orange shrink-0" />
                        <span>{selectedOrder.clientPhone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-kurima-muted">Logistics Destination</span>
                    <div className="space-y-1.5 font-semibold text-foreground/80">
                      <p className="flex items-center gap-2 font-extrabold text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-kurima-orange shrink-0" />
                        <span>{selectedOrder.wilaya}, {selectedOrder.commune}</span>
                      </p>
                      {selectedOrder.addressDetails && (
                        <p className="pl-5 text-kurima-muted">{selectedOrder.addressDetails}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items stream */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-wider text-kurima-muted block">Purchased Showroom Items</span>
                  <div className="divide-y divide-foreground/5 bg-foreground/[0.015] border border-border/80 rounded-2xl p-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-foreground/5 border border-border/40 shrink-0 flex items-center justify-center text-[10px]">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="w-4 h-4 text-kurima-orange" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-foreground">{item.name}</h5>
                            <p className="text-[10px] text-kurima-muted mt-0.5">
                              {item.size ? `Spec: ${item.size}` : ''} {item.color ? `• Enclosure: ${item.color}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-foreground font-extrabold">
                            {item.quantity} x {item.price.toLocaleString()} DA
                          </p>
                          <p className="text-[10px] text-kurima-orange font-mono mt-0.5 font-bold">
                            {(item.quantity * item.price).toLocaleString()} DA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary Invoicing Panel */}
                <div className="bg-foreground/[0.02] border border-border rounded-2xl p-5 text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-foreground/80">
                    <span className="text-kurima-muted">Showroom Subtotal</span>
                    <span className="font-mono">
                      {(selectedOrder.total - (selectedOrder.shippingFee || 0)).toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground/80">
                    <span className="text-kurima-muted">Logistics Shipping Fee</span>
                    <span className="font-mono">
                      {selectedOrder.shippingFee > 0 ? `${selectedOrder.shippingFee.toLocaleString()} DA` : 'FREE'}
                    </span>
                  </div>
                  <Separator className="bg-foreground/5 my-2" />
                  <div className="flex justify-between font-black text-sm text-foreground">
                    <span className="uppercase tracking-widest text-xs">Total Invoiced Amount</span>
                    <span className="text-kurima-orange font-mono font-black">{selectedOrder.total.toLocaleString()} DA</span>
                  </div>
                </div>

                {/* Direct Action buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      window.print()
                    }}
                    className="bg-foreground/5 hover:bg-foreground/10 text-white font-extrabold px-6 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer transition-all border border-white/5"
                  >
                    Print Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-6 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/5"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
