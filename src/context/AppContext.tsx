import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { transactions as initialTxs, wallets as initialWallets, type Transaction, type Wallet } from '../data/mock'
import type { ConnectedWallet } from '../components/ConnectWalletModal'

type Currency = 'USD' | 'EUR' | 'MXN' | 'ARS' | 'COP'
type Language = 'Español' | 'English'

export type Profile = {
  name: string
  email: string
  plan: 'Free' | 'Pro' | 'Business'
  avatarColor: string
  bio: string
  phone: string
}

export type Settings = {
  theme: 'dark' | 'light'
  currency: Currency
  language: Language
  notifications: { gastos: boolean; resumen: boolean; ia: boolean; suscripciones: boolean }
  twoFactor: boolean
}

export type Budget = {
  category: string
  limit: number
}

type AppContextType = {
  transactions: Transaction[]
  wallets: Wallet[]
  connectedWallets: ConnectedWallet[]
  profile: Profile
  settings: Settings
  budgets: Budget[]
  addTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  clearTransactions: () => void
  addWallet: (w: Wallet) => void
  connectWeb3Wallet: (w: ConnectedWallet) => void
  disconnectWeb3Wallet: (id: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  updateSettings: (patch: Partial<Settings>) => void
  updateNotification: (key: keyof Settings['notifications'], val: boolean) => void
  setBudget: (category: string, limit: number) => void
  removeBudget: (category: string) => void
  exportCSV: () => void
  logout: () => void
}

const defaultProfile: Profile = {
  name: 'Juan Díaz',
  email: 'juan@zwam.ai',
  plan: 'Pro',
  avatarColor: '#6c63ff',
  bio: '',
  phone: '',
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

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? { ...fallback as object, ...JSON.parse(s) } as T : fallback
  } catch { return fallback }
}

function loadArr<T>(key: string, fallback: T[]): T[] {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadArr('zwam-txs', initialTxs))
  const [wallets, setWallets] = useState<Wallet[]>(() => loadArr('zwam-wallets', initialWallets))
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>(() => loadArr('zwam-web3', []))
  const [profile, setProfile] = useState<Profile>(() => load('zwam-profile', defaultProfile))
  const [settings, setSettings] = useState<Settings>(() => load('zwam-settings', defaultSettings))
  const [budgets, setBudgets] = useState<Budget[]>(() => loadArr('zwam-budgets', [
    { category: 'Alimentación', limit: 400 },
    { category: 'Vivienda', limit: 1200 },
    { category: 'Entretenimiento', limit: 100 },
    { category: 'Transporte', limit: 150 },
    { category: 'Salud', limit: 200 },
  ]))

  useEffect(() => { localStorage.setItem('zwam-txs', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem('zwam-wallets', JSON.stringify(wallets)) }, [wallets])
  useEffect(() => { localStorage.setItem('zwam-web3', JSON.stringify(connectedWallets)) }, [connectedWallets])
  useEffect(() => { localStorage.setItem('zwam-profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem('zwam-budgets', JSON.stringify(budgets)) }, [budgets])
  useEffect(() => {
    localStorage.setItem('zwam-settings', JSON.stringify(settings))
    applyTheme(settings.theme)
  }, [settings])

  useEffect(() => { applyTheme(settings.theme) }, [])

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev])
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

  const clearTransactions = () => {
    setTransactions([])
    setWallets(prev => prev.map(w => ({ ...w, balance: 0 })))
  }

  const addWallet = (w: Wallet) => setWallets(prev => [...prev, w])
  const connectWeb3Wallet = (w: ConnectedWallet) => setConnectedWallets(prev => [...prev, w])
  const disconnectWeb3Wallet = (id: string) => setConnectedWallets(prev => prev.filter(w => w.id !== id))
  const updateProfile = (patch: Partial<Profile>) => setProfile(prev => ({ ...prev, ...patch }))
  const updateSettings = (patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch }))
  const updateNotification = (key: keyof Settings['notifications'], val: boolean) =>
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: val } }))

  const setBudget = (category: string, limit: number) =>
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category)
      if (exists) return prev.map(b => b.category === category ? { ...b, limit } : b)
      return [...prev, { category, limit }]
    })

  const removeBudget = (category: string) =>
    setBudgets(prev => prev.filter(b => b.category !== category))

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

  const logout = () => {
    localStorage.removeItem('zwam-auth-email')
    setProfile(defaultProfile)
  }

  return (
    <AppContext.Provider value={{
      transactions, wallets, connectedWallets, profile, settings, budgets,
      addTransaction, deleteTransaction, clearTransactions, addWallet, connectWeb3Wallet, disconnectWeb3Wallet,
      updateProfile, updateSettings, updateNotification,
      setBudget, removeBudget, exportCSV, logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
