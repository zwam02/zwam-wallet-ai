import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowUpRight, ArrowDownRight, Trash2, Plus, Pencil, ChevronDown, RotateCcw } from 'lucide-react'
import { useApp, fmtCurrency } from '../context/AppContext'
import NewTransactionModal, { modalStyles } from '../components/NewTransactionModal'
import type { Transaction } from '../data/mock'

const fmt = (n: number, c: Parameters<typeof fmtCurrency>[1] = 'USD') => fmtCurrency(n, c)

function groupByDate(txs: Transaction[]): { date: string; label: string; items: Transaction[] }[] {
  const groups: Record<string, Transaction[]> = {}
  txs.forEach(t => {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  })
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => {
      let label = new Date(date + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      if (date === today) label = 'Hoy'
      else if (date === yesterday) label = 'Ayer'
      else label = label.replace(/^\w/, c => c.toUpperCase())
      return { date, label, items }
    })
}

export default function Transactions() {
  const { transactions, wallets, deleteTransaction, addTransaction, updateTransaction, settings } = useApp()
  const walletName = Object.fromEntries(wallets.map(w => [w.id, w.name]))
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [category, setCategory] = useState('Todas')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [grouped, setGrouped] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const categories = ['Todas', ...Array.from(new Set(transactions.map(t => t.category)))]

  const filtered = useMemo(() => {
    let list = transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchType = filter === 'all' || t.type === filter
      const matchCat = category === 'Todas' || t.category === category
      return matchSearch && matchType && matchCat
    })
    if (sortBy === 'amount') list = [...list].sort((a, b) => b.amount - a.amount)
    return list
  }, [transactions, search, filter, category, sortBy])

  const totalIngresos = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalGastos = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  function openEdit(tx: Transaction) {
    setEditTx(tx)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTx(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimientos</h1>
          <p className="page-subtitle">
            {filtered.length} transacciones · <span style={{ color: 'var(--green)' }}>+{fmt(totalIngresos, settings.currency)}</span> · <span style={{ color: 'var(--red)' }}>-{fmt(totalGastos, settings.currency)}</span>
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => { setEditTx(null); setModalOpen(true) }}>
          <Plus size={14} /> <span className="btn-label-tx">Nueva</span>
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
        <div className="filter-controls">
          <div className="category-select">
            <Filter size={13} color="var(--text-dim)" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="select-native">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => setSortBy(s => s === 'date' ? 'amount' : 'date')} className="sort-btn" title="Ordenar">
            <ChevronDown size={13} />
            <span>{sortBy === 'date' ? 'Fecha' : 'Monto'}</span>
          </button>
          <button onClick={() => setGrouped(g => !g)} className={`sort-btn ${grouped ? 'active' : ''}`} title="Agrupar por fecha">
            Agrupar
          </button>
        </div>
      </div>

      <div className="tx-table">
        {!grouped && (
          <div className="tx-table-header">
            <span>Descripción</span>
            <span>Categoría</span>
            <span>Billetera</span>
            <span>Fecha</span>
            <span style={{ textAlign: 'right' }}>Monto</span>
            <span></span>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
              <Search size={28} color="var(--text-dim)" />
              <p>Sin resultados para tu búsqueda</p>
              <button onClick={() => { setSearch(''); setFilter('all'); setCategory('Todas') }} className="btn-reset">Limpiar filtros</button>
            </motion.div>
          ) : grouped ? (
            groups.map(group => (
              <div key={group.date}>
                <div className="group-header">
                  <span className="group-label">{group.label}</span>
                  <span className="group-total" style={{ color: 'var(--text-dim)' }}>
                    {group.items.filter(t => t.type === 'expense').length > 0 && `-${fmt(group.items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), settings.currency)}`}
                  </span>
                </div>
                {group.items.map((tx, i) => (
                  <TxRow key={tx.id} tx={tx} i={i} walletName={walletName} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} deleteTransaction={deleteTransaction} openEdit={openEdit} fmt={(n) => fmt(n, settings.currency)} grouped />
                ))}
              </div>
            ))
          ) : (
            filtered.map((tx, i) => (
              <TxRow key={tx.id} tx={tx} i={i} walletName={walletName} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} deleteTransaction={deleteTransaction} openEdit={openEdit} fmt={(n) => fmt(n, settings.currency)} grouped={false} />
            ))
          )}
        </AnimatePresence>
      </div>

      <NewTransactionModal
        open={modalOpen}
        onClose={closeModal}
        onAdd={tx => { addTransaction(tx); closeModal() }}
        editTx={editTx}
        onUpdate={(id, patch) => { updateTransaction(id, patch); closeModal() }}
      />

      <style>{`
        .page { padding: 20px 24px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; }
        .page-title { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 11px; color: var(--text-secondary); margin-top: 3px; }
        .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
        .btn-label-tx { }
        .filters-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 8px 11px; flex: 1; min-width: 140px; }
        .search-input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 14px; width: 100%; }
        .clear-search { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 12px; padding: 0 2px; }
        .filter-tabs { display: flex; gap: 3px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 3px; }
        .filter-tab { padding: 6px 12px; border-radius: 6px; border: none; background: none; color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent; }
        .filter-tab.active { background: var(--accent); color: white; }
        .filter-controls { display: flex; gap: 6px; align-items: center; }
        .category-select { display: flex; align-items: center; gap: 7px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 10px; }
        .select-native { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; cursor: pointer; }
        .sort-btn { display: flex; align-items: center; gap: 5px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 10px; font-size: 12px; color: var(--text-secondary); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .sort-btn.active { background: var(--accent-dim); border-color: rgba(108,99,255,0.4); color: var(--accent-light); }
        .tx-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow-y: auto; flex: 1; min-height: 0; }
        .tx-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 72px; padding: 10px 14px; font-size: 10px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-card); z-index: 1; }
        .group-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px 5px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-card); z-index: 1; }
        .group-label { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }
        .group-total { font-size: 11px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; }
        .tx-row-flat { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 72px; padding: 10px 14px; align-items: center; border-bottom: 1px solid var(--border); font-size: 13px; transition: background 0.12s; }
        .tx-row-grouped { display: grid; grid-template-columns: auto 1fr auto auto; gap: 0 10px; padding: 9px 14px; align-items: center; border-bottom: 1px solid var(--border); font-size: 13px; transition: background 0.12s; }
        .tx-row-flat:last-child, .tx-row-grouped:last-child { border-bottom: none; }
        .tx-row-flat:hover, .tx-row-grouped:hover { background: var(--bg-card-hover); }
        .tx-row-flat:hover .btn-delete, .tx-row-grouped:hover .btn-delete { opacity: 1; }
        .tx-row-flat:hover .btn-edit, .tx-row-grouped:hover .btn-edit { opacity: 1; }
        .tx-desc-cell { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .tx-desc-cell span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tx-type-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tx-type-icon.income { background: rgba(34,197,94,0.15); color: var(--green); }
        .tx-type-icon.expense { background: rgba(239,68,68,0.12); color: var(--red); }
        .tag { font-size: 11px; font-weight: 500; background: var(--bg-secondary); color: var(--text-secondary); padding: 3px 7px; border-radius: 20px; border: 1px solid var(--border); width: fit-content; }
        .tx-wallet { color: var(--text-secondary); font-size: 12px; }
        .tx-date { color: var(--text-dim); font-size: 12px; }
        .tx-amt { text-align: right; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .tx-actions { display: flex; align-items: center; justify-content: center; gap: 3px; }
        .btn-delete { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 6px; border-radius: 5px; opacity: 0; transition: opacity 0.15s, color 0.15s; display: flex; align-items: center; }
        .btn-delete:hover { color: var(--red); }
        .btn-edit { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 6px; border-radius: 5px; opacity: 0; transition: opacity 0.15s, color 0.15s; display: flex; align-items: center; }
        .btn-edit:hover { color: var(--accent-light); }
        .confirm-delete { display: flex; gap: 4px; }
        .btn-confirm-del { background: var(--red); color: white; border: none; border-radius: 5px; padding: 4px 8px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .btn-cancel-del { background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 5px; padding: 4px 8px; font-size: 11px; cursor: pointer; }
        .empty-state { padding: 48px; text-align: center; color: var(--text-dim); display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .btn-reset { background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); border-radius: 7px; padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .tx-note { font-size: 10px; color: var(--text-dim); font-style: italic; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .recurring-badge { font-size: 9px; color: var(--accent-light); background: var(--accent-dim); border-radius: 20px; padding: 1px 5px; }

        @media (max-width: 768px) {
          .page { padding: 16px 14px; }
          .page-subtitle { display: none; }
          .filter-controls { display: none; }
          .filter-tab { padding: 6px 10px; font-size: 11px; }
          .tx-table-header { display: none; }
          .tx-row-flat { grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 2px 8px; padding: 12px 14px; }
          .tx-desc-cell { grid-column: 1; grid-row: 1; }
          .tx-amt { grid-column: 2; grid-row: 1; font-size: 14px; }
          .tag { grid-column: 1; grid-row: 2; font-size: 10px; }
          .tx-wallet, .tx-date { display: none; }
          .tx-actions { grid-column: 2; grid-row: 2; justify-content: flex-end; }
          .btn-delete, .btn-edit { opacity: 1; }
          .tx-row-grouped { grid-template-columns: auto 1fr auto auto; padding: 11px 14px; }
          .btn-label-tx { display: none; }
        }
        ${modalStyles}
      `}</style>
    </div>
  )
}

