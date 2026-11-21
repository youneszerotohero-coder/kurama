import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { cn } from '@/components/ui/Btn'
import { setJsonLd } from '@/lib/seo'
import { formatDA } from '@/lib/format'
import { useStore } from '@/context/StoreContext'

export default function Faq() {
  const { t } = useTranslation()
  const { minFreeDelivery } = useStore()
  const [open, setOpen] = useState(0)

  const items = useMemo(
    () => [
      [t('home.q1', 'Quels sont les délais de livraison ?'), t('home.a1', 'Comptez 24 à 72 h pour Alger et les wilayas proches, et 3 à 6 jours ouvrés pour le reste du pays. Vous êtes appelé pour confirmer la commande avant l’expédition.')],
      [t('home.q2', 'Comment se passe le paiement ?'), t('home.a2', 'Le paiement se fait en espèces à la livraison, à domicile ou au bureau de livraison (stop desk). Aucune avance n’est demandée.')],
      [
        t('home.q3', 'La livraison est-elle gratuite ?'),
        t('home.a3', 'Elle est offerte dès {{amount}} d’achat. En dessous, le tarif dépend de votre wilaya et du mode choisi ; il s’affiche avant la confirmation.', { amount: formatDA(minFreeDelivery) }),
      ],
      [t('home.q4', 'Puis-je obtenir un devis ou une facture proforma ?'), t('home.a4', 'Oui : ajoutez vos produits au panier puis cliquez sur « Télécharger le proforma ». Le PDF reprend chaque référence, quantité et prix.')],
      [t('home.q5', 'Le matériel est-il garanti ?'), t('home.a5', 'Tous nos produits sont neufs, d’origine et couverts par la garantie constructeur. En cas de défaut, contactez-nous : nous organisons l’échange.')],
      [t('home.q6', 'Je suis installateur : y a-t-il un espace pro ?'), t('home.a6', 'Créez un compte pour retrouver vos coordonnées pré-remplies, suivre vos commandes et préparer vos proformas plus vite.')],
    ],
    [t, minFreeDelivery],
  )

  useEffect(() => {
    setJsonLd('ld-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    })
    return () => setJsonLd('ld-faq', null)
  }, [items])

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-40 py-12 text-ink-900 md:py-16">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="faq-title" data-reveal className="text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight font-semibold tracking-[-0.035em]">
            {t('home.faqTitle', 'Questions fréquentes')}
          </h2>
          <p data-reveal className="mt-6 max-w-sm text-ink-900/62">
            {t('home.faqLead', 'Une autre question ? Appelez-nous, un conseiller technique vous répond.')}
          </p>
          <a data-reveal href={`tel:${t('store.phone').replace(/\s+/g, '')}`} className="mt-3 inline-block text-[1.2rem] text-forest" dir="ltr">
            <span className="link-line">{t('store.phone')}</span>
          </a>
        </div>

        <ul className="border-t border-ink-900/10 lg:col-span-8">
          {items.map(([q, a], i) => {
            const isOpen = open === i
            return (
              <li key={i} data-reveal className="border-b border-ink-900/10">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-5 text-start"
                  >
                    <span className={cn('text-[clamp(1.02rem,1.3vw,1.2rem)] tracking-[-0.015em] transition-colors', isOpen ? 'text-ink-900' : 'text-ink-900/80 group-hover:text-ink-900')}>{q}</span>
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-500 ease-[var(--ease-osmo)]',
                        isOpen ? 'rotate-45 bg-volt text-ink-900' : 'bg-ink-900/[0.06] text-ink-900/75',
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="collapse-grid" data-open={isOpen}>
                  <div>
                    <p className="max-w-[42rem] pb-7 leading-relaxed text-ink-900/65">{a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
