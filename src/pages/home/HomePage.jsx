import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { setSeo } from '@/lib/seo'
import { promoOf } from '@/lib/format'
import Page from '@/components/layout/Page'
import Hero from './Hero'
import CategoryTiles from './CategoryTiles'
import ProductRail from './ProductRail'
import Brands from './Brands'
import ProBand from './ProBand'
import Showroom from './Showroom'
import Faq from './Faq'

export default function HomePage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('best')

  useEffect(() => {
    setSeo({ path: '/' })
    let alive = true
    api
      .getProducts({ limit: 40 })
      .then((data) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const list = useMemo(() => products || [], [products])
  const newest = list.slice(0, 12)

  const tabs = useMemo(() => {
    const all = [
      { id: 'best', label: t('home.tabBest', 'Meilleures ventes'), items: list.filter((p) => p.tag === 'BEST_SELLER' || p.tag === 'TRENDING') },
      { id: 'promo', label: t('home.tabPromo', 'Promotions'), items: list.filter((p) => p.tag === 'SALE' || promoOf(p) > 0) },
      { id: 'rated', label: t('home.tabRated', 'Les mieux notés'), items: [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12) },
    ]
    return all.filter((x) => x.items.length > 0)
  }, [list, t])
  const current = tabs.find((x) => x.id === tab) || tabs[0]

  return (
    <Page deps={[products]}>
      <main id="main">
        <Hero products={products} />
        <CategoryTiles products={products} />
        <ProductRail id="new-title" title={t('home.newTitle', 'Nouveautés')} subtitle={t('home.newSub', 'Les dernières références arrivées en stock.')} products={newest} loading={loading} to="/shop" linkLabel={t('ui.seeAll', 'Tout voir')} />
        {current && (
          <ProductRail
            id="sel-title"
            title={t('home.selTitle', 'Notre sélection')}
            subtitle={t('home.selSub', 'Ce que les pros commandent le plus en ce moment.')}
            products={current.items}
            loading={loading}
            to={current.id === 'promo' ? '/shop?promo=1' : '/shop?sort=rating'}
            linkLabel={t('ui.seeAll', 'Tout voir')}
            tabs={tabs}
            tab={current.id}
            onTab={setTab}
          />
        )}
        <Brands />
        <ProBand />
        <Showroom />
        <Faq />
      </main>
    </Page>
  )
}