function TxRow({ tx, i, walletName, confirmDelete, setConfirmDelete, deleteTransaction, openEdit, fmt, grouped }: {
  tx: Transaction; i: number; walletName: Record<string, string>;
  confirmDelete: string | null; setConfirmDelete: (id: string | null) => void;
  deleteTransaction: (id: string) => void; openEdit: (tx: Transaction) => void;
  fmt: (n: number) => string; grouped: boolean;
}) {
  const rowClass = grouped ? 'tx-row-grouped' : 'tx-row-flat'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ delay: Math.min(i * 0.02, 0.15) }}
      className={rowClass}
    >
      <div className={`tx-type-icon ${tx.type}`} style={{ gridColumn: 1 }}>
        {tx.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      </div>
      <div style={{ gridColumn: 2, minWidth: 0 }}>
        <div className="tx-desc-cell" style={{ gap: 6 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
            {tx.description}
          </span>
          {tx.recurring && <RotateCcw size={10} color="var(--accent-light)" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span className="tag">{tx.category}</span>
          {!grouped && <span className="tx-wallet">{walletName[tx.wallet] ?? tx.wallet}</span>}
          {!grouped && <span className="tx-date">{tx.date}</span>}
          {tx.notes && <span className="tx-note">{tx.notes}</span>}
        </div>
      </div>
      <span className="tx-amt" style={{ color: tx.type === 'income' ? 'var(--green)' : 'var(--text-primary)', gridColumn: 3 }}>
        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
      </span>
      <div className="tx-actions" style={{ gridColumn: 4 }}>
        {confirmDelete === tx.id ? (
          <div className="confirm-delete">
            <button onClick={() => { deleteTransaction(tx.id); setConfirmDelete(null) }} className="btn-confirm-del">Eliminar</button>
            <button onClick={() => setConfirmDelete(null)} className="btn-cancel-del">No</button>
          </div>
        ) : (
          <>
            <button onClick={() => openEdit(tx)} className="btn-edit"><Pencil size={12} /></button>
            <button onClick={() => setConfirmDelete(tx.id)} className="btn-delete"><Trash2 size={13} /></button>
          </>
        )}
      </div>
    </motion.div>
  )
}
