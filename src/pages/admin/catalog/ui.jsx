import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Check, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/components/ui/Btn'

/* Small building blocks shared by the catalogue screens */

export function Field({ label, hint, error, required, className = '', children }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.82rem]">
        <span className="text-ink-900/75">
          {label}
          {required && <span className="text-forest"> *</span>}
        </span>
        {error ? <span className="text-[#d93025]">{error}</span> : hint ? <span className="text-ink-900/62">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

export function Section({ index, title, subtitle, children, aside }) {
  return (
    <section className="rounded-[1.25rem] bg-ink-900/[0.025] p-5 ring-hair sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2.5 text-[1.05rem] tracking-[-0.01em] text-ink-900">
            {index && <span className="eyebrow rounded-[0.2rem] bg-volt px-1.5 py-[0.3em] text-ink-900">{index}</span>}
            {title}
          </p>
          {subtitle && <p className="mt-1 text-[0.85rem] text-ink-900/65">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function IconBtn({ label, className = '', tone = 'default', ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 disabled:opacity-30',
        tone === 'danger' ? 'text-ink-900/60 hover:bg-[#ff6b5e]/12 hover:text-[#d93025]' : 'text-ink-900/62 hover:bg-ink-900/[0.08] hover:text-ink-900',
        className,
      )}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------- toasts */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const id = useRef(0)
  const push = useCallback((message, tone = 'success') => {
    const key = ++id.current
    setItems((list) => [...list, { key, message, tone }])
    setTimeout(() => setItems((list) => list.filter((x) => x.key !== key)), tone === 'error' ? 6000 : 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 z-[200] flex flex-col gap-2 ltr:right-4 rtl:left-4" aria-live="polite">
        {items.map((x) => (
          <div
            key={x.key}
            className="pointer-events-auto flex max-w-sm animate-[toast-in_0.5s_var(--ease-out-expo)] items-center gap-3 rounded-2xl bg-paper py-3 ps-3 pe-2 text-[0.9rem] text-ink-900 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] ring-hair"
          >
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', x.tone === 'error' ? 'bg-[#ff6b5e] text-ink-900' : 'bg-volt text-ink-900')}>
              {x.tone === 'error' ? <AlertTriangle className="size-4" /> : <Check className="size-4" />}
            </span>
            <span className="flex-1">{x.message}</span>
            <IconBtn label="Dismiss" onClick={() => setItems((l) => l.filter((y) => y.key !== x.key))}>
              <X className="size-3.5" />
            </IconBtn>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/** Confirm dialog driven by a promise: `const ok = await confirm({...})`. */
const ConfirmCtx = createContext(async () => false)
export const useConfirm = () => useContext(ConfirmCtx)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), [])
  const close = (v) => {
    state?.resolve(v)
    setState(null)
  }
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
          <button type="button" aria-hidden="true" tabIndex={-1} className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="relative w-full max-w-sm rounded-[1.5rem] bg-white p-6 ring-hair">
            <p id="confirm-title" className="display text-[1.4rem] tracking-[-0.03em] text-ink-900">
              {state.title}
            </p>
            {state.text && <p className="mt-2 text-[0.92rem] text-ink-900/62">{state.text}</p>}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => close(false)} className="h-11 rounded-full bg-ink-900/[0.06] text-ink-900/85 ring-hair hover:bg-ink-900/[0.1]">
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={cn('h-11 rounded-full font-medium', state.danger ? 'bg-[#ff6b5e] text-ink-900 hover:bg-[#ff8a80]' : 'bg-volt text-ink-900 hover:bg-volt-300')}
              >
                {state.confirm || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  )
}
