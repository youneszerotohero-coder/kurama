import { useTranslation } from 'react-i18next'
import { LANGUAGES, changeLanguage } from '@/i18n'
import { cn } from '@/components/ui/Btn'

/** Segmented FR / ع / EN switch. */
export default function LanguageSwitch({ className = '', tone = 'dark' }) {
  const { i18n, t } = useTranslation()
  const current = i18n.resolvedLanguage || i18n.language
  return (
    <div
      role="group"
      aria-label={t('ui.language', 'Langue')}
      className={cn('items-center gap-0.5 rounded-full p-1', tone === 'dark' ? 'bg-ink-900/[0.05] ring-hair' : 'bg-ink-900/5', className)}
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          onClick={() => changeLanguage(l.code)}
          aria-pressed={current === l.code}
          title={l.name}
          className={cn(
            'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[0.78rem] font-semibold transition-colors duration-300',
            current === l.code ? 'bg-ink-900 text-white' : tone === 'dark' ? 'text-ink-900/65 hover:text-ink-900' : 'text-ink-900/60 hover:text-ink-900',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
