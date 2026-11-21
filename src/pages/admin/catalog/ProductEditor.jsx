import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Plus, Trash2, RefreshCw, Loader2, ChevronDown, Check } from 'lucide-react'
import api from '@/lib/api'
import { lockScroll, unlockScroll } from '@/lib/motion'
import { formatDA, slugify, titleCase } from '@/lib/format'
import { cn } from '@/components/ui/Btn'
import { Field, Section, IconBtn, useToast, useConfirm } from './ui'
import { GalleryDrop } from './ImageDrop'

const TAGS = [
  ['NONE', 'No badge'],
  ['NEW', 'New'],
  ['BEST_SELLER', 'Best seller'],
  ['TRENDING', 'Trending'],
  ['SALE', 'Sale'],
]

const blank = (keep = {}) => ({
  name: '',
  ref: '',
  description: '',
  categoryId: keep.categoryId || '',
  brandId: keep.brandId || '',
  gammeId: keep.gammeId || '',
  priceBought: '',
  priceSold: '',
  promotionPercentage: '0',
  quantity: '',
  tag: 'NONE',
  images: [],
  sizes: [],
  colors: [],
  details: '',
  positives: '',
  negatives: '',
})

function fromProduct(p, { copy = false } = {}) {
  const images = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : []
  return {
    name: copy ? `${p.name} (copy)` : p.name || '',
    ref: copy ? '' : p.ref || '',
    description: p.description || '',
    categoryId: p.categoryId ? String(p.categoryId) : '',
    brandId: p.brandId ? String(p.brandId) : '',
    gammeId: p.gammeId ? String(p.gammeId) : '',
    priceBought: p.priceBought != null ? String(Number(p.priceBought)) : '',
    priceSold: p.priceSold != null ? String(Number(p.priceSold)) : '',
    promotionPercentage: String(Number(p.promotionPercentage || 0)),
    quantity: p.quantity != null ? String(p.quantity) : '',
    tag: p.tag || 'NONE',
    images: [...new Set([p.image, ...images].filter(Boolean))],
    sizes: (Array.isArray(p.sizes) ? p.sizes : []).map((s) =>
      typeof s === 'object' && s
        ? { name: s.name || '', priceBought: s.priceBought != null ? String(s.priceBought) : '', priceSold: s.priceSold != null ? String(s.priceSold) : '' }
        : { name: String(s), priceBought: '', priceSold: '' },
    ),
    colors: (Array.isArray(p.colors) ? p.colors : []).map((c) => ({ name: c.name || '', hex: c.hex || '#888888' })),
    details: (p.details || []).join('\n'),
    positives: (p.positives || []).join('\n'),
    negatives: (p.negatives || []).join('\n'),
  }
}

