import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Plus } from 'lucide-react'
import { wallets, transactions } from '../data/mock'

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

const typeLabel: Record<string, string> = {
  checking: 'Cuenta Corriente',
  savings: 'Ahorros',
  crypto: 'Criptomonedas',
  investment: 'Inversiones',
}

export default function Wallets() {
  const total = wallets.reduce((s, w) => s + w.balance, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billeteras</h1>
          <p className="page-subtitle">Balance total: <strong>${fmt(total)}</strong></p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary">
          <Plus size={15} /> Nueva billetera
        </motion.button>
      </div>

      <div className="wallets-grid">
        {wallets.map((wallet, i) => {
          const walletTxs = transactions.filter(t => t.wallet === wallet.id)
          const income = walletTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
          const expense = walletTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
          const pct = Math.round((wallet.balance / total) * 100)

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="wallet-card"
            >
              <div className="wallet-card-top">
                <div className="wallet-icon" style={{ background: `${wallet.color}20`, color: wallet.color }}>
                  <Wallet size={18} />
                </div>
                <div className="wallet-header-info">
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-type">{typeLabel[wallet.type]}</span>
                </div>
              </div>

              <div className="wallet-balance">${fmt(wallet.balance)}</div>

              <div className="wallet-bar-bg">
                <motion.div
                  className="wallet-bar-fill"
                  style={{ background: wallet.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                />
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
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="distribution-card">
        <div className="card-header">
          <h3>Distribución de activos</h3>
          <TrendingUp size={16} color="var(--text-secondary)" />
        </div>
        <div className="dist-bars">
          {wallets.map(w => (
            <div key={w.id} className="dist-row">
              <span className="dist-label">{w.name}</span>
              <div className="dist-bar-track">
                <motion.div
                  className="dist-bar-fill"
                  style={{ background: w.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(w.balance / total) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="dist-value">${fmt(w.balance)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <style>{`
        .page { padding: 32px 36px; max-width: 1100px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
        .page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 3px; }
        .btn-primary {
          display: flex; align-items: center; gap: 7px;
          background: var(--accent); color: white;
          border: none; padding: 10px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .wallets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px; }
        .wallet-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px; cursor: pointer;
          transition: border-color 0.2s;
        }
        .wallet-card:hover { border-color: var(--accent); }
        .wallet-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .wallet-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .wallet-header-info { display: flex; flex-direction: column; gap: 2px; }
        .wallet-name { font-size: 15px; font-weight: 600; }
        .wallet-type { font-size: 11px; color: var(--text-dim); }
        .wallet-balance { font-size: 28px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: -1px; margin-bottom: 12px; }
        .wallet-bar-bg { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 5px; }
        .wallet-bar-fill { height: 100%; border-radius: 2px; }
        .wallet-pct { font-size: 11px; color: var(--text-dim); }
        .wallet-stats { display: flex; gap: 0; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 14px; }
        .wallet-stat { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .ws-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }
        .ws-value { font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .distribution-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 12px; padding: 20px;
        }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .card-header h3 { font-size: 15px; font-weight: 600; }
        .dist-bars { display: flex; flex-direction: column; gap: 14px; }
        .dist-row { display: flex; align-items: center; gap: 12px; }
        .dist-label { font-size: 13px; width: 130px; flex-shrink: 0; color: var(--text-secondary); }
        .dist-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .dist-bar-fill { height: 100%; border-radius: 3px; }
        .dist-value { font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; width: 100px; text-align: right; }
      `}</style>
    </div>
  )
}
