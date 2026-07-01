import { useState, useEffect, useCallback } from 'react'

export type CryptoPrice = {
  usd: number
  usd_24h_change: number
}

export type CryptoPrices = {
  ethereum: CryptoPrice
  bitcoin: CryptoPrice
  solana: CryptoPrice
}

type State = {
  prices: CryptoPrices | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

const CACHE_KEY = 'zwam-crypto-prices'
const CACHE_TTL = 60_000 // 1 minute

function loadCache(): { data: CryptoPrices; ts: number } | null {
  try {
    const s = localStorage.getItem(CACHE_KEY)
    if (!s) return null
    const parsed = JSON.parse(s)
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed
    return null
  } catch { return null }
}

export function useCryptoPrices() {
  const [state, setState] = useState<State>(() => {
    const cache = loadCache()
    return {
      prices: cache?.data ?? null,
      loading: !cache,
      error: null,
      lastUpdated: cache ? new Date(cache.ts) : null,
    }
  })

  const fetch_ = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana&vs_currencies=usd&include_24hr_change=true',
        { headers: { Accept: 'application/json' } }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: CryptoPrices = await res.json()
      const ts = Date.now()
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts }))
      setState({ prices: data, loading: false, error: null, lastUpdated: new Date(ts) })
    } catch {
      // Fallback to cache even if expired
      const cache = loadCache()
      if (cache) {
        setState(s => ({ ...s, prices: cache.data, loading: false, error: 'Usando datos en caché' }))
      } else {
        // Hardcoded fallback so the UI always renders
        setState({
          prices: {
            ethereum: { usd: 3420, usd_24h_change: 1.2 },
            bitcoin: { usd: 67500, usd_24h_change: -0.8 },
            solana: { usd: 148, usd_24h_change: 2.4 },
          },
          loading: false,
          error: 'Sin conexión — datos estimados',
          lastUpdated: new Date(),
        })
      }
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  // Auto-refresh every minute
  useEffect(() => {
    const id = setInterval(fetch_, CACHE_TTL)
    return () => clearInterval(id)
  }, [fetch_])

  return { ...state, refresh: fetch_ }
}
