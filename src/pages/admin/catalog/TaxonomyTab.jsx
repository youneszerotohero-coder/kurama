import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, Search } from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, titleCase } from '@/lib/format'
import { cn } from '@/components/ui/Btn'
import { IconBtn, useConfirm, useToast } from './ui'
import { SingleDrop } from './ImageDrop'

/* One configuration per kind of taxonomy */
const KINDS = {
  category: {
    noun: 'category',
    create: api.adminCreateCategory,
    update: api.adminUpdateCategory,
    remove: api.adminDeleteCategory,
    extra: { key: 'parentCategory', label: 'Group', placeholder: 'e.g. Electrical equipment' },
    display: (x) => titleCase(x.name),
  },
  brand: {
    noun: 'brand',
    create: api.adminCreateBrand,
    update: api.adminUpdateBrand,
    remove: api.adminDeleteBrand,
    extra: { key: 'origin', label: 'Country', placeholder: 'e.g. France' },
    display: (x) => x.name,
    normalise: (v) => v.toUpperCase(),
  },
  gamme: {
    noun: 'range',
    create: api.adminCreateGamme,
    update: api.adminUpdateGamme,
    remove: api.adminDeleteGamme,
    display: (x) => x.name,
  },
}

function Editor({ kind, item, categories, brands, onDone, onCancel }) {
  const cfg = KINDS[kind]
  const toast = useToast()
  const [name, setName] = useState(item?.name || '')
  const [extra, setExtra] = useState(cfg.extra ? item?.[cfg.extra.key] || '' : '')
  const [image, setImage] = useState(item?.image || '')
  const [brandId, setBrandId] = useState(item?.brandId ? String(item.brandId) : '')
  const [categoryId, setCategoryId] = useState(item?.categoryId ? String(item.categoryId) : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e?.preventDefault()
    if (!name.trim()) return setError('Name is required')
    if (kind === 'gamme' && (!brandId || !categoryId)) return setError('Pick a brand and a category')
    setBusy(true)
    setError('')
    const body = { name: cfg.normalise ? cfg.normalise(name.trim()) : name.trim(), image: image || null }
    if (cfg.extra) body[cfg.extra.key] = extra.trim() || null
    if (kind === 'gamme') Object.assign(body, { brandId: Number(brandId), categoryId: Number(categoryId) })
    try {
      if (item) await cfg.update(item.id, body)
      else await cfg.create(body)
      toast(`${titleCase(cfg.noun)} “${body.name}” ${item ? 'updated' : 'created'}`)
      await onDone()
      if (!item) {
        setName('')
        setExtra('')
        setImage('')
      }
    } catch (err) {
      setError(/unique/i.test(err.message) ? `A ${cfg.noun} with this name already exists` : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={cn('flex flex-wrap items-start gap-2.5', !item && 'rounded-[1.25rem] bg-ink-900/[0.03] p-3 ring-hair')}>
      <SingleDrop value={image} onChange={setImage} className="size-12 shrink-0" />
      <input
        autoFocus={!!item}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`New ${cfg.noun} name`}
        aria-label={`${titleCase(cfg.noun)} name`}
        className="field min-w-[12rem] flex-[2]"
      />
      {cfg.extra && (
        <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={cfg.extra.placeholder} aria-label={cfg.extra.label} className="field min-w-[10rem] flex-1" />
      )}
      {kind === 'gamme' && (
        <>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Category" className="field min-w-[10rem] flex-1">
            <option value="">Category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {titleCase(c.name)}
              </option>
            ))}
          </select>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} aria-label="Brand" className="field min-w-[9rem] flex-1">
            <option value="">Brand…</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </>
      )}
      <button type="submit" disabled={busy} className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-volt px-5 font-medium text-ink-900 hover:bg-volt-300 disabled:opacity-60">
        {busy ? <Loader2 className="size-4 animate-spin" /> : item ? <Check className="size-4" /> : <Plus className="size-4" />}
        {item ? 'Save' : 'Add'}
      </button>
      {item && (
        <IconBtn label="Cancel" className="size-12" onClick={onCancel}>
          <X className="size-4" />
        </IconBtn>
      )}
      {error && <p className="w-full text-[0.85rem] text-[#d93025]">{error}</p>}
    </form>
  )
}

export default function TaxonomyTab({ kind, items, categories, brands, onChanged }) {
  const cfg = KINDS[kind]
  const toast = useToast()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? items.filter((x) => [x.name, x.parentCategory, x.origin, x.brand?.name].filter(Boolean).join(' ').toLowerCase().includes(s)) : items
  }, [items, q])

  const remove = async (item) => {
    const count = item._count?.products ?? 0
    if (count > 0 && kind !== 'gamme') {
      toast(`Move or delete its ${count} product${count > 1 ? 's' : ''} first.`, 'error')
      return
    }
    const ok = await confirm({
      title: `Delete “${cfg.display(item)}”?`,
      text: kind === 'gamme' && count ? `${count} product(s) will simply lose their range.` : 'This cannot be undone.',
      confirm: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await cfg.remove(item.id)
      toast(`${titleCase(cfg.noun)} deleted`)
      await onChanged()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-5">
      <Editor kind={kind} categories={categories} brands={brands} onDone={onChanged} />

      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-ink-900/65">
          {list.length} {cfg.noun === 'category' ? 'categories' : `${cfg.noun}s`}
        </p>
        {items.length > 8 && (
          <label className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-900/65 ltr:left-3.5 rtl:right-3.5" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" aria-label="Filter" className="field h-10 ltr:pl-10 rtl:pr-10" />
          </label>
        )}
      </div>

      {list.length === 0 ? (
        <p className="rounded-[1.25rem] bg-ink-900/[0.02] px-6 py-14 text-center text-ink-900/65 ring-hair">Nothing here yet — add the first one above.</p>
      ) : (
        <ul className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((item) =>
            editing === item.id ? (
              <li key={item.id} className="rounded-[1.25rem] bg-ink-900/[0.05] p-3 ring-1 ring-volt/40 md:col-span-2 xl:col-span-3">
                <Editor
                  kind={kind}
                  item={item}
                  categories={categories}
                  brands={brands}
                  onDone={async () => {
                    await onChanged()
                    setEditing(null)
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li key={item.id} className="group flex items-center gap-3 rounded-[1.25rem] bg-ink-900/[0.03] p-3 ring-hair transition-colors hover:bg-ink-900/[0.05]">
                <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                  <span className="display text-[0.95rem] text-ink-900">{cfg.display(item).slice(0, 2).toUpperCase()}</span>
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className="absolute inset-0 h-full w-full bg-paper object-contain p-1 mix-blend-multiply"
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-ink-900">{cfg.display(item)}</p>
                  <p className="eyebrow truncate text-ink-900/65">
                    {[item.parentCategory, item.origin, item.brand?.name, item.category?.name && titleCase(item.category.name)].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <span className="eyebrow rounded-full bg-ink-900/[0.05] px-2.5 py-1.5 text-ink-900/62">{formatNumber(item._count?.products ?? 0)}</span>
                <div className="flex opacity-60 transition-opacity group-hover:opacity-100">
                  <IconBtn label="Edit" onClick={() => setEditing(item.id)}>
                    <Pencil className="size-3.5" />
                  </IconBtn>
                  <IconBtn label="Delete" tone="danger" onClick={() => remove(item)}>
                    <Trash2 className="size-3.5" />
                  </IconBtn>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
