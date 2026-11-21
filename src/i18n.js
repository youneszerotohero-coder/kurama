import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'

/*
  French is the store's main language and ships with the app. English and Arabic are
  loaded on demand, so visitors only download the language they actually read.
*/
export const LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'ع', name: 'العربية' },
  { code: 'en', label: 'EN', name: 'English' },
]

const STORAGE_KEY = 'i18nextLng'
const supported = LANGUAGES.map((l) => l.code)

const loaders = {
  en: () => import('./locales/en.json'),
  ar: () => import('./locales/ar.json'),
}

function detect() {
  if (typeof window === 'undefined') return 'fr'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && supported.includes(stored.slice(0, 2))) return stored.slice(0, 2)
  } catch {
    /* storage unavailable */
  }
  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('ar') ? 'ar' : 'fr'
}

let arabicFont = null
function applyDocument(lng) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.lang = lng
  html.dir = lng === 'ar' ? 'rtl' : 'ltr'
  if (lng === 'ar' && !arabicFont) arabicFont = import('@fontsource-variable/noto-kufi-arabic/wght.css')
}

async function ensure(lng) {
  if (!loaders[lng] || i18n.hasResourceBundle(lng, 'translation')) return
  const mod = await loaders[lng]()
  i18n.addResourceBundle(lng, 'translation', mod.default || mod, true, true)
}

/** Switches language (loading it first when needed) and remembers the choice. */
export async function changeLanguage(lng) {
  if (!supported.includes(lng)) return
  await ensure(lng)
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
  await i18n.changeLanguage(lng)
}

i18n.on('languageChanged', applyDocument)

/** Resolves once the detected language is ready to render. */
export async function initI18n() {
  const lng = detect()
  await i18n.use(initReactI18next).init({
    resources: { fr: { translation: fr } },
    lng: 'fr',
    fallbackLng: 'fr',
    supportedLngs: supported,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })
  if (lng !== 'fr') {
    try {
      await ensure(lng)
      await i18n.changeLanguage(lng)
    } catch {
      /* stay in French */
    }
  }
  applyDocument(i18n.language)
  return i18n
}

export default i18n
