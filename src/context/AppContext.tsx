import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { transactions as initialTxs, type Transaction } from '../data/mock'

type Currency = 'USD' | 'EUR' | 'MXN' | 'ARS' | 'COP'
type Language = 'Español' | 'English'

type Settings = {
  theme: 'dark' | 'light'
  currency: Currency
  language: Language
  notifications: {
    gastos: boolean
    resumen: boolean
    ia: boolean
    suscripciones: boolean
  }
  twoFactor: boolean
}

type AppContextType = {
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  updateNotification: (key: keyof Settings['notifications'], val: boolean) => void
}

const defaultSettings: Settings = {
  theme: 'dark',
  currency: 'USD',
  language: 'Español',
  notifications: { gastos: true, resumen: true, ia: true, suscripciones: false },
  twoFactor: false,
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTxs)
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('zwam-settings')
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
    } catch { return defaultSettings }
  })

  useEffect(() => {
    localStorage.setItem('zwam-settings', JSON.stringify(settings))
    const root = document.documentElement
    if (settings.theme === 'light') {
      root.style.setProperty('--bg-primary', '#f4f4f8')
      root.style.setProperty('--bg-secondary', '#eaeaf0')
      root.style.setProperty('--bg-card', '#ffffff')
      root.style.setProperty('--bg-card-hover', '#f0f0f7')
      root.style.setProperty('--border', '#dddde8')
      root.style.setProperty('--text-primary', '#111118')
      root.style.setProperty('--text-secondary', '#55556a')
      root.style.setProperty('--text-dim', '#9999b0')
    } else {
      root.style.setProperty('--bg-primary', '#0a0a0f')
      root.style.setProperty('--bg-secondary', '#111118')
      root.style.setProperty('--bg-card', '#16161f')
      root.style.setProperty('--bg-card-hover', '#1c1c28')
      root.style.setProperty('--border', '#2a2a3a')
      root.style.setProperty('--text-primary', '#f0f0f8')
      root.style.setProperty('--text-secondary', '#9090a8')
      root.style.setProperty('--text-dim', '#5a5a72')
    }
  }, [settings])

  const addTransaction = (tx: Transaction) =>
    setTransactions(prev => [tx, ...prev])

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings(prev => ({ ...prev, ...patch }))

  const updateNotification = (key: keyof Settings['notifications'], val: boolean) =>
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: val },
    }))

  return (
    <AppContext.Provider value={{ transactions, addTransaction, settings, updateSettings, updateNotification }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
