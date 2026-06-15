import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Truck,
  Search,
  Save,
  ToggleLeft,
  ToggleRight,
  Home,
  Store,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCw
} from 'lucide-react'
import api from '@/lib/api'

export default function ShippingRates() {
  const [rates, setRates] = useState([])
  const [localRates, setLocalRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await api.adminGetShippingRates()
      const data = res.data || res
      setRates(data)
      setLocalRates(data.map((r) => ({ ...r })))
      setHasChanges(false)
    } catch (e) {
      setErrorMsg('Failed to load shipping rates: ' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const updateLocal = (id, changes) => {
    setLocalRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg('')
    setSaveSuccess(false)
    try {
      await api.adminBulkUpdateShippingRates(
        localRates.map((r) => ({
          id: r.id,
          home_price: Number(r.home),
          desk_price: Number(r.desk),
          is_active: r.is_active,
          home_active: r.home_active,
          desk_active: r.desk_active,
        }))
      )
      setRates(localRates.map((r) => ({ ...r })))
      setHasChanges(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      setErrorMsg('Failed to save shipping rates: ' + (e.message || ''))
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setLocalRates(rates.map((r) => ({ ...r })))
    setHasChanges(false)
    setErrorMsg('')
  }

  const filtered = localRates.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.wilaya.toLowerCase().includes(q) ||
      r.wilaya_ar.includes(search) ||
      r.wilaya_code.includes(q)
    )
  })

  const activeCount = localRates.filter((r) => r.is_active).length
  const inactiveCount = localRates.length - activeCount

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-fade-in-up text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Algerian Shipping Logistics</h3>
          <p className="text-[11px] text-kurima-muted mt-1">
            Configure delivery prices, pickup desks, and active statuses for all 58 Algerian wilayas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRates}
            disabled={loading}
            className="flex items-center justify-center p-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border rounded-xl transition-colors cursor-pointer disabled:opacity-40"
            title="Refresh list"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {hasChanges && (
            <button
              onClick={handleDiscard}
              className="px-5 py-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-kurima-orange hover:bg-kurima-orange-light disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold px-6 py-2.5 text-[10px] uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-kurima-orange/15"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Shipping rates and active routes updated successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-kurima-orange/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-kurima-orange" />
          </div>
          <div>
            <p className="text-[9px] text-kurima-muted font-bold uppercase tracking-wider">Total Wilayas</p>
            <p className="text-lg font-black text-foreground mt-0.5">{localRates.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-[9px] text-kurima-muted font-bold uppercase tracking-wider">Active</p>
            <p className="text-lg font-black text-foreground mt-0.5">{activeCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[9px] text-kurima-muted font-bold uppercase tracking-wider">Disabled</p>
            <p className="text-lg font-black text-foreground mt-0.5">{inactiveCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-3.5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[9px] text-kurima-muted font-bold uppercase tracking-wider">Unsaved Changes</p>
            <p className="text-lg font-black text-foreground mt-0.5">{hasChanges ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-kurima-muted" />
        <input
          type="text"
          placeholder="Search by wilaya name, Arabic name, or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border border-border/80 rounded-2xl text-xs focus:outline-none focus:border-kurima-orange text-foreground font-semibold placeholder:text-kurima-muted/50 transition-all"
        />
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <RotateCw className="w-8 h-8 text-kurima-orange animate-spin" />
            <span className="text-[10px] font-bold text-kurima-muted uppercase tracking-wider">Fetching database rates...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-foreground/[0.02] text-kurima-muted font-bold uppercase tracking-wider border-b border-border text-[9px]">
                  <th className="p-4 w-20">Code</th>
                  <th className="p-4">Wilaya (French / Arabic)</th>
                  <th className="p-4 text-center w-28">Wilaya Status</th>
                  <th className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-kurima-orange" />
                      Home Delivery (DA)
                    </div>
                  </th>
                  <th className="p-4 text-center w-28">Home Active</th>
                  <th className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-kurima-orange" />
                      Desk/Office (DA)
                    </div>
                  </th>
                  <th className="p-4 text-center w-28">Desk Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-kurima-muted font-bold uppercase tracking-wider text-[10px]">
                      No shipping rates matching "{search}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((rate) => {
                    const isDisabled = !rate.is_active
                    return (
                      <tr
                        key={rate.id}
                        className={`transition-colors duration-150 ${
                          isDisabled
                            ? 'bg-red-500/[0.02] hover:bg-red-500/[0.04]'
                            : 'hover:bg-foreground/[0.01]'
                        }`}
                      >
                        {/* Code */}
                        <td className="p-4">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-kurima-orange/10 text-kurima-orange font-black text-[10px] tracking-wider min-w-[32px]">
                            {rate.wilaya_code}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="p-4">
                          <div>
                            <p className={`font-extrabold text-xs ${isDisabled ? 'text-kurima-muted line-through' : 'text-foreground'}`}>
                              {rate.wilaya}
                            </p>
                            <p className="text-[10px] text-kurima-muted mt-0.5" dir="rtl">
                              {rate.wilaya_ar}
                            </p>
                          </div>
                        </td>

                        {/* Wilaya Toggle */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => updateLocal(rate.id, { is_active: !rate.is_active })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                              rate.is_active
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                            }`}
                          >
                            {rate.is_active ? (
                              <>
                                <ToggleRight className="w-4 h-4 shrink-0" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 shrink-0" />
                                <span>Off</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Home Price */}
                        <td className="p-4">
                          <div className="relative max-w-[120px]">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={rate.home}
                              disabled={isDisabled || !rate.home_active}
                              onChange={(e) =>
                                updateLocal(rate.id, { home: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full pl-3 pr-8 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-kurima-orange disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-kurima-muted text-[9px] font-black uppercase pointer-events-none">DA</span>
                          </div>
                        </td>

                        {/* Home Active Toggle */}
                        <td className="p-4 text-center">
                          <button
                            disabled={isDisabled}
                            onClick={() => updateLocal(rate.id, { home_active: !rate.home_active })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer ${
                              rate.home_active
                                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                : 'bg-foreground/5 text-kurima-muted hover:bg-foreground/10'
                            }`}
                          >
                            {rate.home_active ? (
                              <ToggleRight className="w-4 h-4 shrink-0" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 shrink-0" />
                            )}
                            <span>{rate.home_active ? 'On' : 'Off'}</span>
                          </button>
                        </td>

                        {/* Desk Price */}
                        <td className="p-4">
                          <div className="relative max-w-[120px]">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={rate.desk}
                              disabled={isDisabled || !rate.desk_active}
                              onChange={(e) =>
                                updateLocal(rate.id, { desk: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full pl-3 pr-8 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-kurima-orange disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-kurima-muted text-[9px] font-black uppercase pointer-events-none">DA</span>
                          </div>
                        </td>

                        {/* Desk Active Toggle */}
                        <td className="p-4 text-center">
                          <button
                            disabled={isDisabled}
                            onClick={() => updateLocal(rate.id, { desk_active: !rate.desk_active })}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer ${
                              rate.desk_active
                                ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                                : 'bg-foreground/5 text-kurima-muted hover:bg-foreground/10'
                            }`}
                          >
                            {rate.desk_active ? (
                              <ToggleRight className="w-4 h-4 shrink-0" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 shrink-0" />
                            )}
                            <span>{rate.desk_active ? 'On' : 'Off'}</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-border/60 bg-foreground/[0.01] flex items-center justify-between text-[9px] text-kurima-muted font-bold uppercase tracking-wider">
            <span>Showing {filtered.length} of {localRates.length} wilayas</span>
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Unsaved modifications pending
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
