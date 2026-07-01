import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sparkles, Check, ArrowRight, Wallet, TrendingUp, Shield } from 'lucide-react'

type Props = { onAuth: (name: string, email: string, plan: 'Free' | 'Pro' | 'Business') => void }

export default function Auth({ onAuth }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) { setError('Completa todos los campos'); return }
    if (tab === 'register' && !name.trim()) { setError('Escribe tu nombre'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)

    const accounts: Record<string, { name: string; password: string; plan: 'Free' | 'Pro' | 'Business' }> =
      JSON.parse(localStorage.getItem('zwam-accounts') || '{}')

    setTimeout(() => {
      if (tab === 'login') {
        const acc = accounts[email.toLowerCase()]
        if (!acc || acc.password !== password) {
          setError('Email o contraseña incorrectos')
          setLoading(false)
          return
        }
        onAuth(acc.name, email.toLowerCase(), acc.plan)
      } else {
        if (accounts[email.toLowerCase()]) {
          setError('Ya existe una cuenta con ese email')
          setLoading(false)
          return
        }
        const newAcc = { name: name.trim(), password, plan: 'Free' as const }
        accounts[email.toLowerCase()] = newAcc
        localStorage.setItem('zwam-accounts', JSON.stringify(accounts))
        onAuth(newAcc.name, email.toLowerCase(), newAcc.plan)
      }
    }, 700)
  }

  const features = [
    { icon: TrendingUp, text: 'Control total de tus finanzas' },
    { icon: Wallet, text: 'Billeteras fiat y Web3' },
    { icon: Sparkles, text: 'Análisis inteligente con IA' },
    { icon: Shield, text: 'Datos cifrados y seguros' },
  ]

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">Z</div>
          <span className="auth-logo-text">ZwamWallet</span>
        </div>
        <div className="auth-hero">
          <h1 className="auth-headline">Tu dinero,<br />tu control.</h1>
          <p className="auth-sub">La plataforma financiera inteligente que centraliza tus billeteras, analiza tus gastos y te ayuda a ahorrar más.</p>
          <div className="auth-features">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="auth-feature">
                <div className="auth-feature-icon"><Icon size={14} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-plans-teaser">
          <div className="teaser-badge">✦ Planes desde gratis</div>
          <p>Empieza gratis y desbloquea funciones premium cuando las necesites.</p>
        </div>
      </div>

      <div className="auth-right">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="auth-tabs">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }} className={`auth-tab ${tab === t ? 'active' : ''}`}>
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={tab} onSubmit={handleSubmit} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="auth-form">
              {tab === 'register' && (
                <div className="auth-field">
                  <label>Nombre completo</label>
                  <input value={name} onChange={e => { setName(e.target.value); setError('') }} placeholder="Juan García" autoFocus className="auth-input" />
                </div>
              )}
              <div className="auth-field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="juan@email.com" autoFocus={tab === 'login'} className="auth-input" />
              </div>
              <div className="auth-field">
                <label>Contraseña</label>
                <div className="pass-wrap">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="Mínimo 6 caracteres" className="auth-input pass-input" />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="pass-toggle">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">{error}</motion.p>
              )}

              <motion.button type="submit" className={`auth-submit ${loading ? 'loading' : ''}`} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
                {loading ? <span className="auth-spinner" /> : <>{tab === 'login' ? 'Entrar' : 'Crear cuenta'} <ArrowRight size={15} /></>}
              </motion.button>

              {tab === 'login' && (
                <p className="auth-switch">¿No tienes cuenta? <button type="button" onClick={() => { setTab('register'); setError('') }}>Regístrate gratis</button></p>
              )}
              {tab === 'register' && (
                <p className="auth-switch">¿Ya tienes cuenta? <button type="button" onClick={() => { setTab('login'); setError('') }}>Inicia sesión</button></p>
              )}

              {tab === 'register' && (
                <div className="auth-free-note">
                  <Check size={12} color="var(--green)" />
                  <span>Cuenta gratuita — sin tarjeta de crédito</span>
                </div>
              )}
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-root {
          display: flex; min-height: 100vh; height: 100vh;
          background: var(--bg-primary); font-family: 'Inter', 'Space Grotesk', sans-serif;
          overflow: hidden;
        }
        .auth-left {
          flex: 1.1; background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 40px; min-width: 0;
        }
        .auth-brand { display: flex; align-items: center; gap: 10px; }
        .auth-logo {
          width: 34px; height: 34px; background: var(--accent); border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: white;
        }
        .auth-logo-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 19px; color: var(--text-primary); }
        .auth-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
        .auth-headline { font-size: 44px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; letter-spacing: -1.5px; line-height: 1.1; color: var(--text-primary); }
        .auth-sub { font-size: 15px; color: var(--text-secondary); line-height: 1.6; max-width: 380px; }
        .auth-features { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .auth-feature { display: flex; align-items: center; gap: 12px; }
        .auth-feature-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: var(--accent-dim); color: var(--accent-light);
          border: 1px solid rgba(108,99,255,0.25);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .auth-feature span { font-size: 13px; color: var(--text-secondary); }
        .auth-plans-teaser { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; }
        .teaser-badge { font-size: 11px; font-weight: 700; color: var(--accent-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .auth-plans-teaser p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

        .auth-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px;
        }
        .auth-card {
          width: 100%; max-width: 400px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 18px; padding: 32px; display: flex; flex-direction: column; gap: 24px;
        }
        .auth-tabs { display: flex; background: var(--bg-secondary); border-radius: 10px; padding: 3px; gap: 2px; }
        .auth-tab {
          flex: 1; padding: 8px; border-radius: 8px; border: none;
          background: none; color: var(--text-secondary); font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .auth-tab.active { background: var(--bg-card); color: var(--text-primary); box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-field label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
        .auth-input {
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: 9px; padding: 11px 14px; color: var(--text-primary);
          font-size: 14px; outline: none; font-family: inherit; width: 100%;
          transition: border-color 0.15s;
        }
        .auth-input:focus { border-color: var(--accent); }
        .pass-wrap { position: relative; }
        .pass-input { padding-right: 42px; }
        .pass-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-dim); cursor: pointer;
          display: flex; align-items: center;
        }
        .auth-error { font-size: 12px; color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 8px 12px; }
        .auth-submit {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          background: var(--accent); color: white; border: none;
          padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: opacity 0.15s;
        }
        .auth-submit.loading { opacity: 0.7; cursor: default; }
        .auth-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-switch { font-size: 12px; color: var(--text-secondary); text-align: center; }
        .auth-switch button { background: none; border: none; color: var(--accent-light); font-size: 12px; font-weight: 600; cursor: pointer; }
        .auth-free-note { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text-dim); justify-content: center; }
      `}</style>
    </div>
  )
}
