import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Pencil, Copy, Trash2, ExternalLink, PackageOpen, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, titleCase } from '@/lib/format'
import { cn } from '@/components/ui/Btn'
import { IconBtn, useConfirm, useToast } from './ui'

const hasVariantPrices = (p) => Array.isArray(p.sizes) && p.sizes.some((s) => s && typeof s === 'object' && Number(s.priceSold) > 0 && Number(s.priceSold) !== Number(p.priceSold))

/** Number cell that saves itself on Enter / blur. */
function InlineNumber({ value, onSave, suffix, disabled, title, className = '' }) {
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const shown = draft ?? String(value ?? '')

  const commit = async () => {
    if (draft == null) return
    const n = Number(String(draft).replace(',', '.'))
    if (!Number.isFinite(n) || n < 0 || n === Number(value)) {
      setDraft(null)
      return
    }
    setBusy(true)
    try {
      await onSave(n)
    } finally {
      setBusy(false)
      setDraft(null)
    }
  }

  return (
    <span className={cn('relative inline-flex items-center', className)} title={title}>
      <input
        inputMode="decimal"
        value={shown}
        disabled={disabled || busy}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(null)
            e.currentTarget.blur()
          }
        }}
        className="tabular h-9 w-full rounded-lg bg-transparent px-2 text-end text-ink-900 ring-1 ring-transparent transition-shadow hover:ring-ink-900/15 focus:bg-ink-900/[0.05] focus:ring-volt focus:outline-none disabled:opacity-60"
      />
      {busy ? <Loader2 className="ms-1 size-3.5 animate-spin text-forest" /> : suffix ? <span className="ms-1 text-[0.78rem] text-ink-900/62">{suffix}</span> : null}
    </span>
  )
}

function Status({ q }) {
  const n = Number(q) || 0
  const [label, cls] = n <= 0 ? ['Out', 'bg-[#ff6b5e]/15 text-[#d93025]'] : n <= 5 ? ['Low', 'bg-amber-300/15 text-amber-200'] : ['In stock', 'bg-volt/20 text-forest']
  return <span className={cn('eyebrow rounded-full px-2.5 py-1.5', cls)}>{label}</span>
}

