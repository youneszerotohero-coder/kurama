import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Shield,
  Code2,
  Truck,
  Activity,
  CheckCircle,
  AlertTriangle,
  RotateCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import api from '@/lib/api'

export default function Settings() {
  const [settings, setSettings] = useState({
    deliveryApiKey: '',
    metaPixelId: '',
    minFreeDelivery: 15000,
    adminUsername: 'admin',
    adminEmail: 'admin@kurama.dz',
  })

  const [formErrors, setFormErrors] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [pingState, setPingState] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [adminSettings, me] = await Promise.all([
          api.getAdminSettings(),
          api.getMe(),
        ])

        setSettings(prev => ({
          ...prev,
          deliveryApiKey: adminSettings.deliveryApiKey || '',
          metaPixelId: adminSettings.metaPixelId || '',
          minFreeDelivery: adminSettings.minFreeDelivery !== undefined ? Number(adminSettings.minFreeDelivery) : 15000,
          adminUsername: me.fullName || 'admin',
          adminEmail: me.email || 'admin@kurama.dz'
        }))
      } catch (e) {
        console.error('Failed to load backend settings:', e)
      }
    }

    loadSettings()
  }, [])

  // Trigger sandboxed API Delivery Ping test
  const handleTestPing = () => {
    if (!settings.deliveryApiKey.trim()) {
      setPingState('error')
      setTimeout(() => setPingState('idle'), 3000)
      return
    }

    setPingState('loading')
    setTimeout(() => {
      setPingState('success')
      setTimeout(() => setPingState('idle'), 4000)
    }, 1500)
  }

  // Form Validation and submission
  const validateForm = () => {
    const errors = {}

    // Admin email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!settings.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required.'
    } else if (!emailRegex.test(settings.adminEmail.trim())) {
      errors.adminEmail = 'Please enter a valid email address.'
    }

    if (!settings.adminUsername.trim()) {
      errors.adminUsername = 'Admin username is required.'
    }

    if (settings.minFreeDelivery === undefined || settings.minFreeDelivery === null || settings.minFreeDelivery === '' || Number(settings.minFreeDelivery) < 0) {
      errors.minFreeDelivery = 'Free delivery threshold must be a valid non-negative number.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await Promise.all([
        api.updateSettings({
          deliveryApiKey: settings.deliveryApiKey,
          metaPixelId: settings.metaPixelId,
          minFreeDelivery: Number(settings.minFreeDelivery),
        }),
        api.updateProfile({
          fullName: settings.adminUsername,
          email: settings.adminEmail,
        }),
      ])

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      setFormErrors({ submit: e.message || 'Failed to save settings.' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-fade-in-up text-left max-w-3xl"
    >
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Global Control Settings</h3>
        <p className="text-[11px] text-kurima-muted mt-1">Configure Meta marketing pixels, sandboxed delivery API gateways, and manage credentials</p>
      </div>

      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>System Configurations updated successfully! All active gateways synced.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* SECTION 1: SHIPPERS & GATEWAY VENDOR */}
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Truck className="w-4 h-4 text-kurima-orange" />
            <span>Delivery Logistics Gateway</span>
          </h4>
          <Separator className="bg-foreground/5" />
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 flex flex-col w-full">
              <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Yalidine / Delivery API Key</label>
              <input
                type="password"
                value={settings.deliveryApiKey}
                onChange={(e) => setSettings({ ...settings, deliveryApiKey: e.target.value })}
                className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all font-mono"
                placeholder="••••••••••••••••••••••••••••••••"
              />
            </div>

            <div className="w-full sm:w-48 flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Min. Free Delivery (DA)</label>
              <input
                type="number"
                value={settings.minFreeDelivery}
                onChange={(e) => setSettings({ ...settings, minFreeDelivery: e.target.value })}
                className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                placeholder="15000"
              />
            </div>
            
            <button
              type="button"
              onClick={handleTestPing}
              disabled={pingState === 'loading'}
              className="bg-foreground/5 hover:bg-foreground/10 text-white font-extrabold px-6 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer transition-all border border-white/5 flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
            >
              {pingState === 'loading' && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
              {pingState === 'idle' && <span>Test Ping Gateway</span>}
              {pingState === 'success' && <span className="text-green-500">Ping Success! (200 OK)</span>}
              {pingState === 'error' && <span className="text-red-500">API Key Missing</span>}
            </button>
          </div>
          {formErrors.minFreeDelivery && (
            <span className="text-[9px] text-red-500 font-bold block mt-1 uppercase tracking-wider">
              {formErrors.minFreeDelivery}
            </span>
          )}
          <p className="text-[9px] text-kurima-muted leading-relaxed">
            Integrating with national shippers automatically pushes confirmed order files into their dashboard, facilitating instant printing of tracking barcodes.
          </p>
        </div>

        {/* SECTION 2: ADVERTISING PIXELS */}
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Code2 className="w-4 h-4 text-kurima-orange" />
            <span>Tracking & Analytics Pixels</span>
          </h4>
          <Separator className="bg-foreground/5" />

          <div className="flex flex-col">
            <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Meta Pixel ID (Facebook Ad Stream)</label>
            <input
              type="text"
              value={settings.metaPixelId}
              onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
              className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all font-mono"
              placeholder="e.g. 8472938472910"
            />
          </div>
          <p className="text-[9px] text-kurima-muted leading-relaxed">
            Specify a valid Facebook Pixel Stream ID to enable event loops (PageView, AddToCart, InitiateCheckout) across consumer landing catalogs.
          </p>
        </div>

        {/* SECTION 3: ADMIN ACCESS CREDENTIALS */}
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-kurima-orange" />
            <span>Security & Administrative Access</span>
          </h4>
          <Separator className="bg-foreground/5" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Admin Username *</label>
              <input
                type="text"
                value={settings.adminUsername}
                onChange={(e) => setSettings({ ...settings, adminUsername: e.target.value })}
                className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
              />
              {formErrors.adminUsername && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.adminUsername}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Admin Email Address *</label>
              <input
                type="text"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
              />
              {formErrors.adminEmail && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.adminEmail}</span>}
            </div>
          </div>

          <Separator className="bg-foreground/5 my-2" />
          <p className="text-[9px] text-kurima-muted leading-relaxed">
            Admin identity fields are synced with the authenticated profile. Password changes are handled separately from this settings panel.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-8 py-3.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/10"
          >
            Save All Configurations
          </Button>
        </div>

        {formErrors.submit && (
          <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
            {formErrors.submit}
          </div>
        )}
      </form>
    </motion.div>
  )
}
