import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, UserRound, ClipboardList, FileDown } from 'lucide-react'
import { prefersReducedMotion } from '@/lib/motion'
import Btn from '@/components/ui/Btn'

/** Professional accounts band, with an animated proforma document. */
export default function ProBand() {
  const { t } = useTranslation()
  const root = useRef(null)

  // The proforma "prints" itself when it scrolls into view: lines draw in, then the total pops
  const [printed, setPrinted] = useState(false)
  useEffect(() => {
    const doc = root.current?.querySelector('[data-doc]')
    if (!doc || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return setPrinted(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setPrinted(true), io.disconnect()), { rootMargin: '0px 0px -15% 0px' })
    io.observe(doc)
    return () => io.disconnect()
  }, [])

  const perks = [
    [UserRound, t('home.pro1', 'Coordonnées pré-remplies à chaque commande')],
    [ClipboardList, t('home.pro2', 'Historique et suivi de toutes vos commandes')],
    [FileDown, t('home.pro3', 'Proforma PDF daté et référencé, prêt pour la compta')],
  ]

  return (
    <section ref={root} aria-labelledby="pro-title" className="container-x py-10 md:py-14">
      <div className="relative isolate grid items-center gap-10 overflow-hidden rounded-[1.75rem] bg-white p-7 ring-hair sm:p-10 lg:grid-cols-12 lg:p-14">
        <div aria-hidden="true" className="absolute -top-1/2 -left-1/4 -z-10 h-[150%] w-[70%] bg-[radial-gradient(closest-side,rgba(47,107,51,0.35),transparent)]" />
        <div className="lg:col-span-7">
          <p data-reveal className="inline-flex items-center gap-2 rounded-full bg-volt/25 px-3 py-1.5 text-[0.82rem] text-forest">
            {t('home.proBadge', 'Comptes professionnels')}
          </p>
          <h2 id="pro-title" data-reveal className="mt-5 text-[clamp(2rem,3.6vw,3.2rem)] leading-[1] font-semibold tracking-[-0.045em] text-ink-900">
            {t('home.proBandTitle', 'Installateurs, entreprises :')} <span className="text-forest">{t('home.proBandTitle2', 'commandez plus vite.')}</span>
          </h2>
          <ul className="mt-7 space-y-3">
            {perks.map(([Icon, label]) => (
              <li key={label} data-reveal className="flex items-center gap-3 text-ink-900/80">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-900/[0.06] text-forest">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-8 flex flex-wrap gap-2.5">
            <Btn to="/login" variant="volt" size="lg" chip>
              {t('home.proAccount', 'Créer un compte pro')}
            </Btn>
            <Btn to="/shop" variant="ghost" size="lg">
              {t('home.proCta', 'Composer mon devis')}
            </Btn>
          </div>
        </div>

        {/* Proforma mock */}
        <div className="flex justify-center lg:col-span-5">
          <div data-doc data-printed={printed} className="doc-print w-full max-w-[21rem] rotate-[-2.5deg] rounded-2xl bg-white p-6 text-ink-900 shadow-[0_40px_80px_-30px_rgba(10,12,11,0.45)] ring-1 ring-ink-900/[0.06]" aria-hidden="true">
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-2 text-[0.85rem] font-semibold">
                <span className="size-5 rounded-full bg-volt" /> ElectroHub
              </span>
              <span className="text-end text-[0.7rem] leading-tight text-stone-600">
                PROFORMA
                <br />
                PRO-482931
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {[78, 64, 86, 52, 70].map((w, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span data-doc-line className="h-2 rounded-full bg-ink-900/[0.12]" style={{ width: `${w}%`, transitionDelay: `${0.3 + i * 0.08}s` }} />
                  <span data-doc-line className="h-2 w-10 rounded-full bg-ink-900/[0.18]" style={{ transitionDelay: `${0.35 + i * 0.08}s` }} />
                </div>
              ))}
            </div>
            <div data-doc-total className="mt-6 flex items-center justify-between rounded-xl bg-ink-900 px-4 py-3 text-volt">
              <span className="text-[0.75rem] font-medium">TOTAL</span>
              <span className="tabular text-[1.05rem] font-semibold">248 600 DA</span>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[0.72rem] text-stone-600">
              <Check className="size-3.5 text-forest" /> {t('home.proValid', 'Valable 15 jours')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
