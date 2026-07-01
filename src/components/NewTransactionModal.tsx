import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import type { Transaction } from '../data/mock'
import { useApp } from '../context/AppContext'

const categories = ['Trabajo', 'Vivienda', 'Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Shopping', 'Cripto', 'Inversiones', 'Otro']

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (tx: Transaction) => void
}

export default function NewTransactionModal({ open, onClose, onAdd }: Props) {
  const { wallets } = useApp()
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Alimentación')
  const [wallet, setWallet] = useState(() => wallets[0]?.id ?? 'w1')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError('Escribe una descripción'); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Monto inválido'); return }

    const tx: Transaction = {
      id: `t${Date.now()}`,
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      wallet,
    }
    onAdd(tx)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setDescription('')
      setAmount('')
      setCategory('Alimentación')
      setWallet('w1')
      setDate(new Date().toISOString().split('T')[0])
      setError('')
      onClose()
    }, 900)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
              <h2>Nueva Transacción</h2>
              <button onClick={onClose} className="close-btn"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="type-tabs">
                <button type="button" onClick={() => setType('expense')} className={`type-tab ${type === 'expense' ? 'active expense' : ''}`}>Gasto</button>
                <button type="button" onClick={() => setType('income')} className={`type-tab ${type === 'income' ? 'active income' : ''}`}>Ingreso</button>
              </div>

              <div className="field">
                <label>Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => { setDescription(e.target.value); setError('') }}
                  placeholder="Ej: Supermercado, Salario..."
                  className="input"
                  autoFocus
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Monto (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setError('') }}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="input"
                  />
                </div>
                <div className="field">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="input select">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Billetera</label>
                  <select value={wallet} onChange={e => setWallet(e.target.value)} className="input select">
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <motion.button
                type="submit"
                className={`submit-btn ${success ? 'success' : type}`}
                whileHover={{ scale: success ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {success ? <><Check size={15} /> Guardado</> : `Agregar ${type === 'expense' ? 'Gasto' : 'Ingreso'}`}
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
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    width: 440px;
    max-width: calc(100vw - 32px);
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-header h2 { font-size: 17px; font-weight: 700; }
  .close-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); transition: color 0.15s; }
  .close-btn:hover { color: var(--text-primary); }
  .type-tabs { display: flex; gap: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 4px; margin-bottom: 18px; }
  .type-tab { flex: 1; padding: 8px; border-radius: 7px; border: none; background: none; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .type-tab.active.expense { background: rgba(239,68,68,0.15); color: #ef4444; }
  .type-tab.active.income { background: rgba(34,197,94,0.15); color: #22c55e; }
  form { display: flex; flex-direction: column; gap: 14px; }
  .field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .field-row { display: flex; gap: 12px; }
  .field label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
  .input {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 9px 12px;
    color: var(--text-primary); font-size: 13px;
    outline: none; width: 100%; transition: border-color 0.15s;
    font-family: inherit;
  }
  .input:focus { border-color: var(--accent); }
  .select { cursor: pointer; }
  .error-msg { font-size: 12px; color: var(--red); margin-top: -6px; }
  .submit-btn {
    padding: 11px; border: none; border-radius: 9px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background 0.2s;
  }
  .submit-btn.expense { background: #ef4444; color: white; }
  .submit-btn.income { background: var(--green); color: white; }
  .submit-btn.success { background: var(--green); color: white; }
`