const num = (v) => (v === '' || v == null ? NaN : Number(String(v).replace(',', '.')))
const lines = (v) =>
  String(v || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

function makeRef(brandName, name, seed) {
  const prefix = (brandName || 'EH').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'EH'
  const mid = slugify(name).replace(/-/g, '').slice(0, 6).toUpperCase()
  return [prefix, mid, seed].filter(Boolean).join('-')
}

/** Select with an inline "create new" row. */
function SelectOrCreate({ value, onChange, options, placeholder, createLabel, onCreate, disabled, invalid }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const create = async () => {
    if (!name.trim()) return
    setBusy(true)
    setError('')
    try {
      const item = await onCreate(name.trim())
      onChange(String(item.id))
      setAdding(false)
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (adding) {
    return (
      <div>
        <div className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                create()
              }
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder={createLabel}
            className="field"
          />
          <button type="button" onClick={create} disabled={busy || !name.trim()} className="flex h-12 shrink-0 items-center gap-1.5 rounded-[0.9rem] bg-volt px-4 text-ink-900 disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Add
          </button>
          <IconBtn label="Cancel" className="size-12" onClick={() => setAdding(false)}>
            <X className="size-4" />
          </IconBtn>
        </div>
        {error && <p className="mt-1 text-[0.8rem] text-[#d93025]">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-invalid={invalid} className="field">
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setAdding(true)}
        disabled={disabled}
        title={createLabel}
        className="flex h-12 shrink-0 items-center gap-1.5 rounded-[0.9rem] bg-ink-900/[0.05] px-3.5 text-[0.85rem] text-ink-900/80 ring-hair hover:bg-ink-900/[0.1] hover:text-ink-900 disabled:opacity-40"
      >
        <Plus className="size-4" /> New
      </button>
    </div>
  )
}

export default function ProductEditor({ open, editing, duplicateOf, categories, brands, gammes, onClose, onSaved, onTaxonomyChanged }) {
  const toast = useToast()
  const confirm = useConfirm()
  const nameRef = useRef(null)
  const [form, setForm] = useState(blank())
  const [initial, setInitial] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [refTouched, setRefTouched] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const seed = useRef(String(Math.floor(100 + Math.random() * 900)))
  const isEdit = !!editing

  // (Re)initialise whenever the drawer opens
  useEffect(() => {
    if (!open) return
    const start = editing ? fromProduct(editing) : duplicateOf ? fromProduct(duplicateOf, { copy: true }) : blank()
    seed.current = String(Math.floor(100 + Math.random() * 900))
    setForm(start)
    setInitial(JSON.stringify(start))
    setErrors({})
    setRefTouched(!!editing)
    setAdvanced(!!(start.sizes.length || start.colors.length || start.details || start.positives || start.negatives))
    const id = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 350)
    return () => clearTimeout(id)
  }, [open, editing, duplicateOf])

  useEffect(() => {
    if (!open) return
    lockScroll('editor')
    return () => unlockScroll('editor')
  }, [open])

  const brandName = brands.find((b) => String(b.id) === form.brandId)?.name
  // Auto-reference while the admin hasn't typed one
  useEffect(() => {
    if (refTouched || !open) return
    setForm((f) => ({ ...f, ref: f.name || brandName ? makeRef(brandName, f.name, seed.current) : '' }))
  }, [form.name, brandName, refTouched, open])

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setErrors((e) => {
      const n = { ...e }
      Object.keys(patch).forEach((k) => delete n[k])
      delete n.submit
      return n
    })
  }

  const ranges = useMemo(
    () => gammes.filter((g) => (!form.brandId || String(g.brandId) === form.brandId) && (!form.categoryId || String(g.categoryId) === form.categoryId)),
    [gammes, form.brandId, form.categoryId],
  )

  // Drop the range when it no longer fits the brand / category
  useEffect(() => {
    if (form.gammeId && !ranges.some((g) => String(g.id) === form.gammeId)) setForm((f) => ({ ...f, gammeId: '' }))
  }, [ranges, form.gammeId])

  const buy = num(form.priceBought)
  const sell = num(form.priceSold)
  const promo = Math.min(100, Math.max(0, num(form.promotionPercentage) || 0))
  const finalP = Number.isFinite(sell) ? sell * (1 - promo / 100) : NaN
  const margin = Number.isFinite(finalP) && Number.isFinite(buy) ? finalP - buy : NaN
  const marginPct = Number.isFinite(margin) && finalP > 0 ? (margin / finalP) * 100 : NaN

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.ref.trim()) e.ref = 'Required'
    if (!form.categoryId) e.categoryId = 'Choose one'
    if (!form.brandId) e.brandId = 'Choose one'
    if (!(sell > 0)) e.priceSold = 'Enter a price'
    if (form.priceBought !== '' && !(buy >= 0)) e.priceBought = 'Invalid'
    if (form.quantity === '' || !(num(form.quantity) >= 0)) e.quantity = 'Enter stock'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const payload = () => {
    const baseBuy = Number.isFinite(buy) ? buy : 0
    const sizes = form.sizes
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        priceBought: Number.isFinite(num(s.priceBought)) ? num(s.priceBought) : baseBuy,
        priceSold: Number.isFinite(num(s.priceSold)) ? num(s.priceSold) : sell,
      }))
    return {
      ref: form.ref.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      priceBought: baseBuy,
      priceSold: sell,
      promotionPercentage: promo,
      quantity: Math.max(0, Math.round(num(form.quantity))),
      inStock: num(form.quantity) > 0,
      categoryId: Number(form.categoryId),
      brandId: Number(form.brandId),
      gammeId: form.gammeId ? Number(form.gammeId) : null,
      tag: form.tag,
      image: form.images[0] || '',
      images: form.images,
      sizes,
      colors: form.colors.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), hex: c.hex })),
      details: lines(form.details),
      positives: lines(form.positives),
      negatives: lines(form.negatives),
    }
  }

  const save = async (another = false) => {
    if (saving) return
    if (!validate()) {
      toast('Please complete the highlighted fields.', 'error')
      return
    }
    setSaving(true)
    try {
      const body = payload()
      const saved = isEdit ? await api.adminUpdateProduct(editing.id, body) : await api.adminCreateProduct(body)
      toast(isEdit ? `“${body.name}” updated` : `“${body.name}” added to the catalogue`)
      onSaved(saved, { another })
      if (another && !isEdit) {
        const next = blank({ categoryId: form.categoryId, brandId: form.brandId, gammeId: form.gammeId })
        seed.current = String(Math.floor(100 + Math.random() * 900))
        setForm(next)
        setInitial(JSON.stringify(next))
        setRefTouched(false)
        setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 50)
      }
    } catch (err) {
      setErrors((e) => ({ ...e, submit: err.message }))
      toast(err.message || 'Could not save the product', 'error')
    } finally {
      setSaving(false)
    }
  }

  const dirty = open && JSON.stringify(form) !== initial
  const requestClose = async () => {
    if (dirty && !(await confirm({ title: 'Discard changes?', text: 'Your edits to this product will be lost.', confirm: 'Discard', danger: true }))) return
    onClose()
  }

  // Keyboard: Ctrl/Cmd + Enter saves, Escape closes
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        save(false)
      } else if (e.key === 'Escape' && !document.querySelector('[role="alertdialog"]')) requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Inline creation of categories / brands / ranges
  const createCategory = async (name) => {
    const c = await api.adminCreateCategory({ name })
    await onTaxonomyChanged()
    toast(`Category “${name}” created`)
    return c
  }
  const createBrand = async (name) => {
    const b = await api.adminCreateBrand({ name: name.toUpperCase() })
    await onTaxonomyChanged()
    toast(`Brand “${b.name}” created`)
    return b
  }
  const createRange = async (name) => {
    if (!form.brandId || !form.categoryId) throw new Error('Pick a category and a brand first')
    const g = await api.adminCreateGamme({ name, brandId: Number(form.brandId), categoryId: Number(form.categoryId) })
    await onTaxonomyChanged()
    toast(`Range “${name}” created`)
    return g
  }

  const updateRow = (key, i, patch) => set({ [key]: form[key].map((r, k) => (k === i ? { ...r, ...patch } : r)) })
  const removeRow = (key, i) => set({ [key]: form[key].filter((_, k) => k !== i) })

  return (
    <div className={cn('fixed inset-0 z-[150]', open ? 'visible' : 'invisible delay-500')} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={requestClose}
        className={cn('absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          save(false)
        }}
        className={cn(
          'absolute inset-y-0 flex w-full flex-col bg-white shadow-[0_0_100px_rgba(0,0,0,0.7)] transition-transform duration-700 ease-[var(--ease-osmo)] sm:inset-y-2 sm:w-[min(52rem,calc(100%-1rem))] sm:rounded-[1.75rem] sm:ring-hair ltr:right-0 rtl:left-0 sm:ltr:right-2 sm:rtl:left-2',
          open ? 'translate-x-0' : 'ltr:translate-x-[110%] rtl:-translate-x-[110%]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 sm:px-7">
          <div className="min-w-0">
            <p className="eyebrow text-ink-900/65">{isEdit ? `Editing · ${editing.ref}` : duplicateOf ? 'Duplicate' : 'New product'}</p>
            <h2 id="editor-title" className="display mt-1 truncate text-[1.7rem] tracking-[-0.035em] text-ink-900">
              {form.name || (isEdit ? editing.name : 'Untitled product')}
            </h2>
          </div>
          <IconBtn label="Close" className="size-11 bg-ink-900/[0.06] ring-hair" onClick={requestClose}>
            <X className="size-4" />
          </IconBtn>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 sm:px-7">
          <Section index="1" title="Photos" subtitle="Drag & drop, paste (Ctrl+V) or browse. Images are compressed automatically.">
            <GalleryDrop images={form.images} onChange={(images) => set({ images })} />
          </Section>

          <Section index="2" title="Essentials">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" required error={errors.name} className="sm:col-span-2">
                <input ref={nameRef} value={form.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={!!errors.name} placeholder="e.g. Disjoncteur différentiel 2P 40A 30mA" className="field" />
              </Field>
              <Field label="Category" required error={errors.categoryId}>
                <SelectOrCreate
                  value={form.categoryId}
                  onChange={(v) => set({ categoryId: v })}
                  options={categories.map((c) => ({ id: c.id, label: titleCase(c.name) }))}
                  placeholder="Choose a category"
                  createLabel="New category name"
                  onCreate={createCategory}
                  invalid={!!errors.categoryId}
                />
              </Field>
              <Field label="Brand" required error={errors.brandId}>
                <SelectOrCreate
                  value={form.brandId}
                  onChange={(v) => set({ brandId: v })}
                  options={brands.map((b) => ({ id: b.id, label: b.name }))}
                  placeholder="Choose a brand"
                  createLabel="New brand name"
                  onCreate={createBrand}
                  invalid={!!errors.brandId}
                />
              </Field>
              <Field label="Range (gamme)" hint="Optional">
                <SelectOrCreate
                  value={form.gammeId}
                  onChange={(v) => set({ gammeId: v })}
                  options={ranges.map((g) => ({ id: g.id, label: g.name }))}
                  placeholder={form.brandId && form.categoryId ? (ranges.length ? 'No range' : 'No range yet') : 'Pick category & brand first'}
                  createLabel="New range name"
                  onCreate={createRange}
                  disabled={!form.brandId || !form.categoryId}
                />
              </Field>
              <Field label="Reference (SKU)" required error={errors.ref} hint={refTouched ? null : 'Auto-generated'}>
                <div className="flex gap-2">
                  <input
                    value={form.ref}
                    onChange={(e) => {
                      setRefTouched(true)
                      set({ ref: e.target.value.toUpperCase() })
                    }}
                    aria-invalid={!!errors.ref}
                    className="field font-mono text-[0.88rem] tracking-wide"
                  />
                  <IconBtn
                    label="Regenerate reference"
                    className="size-12 rounded-[0.9rem] bg-ink-900/[0.05] ring-hair"
                    onClick={() => {
                      seed.current = String(Math.floor(100 + Math.random() * 900))
                      setRefTouched(false)
                      set({ ref: makeRef(brandName, form.name, seed.current) })
                    }}
                  >
                    <RefreshCw className="size-4" />
                  </IconBtn>
                </div>
              </Field>
            </div>
          </Section>

          <Section
            index="3"
            title="Price & stock"
            aside={
              Number.isFinite(finalP) && finalP > 0 ? (
                <div className="text-end">
                  <p className="eyebrow text-ink-900/65">Customer pays</p>
                  <p className="display tabular text-[1.4rem] tracking-[-0.03em] text-forest">{formatDA(finalP)}</p>
                </div>
              ) : null
            }
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Selling price (DA)" required error={errors.priceSold}>
                <input inputMode="decimal" value={form.priceSold} onChange={(e) => set({ priceSold: e.target.value })} aria-invalid={!!errors.priceSold} placeholder="0" className="field tabular" />
              </Field>
              <Field label="Purchase price (DA)" hint="Private" error={errors.priceBought}>
                <input inputMode="decimal" value={form.priceBought} onChange={(e) => set({ priceBought: e.target.value })} aria-invalid={!!errors.priceBought} placeholder="0" className="field tabular" />
              </Field>
              <Field label="Promotion (%)">
                <input inputMode="decimal" value={form.promotionPercentage} onChange={(e) => set({ promotionPercentage: e.target.value })} placeholder="0" className="field tabular" />
              </Field>
              <Field label="Units in stock" required error={errors.quantity}>
                <input inputMode="numeric" value={form.quantity} onChange={(e) => set({ quantity: e.target.value.replace(/[^\d]/g, '') })} aria-invalid={!!errors.quantity} placeholder="0" className="field tabular" />
              </Field>
              <Field label="Badge">
                <select value={form.tag} onChange={(e) => set({ tag: e.target.value })} className="field">
                  {TAGS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="rounded-[0.9rem] bg-ink-900/[0.03] px-4 py-2.5 ring-hair">
                <p className="text-[0.82rem] text-ink-900/65">Margin</p>
                <p className={cn('tabular mt-0.5 text-[1.05rem]', Number.isFinite(margin) ? (margin >= 0 ? 'text-forest' : 'text-[#d93025]') : 'text-ink-900/65')}>
                  {Number.isFinite(margin) && form.priceBought !== '' ? `${formatDA(margin)} · ${marginPct.toFixed(0)}%` : '—'}
                </p>
              </div>
            </div>
          </Section>

          <Section index="4" title="Description" subtitle="Shown on the product page and used by Google.">
            <textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={5}
              placeholder="What it is, what it is for, key standards (NF, CE)…"
              className="field h-auto resize-y py-3 leading-relaxed"
            />
          </Section>

          {/* Optional extras */}
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            aria-expanded={advanced}
            className="flex w-full items-center justify-between rounded-[1.25rem] bg-ink-900/[0.025] px-5 py-4 text-start ring-hair hover:bg-ink-900/[0.04] sm:px-6"
          >
            <span>
              <span className="block text-ink-900">Variants, colours & technical details</span>
              <span className="text-[0.85rem] text-ink-900/65">Optional — calibres with their own price, finishes, specs, pros & cons.</span>
            </span>
            <ChevronDown className={cn('size-5 text-ink-900/60 transition-transform duration-500', advanced && 'rotate-180')} />
          </button>

          <div className="collapse-grid" data-open={advanced}>
            <div className="space-y-4">
              <Section
                title="Specifications / variants"
                subtitle="e.g. 16A, 32A, 63A — leave prices empty to use the main price."
                aside={
                  <button type="button" onClick={() => set({ sizes: [...form.sizes, { name: '', priceBought: '', priceSold: '' }] })} className="flex h-9 items-center gap-1.5 rounded-full bg-ink-900/[0.06] px-3.5 text-[0.85rem] ring-hair hover:bg-ink-900/[0.1]">
                    <Plus className="size-3.5" /> Add
                  </button>
                }
              >
                {form.sizes.length === 0 ? (
                  <p className="text-[0.88rem] text-ink-900/65">No variants — the product is sold at a single price.</p>
                ) : (
                  <div className="space-y-2">
                    {form.sizes.map((s, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                        <input value={s.name} onChange={(e) => updateRow('sizes', i, { name: e.target.value })} placeholder="Name (32A)" aria-label="Variant name" className="field" />
                        <input inputMode="decimal" value={s.priceSold} onChange={(e) => updateRow('sizes', i, { priceSold: e.target.value })} placeholder={form.priceSold || 'Sell price'} aria-label="Variant selling price" className="field tabular" />
                        <input inputMode="decimal" value={s.priceBought} onChange={(e) => updateRow('sizes', i, { priceBought: e.target.value })} placeholder={form.priceBought || 'Buy price'} aria-label="Variant purchase price" className="field tabular" />
                        <IconBtn label="Remove variant" tone="danger" className="size-12" onClick={() => removeRow('sizes', i)}>
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section
                title="Colours / finishes"
                aside={
                  <button type="button" onClick={() => set({ colors: [...form.colors, { name: '', hex: '#ffffff' }] })} className="flex h-9 items-center gap-1.5 rounded-full bg-ink-900/[0.06] px-3.5 text-[0.85rem] ring-hair hover:bg-ink-900/[0.1]">
                    <Plus className="size-3.5" /> Add
                  </button>
                }
              >
                {form.colors.length === 0 ? (
                  <p className="text-[0.88rem] text-ink-900/65">No colour options.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {form.colors.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <label className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-[0.9rem] bg-ink-900/[0.04] ring-hair">
                          <span className="size-7 rounded-full shadow-[inset_0_0_0_1px_rgba(10,12,11,0.25)]" style={{ backgroundColor: c.hex }} />
                          <input type="color" value={c.hex} onChange={(e) => updateRow('colors', i, { hex: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Pick colour" />
                        </label>
                        <input value={c.name} onChange={(e) => updateRow('colors', i, { name: e.target.value })} placeholder="White, Anthracite…" aria-label="Colour name" className="field" />
                        <IconBtn label="Remove colour" tone="danger" className="size-12" onClick={() => removeRow('colors', i)}>
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Technical details" subtitle="One item per line.">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Specifications">
                    <textarea value={form.details} onChange={(e) => set({ details: e.target.value })} rows={5} placeholder={'Breaking capacity 6kA\nDIN rail mounting'} className="field h-auto resize-y py-3" />
                  </Field>
                  <Field label="Strengths">
                    <textarea value={form.positives} onChange={(e) => set({ positives: e.target.value })} rows={5} placeholder="Easy to install" className="field h-auto resize-y py-3" />
                  </Field>
                  <Field label="Limitations">
                    <textarea value={form.negatives} onChange={(e) => set({ negatives: e.target.value })} rows={5} placeholder="Needs a 2-module slot" className="field h-auto resize-y py-3" />
                  </Field>
                </div>
              </Section>
            </div>
          </div>

          {errors.submit && (
            <p role="alert" className="rounded-xl bg-[#ff6b5e]/10 px-4 py-3 text-[0.9rem] text-[#d93025]">
              {errors.submit}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/[0.08] px-5 py-4 sm:px-7">
          <p className="eyebrow hidden text-ink-900/62 sm:block">Ctrl + Enter to save · Esc to close</p>
          <div className="flex flex-1 justify-end gap-2 sm:flex-none">
            {!isEdit && (
              <button type="button" disabled={saving} onClick={() => save(true)} className="h-12 rounded-full bg-ink-900/[0.06] px-5 text-[0.92rem] text-ink-900 ring-hair hover:bg-ink-900/[0.1] disabled:opacity-50">
                Save & add another
              </button>
            )}
            <button type="submit" disabled={saving} className="flex h-12 items-center gap-2 rounded-full bg-volt px-6 text-[0.95rem] font-medium text-ink-900 hover:bg-volt-300 disabled:opacity-60">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {isEdit ? 'Save changes' : 'Save product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
