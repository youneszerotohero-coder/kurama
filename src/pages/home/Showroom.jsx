import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Clock, Navigation } from 'lucide-react'

/** Compact showroom block: photo + address, hours, phone, directions. */
export default function Showroom() {
  const { t } = useTranslation()
  const phone = t('store.phone')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`ElectroHub ${t('store.address')}`)}`

  return (
    <section aria-labelledby="showroom-title" className="container-x py-10 md:py-14">
      <div className="grid overflow-hidden rounded-[1.75rem] bg-paper text-ink-900 lg:grid-cols-2">
        <div className="relative min-h-[16rem]" data-reveal>
          <img
            src="/img/store-735.webp"
            srcSet="/img/store-480.webp 480w, /img/store-735.webp 735w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt={t('home.showAlt', 'Le showroom ElectroHub : éclairage, interrupteurs, prises et accessoires')}
            width="735"
            height="490"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="p-7 sm:p-10">
          <p data-reveal className="text-[0.85rem] font-medium text-forest">
            {t('home.showEyebrow', 'Showroom')}
          </p>
          <h2 id="showroom-title" data-reveal className="mt-2 text-[clamp(1.7rem,2.8vw,2.5rem)] leading-tight font-semibold tracking-[-0.04em]">
            {t('store.title')}
          </h2>
          <p data-reveal className="mt-3 text-stone-600">
            {t('store.subtitle')}
          </p>
          <ul className="mt-6 space-y-3 text-[0.95rem]">
            <li data-reveal className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-forest" /> {t('store.address')}
            </li>
            <li data-reveal className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-forest" /> {t('store.weekdays')} · {t('store.friday')}
            </li>
            <li data-reveal className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-forest" />
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:underline" dir="ltr">
                {phone}
              </a>
            </li>
          </ul>
          <a
            data-reveal
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-ink-900 px-6 text-[0.95rem] font-medium text-white transition-colors hover:bg-forest"
          >
            <Navigation className="size-4 text-forest" /> {t('home.showDirections', 'Itinéraire')}
          </a>
        </div>
      </div>
    </section>
  )
}
