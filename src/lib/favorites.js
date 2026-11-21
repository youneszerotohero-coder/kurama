import { useSyncExternalStore } from 'react'

const KEY = 'kurama_favorites'
const listeners = new Set()

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v.map(Number) : []
  } catch {
    return []
  }
}

let snapshot = read()

function emit() {
  snapshot = read()
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key === KEY) emit()
  })
}

export function toggleFavorite(id) {
  const n = Number(id)
  const next = snapshot.includes(n) ? snapshot.filter((x) => x !== n) : [...snapshot, n]
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  emit()
  return next.includes(n)
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

const NONE = []

/** Live list of favourite product ids (shared across every component). */
export function useFavorites() {
  // The server snapshot is empty so hydration matches the prerendered HTML
  return useSyncExternalStore(subscribe, () => snapshot, () => NONE)
}

export function useIsFavorite(id) {
  const favs = useFavorites()
  return favs.includes(Number(id))
}
