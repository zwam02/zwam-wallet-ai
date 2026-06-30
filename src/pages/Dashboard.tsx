import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, Sparkles, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { wallets, monthlyData } from '../data/mock'
import { useApp } from '../context/AppContext'
import NewTransactionModal, { modalStyles } from '../components/NewTransactionModal'

const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

export default function Dashboard() {
  const { transactions, addTransaction } = useApp()
  const [modalOpen, setModalOpen] = useState(false)

  const thisMonthIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const thisMonthExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Martes, 30 de junio de 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Nueva transacción
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-secondary">
            <Sparkles size={14} /> Analizar con IA
          </motion.button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Balance Total', value: `$${fmt(totalBalance)}`, icon: Wallet, color: 'var(--accent)', change: '+4.2%' },
          { label: 'Ingresos del Mes', value: `$${fmt(thisMonthIncome)}`, icon: TrendingUp, color: 'var(--green)', change: '+12%' },
          { label: 'Gastos del Mes', value: `$${fmt(thisMonthExpense)}`, icon: TrendingDown, color: 'var(--red)', change: '-3.1%' },
          { label: 'Ahorro Neto', value: `$${fmt(thisMonthIncome - thisMonthExpense)}`, icon: Sparkles, color: '#ec4899', change: '+28%' },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariants} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={16} />
            </div>
            <div className="stat-body">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-change" style={{ color: stat.change.startsWith('+') ? 'var(--green)' : 'var(--red)' }}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {stat.change} este mes
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="content-grid">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="chart-card">
          <div className="card-header">
            <h3>Flujo de Dinero</h3>
            <span className="badge">Últimos 6 meses</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${fmt(v)}`, '']}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#6c63ff" strokeWidth={2} fill="url(#incomeGrad)" name="Ingresos" />
                <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Gastos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="recent-card">
          <div className="card-header">
            <h3>Movimientos Recientes</h3>
            <Link to="/transactions" className="link-small">Ver todos</Link>
          </div>
          <div className="tx-list">
            {transactions.slice(0, 8).map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }} className="tx-item">
                <div className="tx-dot" style={{ background: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }} />
                <div className="tx-info">
                  <span className="tx-desc">{tx.description}</span>
                  <span className="tx-cat">{tx.category}</span>
                </div>
                <span className="tx-amount" style={{ color: tx.type === 'income' ? 'var(--green)' : 'var(--text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <NewTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={tx => { addTransaction(tx); setModalOpen(false) }}
      />

      <style>{`
        .page {
          height: 100vh;
          padding: 16px 22px;
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 10px;
          overflow: hidden;
        }
        .page-header { display: flex; align-items: center; justify-content: space-between; }
        .page-title { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
        .btn-primary {
          display: flex; align-items: center; gap: 6px;
          background: var(--accent); color: white;
          border: none; padding: 7px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .btn-secondary {
          display: flex; align-items: center; gap: 6px;
          background: var(--bg-card); color: var(--text-secondary);
          border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .stat-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 10px; padding: 10px 12px; display: flex; gap: 10px; align-items: center;
        }
        .stat-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-body { display: flex; flex-direction: column; gap: 1px; }
        .stat-label { font-size: 10px; color: var(--text-secondary); }
        .stat-value { font-size: 16px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.4px; line-height: 1.2; }
        .stat-change { font-size: 10px; display: flex; align-items: center; gap: 2px; }
        .content-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 8px;
          min-height: 0;
        }
        .chart-card, .recent-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 10px; padding: 12px 14px;
          display: flex; flex-direction: column;
          min-height: 0; overflow: hidden;
        }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-shrink: 0; }
        .card-header h3 { font-size: 13px; font-weight: 600; }
        .badge { font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); padding: 2px 7px; border-radius: 20px; border: 1px solid var(--border); }
        .link-small { font-size: 11px; color: var(--accent-light); text-decoration: none; }
        .chart-wrap { flex: 1; min-height: 0; }
        .tx-list { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .tx-item { display: flex; align-items: center; gap: 8px; padding: 7px 5px; border-radius: 6px; transition: background 0.15s; flex-shrink: 0; }
        .tx-item:hover { background: var(--bg-card-hover); }
        .tx-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .tx-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .tx-desc { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tx-cat { font-size: 10px; color: var(--text-dim); }
        .tx-amount { font-size: 12px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; flex-shrink: 0; }
        ${modalStyles}
      `}</style>
    </div>
  )
}
