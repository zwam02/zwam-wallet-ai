import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Wifi, AlertCircle, Copy, ExternalLink, LogOut } from 'lucide-react'

export type ConnectedWallet = {
  id: string
  name: string
  address: string
  ethBalance: number
  usdBalance: number
  network: string
  icon: string
  color: string
}

const WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#f6851b', desc: 'La billetera más popular de Ethereum' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', color: '#3b99fc', desc: 'Conecta cualquier billetera móvil' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052ff', desc: 'Billetera de Coinbase Exchange' },
  { id: 'trust', name: 'Trust Wallet', icon: '🛡️', color: '#3375bb', desc: 'Billetera multi-chain descentralizada' },
  { id: 'phantom', name: 'Phantom', icon: '👻', color: '#ab9ff2', desc: 'La billetera líder de Solana' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', color: '#ff6eb4', desc: 'Experiencia Ethereum simplificada' },
]

function randomAddress() {
  const chars = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)]
  return addr
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

type Step = 'pick' | 'connecting' | 'confirm' | 'connected'

interface Props {
  open: boolean
  onClose: () => void
  onConnect: (w: ConnectedWallet) => void
  connectedWallets: ConnectedWallet[]
  onDisconnect: (id: string) => void
}

export default function ConnectWalletModal({ open, onClose, onConnect, connectedWallets, onDisconnect }: Props) {
  const [step, setStep] = useState<Step>('pick')
  const [selected, setSelected] = useState<typeof WALLETS[0] | null>(null)
  const [result, setResult] = useState<ConnectedWallet | null>(null)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'connect' | 'connected'>('connect')

  function handlePick(w: typeof WALLETS[0]) {
    setSelected(w)
    setStep('connecting')
    setTimeout(() => setStep('confirm'), 1600)
    setTimeout(() => {
      const addr = randomAddress()
      const eth = +(Math.random() * 4 + 0.1).toFixed(4)
      const usd = +(eth * 3420).toFixed(2)
      const cw: ConnectedWallet = {
        id: `cw-${w.id}-${Date.now()}`,
        name: w.name,
        address: addr,
        ethBalance: eth,
        usdBalance: usd,
        network: w.id === 'phantom' ? 'Solana' : 'Ethereum',
        icon: w.icon,
        color: w.color,
      }
      setResult(cw)
      setStep('connected')
    }, 3200)
  }

  function handleConfirm() {
    if (result) {
      onConnect(result)
      setTab('connected')
      setStep('pick')
      setSelected(null)
      setResult(null)
    }
  }

  function handleClose() {
    setStep('pick')
    setSelected(null)
    setResult(null)
    onClose()
  }

  function copy(addr: string) {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose}>
          <motion.div className="modal" initial={{ opacity: 0, scale: 0.93, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h2>Conectar billetera Web3</h2>
              <button onClick={handleClose} className="close-btn"><X size={15} /></button>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button onClick={() => { setTab('connect'); setStep('pick') }} className={`tab ${tab === 'connect' ? 'active' : ''}`}>Conectar nueva</button>
              <button onClick={() => setTab('connected')} className={`tab ${tab === 'connected' ? 'active' : ''}`}>
                Conectadas {connectedWallets.length > 0 && <span className="tab-badge">{connectedWallets.length}</span>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'connect' && (
                <motion.div key="connect-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* STEP: PICK */}
                  {step === 'pick' && (
                    <div className="wallet-list">
                      {WALLETS.map((w, i) => {
                        const isConnected = connectedWallets.some(cw => cw.name === w.name)
                        return (
                          <motion.button key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => !isConnected && handlePick(w)} disabled={isConnected}
                            className={`wallet-option ${isConnected ? 'already' : ''}`}>
                            <span className="wallet-icon-big">{w.icon}</span>
                            <div className="wallet-option-info">
                              <span className="wallet-option-name">{w.name}</span>
                              <span className="wallet-option-desc">{isConnected ? '✓ Ya conectada' : w.desc}</span>
                            </div>
                            <div className="wallet-option-dot" style={{ background: w.color }} />
                          </motion.button>
                        )
                      })}
                    </div>
                  )}

                  {/* STEP: CONNECTING */}
                  {(step === 'connecting' || step === 'confirm') && selected && (
                    <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="connecting-view">
                      <div className="connecting-icon" style={{ boxShadow: `0 0 28px ${selected.color}55` }}>
                        <span style={{ fontSize: 40 }}>{selected.icon}</span>
                      </div>
                      <h3>{step === 'connecting' ? 'Conectando...' : 'Confirma en tu billetera'}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
                        {step === 'connecting'
                          ? `Abriendo ${selected.name}...`
                          : 'Acepta la solicitud de conexión en tu billetera'}
                      </p>
                      <div className="dots-loader">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="dot" style={{ background: selected.color }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, delay: i * 0.25, repeat: Infinity }} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP: CONNECTED */}
                  {step === 'connected' && result && (
                    <motion.div key="connected" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="connected-view">
                      <motion.div className="success-ring" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <Check size={28} color="#22c55e" />
                      </motion.div>
                      <h3>¡Conectada exitosamente!</h3>

                      <div className="wallet-summary">
                        <div className="ws-row">
                          <span className="ws-key">Billetera</span>
                          <span className="ws-val">{result.icon} {result.name}</span>
                        </div>
                        <div className="ws-row">
                          <span className="ws-key">Red</span>
                          <span className="ws-val network-badge" style={{ color: result.color, background: `${result.color}22` }}>{result.network}</span>
                        </div>
                        <div className="ws-row">
                          <span className="ws-key">Dirección</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="ws-val mono">{shortAddress(result.address)}</span>
                            <button onClick={() => copy(result.address)} className="icon-btn" title="Copiar">
                              {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                        <div className="ws-row">
                          <span className="ws-key">Balance ETH</span>
                          <span className="ws-val">{result.ethBalance} ETH</span>
                        </div>
                        <div className="ws-row">
                          <span className="ws-key">Balance USD</span>
                          <span className="ws-val" style={{ color: 'var(--green)' }}>${result.usdBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleClose} className="btn-secondary-sm">Cerrar</button>
                        <button onClick={handleConfirm} className="btn-primary-sm">Añadir a billeteras</button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {tab === 'connected' && (
                <motion.div key="connected-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {connectedWallets.length === 0 ? (
                    <div className="empty-connected">
                      <Wifi size={32} color="var(--text-dim)" />
                      <p>No tienes billeteras Web3 conectadas aún</p>
                      <button onClick={() => setTab('connect')} className="btn-primary-sm">Conectar ahora</button>
                    </div>
                  ) : (
                    <div className="connected-list">
                      {connectedWallets.map(cw => (
                        <div key={cw.id} className="connected-item">
                          <div className="ci-left">
                            <span className="ci-icon">{cw.icon}</span>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <span className="ci-name">{cw.name}</span>
                                <span className="ci-net" style={{ color: cw.color, background: `${cw.color}22` }}>{cw.network}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                <span className="ci-addr">{shortAddress(cw.address)}</span>
                                <button onClick={() => copy(cw.address)} className="icon-btn"><Copy size={11} /></button>
                                <a href={`https://etherscan.io/address/${cw.address}`} target="_blank" rel="noopener noreferrer" className="icon-btn"><ExternalLink size={11} /></a>
                              </div>
                            </div>
                          </div>
                          <div className="ci-right">
                            <div style={{ textAlign: 'right' }}>
                              <span className="ci-eth">{cw.ethBalance} ETH</span>
                              <span className="ci-usd">${cw.usdBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <button onClick={() => onDisconnect(cw.id)} className="disconnect-btn" title="Desconectar">
                              <LogOut size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const connectWalletStyles = `
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 200; }
  .modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 18px; width: 440px; max-width: calc(100vw - 24px); max-height: 86vh; overflow-y: auto; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px 0; }
  .modal-header h2 { font-size: 16px; font-weight: 700; }
  .close-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); }
  .tabs { display: flex; gap: 4px; padding: 14px 22px 0; }
  .tab { flex: 1; padding: 7px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .tab.active { background: var(--accent-dim); color: var(--accent-light); border-color: rgba(108,99,255,0.3); }
  .tab-badge { background: var(--accent); color: white; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 700; }
  .wallet-list { padding: 14px 22px 22px; display: flex; flex-direction: column; gap: 6px; }
  .wallet-option { display: flex; align-items: center; gap: 13px; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; text-align: left; transition: all 0.15s; width: 100%; }
  .wallet-option:hover:not(:disabled) { border-color: var(--accent); background: var(--bg-card-hover); transform: translateX(2px); }
  .wallet-option.already { opacity: 0.5; cursor: not-allowed; }
  .wallet-icon-big { font-size: 26px; flex-shrink: 0; }
  .wallet-option-info { flex: 1; }
  .wallet-option-name { font-size: 14px; font-weight: 600; display: block; }
  .wallet-option-desc { font-size: 11px; color: var(--text-dim); display: block; margin-top: 2px; }
  .wallet-option-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .connecting-view { padding: 32px 22px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .connecting-icon { width: 84px; height: 84px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
  .connecting-view h3 { font-size: 18px; font-weight: 700; }
  .dots-loader { display: flex; gap: 8px; margin-top: 8px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .connected-view { padding: 24px 22px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .success-ring { width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--green); background: rgba(34,197,94,0.1); display: flex; align-items: center; justify-content: center; }
  .connected-view h3 { font-size: 17px; font-weight: 700; }
  .wallet-summary { width: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .ws-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--border); gap: 12px; }
  .ws-row:last-child { border-bottom: none; }
  .ws-key { font-size: 12px; color: var(--text-secondary); }
  .ws-val { font-size: 13px; font-weight: 600; }
  .ws-val.mono { font-family: monospace; font-size: 12px; }
  .network-badge { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
  .icon-btn { background: none; border: none; cursor: pointer; color: var(--text-dim); display: flex; align-items: center; padding: 2px; border-radius: 4px; }
  .icon-btn:hover { color: var(--text-primary); }
  .btn-primary-sm { background: var(--accent); color: white; border: none; border-radius: 9px; padding: 9px 20px; font-size: 13px; font-weight: 600; cursor: pointer; flex: 1; }
  .btn-secondary-sm { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 9px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .empty-connected { padding: 40px 22px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-dim); font-size: 13px; }
  .connected-list { padding: 12px 22px 22px; display: flex; flex-direction: column; gap: 8px; }
  .connected-item { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; gap: 12px; }
  .ci-left { display: flex; align-items: center; gap: 11px; }
  .ci-icon { font-size: 24px; }
  .ci-name { font-size: 13px; font-weight: 600; }
  .ci-net { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
  .ci-addr { font-family: monospace; font-size: 11px; color: var(--text-dim); }
  .ci-right { display: flex; align-items: center; gap: 10px; }
  .ci-eth { font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; display: block; }
  .ci-usd { font-size: 11px; color: var(--green); font-family: 'Space Grotesk', sans-serif; display: block; }
  .disconnect-btn { background: none; border: 1px solid var(--border); border-radius: 7px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dim); transition: all 0.15s; }
  .disconnect-btn:hover { color: var(--red); border-color: var(--red); background: rgba(239,68,68,0.08); }
`
