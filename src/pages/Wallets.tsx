import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, Plus, X, Check, Link as LinkIcon, Wifi, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Wallet as WalletType } from '../data/mock'
import ConnectWalletModal, { connectWalletStyles } from '../components/ConnectWalletModal'

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
        <motion.div className="nw-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="nw-modal" initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} onClick={e => e.stopPropagation()}>
            <div className="nw-header">
              <h2>Nueva Billetera</h2>
              <button onClick={onClose} className="nw-close"><X size={15} /></button>
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

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function Wallets() {
  const { wallets, transactions, connectedWallets, addWallet, connectWeb3Wallet, disconnectWeb3Wallet } = useApp()
  const [newWalletOpen, setNewWalletOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)

  const totalFiat = wallets.reduce((s, w) => s + w.balance, 0)
  const totalWeb3 = connectedWallets.reduce((s, w) => s + w.usdBalance, 0)
  const grandTotal = totalFiat + totalWeb3

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billeteras</h1>
          <p className="page-subtitle">
            Balance total: <strong>${fmt(grandTotal)}</strong>
            {connectedWallets.length > 0 && <> · <span style={{ color: 'var(--accent-light)' }}>{connectedWallets.length} Web3 conectada{connectedWallets.length > 1 ? 's' : ''}</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-web3" onClick={() => setConnectOpen(true)}>
            <LinkIcon size={14} /> Conectar Web3
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setNewWalletOpen(true)}>
            <Plus size={14} /> Nueva billetera
          </motion.button>
        </div>
      </div>

      {/* Fiat wallets */}
      <div className="wallets-grid">
        <AnimatePresence>
          {wallets.map((wallet, i) => {
            const walletTxs = transactions.filter(t => t.wallet === wallet.id)
            const income = walletTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const expense = walletTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            const pct = grandTotal > 0 ? Math.round((wallet.balance / grandTotal) * 100) : 0

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
                  <div className="wallet-stat"><span className="ws-label">Ingresos</span><span className="ws-value" style={{ color: 'var(--green)' }}>+${fmt(income)}</span></div>
                  <div className="wallet-stat"><span className="ws-label">Gastos</span><span className="ws-value" style={{ color: 'var(--red)' }}>-${fmt(expense)}</span></div>
                  <div className="wallet-stat"><span className="ws-label">Movimientos</span><span className="ws-value">{walletTxs.length}</span></div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Web3 wallets */}
      {connectedWallets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="web3-section">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="web3-badge"><Wifi size={12} /> Web3</div>
              <h3>Billeteras descentralizadas</h3>
            </div>
            <button onClick={() => setConnectOpen(true)} className="manage-btn">Gestionar</button>
          </div>
          <div className="web3-grid">
            <AnimatePresence>
              {connectedWallets.map((cw, i) => (
                <motion.div key={cw.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }} className="web3-card">
                  <div className="web3-card-top">
                    <span className="web3-icon">{cw.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span className="web3-name">{cw.name}</span>
                        <span className="net-badge" style={{ color: cw.color, background: `${cw.color}22` }}>{cw.network}</span>
                      </div>
                      <span className="web3-addr">{shortAddress(cw.address)}</span>
                    </div>
                    <div className="connected-dot" />
                  </div>
                  <div className="web3-balance">${fmt(cw.usdBalance)}</div>
                  <div className="web3-eth">{cw.ethBalance} {cw.network === 'Solana' ? 'SOL' : 'ETH'}</div>
                  <button onClick={() => disconnectWeb3Wallet(cw.id)} className="disconnect-pill">
                    <WifiOff size={11} /> Desconectar
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Distribution */}
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
                <motion.div className="dist-bar-fill" style={{ background: w.color }} initial={{ width: 0 }} animate={{ width: grandTotal > 0 ? `${(w.balance / grandTotal) * 100}%` : '0%' }} transition={{ duration: 0.8 }} />
              </div>
              <span className="dist-value">${fmt(w.balance)}</span>
            </div>
          ))}
          {connectedWallets.map(cw => (
            <div key={cw.id} className="dist-row">
              <span className="dist-label">{cw.icon} {cw.name}</span>
              <div className="dist-bar-track">
                <motion.div className="dist-bar-fill" style={{ background: cw.color }} initial={{ width: 0 }} animate={{ width: grandTotal > 0 ? `${(cw.usdBalance / grandTotal) * 100}%` : '0%' }} transition={{ duration: 0.8 }} />
              </div>
              <span className="dist-value">${fmt(cw.usdBalance)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <NewWalletModal open={newWalletOpen} onClose={() => setNewWalletOpen(false)} onAdd={w => { addWallet(w); setNewWalletOpen(false) }} />

      <ConnectWalletModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onConnect={connectWeb3Wallet}
        connectedWallets={connectedWallets}
        onDisconnect={disconnectWeb3Wallet}
      />

      <style>{`
        .page { padding: 24px 28px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; }
        .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 3px; }
        .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .btn-web3 { display: flex; align-items: center; gap: 6px; background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-web3:hover { border-color: var(--accent); color: var(--accent-light); background: var(--accent-dim); }

        /* Fiat wallets */
        .wallets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .wallet-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 13px; padding: 18px; cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
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

        /* Web3 section */
        .web3-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 13px; padding: 18px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-header h3 { font-size: 14px; font-weight: 600; }
        .web3-badge { display: flex; align-items: center; gap: 5px; background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .manage-btn { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 7px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); cursor: pointer; }
        .manage-btn:hover { color: var(--text-primary); border-color: var(--accent); }
        .web3-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .web3-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 11px; padding: 14px; cursor: pointer; transition: border-color 0.15s, transform 0.2s; }
        .web3-card:hover { border-color: var(--accent); }
        .web3-card-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
        .web3-icon { font-size: 26px; flex-shrink: 0; }
        .web3-name { font-size: 13px; font-weight: 600; display: block; }
        .net-badge { font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 20px; }
        .web3-addr { font-family: monospace; font-size: 10px; color: var(--text-dim); display: block; margin-top: 2px; }
        .connected-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; box-shadow: 0 0 6px rgba(34,197,94,0.6); margin-top: 4px; }
        .web3-balance { font-size: 20px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.5px; }
        .web3-eth { font-size: 11px; color: var(--text-secondary); margin-top: 2px; margin-bottom: 12px; }
        .disconnect-pill { display: flex; align-items: center; gap: 5px; background: none; border: 1px solid var(--border); border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 500; color: var(--text-dim); cursor: pointer; transition: all 0.15s; }
        .disconnect-pill:hover { color: var(--red); border-color: var(--red); background: rgba(239,68,68,0.07); }

        /* Distribution */
        .distribution-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; flex-shrink: 0; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .card-header h3 { font-size: 14px; font-weight: 600; }
        .dist-bars { display: flex; flex-direction: column; gap: 12px; }
        .dist-row { display: flex; align-items: center; gap: 12px; }
        .dist-label { font-size: 12px; width: 130px; flex-shrink: 0; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dist-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .dist-bar-fill { height: 100%; border-radius: 3px; }
        .dist-value { font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; width: 90px; text-align: right; }

        /* New wallet modal */
        .nw-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .nw-modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 24px; width: 420px; max-width: calc(100vw - 32px); }
        .nw-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .nw-header h2 { font-size: 16px; font-weight: 700; }
        .nw-close { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); }
        .wfield { display: flex; flex-direction: column; gap: 5px; }
        .wfield label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
        .winput { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text-primary); font-size: 13px; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
        .winput:focus { border-color: var(--accent); }
        .wsubmit { padding: 11px; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .wsubmit.done { background: var(--green); }

        ${connectWalletStyles}
      `}</style>
    </div>
  )
}
