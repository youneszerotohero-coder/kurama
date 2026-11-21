import { Link } from 'react-router-dom'

// Plain class join (tailwind-merge stays out of the public bundle)
export const cn = (...c) => c.filter(Boolean).join(' ')

const variants = {
  volt: 'bg-volt text-ink-900 hover:bg-volt-300',
  light: 'bg-white text-ink-900 shadow-[inset_0_0_0_1px_rgba(10,12,11,0.1)] hover:bg-paper',
  dark: 'bg-ink-900 text-white hover:bg-forest',
  ghost: 'bg-white text-ink-900 shadow-[inset_0_0_0_1px_rgba(10,12,11,0.14)] hover:bg-paper',
  outline: 'text-current shadow-[inset_0_0_0_1px_currentColor] hover:bg-current/[0.06]',
  danger: 'bg-[#d93025]/10 text-[#b3261e] shadow-[inset_0_0_0_1px_rgba(217,48,37,0.3)] hover:bg-[#d93025]/15',
}

const sizes = {
  xs: 'h-8 px-3 text-[0.8rem]',
  sm: 'h-9 px-4 text-[0.875rem]',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-7 text-[1.02rem]',
}

/** Button label (kept as a component so every button renders its text the same way). */
export function Roll({ children, className = '' }) {
  return <span className={cn('block', className)}>{children}</span>
}

// Literal class lists so Tailwind can see them
const NUDGE = {
  btn: 'transition-transform duration-300 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5',
  card: 'transition-transform duration-300 group-hover/card:translate-x-0.5 rtl:group-hover/card:-translate-x-0.5',
}

/** Round arrow badge; the arrow nudges forward on hover. */
export function ArrowChip({ className = '', iconClassName = 'size-4', group = 'btn' }) {
  return (
    <span className={cn('relative inline-flex size-9 shrink-0 items-center justify-center rounded-full', className)}>
      <Arrow className={cn(iconClassName, NUDGE[group] || NUDGE.btn)} />
    </span>
  )
}

export function Arrow({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('rtl:-scale-x-100', className)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Bolt({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.2 2 4.5 13.6h6.3L9.9 22l8.6-11.7h-6.3L13.2 2Z" />
    </svg>
  )
}

/** Brand mark: volt chip with the bolt + wordmark. */
export function Logo({ className = '', size = 'md' }) {
  const chip = size === 'lg' ? 'size-10' : 'size-8'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} dir="ltr">
      <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-volt text-ink-900 shadow-[0_0_24px_rgba(154,240,126,0.25)] transition-transform duration-700 ease-[var(--ease-osmo)] group-hover:rotate-[-12deg]', chip)}>
        <Bolt className="h-[55%] w-auto" />
      </span>
      <span className={cn('font-semibold tracking-[-0.02em] text-ink-900', size === 'lg' ? 'text-xl' : 'text-[1.08rem]')}>
        Electro<span className="text-forest">Hub</span>
      </span>
    </span>
  )
}

/**
 * Pill button with the rolling label.
 * `to` renders a router <Link>, `href` an <a>, otherwise a <button>.
 * `chip` adds the arrow badge at the end.
 */
export default function Btn({ to, href, variant = 'volt', size = 'md', chip = false, chipClassName, icon, children, className, ...props }) {
  const Comp = to ? Link : href ? 'a' : 'button'
  const linkProps = to ? { to } : href ? { href } : { type: props.type || 'button' }
  return (
    <Comp
      {...linkProps}
      className={cn(
        'group/btn relative inline-flex shrink-0 select-none items-center justify-center gap-2.5 rounded-full font-medium whitespace-nowrap tracking-[-0.01em] transition-[background-color,color,transform] duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        chip && 'pe-1.5',
        className,
      )}
      {...props}
    >
      {icon}
      <Roll>{children}</Roll>
      {chip && (
        <ArrowChip
          className={cn(
            size === 'lg' ? 'size-11' : size === 'sm' || size === 'xs' ? 'size-7' : 'size-8',
            variant === 'volt' || variant === 'light' ? 'bg-ink-900 text-volt' : 'bg-volt text-ink-900',
            chipClassName,
          )}
        />
      )}
    </Comp>
  )
}

/** Small section label: [index] Label */
export function Eyebrow({ index, children, tone = 'dark', className = '', ...rest }) {
  const dark = tone === 'dark'
  return (
    <p {...rest} className={cn('eyebrow inline-flex items-center gap-2', dark ? 'text-ink-900/62' : 'text-stone-600', className)}>
      {index && <span className={cn('rounded-[0.2rem] px-1.5 py-[0.3em]', dark ? 'bg-volt text-ink-900' : 'bg-ink-900 text-volt')}>{index}</span>}
      {children}
    </p>
  )
}
