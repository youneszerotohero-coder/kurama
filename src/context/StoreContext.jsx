import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'

/*
  Catalogue reference data (categories, brands, ranges) and public settings, fetched once
  and shared by the header menus, the home page, the shop filters and the footer.
*/
const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [gammes, setGammes] = useState([])
  const [settings, setSettings] = useState({ minFreeDelivery: 15000 })
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const [cats, brs, gms, st] = await Promise.all([
      api.getCategories().catch(() => []),
      api.getBrands().catch(() => []),
      api.getGammes().catch(() => []),
      api.getPublicSettings().catch(() => null),
    ])
    setCategories(Array.isArray(cats) ? cats : [])
    setBrands(Array.isArray(brs) ? brs : [])
    setGammes(Array.isArray(gms) ? gms : [])
    if (st && st.minFreeDelivery !== undefined) setSettings({ ...st, minFreeDelivery: Number(st.minFreeDelivery) })
    setReady(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ categories, brands, gammes, settings, ready, refresh, minFreeDelivery: settings.minFreeDelivery ?? 15000 }),
    [categories, brands, gammes, settings, ready, refresh],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
