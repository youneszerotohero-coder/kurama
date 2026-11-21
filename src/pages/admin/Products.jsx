import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import api from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { cn } from '@/components/ui/Btn'
import { ToastProvider, ConfirmProvider } from './catalog/ui'
import ProductsTab from './catalog/ProductsTab'
import TaxonomyTab from './catalog/TaxonomyTab'
import ProductEditor from './catalog/ProductEditor'

const TABS = [
  ['products', 'Products'],
  ['categories', 'Categories'],
  ['brands', 'Brands'],
  ['ranges', 'Ranges'],
]

function Catalogue() {
  const store = useStore()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'products'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [gammes, setGammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState({ open: false, editing: null, duplicateOf: null })

  const loadTaxonomy = useCallback(async () => {
    const [c, b, g] = await Promise.all([api.getCategories({ fresh: true }), api.getBrands({ fresh: true }), api.getGammes({ fresh: true })])
    setCategories(c)
    setBrands(b)
    setGammes(g)
    store.refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProducts = useCallback(async () => {
    setProducts(await api.adminGetProducts())
  }, [])

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([loadProducts(), loadTaxonomy()])
    } finally {
      setLoading(false)
    }
  }, [loadProducts, loadTaxonomy])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Deep link: /admin/products?new=product opens the editor straight away
  useEffect(() => {
    if (params.get('new') === 'product') {
      setEditor({ open: true, editing: null, duplicateOf: null })
      const next = new URLSearchParams(params)
      next.delete('new')
      setParams(next, { replace: true })
    }
  }, [params, setParams])

  const setTab = (id) => {
    const next = new URLSearchParams(params)
    if (id === 'products') next.delete('tab')
    else next.set('tab', id)
    setParams(next, { replace: true })
  }

  const counts = { products: products.length, categories: categories.length, brands: brands.length, ranges: gammes.length }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[0.85rem] text-forest">Catalogue</p>
          <h1 className="mt-2 text-[clamp(2rem,3.6vw,3rem)] leading-[1] font-semibold tracking-[-0.04em]">Products & categories</h1>
          <p className="mt-3 max-w-xl text-ink-900/60">Add a product in under a minute: drop photos, pick (or create) its category and brand, set a price. Everything else is optional.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ open: true, editing: null, duplicateOf: null })}
          className="group/btn flex h-14 items-center gap-3 rounded-full bg-volt ps-6 pe-2 font-medium text-ink-900 transition-colors hover:bg-volt-300"
        >
          New product
          <span className="flex size-10 items-center justify-center rounded-full bg-ink-900 text-volt transition-transform duration-500 group-hover/btn:rotate-90">
            <Plus className="size-5" />
          </span>
        </button>
      </div>

      <div role="tablist" aria-label="Catalogue sections" className="flex w-full gap-1 overflow-x-auto rounded-full bg-ink-900/[0.035] p-1 ring-hair no-scrollbar sm:w-fit">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn('flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[0.93rem] transition-colors duration-300', tab === id ? 'bg-ink-900 text-white' : 'text-ink-900/65 hover:text-ink-900')}
          >
            {label}
            <span className={cn('eyebrow rounded-full px-1.5 py-1', tab === id ? 'bg-ink-900/10' : 'bg-ink-900/[0.06]')}>{counts[id]}</span>
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <ProductsTab
          products={products}
          categories={categories}
          brands={brands}
          loading={loading}
          onEdit={(p) => setEditor({ open: true, editing: p, duplicateOf: null })}
          onDuplicate={(p) => setEditor({ open: true, editing: null, duplicateOf: p })}
          onChanged={loadAll}
          onPatched={(saved) => setProducts((list) => list.map((p) => (p.id === saved.id ? { ...p, ...saved, category: p.category, brand: p.brand, gamme: p.gamme } : p)))}
        />
      )}
      {tab === 'categories' && <TaxonomyTab kind="category" items={categories} categories={categories} brands={brands} onChanged={loadTaxonomy} />}
      {tab === 'brands' && <TaxonomyTab kind="brand" items={brands} categories={categories} brands={brands} onChanged={loadTaxonomy} />}
      {tab === 'ranges' && <TaxonomyTab kind="gamme" items={gammes} categories={categories} brands={brands} onChanged={loadTaxonomy} />}

      <ProductEditor
        open={editor.open}
        editing={editor.editing}
        duplicateOf={editor.duplicateOf}
        categories={categories}
        brands={brands}
        gammes={gammes}
        onClose={() => setEditor((e) => ({ ...e, open: false }))}
        onTaxonomyChanged={loadTaxonomy}
        onSaved={async (saved, { another }) => {
          await Promise.all([loadProducts(), loadTaxonomy()])
          if (!another) setEditor((e) => ({ ...e, open: false }))
        }}
      />
    </div>
  )
}

export default function Products() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Catalogue />
      </ConfirmProvider>
    </ToastProvider>
  )
}
