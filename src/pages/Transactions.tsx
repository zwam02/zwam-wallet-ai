import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { transactions } from '../data/mock'

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

const categories = ['Todas', ...Array.from(new Set(transactions.map(t => t.category)))]

export default function Transactions() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [category, setCategory] = useState('Todas')

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filter === 'all' || t.type === filter
    const matchCat = category === 'Todas' || t.category === category
    return matchSearch && matchType && matchCat
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimientos</h1>
          <p className="page-subtitle">{filtered.length} transacciones encontradas</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary">
          + Nueva transacción
        </motion.button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={15} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>
        <div className="category-select">
          <Filter size={14} color="var(--text-dim)" />
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
        </div>
        <AnimatePresence mode="popLayout">
          {filtered.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.03 }}
              className="tx-row"
            >
              <div className="tx-desc-cell">
                <div className={`tx-type-icon ${tx.type}`}>
                  {tx.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </div>
                <span>{tx.description}</span>
              </div>
              <span className="tag">{tx.category}</span>
              <span className="tx-wallet">{tx.wallet === 'w1' ? 'Principal' : tx.wallet === 'w2' ? 'Ahorros' : tx.wallet === 'w3' ? 'Cripto' : 'Inversiones'}</span>
              <span className="tx-date">{tx.date}</span>
              <span className="tx-amt" style={{ color: tx.type === 'income' ? 'var(--green)' : 'var(--text-primary)' }}>
                {tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="empty-state">
            <span>Sin resultados para tu búsqueda</span>
          </div>
        )}
      </div>

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
        .filters-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .search-box {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 12px; flex: 1; min-width: 200px;
        }
        .search-input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; width: 100%; }
        .filter-tabs { display: flex; gap: 4px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 3px; }
        .filter-tab { padding: 6px 14px; border-radius: 6px; border: none; background: none; color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .filter-tab.active { background: var(--accent); color: white; }
        .category-select { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; }
        .select-native { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; cursor: pointer; }
        .tx-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .tx-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 12px 16px; font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
        .tx-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 13px 16px; align-items: center; border-bottom: 1px solid var(--border); transition: background 0.15s; font-size: 13px; }
        .tx-row:last-child { border-bottom: none; }
        .tx-row:hover { background: var(--bg-card-hover); }
        .tx-desc-cell { display: flex; align-items: center; gap: 10px; }
        .tx-type-icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tx-type-icon.income { background: rgba(34,197,94,0.15); color: var(--green); }
        .tx-type-icon.expense { background: rgba(239,68,68,0.12); color: var(--red); }
        .tag { font-size: 11px; font-weight: 500; background: var(--bg-secondary); color: var(--text-secondary); padding: 3px 8px; border-radius: 20px; border: 1px solid var(--border); width: fit-content; }
        .tx-wallet { color: var(--text-secondary); }
        .tx-date { color: var(--text-dim); }
        .tx-amt { text-align: right; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .empty-state { padding: 40px; text-align: center; color: var(--text-dim); font-size: 14px; }
      `}</style>
    </div>
  )
}
