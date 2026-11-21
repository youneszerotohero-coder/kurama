import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, CornerDownLeft } from 'lucide-react'
import api from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { lockScroll, unlockScroll } from '@/lib/motion'
import { categoryLabel, finalPrice, formatDA, productImage } from '@/lib/format'
import { ArrowChip, cn } from '@/components/ui/Btn'

import { SEARCH_EVENT as EVENT } from './searchBus'

export default function SearchOverlay() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { categories, brands } = useStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const input = useRef(null)

  // Loaded lazily: open straight away when a search was requested before the code arrived
  useEffect(() => {
    if (window.__ehSearchRequested) setOpen(true)
    window.__ehSearchRequested = false
  }, [])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(e.target?.tagName) || e.target?.isContentEditable
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener(EVENT, onOpen)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener(EVENT, onOpen)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    lockScroll('search')
    const id = setTimeout(() => input.current?.focus(), 60)
    return () => {
      clearTimeout(id)
      unlockScroll('search')
    }
  }, [open])

  useEffect(() => {
    const q = query.trim()
    setActive(0)
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    let cancelled = false
    const id = setTimeout(async () => {
      try {
        const data = await api.getProducts({ search: q, limit: 8 })
        if (!cancelled) setResults(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [query])

  const close = () => setOpen(false)
  const submit = (e) => {
    e.preventDefault()
    const pick = query.trim().length >= 2 ? results[active] : null
    if (pick) {
      navigate(`/product/${pick.id}`)
    } else if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
    }
    close()
  }

  const onKeyDown = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    }
  }

  const suggestions = [t('search.breakers'), t('search.cables'), t('search.switches'), t('search.monitors')]

  return (
    <div
      className={cn('fixed inset-0 z-[160] transition-[visibility] duration-500', open ? 'visible' : 'invisible')}
      role="dialog"
      aria-modal="true"
      aria-label={t('search.btn')}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={cn('absolute inset-0 bg-ink-900/40 backdrop-blur-md transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
      />
      <div
        className={cn(
          'relative mx-auto mt-[max(4.5rem,9vh)] w-[min(52rem,calc(100%-2rem))] overflow-hidden rounded-[1.75rem] bg-white shadow-[inset_0_0_0_1px_rgba(10,12,11,0.1),0_50px_100px_-30px_rgba(0,0,0,0.9)] transition-[opacity,transform] duration-500 ease-[var(--ease-osmo)]',
          open ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0',
        )}
      >
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink-900/[0.08] px-5 sm:px-7">
          <Search className="size-5 shrink-0 text-forest" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            className="display h-20 min-w-0 flex-1 bg-transparent text-[clamp(1.2rem,2.6vw,1.8rem)] tracking-[-0.03em] text-ink-900 placeholder:text-ink-900/60 focus:outline-none"
          />
          <button type="button" onClick={close} className="flex size-10 items-center justify-center rounded-full bg-ink-900/[0.06] text-ink-900/75 hover:text-ink-900" aria-label={t('ui.close', 'Fermer')}>
            <X className="size-4" />
          </button>
        </form>

        <div className="max-h-[62vh] overflow-y-auto p-3 sm:p-4">
          {query.trim().length < 2 ? (
            <div className="grid gap-6 p-3 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-3 text-ink-900/65">{t('search.trending')}</p>
                <ul className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => setQuery(s)} className="rounded-full bg-ink-900/[0.05] px-3.5 py-2 text-[0.88rem] text-ink-900/85 ring-hair hover:bg-ink-900/[0.1]">
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-3 text-ink-900/65">{t('nav.categories')}</p>
                <ul className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <Link to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={close} className="rounded-full bg-ink-900/[0.05] px-3.5 py-2 text-[0.88rem] text-ink-900/85 ring-hair hover:bg-volt hover:text-ink-900">
                        {categoryLabel(t, c.name)}
                      </Link>
                    </li>
                  ))}
                  {brands.slice(0, 6).map((b) => (
                    <li key={`b-${b.id}`}>
                      <Link to={`/shop?brand=${encodeURIComponent(b.name)}`} onClick={close} className="rounded-full px-3.5 py-2 text-[0.88rem] text-ink-900/62 ring-hair hover:text-ink-900">
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : loading && !results.length ? (
            <ul className="space-y-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="skeleton h-[4.5rem] rounded-2xl" />
              ))}
            </ul>
          ) : results.length ? (
            <ul className="space-y-1">
              {results.map((p, i) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.id}`}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className={cn('group/card flex items-center gap-4 rounded-2xl p-2.5 transition-colors', active === i ? 'bg-ink-900/[0.07]' : 'hover:bg-ink-900/[0.04]')}
                  >
                    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                      <img src={productImage(p)} alt="" width="56" height="56" loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block text-forest">{p.brand || categoryLabel(t, p.category)}</span>
                      <span className="mt-1 block truncate text-ink-900">{p.name}</span>
                      <span className="eyebrow text-ink-900/62">{p.ref}</span>
                    </span>
                    <span className="tabular shrink-0 text-ink-900/90">{formatDA(finalPrice(p))}</span>
                    <ArrowChip group="card" className="hidden size-8 bg-ink-900/[0.06] text-ink-900/75 group-hover/card:bg-volt group-hover/card:text-ink-900 sm:inline-flex" iconClassName="size-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="display text-2xl text-ink-900">{t('search.noResults', 'Aucun résultat')}</p>
              <p className="mt-2 text-ink-900/60">{t('search.noResultsDesc', 'Essayez une autre référence ou un autre mot-clé.')}</p>
            </div>
          )}
        </div>

        {query.trim().length >= 2 && (
          <button
            type="button"
            onClick={() => {
              navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
              close()
            }}
            className="flex w-full items-center justify-between gap-3 border-t border-ink-900/[0.08] px-6 py-4 text-start text-ink-900/75 transition-colors hover:bg-ink-900/[0.04] hover:text-ink-900"
          >
            <span>
              {t('ui.seeAllResults', 'Voir tous les résultats pour')} « <span className="text-ink-900">{query.trim()}</span> »
            </span>
            <CornerDownLeft className="size-4 text-forest" />
          </button>
        )}
      </div>
    </div>
  )
}
