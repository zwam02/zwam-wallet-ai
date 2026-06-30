import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { transactions as initialTxs, wallets as initialWallets, type Transaction, type Wallet } from '../data/mock'

type Currency = 'USD' | 'EUR' | 'MXN' | 'ARS' | 'COP'
type Language = 'Español' | 'English'

export type Settings = {
  theme: 'dark' | 'light'
  currency: Currency
  language: Language
  notifications: { gastos: boolean; resumen: boolean; ia: boolean; suscripciones: boolean }
  twoFactor: boolean
}

type AppContextType = {
  transactions: Transaction[]
  wallets: Wallet[]
  addTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  addWallet: (w: Wallet) => void
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  updateNotification: (key: keyof Settings['notifications'], val: boolean) => void
  exportCSV: () => void
}

const defaultSettings: Settings = {
  theme: 'dark',
  currency: 'USD',
  language: 'Español',
  notifications: { gastos: true, resumen: true, ia: true, suscripciones: false },
  twoFactor: false,
}

function applyTheme(theme: 'dark' | 'light') {
  const r = document.documentElement
  if (theme === 'light') {
    r.style.setProperty('--bg-primary', '#f0f0f6')
    r.style.setProperty('--bg-secondary', '#e4e4ee')
    r.style.setProperty('--bg-card', '#ffffff')
    r.style.setProperty('--bg-card-hover', '#f5f5fc')
    r.style.setProperty('--border', '#d8d8e8')
    r.style.setProperty('--text-primary', '#0e0e18')
    r.style.setProperty('--text-secondary', '#55556a')
    r.style.setProperty('--text-dim', '#9999b0')
  } else {
    r.style.setProperty('--bg-primary', '#0a0a0f')
    r.style.setProperty('--bg-secondary', '#111118')
    r.style.setProperty('--bg-card', '#16161f')
    r.style.setProperty('--bg-card-hover', '#1c1c28')
    r.style.setProperty('--border', '#2a2a3a')
    r.style.setProperty('--text-primary', '#f0f0f8')
    r.style.setProperty('--text-secondary', '#9090a8')
    r.style.setProperty('--text-dim', '#5a5a72')
  }
}

function loadTxs(): Transaction[] {
  try {
    const s = localStorage.getItem('zwam-txs')
    return s ? JSON.parse(s) : initialTxs
  } catch { return initialTxs }
}

function loadWallets(): Wallet[] {
  try {
    const s = localStorage.getItem('zwam-wallets')
    return s ? JSON.parse(s) : initialWallets
  } catch { return initialWallets }
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTxs)
  const [wallets, setWallets] = useState<Wallet[]>(loadWallets)
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const s = localStorage.getItem('zwam-settings')
      return s ? { ...defaultSettings, ...JSON.parse(s) } : defaultSettings
    } catch { return defaultSettings }
  })

  useEffect(() => { localStorage.setItem('zwam-txs', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem('zwam-wallets', JSON.stringify(wallets)) }, [wallets])
  useEffect(() => {
    localStorage.setItem('zwam-settings', JSON.stringify(settings))
    applyTheme(settings.theme)
  }, [settings])

  // apply theme on mount
  useEffect(() => { applyTheme(settings.theme) }, [])

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev])
    // update wallet balance
    setWallets(prev => prev.map(w =>
      w.id === tx.wallet
        ? { ...w, balance: w.balance + (tx.type === 'income' ? tx.amount : -tx.amount) }
        : w
    ))
  }

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id)
    if (!tx) return
    setTransactions(prev => prev.filter(t => t.id !== id))
    setWallets(prev => prev.map(w =>
      w.id === tx.wallet
        ? { ...w, balance: w.balance - (tx.type === 'income' ? tx.amount : -tx.amount) }
        : w
    ))
  }

  const addWallet = (w: Wallet) => setWallets(prev => [...prev, w])

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings(prev => ({ ...prev, ...patch }))

  const updateNotification = (key: keyof Settings['notifications'], val: boolean) =>
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: val } }))

  const exportCSV = () => {
    const rows = [['ID', 'Descripción', 'Monto', 'Tipo', 'Categoría', 'Fecha', 'Billetera']]
    transactions.forEach(t => rows.push([t.id, t.description, String(t.amount), t.type, t.category, t.date, t.wallet]))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'zwam-transacciones.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppContext.Provider value={{ transactions, wallets, addTransaction, deleteTransaction, addWallet, settings, updateSettings, updateNotification, exportCSV }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
