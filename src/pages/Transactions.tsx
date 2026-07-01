import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowUpRight, ArrowDownRight, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import NewTransactionModal, { modalStyles } from '../components/NewTransactionModal'

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

export default function Transactions() {
  const { transactions, wallets, deleteTransaction, addTransaction } = useApp()
  const walletName = Object.fromEntries(wallets.map(w => [w.id, w.name]))
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [category, setCategory] = useState('Todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const categories = ['Todas', ...Array.from(new Set(transactions.map(t => t.category)))]

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filter === 'all' || t.type === filter
    const matchCat = category === 'Todas' || t.category === category
    return matchSearch && matchType && matchCat
  })

  const totalIngresos = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalGastos = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimientos</h1>
          <p className="page-subtitle">{filtered.length} transacciones · Ingresos <span style={{ color: 'var(--green)' }}>${fmt(totalIngresos)}</span> · Gastos <span style={{ color: 'var(--red)' }}>${fmt(totalGastos)}</span></p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Nueva transacción
        </motion.button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={14} color="var(--text-dim)" />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          {search && <button onClick={() => setSearch('')} className="clear-search">✕</button>}
        </div>
        <div className="filter-tabs">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''}`}>
              {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>
        <div className="category-select">
          <Filter size={13} color="var(--text-dim)" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="select-native">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="tx-table">
        <div className="tx-table-header">
          <span>Descripción</span>
          <span>Categoría</span>
          <span>Billetera</span>
          <span>Fecha</span>
          <span style={{ textAlign: 'right' }}>Monto</span>
          <span></span>
        </div>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
              <Search size={28} color="var(--text-dim)" />
              <p>Sin resultados para tu búsqueda</p>
              <button onClick={() => { setSearch(''); setFilter('all'); setCategory('Todas') }} className="btn-reset">Limpiar filtros</button>
            </motion.div>
          ) : (
            filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="tx-row"
              >
                <div className="tx-desc-cell">
                  <div className={`tx-type-icon ${tx.type}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  </div>
                  <span>{tx.description}</span>
                </div>
                <span className="tag">{tx.category}</span>
                <span className="tx-wallet">{walletName[tx.wallet] ?? tx.wallet}</span>
                <span className="tx-date">{tx.date}</span>
                <span className="tx-amt" style={{ color: tx.type === 'income' ? 'var(--green)' : 'var(--text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}
                </span>
                <div className="tx-actions">
                  {confirmDelete === tx.id ? (
                    <div className="confirm-delete">
                      <button onClick={() => { deleteTransaction(tx.id); setConfirmDelete(null) }} className="btn-confirm-del">Eliminar</button>
                      <button onClick={() => setConfirmDelete(null)} className="btn-cancel-del">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(tx.id)} className="btn-delete">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <NewTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={tx => { addTransaction(tx); setModalOpen(false) }} />

      <style>{`
        .page { padding: 24px 28px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; }
        .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 3px; }
        .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .filters-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 11px; flex: 1; min-width: 180px; }
        .search-input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; width: 100%; }
        .clear-search { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 12px; padding: 0 2px; }
        .filter-tabs { display: flex; gap: 3px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 3px; }
        .filter-tab { padding: 5px 12px; border-radius: 6px; border: none; background: none; color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .filter-tab.active { background: var(--accent); color: white; }
        .category-select { display: flex; align-items: center; gap: 7px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 11px; }
        .select-native { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; cursor: pointer; }
        .tx-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow-y: auto; flex: 1; min-height: 0; }
        .tx-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 40px; padding: 10px 14px; font-size: 10px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-card); z-index: 1; }
        .tx-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 40px; padding: 10px 14px; align-items: center; border-bottom: 1px solid var(--border); font-size: 13px; transition: background 0.12s; }
        .tx-row:last-child { border-bottom: none; }
        .tx-row:hover { background: var(--bg-card-hover); }
        .tx-row:hover .btn-delete { opacity: 1; }
        .tx-desc-cell { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .tx-desc-cell span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tx-type-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tx-type-icon.income { background: rgba(34,197,94,0.15); color: var(--green); }
        .tx-type-icon.expense { background: rgba(239,68,68,0.12); color: var(--red); }
        .tag { font-size: 11px; font-weight: 500; background: var(--bg-secondary); color: var(--text-secondary); padding: 3px 7px; border-radius: 20px; border: 1px solid var(--border); width: fit-content; }
        .tx-wallet { color: var(--text-secondary); font-size: 12px; }
        .tx-date { color: var(--text-dim); font-size: 12px; }
        .tx-amt { text-align: right; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .tx-actions { display: flex; align-items: center; justify-content: center; }
        .btn-delete { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; border-radius: 5px; opacity: 0; transition: opacity 0.15s, color 0.15s; display: flex; align-items: center; }
        .btn-delete:hover { color: var(--red); }
        .confirm-delete { display: flex; gap: 4px; }
        .btn-confirm-del { background: var(--red); color: white; border: none; border-radius: 5px; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .btn-cancel-del { background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 5px; padding: 3px 8px; font-size: 11px; cursor: pointer; }
        .empty-state { padding: 48px; text-align: center; color: var(--text-dim); display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .btn-reset { background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); border-radius: 7px; padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer; }
        ${modalStyles}
      `}</style>
    </div>
  )
}
