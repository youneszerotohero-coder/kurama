import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Page, { SplitWords, useIntro } from '@/components/layout/Page'
import Btn from '@/components/ui/Btn'
import { setSeo } from '@/lib/seo'

export default function NotFound() {
  const { t } = useTranslation()
  const scope = useRef(null)
  useIntro(scope)
  useEffect(() => setSeo({ title: t('ui.notFound', 'Page introuvable'), noindex: true }), [t])

  return (
    <Page>
      <main id="main" ref={scope} className="relative flex min-h-[70svh] items-center overflow-hidden py-16">
        <div aria-hidden="true" className="grid-lines-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,#000_20%,transparent_75%)]" />
        <div className="container-x relative">
          <p data-intro className="eyebrow mb-6 flex items-center gap-2 text-ink-900/60">
            <span className="live-dot" /> {t('ui.err404', 'Erreur 404 — circuit ouvert')}
          </p>
          <h1 className="text-[clamp(2.4rem,6vw,5rem)] leading-[1] font-semibold tracking-[-0.045em]">
            <SplitWords text={t('ui.notFoundTitle', 'Plus de courant ici.')} />
          </h1>
          <p data-intro className="mt-6 max-w-xl text-lead text-ink-900/65">
            {t('ui.notFoundText', 'La page que vous cherchez a été déplacée ou n’existe plus. Repartons sur une ligne sous tension.')}
          </p>
          <div data-intro className="mt-10 flex flex-wrap gap-2.5">
            <Btn to="/" variant="volt" size="lg" chip>
              {t('nav.home')}
            </Btn>
            <Btn to="/shop" variant="ghost" size="lg">
              {t('nav.shop')}
            </Btn>
          </div>
        </div>
      </main>
    </Page>
  )
}