export default function ProductsTab({ products, categories, brands, loading, onEdit, onDuplicate, onChanged, onPatched }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [brand, setBrand] = useState('')
  const [stock, setStock] = useState('')

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return products.filter((p) => {
      if (cat && String(p.categoryId) !== cat) return false
      if (brand && String(p.brandId) !== brand) return false
      if (stock === 'out' && Number(p.quantity) > 0) return false
      if (stock === 'low' && !(Number(p.quantity) > 0 && Number(p.quantity) <= 5)) return false
      if (s && ![p.name, p.ref, p.brand, p.category, p.gamme].filter(Boolean).join(' ').toLowerCase().includes(s)) return false
      return true
    })
  }, [products, q, cat, brand, stock])

  const patch = async (p, body, label) => {
    try {
      const saved = await api.adminUpdateProduct(p.id, body)
      onPatched(saved)
      toast(`${label} updated for “${p.name}”`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const remove = async (p) => {
    const ok = await confirm({ title: `Delete “${p.name}”?`, text: 'The product disappears from the store. Past orders keep their copy.', confirm: 'Delete', danger: true })
    if (!ok) return
    try {
      await api.adminDeleteProduct(p.id)
      toast('Product deleted')
      await onChanged()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const low = products.filter((p) => Number(p.quantity) > 0 && Number(p.quantity) <= 5).length
  const out = products.filter((p) => Number(p.quantity) <= 0).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        <label className="relative min-w-[15rem] flex-[2]">
          <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-900/65 ltr:left-4 rtl:right-4" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference, brand…" aria-label="Search products" className="field ltr:pl-11 rtl:pr-11" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="field min-w-[11rem] flex-1">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {titleCase(c.name)}
            </option>
          ))}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand" className="field min-w-[9rem] flex-1">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <div className="flex gap-1 rounded-[0.9rem] bg-ink-900/[0.035] p-1 ring-hair">
          {[
            ['', 'All'],
            ['low', `Low (${low})`],
            ['out', `Out (${out})`],
          ].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setStock(v)} className={cn('h-10 rounded-[0.7rem] px-3 text-[0.85rem] transition-colors', stock === v ? 'bg-ink-900 text-white' : 'text-ink-900/65 hover:text-ink-900')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="eyebrow text-ink-900/65">
        {formatNumber(list.length)} of {formatNumber(products.length)} products · click a price or stock to edit it in place
      </p>

      {loading && !products.length ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center rounded-[1.25rem] bg-ink-900/[0.02] px-6 py-16 text-center ring-hair">
          <PackageOpen className="size-8 text-ink-900/60" />
          <p className="mt-4 text-ink-900">No products match.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] ring-hair">
          <table className="w-full text-[0.9rem]">
            <thead className="hidden bg-ink-900/[0.03] text-start md:table-header-group">
              <tr className="eyebrow text-ink-900/65">
                <th className="px-4 py-3 text-start font-normal">Product</th>
                <th className="px-2 py-3 text-end font-normal">Price</th>
                <th className="px-2 py-3 text-end font-normal">Promo</th>
                <th className="px-2 py-3 text-end font-normal">Stock</th>
                <th className="px-2 py-3 text-start font-normal">Status</th>
                <th className="px-4 py-3 text-end font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.06]">
              {list.map((p) => {
                const varies = hasVariantPrices(p)
                return (
                  <tr key={p.id} className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 px-3 py-3 transition-colors hover:bg-ink-900/[0.025] md:table-row md:px-0 md:py-0">
                    <td className="col-span-3 md:col-span-1 md:px-4 md:py-3">
                      <button type="button" onClick={() => onEdit(p)} className="flex w-full items-center gap-3 text-start">
                        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                          {p.image ? <img src={p.image} alt="" loading="lazy" className="h-full w-full object-contain p-1 mix-blend-multiply" /> : <PackageOpen className="size-4 text-ink-900/60" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-ink-900 group-hover:text-forest">{p.name}</span>
                          <span className="eyebrow block truncate text-ink-900/65">
                            {p.ref} · {titleCase(p.category || '')} · {p.brand}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="md:px-2 md:py-3 md:text-end">
                      <span className="me-2 text-[0.78rem] text-ink-900/65 md:hidden">Price</span>
                      <InlineNumber
                        value={Number(p.priceSold)}
                        suffix="DA"
                        disabled={varies}
                        title={varies ? 'This product has variant prices — edit it to change them' : 'Click to edit'}
                        className="w-32"
                        onSave={(n) => patch(p, { priceSold: n }, 'Price')}
                      />
                    </td>
                    <td className="md:px-2 md:py-3 md:text-end">
                      <InlineNumber value={Number(p.promotionPercentage || 0)} suffix="%" className="w-20" onSave={(n) => patch(p, { promotionPercentage: Math.min(100, n) }, 'Promotion')} />
                    </td>
                    <td className="md:px-2 md:py-3 md:text-end">
                      <span className="me-2 text-[0.78rem] text-ink-900/65 md:hidden">Stock</span>
                      <InlineNumber value={Number(p.quantity || 0)} className="w-20" onSave={(n) => patch(p, { quantity: Math.round(n), inStock: n > 0 }, 'Stock')} />
                    </td>
                    <td className="md:px-2 md:py-3">
                      <Status q={p.quantity} />
                    </td>
                    <td className="col-span-2 justify-self-end md:px-4 md:py-3">
                      <div className="flex justify-end">
                        <IconBtn label="Edit" onClick={() => onEdit(p)}>
                          <Pencil className="size-3.5" />
                        </IconBtn>
                        <IconBtn label="Duplicate" onClick={() => onDuplicate(p)}>
                          <Copy className="size-3.5" />
                        </IconBtn>
                        <Link to={`/product/${p.id}`} target="_blank" title="View in store" aria-label="View in store" className="flex size-9 items-center justify-center rounded-full text-ink-900/62 hover:bg-ink-900/[0.08] hover:text-ink-900">
                          <ExternalLink className="size-3.5" />
                        </Link>
                        <IconBtn label="Delete" tone="danger" onClick={() => remove(p)}>
                          <Trash2 className="size-3.5" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
