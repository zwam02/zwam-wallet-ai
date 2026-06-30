import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, Plus, X, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Wallet as WalletType } from '../data/mock'

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

const typeLabel: Record<string, string> = {
  checking: 'Cuenta Corriente',
  savings: 'Ahorros',
  crypto: 'Criptomonedas',
  investment: 'Inversiones',
}

const COLORS = ['#6c63ff', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6']

function NewWalletModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (w: WalletType) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<WalletType['type']>('checking')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setErr('Escribe un nombre'); return }
    if (!balance || isNaN(Number(balance)) || Number(balance) < 0) { setErr('Balance inválido'); return }
    onAdd({ id: `w${Date.now()}`, name: name.trim(), balance: Number(balance), currency: 'USD', color, type })
    setDone(true)
    setTimeout(() => { setDone(false); setName(''); setBalance(''); setErr(''); onClose() }, 900)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal" initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Billetera</h2>
              <button onClick={onClose} className="close-btn"><X size={15} /></button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="wfield">
                <label>Nombre</label>
                <input className="winput" value={name} onChange={e => { setName(e.target.value); setErr('') }} placeholder="Ej: Cuenta nómina" autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="wfield" style={{ flex: 1 }}>
                  <label>Tipo</label>
                  <select className="winput" value={type} onChange={e => setType(e.target.value as WalletType['type'])}>
                    {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="wfield" style={{ flex: 1 }}>
                  <label>Balance inicial (USD)</label>
                  <input className="winput" type="number" min="0" step="0.01" value={balance} onChange={e => { setBalance(e.target.value); setErr('') }} placeholder="0.00" />
                </div>
              </div>
              <div className="wfield">
                <label>Color</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', outline: color === c ? `2px solid ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
              {err && <p style={{ fontSize: 12, color: 'var(--red)', margin: '-6px 0' }}>{err}</p>}
              <motion.button type="submit" className={`wsubmit ${done ? 'done' : ''}`} whileHover={{ scale: done ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
                {done ? <><Check size={14} /> Creada</> : 'Crear billetera'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Wallets() {
  const { wallets, transactions, addWallet } = useApp()
  const [modalOpen, setModalOpen] = useState(false)

  const total = wallets.reduce((s, w) => s + w.balance, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billeteras</h1>
          <p className="page-subtitle">Balance total: <strong>${fmt(total)}</strong> · {wallets.length} cuentas</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Nueva billetera
        </motion.button>
      </div>

      <div className="wallets-grid">
        <AnimatePresence>
          {wallets.map((wallet, i) => {
            const walletTxs = transactions.filter(t => t.wallet === wallet.id)
            const income = walletTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const expense = walletTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            const pct = total > 0 ? Math.round((wallet.balance / total) * 100) : 0

            return (
              <motion.div key={wallet.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -2 }} className="wallet-card">
                <div className="wallet-card-top">
                  <div className="wallet-icon" style={{ background: `${wallet.color}22`, color: wallet.color }}>
                    <Wallet size={17} />
                  </div>
                  <div>
                    <span className="wallet-name">{wallet.name}</span>
                    <span className="wallet-type">{typeLabel[wallet.type] ?? wallet.type}</span>
                  </div>
                </div>
                <div className="wallet-balance">${fmt(wallet.balance)}</div>
                <div className="wallet-bar-bg">
                  <motion.div className="wallet-bar-fill" style={{ background: wallet.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2 + i * 0.06, duration: 0.6 }} />
                </div>
                <span className="wallet-pct">{pct}% del total</span>
                <div className="wallet-stats">
                  <div className="wallet-stat">
                    <span className="ws-label">Ingresos</span>
                    <span className="ws-value" style={{ color: 'var(--green)' }}>+${fmt(income)}</span>
                  </div>
                  <div className="wallet-stat">
                    <span className="ws-label">Gastos</span>
                    <span className="ws-value" style={{ color: 'var(--red)' }}>-${fmt(expense)}</span>
                  </div>
                  <div className="wallet-stat">
                    <span className="ws-label">Movimientos</span>
                    <span className="ws-value">{walletTxs.length}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="distribution-card">
        <div className="card-header">
          <h3>Distribución de activos</h3>
          <TrendingUp size={15} color="var(--text-secondary)" />
        </div>
        <div className="dist-bars">
          {wallets.map(w => (
            <div key={w.id} className="dist-row">
              <span className="dist-label">{w.name}</span>
              <div className="dist-bar-track">
                <motion.div className="dist-bar-fill" style={{ background: w.color }} initial={{ width: 0 }} animate={{ width: total > 0 ? `${(w.balance / total) * 100}%` : '0%' }} transition={{ duration: 0.8 }} />
              </div>
              <span className="dist-value">${fmt(w.balance)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <NewWalletModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={w => { addWallet(w); setModalOpen(false) }} />

      <style>{`
        .page { padding: 24px 28px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; }
        .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 3px; }
        .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .wallets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .wallet-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 13px; padding: 18px; cursor: pointer; transition: border-color 0.2s; }
        .wallet-card:hover { border-color: var(--accent); }
        .wallet-card-top { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }
        .wallet-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wallet-name { font-size: 14px; font-weight: 600; display: block; }
        .wallet-type { font-size: 11px; color: var(--text-dim); display: block; margin-top: 1px; }
        .wallet-balance { font-size: 26px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.8px; margin-bottom: 10px; }
        .wallet-bar-bg { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
        .wallet-bar-fill { height: 100%; border-radius: 2px; }
        .wallet-pct { font-size: 11px; color: var(--text-dim); }
        .wallet-stats { display: flex; margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px; }
        .wallet-stat { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .ws-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.4px; }
        .ws-value { font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .distribution-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; flex-shrink: 0; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .card-header h3 { font-size: 14px; font-weight: 600; }
        .dist-bars { display: flex; flex-direction: column; gap: 12px; }
        .dist-row { display: flex; align-items: center; gap: 12px; }
        .dist-label { font-size: 12px; width: 120px; flex-shrink: 0; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dist-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .dist-bar-fill { height: 100%; border-radius: 3px; }
        .dist-value { font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; width: 90px; text-align: right; }
        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 24px; width: 420px; max-width: calc(100vw - 32px); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .modal-header h2 { font-size: 16px; font-weight: 700; }
        .close-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); }
        .wfield { display: flex; flex-direction: column; gap: 5px; }
        .wfield label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
        .winput { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text-primary); font-size: 13px; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
        .winput:focus { border-color: var(--accent); }
        .wsubmit { padding: 11px; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .wsubmit.done { background: var(--green); }
      `}</style>
    </div>
  )
}
