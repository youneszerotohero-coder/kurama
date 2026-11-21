import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Truck, Building2 } from 'lucide-react'
import api from '@/lib/api'
import { formatDA } from '@/lib/format'
import { cn } from '@/components/ui/Btn'

const EMPTY = { name: '', phone: '', wilaya: '', commune: '' }
const PHONE_RE = /^0[567]\d{8}$/

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null')
  } catch {
    return null
  }
}

/**
 * Delivery form state shared by the product page (express order) and the checkout:
 * territories, home / stop-desk choice and the resulting fee.
 */
export function useDelivery(subtotal, minFreeDelivery) {
  const [form, setForm] = useState(() => {
    const u = readUser()
    return u ? { name: u.name || u.fullName || '', phone: u.phone || '', wilaya: u.wilaya || '', commune: u.commune || '' } : EMPTY
  })
  const [errors, setErrors] = useState({})
  const [territories, setTerritories] = useState([])
  const [type, setType] = useState('home')

  useEffect(() => {
    api
      .getTerritories()
      .then((d) => setTerritories(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []))
      .catch(() => setTerritories([]))
  }, [])

  const wilaya = useMemo(
    () => territories.find((w) => `${w.name} (${w.code})` === form.wilaya || (form.wilaya && form.wilaya.includes(`(${w.code})`))) || null,
    [territories, form.wilaya],
  )

  // Fall back to home delivery when the stop desk isn't offered in this wilaya
  useEffect(() => {
    if (wilaya && type === 'desk' && !wilaya.desk_active) setType('home')
  }, [wilaya, type])

  const free = subtotal >= minFreeDelivery
  const priceOf = (kind) => (wilaya ? Number(kind === 'desk' ? wilaya.desk_price : wilaya.home_price) : null)
  const fee = free ? 0 : priceOf(type)

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      Object.keys(patch).forEach((k) => delete next[k])
      delete next.submit
      return next
    })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = true
    if (!PHONE_RE.test(form.phone.replace(/\s+/g, ''))) e.phone = true
    if (!form.wilaya) e.wilaya = true
    if (!form.commune.trim()) e.commune = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const payload = () => ({
    clientName: form.name.trim(),
    clientPhone: form.phone.replace(/\s+/g, ''),
    fullName: form.name.trim(),
    phone: form.phone.replace(/\s+/g, ''),
    wilaya: form.wilaya,
    commune: form.commune,
    shippingType: type,
    addressDetails: `${form.commune}, ${form.wilaya}`,
  })

  const remember = () => {
    const u = readUser()
    if (!u) return
    try {
      localStorage.setItem('currentUser', JSON.stringify({ ...u, name: form.name, phone: form.phone, wilaya: form.wilaya, commune: form.commune }))
    } catch {
      /* ignore */
    }
  }

  return { form, update, errors, setErrors, territories, wilaya, type, setType, fee, free, priceOf, validate, payload, remember, reset: () => setForm(EMPTY) }
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 flex items-center justify-between text-ink-900/60">
        <span>
          {label} <span className="text-forest">*</span>
        </span>
        {error && <span className="normal-case tracking-normal text-[#d93025]">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

/** The fields themselves (name, phone, wilaya, commune, delivery method). */
export default function DeliveryFields({ delivery, compact = false }) {
  const { t, i18n } = useTranslation()
  const { form, update, errors, territories, wilaya, type, setType, free, priceOf } = delivery
  const ar = i18n.language === 'ar'

  const method = (kind, Icon, label) => {
    const disabled = kind === 'desk' && wilaya && !wilaya.desk_active
    const price = priceOf(kind)
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setType(kind)}
        aria-pressed={type === kind}
        className={cn(
          'flex items-center gap-3 rounded-2xl p-3.5 text-start ring-hair transition-[background-color,box-shadow] duration-300 disabled:cursor-not-allowed disabled:opacity-40',
          type === kind ? 'bg-volt/20 shadow-[inset_0_0_0_1px_var(--color-volt)]' : 'bg-ink-900/[0.03] hover:bg-ink-900/[0.06]',
        )}
      >
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', type === kind ? 'bg-volt text-ink-900' : 'bg-ink-900/[0.06] text-ink-900/65')}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.93rem] text-ink-900">{label}</span>
          <span className="eyebrow text-ink-900/65">
            {disabled ? t('checkout.unavailable', 'Indisponible') : free ? t('checkout.free') : price != null ? formatDA(price) : t('ui.chooseWilaya', 'Choisir la wilaya')}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <Field label={t('productPage.fullName')} error={errors.name} hint={t('productPage.nameRequired')}>
          <input
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={t('productPage.namePlaceholder')}
            aria-invalid={!!errors.name}
            className="field"
          />
        </Field>
        <Field label={t('productPage.phoneNumber')} error={errors.phone} hint={t('auth.phoneError')}>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="05 / 06 / 07 XX XX XX XX"
            aria-invalid={!!errors.phone}
            dir="ltr"
            className="field rtl:text-right"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('productPage.wilaya')} error={errors.wilaya} hint={t('productPage.required')}>
          <select name="wilaya" value={form.wilaya} onChange={(e) => update({ wilaya: e.target.value, commune: '' })} aria-invalid={!!errors.wilaya} className="field">
            <option value="">{t('ui.chooseWilaya', 'Choisir la wilaya')}</option>
            {territories.map((w) => (
              <option key={w.code} value={`${w.name} (${w.code})`}>
                {w.code} — {ar && w.name_ar ? w.name_ar : w.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('productPage.commune')} error={errors.commune} hint={t('productPage.required')}>
          {territories.length > 0 ? (
            <select
              name="commune"
              value={form.commune}
              onChange={(e) => update({ commune: e.target.value })}
              disabled={!wilaya}
              aria-invalid={!!errors.commune}
              className="field"
            >
              <option value="">{t('ui.chooseCommune', 'Choisir la commune')}</option>
              {(wilaya?.communes || []).map((c) => (
                <option key={c.id} value={c.name}>
                  {ar && c.name_ar ? c.name_ar : c.name}
                </option>
              ))}
            </select>
          ) : (
            <input name="commune" value={form.commune} onChange={(e) => update({ commune: e.target.value })} aria-invalid={!!errors.commune} className="field" />
          )}
        </Field>
      </div>
      <div>
        <p className="eyebrow mb-2 text-ink-900/60">{t('checkout.deliveryType', 'Mode de livraison')}</p>
        <div className="grid grid-cols-2 gap-2.5">
          {method('home', Truck, t('checkout.homeDelivery', 'À domicile'))}
          {method('desk', Building2, t('checkout.stopDesk', 'Stop desk'))}
        </div>
      </div>
    </div>
  )
}
