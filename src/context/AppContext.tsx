import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type Transaction, type Wallet } from '../data/mock'
import type { ConnectedWallet } from '../components/ConnectWalletModal'
import type { PaymentMethod } from '../components/AddCardModal'

type Currency = 'USD' | 'EUR' | 'MXN' | 'ARS' | 'COP'
type Language = 'Español' | 'English'

export type Profile = {
  name: string
  email: string
  plan: 'Free' | 'Pro' | 'Business'
  avatarColor: string
  avatarEmoji: string
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

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', MXN: '$', ARS: '$', COP: '$',
}

export function fmtCurrency(amount: number, currency: Currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${symbol}${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type AppContextType = {
  transactions: Transaction[]
  wallets: Wallet[]
  connectedWallets: ConnectedWallet[]
  paymentMethods: PaymentMethod[]
  profile: Profile
  settings: Settings
  budgets: Budget[]
  addTransaction: (tx: Transaction) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  clearTransactions: () => void
  addWallet: (w: Wallet) => void
  updateWallet: (id: string, patch: Partial<Wallet>) => void
  deleteWallet: (id: string) => void
  connectWeb3Wallet: (w: ConnectedWallet) => void
  disconnectWeb3Wallet: (id: string) => void
  addPaymentMethod: (m: PaymentMethod) => void
  removePaymentMethod: (id: string) => void
  setDefaultPaymentMethod: (id: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  updateSettings: (patch: Partial<Settings>) => void
  updateNotification: (key: keyof Settings['notifications'], val: boolean) => void
  setBudget: (category: string, limit: number) => void
  removeBudget: (category: string) => void
  exportCSV: () => void
  logout: () => void
}

const DATA_VERSION = '3'

const defaultProfile: Profile = {
  name: '',
  email: '',
  plan: 'Free',
  avatarColor: '#6c63ff',
  avatarEmoji: '',
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

function clearOldData() {
  const keys = ['zwam-txs', 'zwam-wallets', 'zwam-web3', 'zwam-payments', 'zwam-profile', 'zwam-budgets', 'zwam-settings']
  keys.forEach(k => localStorage.removeItem(k))
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
  if (localStorage.getItem('zwam-version') !== DATA_VERSION) {
    clearOldData()
    localStorage.setItem('zwam-version', DATA_VERSION)
  }

  const [transactions, setTransactions] = useState<Transaction[]>(() => loadArr('zwam-txs', []))
  const [wallets, setWallets] = useState<Wallet[]>(() => loadArr('zwam-wallets', []))
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>(() => loadArr('zwam-web3', []))
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => loadArr('zwam-payments', []))
  const [profile, setProfile] = useState<Profile>(() => load('zwam-profile', defaultProfile))
  const [settings, setSettings] = useState<Settings>(() => load('zwam-settings', defaultSettings))
  const [budgets, setBudgets] = useState<Budget[]>(() => loadArr('zwam-budgets', []))

  useEffect(() => { localStorage.setItem('zwam-txs', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem('zwam-wallets', JSON.stringify(wallets)) }, [wallets])
  useEffect(() => { localStorage.setItem('zwam-web3', JSON.stringify(connectedWallets)) }, [connectedWallets])
  useEffect(() => { localStorage.setItem('zwam-payments', JSON.stringify(paymentMethods)) }, [paymentMethods])
  useEffect(() => { localStorage.setItem('zwam-profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem('zwam-budgets', JSON.stringify(budgets)) }, [budgets])
  useEffect(() => {
    localStorage.setItem('zwam-settings', JSON.stringify(settings))
    applyTheme(settings.theme)
  }, [settings])

  useEffect(() => { applyTheme(settings.theme) }, [])

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => [tx, ...prev])
    setWallets(prev => prev.map(w =>
      w.id === tx.wallet
        ? { ...w, balance: w.balance + (tx.type === 'income' ? tx.amount : -tx.amount) }
        : w
    ))
  }, [])

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== id) return t
      const oldTx = t
      const newTx = { ...t, ...patch }
      // Reverse old effect and apply new
      setWallets(ws => ws.map(w => {
        let balance = w.balance
        if (w.id === oldTx.wallet) balance -= oldTx.type === 'income' ? oldTx.amount : -oldTx.amount
        if (w.id === newTx.wallet) balance += newTx.type === 'income' ? newTx.amount : -newTx.amount
        return w.id === oldTx.wallet || w.id === newTx.wallet ? { ...w, balance } : w
      }))
      return newTx
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    const tx = transactions.find(t => t.id === id)
    if (!tx) return
    setTransactions(prev => prev.filter(t => t.id !== id))
    setWallets(prev => prev.map(w =>
      w.id === tx.wallet
        ? { ...w, balance: w.balance - (tx.type === 'income' ? tx.amount : -tx.amount) }
        : w
    ))
  }, [transactions])

  const clearTransactions = useCallback(() => {
    setTransactions([])
    setWallets(prev => prev.map(w => ({ ...w, balance: 0 })))
  }, [])

  const addWallet = useCallback((w: Wallet) => setWallets(prev => [...prev, w]), [])

  const updateWallet = useCallback((id: string, patch: Partial<Wallet>) =>
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w)), [])

  const deleteWallet = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.wallet !== id))
    setWallets(prev => prev.filter(w => w.id !== id))
  }, [])

  const connectWeb3Wallet = useCallback((w: ConnectedWallet) => setConnectedWallets(prev => [...prev, w]), [])
  const disconnectWeb3Wallet = useCallback((id: string) => setConnectedWallets(prev => prev.filter(w => w.id !== id)), [])
  const addPaymentMethod = useCallback((m: PaymentMethod) => setPaymentMethods(prev => [...prev, m]), [])
  const removePaymentMethod = useCallback((id: string) => setPaymentMethods(prev => prev.filter(m => m.id !== id)), [])
  const setDefaultPaymentMethod = useCallback((id: string) => setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id }))), [])
  const updateProfile = useCallback((patch: Partial<Profile>) => setProfile(prev => ({ ...prev, ...patch })), [])
  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch })), [])
  const updateNotification = useCallback((key: keyof Settings['notifications'], val: boolean) =>
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: val } })), [])

  const setBudget = useCallback((category: string, limit: number) =>
    setBudgets(prev => {
      const exists = prev.find(b => b.category === category)
      if (exists) return prev.map(b => b.category === category ? { ...b, limit } : b)
      return [...prev, { category, limit }]
    }), [])

  const removeBudget = useCallback((category: string) =>
    setBudgets(prev => prev.filter(b => b.category !== category)), [])

  const exportCSV = useCallback(() => {
    const rows = [['ID', 'Descripción', 'Monto', 'Tipo', 'Categoría', 'Fecha', 'Billetera', 'Notas', 'Recurrente']]
    transactions.forEach(t => rows.push([
      t.id, t.description, String(t.amount), t.type, t.category, t.date, t.wallet,
      t.notes ?? '', t.recurring ? 'Sí' : 'No',
    ]))
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `zwam-transacciones-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [transactions])

  const logout = useCallback(() => {
    localStorage.removeItem('zwam-auth-email')
    setProfile(defaultProfile)
  }, [])

  return (
    <AppContext.Provider value={{
      transactions, wallets, connectedWallets, paymentMethods, profile, settings, budgets,
      addTransaction, updateTransaction, deleteTransaction, clearTransactions,
      addWallet, updateWallet, deleteWallet,
      connectWeb3Wallet, disconnectWeb3Wallet,
      addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod,
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
