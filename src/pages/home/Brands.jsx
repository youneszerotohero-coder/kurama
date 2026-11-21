import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/context/StoreContext'
import { formatNumber, isUploaded } from '@/lib/format'
import SectionHead from './SectionHead'

/** "Shop by brand" grid. */
export default function Brands() {
  const { t } = useTranslation()
  const { brands } = useStore()
  if (!brands.length) return null

  return (
    <section aria-labelledby="brands-title" className="container-x py-10 md:py-14">
      <SectionHead id="brands-title" title={t('home.brandsTitle', 'Nos marques')} subtitle={t('home.brandsSub', 'Matériel d’origine, acheté chez les distributeurs officiels.')} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.slice(0, 12).map((b) => (
          <li key={b.id} data-reveal>
            <Link
              to={`/shop?brand=${encodeURIComponent(b.name)}`}
              className="group flex h-28 flex-col items-center justify-center gap-1.5 rounded-[1.25rem] bg-white px-4 text-center ring-hair transition-colors duration-300 hover:bg-paper"
            >
              {isUploaded(b.image) ? (
                <span className="flex h-10 w-full items-center justify-center rounded-lg bg-paper px-2 group-hover:bg-transparent">
                  <img src={b.image} alt={b.name} width="120" height="40" loading="lazy" className="max-h-8 w-auto object-contain mix-blend-multiply" />
                </span>
              ) : (
                <span className="text-[1.2rem] font-bold tracking-[-0.03em] text-ink-900 transition-colors group-hover:text-ink-900">{b.name}</span>
              )}
              <span className="text-[0.78rem] text-ink-900/65 transition-colors group-hover:text-stone-600">
                {formatNumber(b._count?.products ?? 0)} {t('ui.productsWord', 'produits')}
                {b.origin ? ` · ${b.origin}` : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
