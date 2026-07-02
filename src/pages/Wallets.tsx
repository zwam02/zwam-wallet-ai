import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, Plus, X, Check, Link as LinkIcon, Wifi, WifiOff, CreditCard, Star, Trash2, Smartphone } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Wallet as WalletType } from '../data/mock'
import ConnectWalletModal, { connectWalletStyles } from '../components/ConnectWalletModal'
import AddCardModal, { addCardStyles, BRAND_LOGOS } from '../components/AddCardModal'
import type { PaymentMethod } from '../components/AddCardModal'

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

function PaymentCard({ method, onRemove, onDefault }: { method: PaymentMethod; onRemove: () => void; onDefault: () => void }) {
  const [flipped, setFlipped] = useState(false)
  const isDigital = method.category === 'digital'

  if (isDigital) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pm-digital-card" style={{ background: method.color }}>
        <div className="pm-dc-top">
          <span className="pm-dc-logo">{method.brand === 'apple_pay' ? '' : '𝐆'}</span>
          <div className="pm-dc-actions">
            {method.isDefault && <span className="pm-default-tag">Principal</span>}
            {!method.isDefault && <button onClick={onDefault} className="pm-action-btn pm-star" title="Marcar como principal"><Star size={13} /></button>}
            <button onClick={onRemove} className="pm-action-btn pm-trash" title="Eliminar"><Trash2 size={13} /></button>
          </div>
        </div>
        <div className="pm-dc-name">{method.nickname}</div>
        <div className="pm-dc-status"><div className="pm-dot" /> Vinculado</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="pm-card-wrap"
      onClick={() => setFlipped(f => !f)}
      title="Toca para voltear"
    >
      <div className={`pm-card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="pm-card-face pm-card-front" style={{ background: method.color }}>
          <div className="pm-card-top">
            <div className="pm-chip" />
            <div className="pm-card-meta">
              {method.isDefault && <span className="pm-default-tag">Principal</span>}
              <span className="pm-brand-label">{BRAND_LOGOS[method.brand]?.label}</span>
            </div>
          </div>
          <div className="pm-card-num">•••• •••• •••• {method.last4}</div>
          <div className="pm-card-bottom">
            <div>
              <div className="pm-cl">TITULAR</div>
              <div className="pm-cv">{method.holder}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="pm-cl">EXPIRA</div>
              <div className="pm-cv">{method.expiry}</div>
            </div>
          </div>
        </div>
        {/* Back */}
        <div className="pm-card-face pm-card-back" style={{ background: method.color }}>
          <div className="pm-stripe" />
          <div className="pm-cvv-area">
            <span>CVV</span>
            <div className="pm-cvv-box">•••</div>
          </div>
          <div className="pm-back-actions" onClick={e => e.stopPropagation()}>
            <span className="pm-card-type-tag">{method.category === 'credit' ? '💳 Crédito' : '🏦 Débito'}</span>
            {!method.isDefault && (
              <button onClick={onDefault} className="pm-action-btn pm-star-btn" title="Marcar como principal">
                <Star size={12} /> Principal
              </button>
            )}
            <button onClick={onRemove} className="pm-action-btn pm-trash-btn" title="Eliminar">
              <Trash2 size={12} /> Quitar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Wallets() {
  const {
    wallets, transactions, connectedWallets, paymentMethods,
    addWallet, connectWeb3Wallet, disconnectWeb3Wallet,
    addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod,
  } = useApp()
  const [newWalletOpen, setNewWalletOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'wallets' | 'cards'>('wallets')

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
            {connectedWallets.length > 0 && <> · <span style={{ color: 'var(--accent-light)' }}>{connectedWallets.length} Web3</span></>}
            {paymentMethods.length > 0 && <> · <span style={{ color: '#f59e0b' }}>{paymentMethods.length} método{paymentMethods.length > 1 ? 's' : ''} de pago</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeTab === 'wallets' ? (
            <>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-web3" onClick={() => setConnectOpen(true)}>
                <LinkIcon size={14} /> Conectar Web3
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setNewWalletOpen(true)}>
                <Plus size={14} /> Nueva billetera
              </motion.button>
            </>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setAddCardOpen(true)}>
              <Plus size={14} /> Vincular método
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        <button onClick={() => setActiveTab('wallets')} className={`page-tab ${activeTab === 'wallets' ? 'active' : ''}`}>
          <Wallet size={14} /> Billeteras
        </button>
        <button onClick={() => setActiveTab('cards')} className={`page-tab ${activeTab === 'cards' ? 'active' : ''}`}>
          <CreditCard size={14} /> Métodos de pago
          {paymentMethods.length > 0 && <span className="tab-count">{paymentMethods.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'wallets' ? (
          <motion.div key="wallets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                        <div className="wallet-icon" style={{ background: `${wallet.color}22`, color: wallet.color }}><Wallet size={17} /></div>
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
                        <button onClick={() => disconnectWeb3Wallet(cw.id)} className="disconnect-pill"><WifiOff size={11} /> Desconectar</button>
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
          </motion.div>
        ) : (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {paymentMethods.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pm-empty">
                <div className="pm-empty-icon"><CreditCard size={32} color="var(--text-dim)" /></div>
                <h3>Sin métodos de pago</h3>
                <p>Vincula tus tarjetas de débito, crédito o billeteras digitales para tenerlas siempre a mano.</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setAddCardOpen(true)}>
                  <Plus size={14} /> Vincular primer método
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Cards section */}
                {paymentMethods.filter(m => m.category !== 'digital').length > 0 && (
                  <div className="pm-section">
                    <div className="pm-section-head">
                      <CreditCard size={14} color="var(--text-secondary)" />
                      <h3>Tarjetas</h3>
                      <span className="pm-count">{paymentMethods.filter(m => m.category !== 'digital').length}</span>
                    </div>
                    <div className="pm-cards-grid">
                      <AnimatePresence>
                        {paymentMethods.filter(m => m.category !== 'digital').map(m => (
                          <PaymentCard key={m.id} method={m}
                            onRemove={() => removePaymentMethod(m.id)}
                            onDefault={() => setDefaultPaymentMethod(m.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Digital wallets section */}
                {paymentMethods.filter(m => m.category === 'digital').length > 0 && (
                  <div className="pm-section">
                    <div className="pm-section-head">
                      <Smartphone size={14} color="var(--text-secondary)" />
                      <h3>Billeteras digitales</h3>
                      <span className="pm-count">{paymentMethods.filter(m => m.category === 'digital').length}</span>
                    </div>
                    <div className="pm-digital-grid">
                      <AnimatePresence>
                        {paymentMethods.filter(m => m.category === 'digital').map(m => (
                          <PaymentCard key={m.id} method={m}
                            onRemove={() => removePaymentMethod(m.id)}
                            onDefault={() => setDefaultPaymentMethod(m.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Security note */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pm-security">
                  <div className="pm-sec-icon">🔒</div>
                  <div>
                    <p className="pm-sec-title">Datos seguros</p>
                    <p className="pm-sec-sub">Solo almacenamos los últimos 4 dígitos de tu tarjeta. Nunca guardamos el CVV ni el número completo.</p>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <NewWalletModal open={newWalletOpen} onClose={() => setNewWalletOpen(false)} onAdd={w => { addWallet(w); setNewWalletOpen(false) }} />

      <ConnectWalletModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onConnect={connectWeb3Wallet}
        connectedWallets={connectedWallets}
        onDisconnect={disconnectWeb3Wallet}
      />

      <AddCardModal
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        onAdd={m => { addPaymentMethod(m); setAddCardOpen(false) }}
      />

      <style>{`
        .page { padding: 20px 24px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; flex-wrap: wrap; gap: 10px; }
        .page-title { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 3px; }
        .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .btn-web3 { display: flex; align-items: center; gap: 6px; background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-web3:hover { border-color: var(--accent); color: var(--accent-light); background: var(--accent-dim); }
        @media (max-width: 768px) {
          .page { padding: 16px 14px; }
          .wallets-grid { grid-template-columns: 1fr; }
          .web3-grid { grid-template-columns: 1fr; }
          .pm-cards-grid { grid-template-columns: 1fr; }
          .pm-digital-grid { grid-template-columns: 1fr; }
          .pm-card-wrap { height: 140px; }
        }

        /* Tabs */
        .page-tabs { display: flex; gap: 3px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 3px; flex-shrink: 0; align-self: flex-start; }
        .page-tab { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: none; background: none; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .page-tab.active { background: var(--accent); color: white; }
        .tab-count { background: rgba(255,255,255,0.25); color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
        .page-tab:not(.active) .tab-count { background: var(--accent-dim); color: var(--accent-light); }

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

        /* Web3 */
        .web3-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 13px; padding: 18px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-header h3 { font-size: 14px; font-weight: 600; }
        .web3-badge { display: flex; align-items: center; gap: 5px; background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .manage-btn { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 7px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); cursor: pointer; }
        .manage-btn:hover { color: var(--text-primary); border-color: var(--accent); }
        .web3-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .web3-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 11px; padding: 14px; cursor: pointer; transition: border-color 0.15s; }
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

        /* Payment methods */
        .pm-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 20px; text-align: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; }
        .pm-empty-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; }
        .pm-empty h3 { font-size: 16px; font-weight: 700; }
        .pm-empty p { font-size: 13px; color: var(--text-secondary); max-width: 360px; line-height: 1.6; }

        .pm-section { display: flex; flex-direction: column; gap: 12px; }
        .pm-section-head { display: flex; align-items: center; gap: 8px; }
        .pm-section-head h3 { font-size: 13px; font-weight: 600; color: var(--text-secondary); flex: 1; }
        .pm-count { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; font-size: 11px; font-weight: 700; color: var(--text-secondary); padding: 1px 8px; }
        .pm-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        .pm-digital-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }

        /* Card flip */
        .pm-card-wrap { perspective: 1000px; cursor: pointer; height: 150px; }
        .pm-card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.5s; }
        .pm-card-inner.flipped { transform: rotateY(180deg); }
        .pm-card-face { position: absolute; inset: 0; border-radius: 13px; backface-visibility: hidden; padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
        .pm-card-face::before { content: ''; position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.07); }
        .pm-card-back { transform: rotateY(180deg); }
        .pm-card-top { display: flex; align-items: center; justify-content: space-between; }
        .pm-chip { width: 28px; height: 21px; background: linear-gradient(135deg,#d4af37,#ffd700); border-radius: 4px; }
        .pm-card-meta { display: flex; align-items: center; gap: 7px; }
        .pm-brand-label { font-size: 13px; font-weight: 800; color: white; opacity: 0.9; }
        .pm-default-tag { font-size: 9px; font-weight: 700; background: rgba(255,255,255,0.2); color: white; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .pm-card-num { font-size: 15px; font-weight: 700; color: white; letter-spacing: 2px; font-family: monospace; }
        .pm-card-bottom { display: flex; justify-content: space-between; }
        .pm-cl { font-size: 8px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px; }
        .pm-cv { font-size: 12px; font-weight: 600; color: white; font-family: 'Space Grotesk', sans-serif; }
        .pm-stripe { height: 36px; background: rgba(0,0,0,0.4); margin: -16px -18px 12px; }
        .pm-cvv-area { display: flex; align-items: center; gap: 10px; font-size: 11px; color: rgba(255,255,255,0.7); }
        .pm-cvv-box { background: white; color: #333; border-radius: 4px; padding: 3px 10px; font-size: 12px; font-family: monospace; letter-spacing: 2px; }
        .pm-back-actions { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .pm-card-type-tag { font-size: 11px; color: rgba(255,255,255,0.7); flex: 1; }
        .pm-action-btn { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.15); border: none; border-radius: 6px; padding: 4px 9px; font-size: 11px; color: white; cursor: pointer; transition: background 0.15s; }
        .pm-action-btn:hover { background: rgba(255,255,255,0.25); }
        .pm-star-btn, .pm-trash-btn { font-weight: 600; }

        /* Digital wallet card */
        .pm-digital-card { border-radius: 13px; padding: 16px 18px; height: 100px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
        .pm-digital-card::before { content: ''; position: absolute; top: -15px; right: -15px; width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.07); }
        .pm-dc-top { display: flex; align-items: center; justify-content: space-between; }
        .pm-dc-logo { font-size: 24px; }
        .pm-dc-actions { display: flex; align-items: center; gap: 5px; }
        .pm-dc-name { font-size: 15px; font-weight: 700; color: white; }
        .pm-dc-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.7); }
        .pm-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 5px rgba(74,222,128,0.6); }
        .pm-action-btn.pm-star { background: rgba(255,255,255,0.1); border: none; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; padding: 0; }
        .pm-action-btn.pm-trash { background: rgba(239,68,68,0.2); border: none; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; padding: 0; }
        .pm-action-btn.pm-star:hover { background: rgba(255,255,255,0.2); }
        .pm-action-btn.pm-trash:hover { background: rgba(239,68,68,0.4); }

        .pm-security { display: flex; align-items: flex-start; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
        .pm-sec-icon { font-size: 20px; flex-shrink: 0; }
        .pm-sec-title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
        .pm-sec-sub { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

        ${connectWalletStyles}
        ${addCardStyles}
      `}</style>
    </div>
  )
}
