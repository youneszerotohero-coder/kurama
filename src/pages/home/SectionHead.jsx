import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/components/ui/Btn'

/** Storefront section heading: title, optional subtitle, "see all" link and extra controls. */
export default function SectionHead({ id, title, subtitle, to, linkLabel, children, tone = 'dark', className = '' }) {
  return (
    <div className={cn('mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div data-reveal className="min-w-0">
        <h2 id={id} className={cn('text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight font-semibold tracking-[-0.035em]', tone === 'dark' ? 'text-ink-900' : 'text-ink-900')}>
          {title}
        </h2>
        {subtitle && <p className={cn('mt-1.5 text-[0.98rem]', tone === 'dark' ? 'text-ink-900/60' : 'text-stone-600')}>{subtitle}</p>}
      </div>
      <div data-reveal className="flex items-center gap-2">
        {children}
        {to && (
          <Link to={to} className={cn('group flex h-10 items-center gap-1.5 rounded-full px-4 text-[0.9rem] ring-hair transition-colors', tone === 'dark' ? 'text-ink-900/85 hover:bg-ink-900 hover:text-white' : 'text-ink-900 hover:bg-ink-900 hover:text-white')}>
            {linkLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
