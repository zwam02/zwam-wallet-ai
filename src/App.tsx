import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Wallets from './pages/Wallets'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Plans from './pages/Plans'
import Auth from './pages/Auth'
import Layout from './components/Layout'
import { useApp } from './context/AppContext'

function AuthGate() {
  const { profile, updateProfile, logout } = useApp()
  const [authed, setAuthed] = useState<boolean>(() => !!localStorage.getItem('zwam-auth-email'))

  useEffect(() => {
    if (authed) {
      const email = localStorage.getItem('zwam-auth-email') || ''
      const accounts: Record<string, { name: string; password: string; plan: 'Free' | 'Pro' | 'Business' }> =
        JSON.parse(localStorage.getItem('zwam-accounts') || '{}')
      const acc = accounts[email]
      if (acc) updateProfile({ name: acc.name, email, plan: acc.plan })
    }
  }, [])

  function handleAuth(name: string, email: string, plan: 'Free' | 'Pro' | 'Business') {
    localStorage.setItem('zwam-auth-email', email)
    updateProfile({ name, email, plan })
    setAuthed(true)
  }

  function handleLogout() {
    logout()
    setAuthed(false)
  }

  if (!authed) return <Auth onAuth={handleAuth} />

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="wallet" element={<Wallets />} />
          <Route path="wallets" element={<Navigate to="/wallet" replace />} />
          <Route path="insights" element={<Insights />} />
          <Route path="settings" element={<Settings />} />
          <Route path="plans" element={<Plans />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return <AuthGate />
}
