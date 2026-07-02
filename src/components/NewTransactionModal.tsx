import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, RotateCcw } from 'lucide-react'
import type { Transaction } from '../data/mock'
import { useApp, fmtCurrency } from '../context/AppContext'

const CATEGORIES_EXPENSE = ['Alimentación', 'Vivienda', 'Transporte', 'Salud', 'Entretenimiento', 'Shopping', 'Educación', 'Cripto', 'Suscripciones', 'Restaurantes', 'Servicios', 'Otro']
const CATEGORIES_INCOME = ['Trabajo', 'Freelance', 'Inversiones', 'Cripto', 'Dividendos', 'Ventas', 'Regalo', 'Otro']

const CATEGORY_ICONS: Record<string, string> = {
  Alimentación: '🛒', Vivienda: '🏠', Transporte: '🚗', Salud: '💊', Entretenimiento: '🎬',
  Shopping: '🛍️', Educación: '📚', Cripto: '₿', Suscripciones: '📺', Restaurantes: '🍽️',
  Servicios: '⚡', Trabajo: '💼', Freelance: '💻', Inversiones: '📈', Dividendos: '💰',
  Ventas: '🏷️', Regalo: '🎁', Otro: '📌',
}

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (tx: Transaction) => void
  editTx?: Transaction | null
  onUpdate?: (id: string, patch: Partial<Transaction>) => void
}

export default function NewTransactionModal({ open, onClose, onAdd, editTx, onUpdate }: Props) {
  const { wallets, settings } = useApp()
  const isEdit = !!editTx

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Alimentación')
  const [wallet, setWallet] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editTx) {
      setType(editTx.type)
      setDescription(editTx.description)
      setAmount(String(editTx.amount))
      setCategory(editTx.category)
      setWallet(editTx.wallet)
      setDate(editTx.date)
      setNotes(editTx.notes ?? '')
      setRecurring(editTx.recurring ?? false)
    } else {
      setType('expense')
      setDescription('')
      setAmount('')
      setCategory('Alimentación')
      setWallet(wallets[0]?.id ?? '')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setRecurring(false)
    }
    setError('')
    setSuccess(false)
  }, [open, editTx])

  useEffect(() => {
    if (!wallet && wallets.length > 0) setWallet(wallets[0].id)
  }, [wallets])

  const categories = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError('Escribe una descripción'); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Monto inválido'); return }
    if (!wallet) { setError('Selecciona una billetera'); return }
    setError('')

    if (isEdit && editTx && onUpdate) {
      onUpdate(editTx.id, { description: description.trim(), amount: Number(amount), type, category, date, notes: notes.trim() || undefined, recurring, wallet })
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 900)
    } else {
      const tx: Transaction = {
        id: `t${Date.now()}`,
        description: description.trim(),
        amount: Number(amount),
        type, category, date, wallet,
        notes: notes.trim() || undefined,
        recurring,
      }
      onAdd(tx)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setDescription(''); setAmount(''); setNotes(''); setError('')
        setWallet(wallets[0]?.id ?? '')
        setDate(new Date().toISOString().split('T')[0])
        onClose()
      }, 900)
    }
  }

  const currencyLabel = settings.currency

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{isEdit ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
              <button onClick={onClose} className="close-btn"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="type-tabs">
                <button type="button" onClick={() => { setType('expense'); setCategory(CATEGORIES_EXPENSE[0]) }} className={`type-tab ${type === 'expense' ? 'active expense' : ''}`}>
                  Gasto
                </button>
                <button type="button" onClick={() => { setType('income'); setCategory(CATEGORIES_INCOME[0]) }} className={`type-tab ${type === 'income' ? 'active income' : ''}`}>
                  Ingreso
                </button>
              </div>

              <div className="field">
                <label>Descripción</label>
                <input type="text" value={description} onChange={e => { setDescription(e.target.value); setError('') }}
                  placeholder="Ej: Supermercado, Salario..." className="input" autoFocus autoComplete="off" />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Monto ({currencyLabel})</label>
                  <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError('') }}
                    placeholder="0.00" min="0.01" step="0.01" className="input" inputMode="decimal" />
                </div>
                <div className="field">
                  <label>Fecha</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
                </div>
              </div>

              <div className="field">
                <label>Categoría</label>
                <div className="cat-grid">
                  {categories.map(c => (
                    <button key={c} type="button" onClick={() => setCategory(c)}
                      className={`cat-chip ${category === c ? 'active' : ''}`}>
                      <span>{CATEGORY_ICONS[c] ?? '📌'}</span>
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {wallets.length > 0 && (
                <div className="field">
                  <label>Billetera</label>
                  <select value={wallet} onChange={e => setWallet(e.target.value)} className="input select">
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {fmtCurrency(w.balance, settings.currency)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label>Notas (opcional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Agrega detalles..." className="input textarea" rows={2} />
              </div>

              <label className="recurring-row">
                <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="checkbox" />
                <RotateCcw size={13} color="var(--text-dim)" />
                <span>Transacción recurrente (mensual)</span>
              </label>

              {error && <p className="error-msg">{error}</p>}

              <motion.button type="submit" className={`submit-btn ${success ? 'success' : type}`}
                whileHover={{ scale: success ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
                {success
                  ? <><Check size={15} /> {isEdit ? 'Actualizado' : 'Guardado'}</>
                  : isEdit ? 'Guardar cambios' : `Agregar ${type === 'expense' ? 'Gasto' : 'Ingreso'}`}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const modalStyles = `
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 16px;
  }
  .modal {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px;
    width: 480px; max-width: 100%; max-height: 90vh; overflow-y: auto;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .modal-header h2 { font-size: 17px; font-weight: 700; }
  .close-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); }
  .type-tabs { display: flex; gap: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 4px; margin-bottom: 16px; }
  .type-tab { flex: 1; padding: 8px; border-radius: 7px; border: none; background: none; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent; }
  .type-tab.active.expense { background: rgba(239,68,68,0.15); color: #ef4444; }
  .type-tab.active.income { background: rgba(34,197,94,0.15); color: #22c55e; }
  form { display: flex; flex-direction: column; gap: 13px; }
  .field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .field-row { display: flex; gap: 12px; }
  .field label { font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
  .input {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 9px 12px;
    color: var(--text-primary); font-size: 14px;
    outline: none; width: 100%; transition: border-color 0.15s;
    font-family: inherit; box-sizing: border-box; -webkit-appearance: none;
  }
  .input:focus { border-color: var(--accent); }
  .select { cursor: pointer; }
  .textarea { resize: vertical; min-height: 52px; font-size: 13px; }
  .cat-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .cat-chip {
    display: flex; align-items: center; gap: 4px;
    padding: 5px 10px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg-card); color: var(--text-secondary);
    font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }
  .cat-chip:hover { border-color: var(--accent); color: var(--accent-light); }
  .cat-chip.active { background: var(--accent-dim); border-color: rgba(108,99,255,0.5); color: var(--accent-light); font-weight: 600; }
  .recurring-row { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-secondary); }
  .checkbox { width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; }
  .error-msg { font-size: 12px; color: var(--red); background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 7px 11px; }
  .submit-btn {
    padding: 12px; border: none; border-radius: 9px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background 0.2s;
  }
  .submit-btn.expense { background: #ef4444; color: white; }
  .submit-btn.income { background: var(--green); color: white; }
  .submit-btn.success { background: var(--green); color: white; }
  @media (max-width: 480px) { .field-row { flex-direction: column; } }
`
