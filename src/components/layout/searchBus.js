/* Tiny event bus so any component can open the (lazy-loaded) search overlay */
export const SEARCH_EVENT = 'eh:search'

export function openSearch() {
  // Remembered for an overlay that is still loading; it clears the flag once mounted
  window.__ehSearchRequested = true
  window.dispatchEvent(new Event(SEARCH_EVENT))
}
