import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

export default function Clients() {
  const [clients, setClients] = useState([])
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editId, setEditId] = useState(null)
  
  // Form fields
  const [clientForm, setClientForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    wilaya: 'Algiers',
    commune: '',
    approved: false
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await api.adminGetClients()
        setClients(data)
      } catch (e) {
        console.error('Failed to load clients from backend:', e)
      }
    }

    loadClients()
  }, [])

  // Deletion logic
  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return

    try {
      await api.adminDeleteClient(id)
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      alert(e.message || 'Failed to delete client.')
    }
  }

  // Toggle approval switch in the row
  const handleToggleApproval = async (id) => {
    try {
      const client = clients.find(c => c.id === id)
      const updatedClient = await api.adminToggleClientApproval(id, !client?.approved)
      setClients(prev => prev.map(c => (c.id === id ? updatedClient : c)))
    } catch (e) {
      alert(e.message || 'Failed to update approval state.')
    }
  }

  const openAddModal = () => {
    setModalOpen(true)
    setModalMode('add')
    setEditId(null)
    setFormErrors({})
    setClientForm({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      wilaya: 'Algiers',
      commune: '',
      approved: false
    })
  }

  const openEditModal = (client) => {
    setModalOpen(true)
    setModalMode('edit')
    setEditId(client.id)
    setFormErrors({})
    setClientForm({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      company: client.company,
      wilaya: client.wilaya,
      commune: client.commune || '',
      approved: client.approved
    })
  }

  // Form Validation
  const validateForm = () => {
    const errors = {}
    if (!clientForm.fullName.trim()) errors.fullName = 'Full Name is required.'
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!clientForm.email.trim()) {
      errors.email = 'Email Address is required.'
    } else if (!emailRegex.test(clientForm.email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    // Algerian phone format verification (e.g. 05, 06, 07)
    const phoneRegex = /^(05|06|07)\d{8}$/
    if (!clientForm.phone.trim()) {
      errors.phone = 'Phone Number is required.'
    } else if (!phoneRegex.test(clientForm.phone.trim())) {
      errors.phone = 'Invalid format. Use 05/06/07XXXXXXXX.'
    }

    if (!clientForm.company.trim()) errors.company = 'Company name is required.'
    if (!clientForm.wilaya) errors.wilaya = 'Select a wilaya.'
    if (!clientForm.commune.trim()) errors.commune = 'Commune is required.'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit Save
  const handleSaveClient = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (modalMode === 'add') {
        const created = await api.adminCreateClient(clientForm)
        setClients(prev => [created, ...prev])
        if (created.temporaryPassword) {
          alert(`Client created. Temporary password: ${created.temporaryPassword}`)
        }
      } else {
        const updated = await api.adminUpdateClient(editId, clientForm)
        setClients(prev => prev.map(c => (c.id === editId ? updated : c)))
      }

      setModalOpen(false)
      setEditId(null)
      setFormErrors({})
    } catch (e) {
      setFormErrors({ submit: e.message || 'Failed to save client.' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-fade-in-up"
    >
      <div className="flex justify-between items-center flex-wrap gap-4 text-left">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Client Accounts</h3>
          <p className="text-[11px] text-kurima-muted mt-1">Approve partner contractors, inspect corporate logs, and restrict grid platform access</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-5 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/5 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Clients Administration Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-foreground/[0.015] border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-kurima-muted">
                <th className="p-5">Partner Client Info</th>
                <th className="p-5">Corporate / Company</th>
                <th className="p-5">Contact Details</th>
                <th className="p-5">Logistics Hub (Wilaya)</th>
                <th className="p-5 text-center">Approved Access</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-semibold text-foreground/80">
              {clients.map(c => {
                const displayName = c.fullName || c.name || 'Anonymous Client'
                return (
                  <tr key={c.id} className="hover:bg-foreground/[0.005] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-kurima-orange/5 border border-kurima-orange/15 flex items-center justify-center text-kurima-orange font-bold uppercase text-[10px]">
                          {displayName.slice(0, 2)}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-foreground">{displayName}</h5>
                          <span className="text-[9px] text-kurima-muted">ID: CL-{c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="flex items-center gap-1.5 text-foreground/90 font-extrabold">
                        <Building className="w-4 h-4 text-kurima-orange shrink-0" />
                        {c.company}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1 text-kurima-muted">
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-foreground/40" />
                          <span>{c.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-foreground/40" />
                          <span>{c.phone}</span>
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-kurima-orange shrink-0" />
                        <span>{c.wilaya} {c.commune ? `, ${c.commune}` : ''}</span>
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleApproval(c.id)}
                          className={`w-12 h-6 rounded-full p-1 transition-all duration-300 relative cursor-pointer ${
                            c.approved ? 'bg-kurima-orange' : 'bg-foreground/10 border border-white/5'
                          }`}
                        >
                          <motion.div
                            layout
                            className={`w-4 h-4 rounded-full shadow-md transition-all ${
                              c.approved ? 'bg-black translate-x-6' : 'bg-foreground/40'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl transition-all cursor-pointer text-foreground/60"
                          title="Edit Client"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c.id)}
                          className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer text-foreground/60"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-kurima-muted uppercase tracking-widest text-[10px]">
                    No corporate clients registered in administrative streams.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          CLIENT ADD / EDIT DIALOG FORM MODAL
          ───────────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              />
 
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh] text-left"
              >
                {/* Dismiss button */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute right-6 top-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
 
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-4">
                  {modalMode === 'add' ? 'Register New Client' : 'Modify Client Access'}
                </h3>

                <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
                  {formErrors.submit && (
                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
                      {formErrors.submit}
                    </div>
                  )}

                  {/* Full name */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={clientForm.fullName}
                      onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                      placeholder="e.g. Younes Zerotohero"
                    />
                    {formErrors.fullName && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.fullName}</span>}
                  </div>
 
                  {/* Company */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Company / Contractor Name *</label>
                    <input
                      type="text"
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                      placeholder="e.g. ElectroAlgiers E.U.R.L"
                    />
                    {formErrors.company && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.company}</span>}
                  </div>
 
                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Email Address *</label>
                      <input
                        type="text"
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="e.g. contact@electroalgiers.com"
                      />
                      {formErrors.email && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.email}</span>}
                    </div>
 
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Phone Number (Algerian format) *</label>
                      <input
                        type="text"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold font-mono text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="e.g. 0561234567"
                      />
                      {formErrors.phone && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.phone}</span>}
                    </div>
                  </div>
 
                  {/* Wilaya & Commune */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Wilaya *</label>
                      <select
                        value={clientForm.wilaya}
                        onChange={(e) => setClientForm({ ...clientForm, wilaya: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                      >
                        <option value="Algiers">Algiers</option>
                        <option value="Oran">Oran</option>
                        <option value="Constantine">Constantine</option>
                        <option value="Blida">Blida</option>
                        <option value="Setif">Setif</option>
                        <option value="Annaba">Annaba</option>
                        <option value="Tizi Ouzou">Tizi Ouzou</option>
                        <option value="Bejaia">Bejaia</option>
                        <option value="Tlemcen">Tlemcen</option>
                      </select>
                    </div>
 
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Commune *</label>
                      <input
                        type="text"
                        value={clientForm.commune}
                        onChange={(e) => setClientForm({ ...clientForm, commune: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="e.g. Hydra"
                      />
                      {formErrors.commune && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.commune}</span>}
                    </div>
                  </div>
 
                  {/* Switch approval inside form */}
                  <div className="bg-foreground/[0.015] border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <p className="font-bold text-foreground flex items-center gap-1">
                        {clientForm.approved ? (
                          <ShieldCheck className="w-4 h-4 text-kurima-orange" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        )}
                        <span>Approve Account Status</span>
                      </p>
                      <p className="text-[9px] text-kurima-muted leading-tight">Approved accounts can request instant wholesale quotes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClientForm({ ...clientForm, approved: !clientForm.approved })}
                      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 relative cursor-pointer ${
                        clientForm.approved ? 'bg-kurima-orange' : 'bg-foreground/10 border border-white/5'
                      }`}
                    >
                      <motion.div
                        layout
                        className={`w-4 h-4 rounded-full shadow-md transition-all ${
                          clientForm.approved ? 'bg-black translate-x-6' : 'bg-foreground/40'
                        }`}
                      />
                    </button>
                  </div>
 
                  {/* Footer buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-foreground/5">
                    <Button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      variant="outline"
                      className="border-white/10 text-white rounded-full px-6 py-2.5 h-auto text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-6 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/5"
                    >
                      {modalMode === 'add' ? 'Register Client' : 'Update Access'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
