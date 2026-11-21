import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { categoryLabel, formatNumber, isUploaded, productImage } from '@/lib/format'
import SectionHead from './SectionHead'

/** "Shop by category": each tile shows the category image, or one of its products. */
export default function CategoryTiles({ products }) {
  const { t } = useTranslation()
  const { categories, ready } = useStore()

  const tiles = useMemo(() => {
    const byCat = new Map()
    ;(products || []).forEach((p) => {
      const k = String(p.category || '').toLowerCase()
      if (k && !byCat.has(k)) byCat.set(k, productImage(p))
    })
    return categories.map((c) => ({ ...c, cover: isUploaded(c.image) ? c.image : byCat.get(c.name.toLowerCase()) || null }))
  }, [categories, products])

  if (ready && !categories.length) return null

  return (
    <section aria-labelledby="cats-title" className="container-x py-12 md:py-16">
      <SectionHead id="cats-title" title={t('home.catsTitle', 'Acheter par catégorie')} subtitle={t('home.catsSub', 'Trouvez la bonne référence en quelques clics.')} to="/shop" linkLabel={t('ui.allProducts', 'Tous les produits')} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {!ready &&
          Array.from({ length: 5 }, (_, i) => (
            <li key={`s${i}`} aria-hidden="true" className="rounded-[1.25rem] p-2 ring-hair">
              <div className="skeleton aspect-[4/3] rounded-[0.95rem]" />
              <div className="skeleton mx-1.5 mt-3 mb-1 h-4 w-2/3 rounded" />
            </li>
          ))}
        {tiles.slice(0, 11).map((c) => (
          <li key={c.id} data-reveal>
            <Link
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              className="group flex h-full flex-col rounded-[1.25rem] bg-white p-2 ring-hair transition-[box-shadow,background-color] duration-300 hover:bg-paper hover:shadow-[inset_0_0_0_1px_rgba(154,240,126,0.35)]"
            >
              <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[0.95rem] bg-paper">
                {c.cover ? (
                  <img src={c.cover} alt="" width="220" height="165" loading="lazy" className="h-full w-full object-contain p-[12%] mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110" />
                ) : (
                  <span className="text-[1.6rem] font-semibold tracking-[-0.04em] text-ink-900/70">{categoryLabel(t, c.name).slice(0, 2)}</span>
                )}
              </span>
              <span className="flex items-baseline justify-between gap-2 px-1.5 pt-3 pb-1">
                <span className="truncate text-[0.95rem] text-ink-900 group-hover:text-forest">{categoryLabel(t, c.name)}</span>
                <span className="tabular shrink-0 text-[0.78rem] text-ink-900/65">{formatNumber(c._count?.products ?? 0)}</span>
              </span>
            </Link>
          </li>
        ))}
        <li data-reveal>
          <Link to="/shop" className="group flex h-full min-h-[9rem] flex-col items-center justify-center gap-3 rounded-[1.25rem] bg-volt p-4 text-center text-ink-900 transition-colors hover:bg-volt-300">
            <span className="flex size-12 items-center justify-center rounded-full bg-ink-900 text-volt transition-transform duration-500 group-hover:rotate-90">
              <LayoutGrid className="size-5" />
            </span>
            <span className="text-[0.95rem] font-medium">{t('home.allCats', 'Tout le catalogue')}</span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
