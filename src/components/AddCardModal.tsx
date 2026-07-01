import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, CreditCard, Smartphone } from 'lucide-react'

export type PaymentMethod = {
  id: string
  category: 'credit' | 'debit' | 'digital'
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'apple_pay' | 'google_pay' | 'other'
  last4: string
  holder: string
  expiry: string
  nickname: string
  color: string
  isDefault: boolean
}

function detectBrand(num: string): PaymentMethod['brand'] {
  const n = num.replace(/\s/g, '')
  if (n.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (n.startsWith('6')) return 'discover'
  return 'other'
}

function formatCardNum(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

export const BRAND_LOGOS: Record<PaymentMethod['brand'], { label: string; color: string; gradient: string }> = {
  visa:        { label: 'Visa',        color: '#1a1f71', gradient: 'linear-gradient(135deg,#1a1f71,#2563eb)' },
  mastercard:  { label: 'Mastercard',  color: '#eb001b', gradient: 'linear-gradient(135deg,#eb001b,#f79e1b)' },
  amex:        { label: 'Amex',        color: '#007bc1', gradient: 'linear-gradient(135deg,#007bc1,#00b4e6)' },
  discover:    { label: 'Discover',    color: '#e65c00', gradient: 'linear-gradient(135deg,#e65c00,#f9d423)' },
  apple_pay:   { label: 'Apple Pay',   color: '#1d1d1f', gradient: 'linear-gradient(135deg,#1d1d1f,#48484a)' },
  google_pay:  { label: 'Google Pay',  color: '#4285f4', gradient: 'linear-gradient(135deg,#4285f4,#34a853)' },
  other:       { label: 'Tarjeta',     color: '#6c63ff', gradient: 'linear-gradient(135deg,#6c63ff,#a78bfa)' },
}

const CARD_COLORS = [
  'linear-gradient(135deg,#1a1f71,#2563eb)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#0f766e,#14b8a6)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
  'linear-gradient(135deg,#be123c,#fb7185)',
  'linear-gradient(135deg,#1d4ed8,#38bdf8)',
]

type Props = { open: boolean; onClose: () => void; onAdd: (m: PaymentMethod) => void }

export default function AddCardModal({ open, onClose, onAdd }: Props) {
  const [step, setStep] = useState<'choose' | 'card' | 'digital'>('choose')
  const [category, setCategory] = useState<'credit' | 'debit'>('credit')
  const [cardNum, setCardNum] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [nickname, setNickname] = useState('')
  const [color, setColor] = useState(CARD_COLORS[0])
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  function reset() {
    setStep('choose'); setCardNum(''); setHolder(''); setExpiry(''); setCvv('')
    setNickname(''); setColor(CARD_COLORS[0]); setErr(''); setDone(false)
  }

  function close() { reset(); onClose() }

  function addDigital(brand: 'apple_pay' | 'google_pay') {
    setDone(true)
    const m: PaymentMethod = {
      id: `pm${Date.now()}`, category: 'digital', brand,
      last4: '', holder: '', expiry: '', nickname: BRAND_LOGOS[brand].label,
      color: BRAND_LOGOS[brand].gradient, isDefault: false,
    }
    setTimeout(() => { onAdd(m); reset(); onClose() }, 900)
  }

  function submitCard(e: React.FormEvent) {
    e.preventDefault()
    const digits = cardNum.replace(/\s/g, '')
    if (digits.length < 13) { setErr('Número de tarjeta inválido'); return }
    if (!holder.trim()) { setErr('Escribe el nombre del titular'); return }
    if (expiry.length < 5) { setErr('Fecha de expiración inválida'); return }
    if (cvv.length < 3) { setErr('CVV inválido'); return }
    setErr('')
    const brand = detectBrand(digits)
    const m: PaymentMethod = {
      id: `pm${Date.now()}`, category, brand,
      last4: digits.slice(-4), holder: holder.trim(),
      expiry, nickname: nickname.trim() || `${BRAND_LOGOS[brand].label} ••••${digits.slice(-4)}`,
      color, isDefault: false,
    }
    setDone(true)
    setTimeout(() => { onAdd(m); reset(); onClose() }, 900)
  }

  const brand = detectBrand(cardNum.replace(/\s/g, ''))

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div className="cm-modal" initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} onClick={e => e.stopPropagation()}>
            <div className="cm-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {step !== 'choose' && (
                  <button onClick={() => { setStep('choose'); setErr('') }} className="cm-back">←</button>
                )}
                <h2>{step === 'choose' ? 'Vincular método de pago' : step === 'digital' ? 'Billetera digital' : 'Agregar tarjeta'}</h2>
              </div>
              <button onClick={close} className="cm-close"><X size={15} /></button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'choose' && (
                <motion.div key="choose" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="cm-choose">
                  <p className="cm-hint">Selecciona el tipo de método de pago a vincular</p>
                  <div className="cm-option-grid">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cm-option" onClick={() => { setCategory('credit'); setStep('card') }}>
                      <div className="cm-opt-icon" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}><CreditCard size={22} /></div>
                      <span className="cm-opt-label">Tarjeta de crédito</span>
                      <span className="cm-opt-sub">Visa, Mastercard, Amex...</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cm-option" onClick={() => { setCategory('debit'); setStep('card') }}>
                      <div className="cm-opt-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}><CreditCard size={22} /></div>
                      <span className="cm-opt-label">Tarjeta de débito</span>
                      <span className="cm-opt-sub">Cuenta bancaria vinculada</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="cm-option" onClick={() => setStep('digital')}>
                      <div className="cm-opt-icon" style={{ background: 'rgba(108,99,255,0.12)', color: '#a78bfa' }}><Smartphone size={22} /></div>
                      <span className="cm-opt-label">Billetera digital</span>
                      <span className="cm-opt-sub">Apple Pay, Google Pay</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 'digital' && (
                <motion.div key="digital" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="cm-digital">
                  {done ? (
                    <div className="cm-done"><div className="cm-done-icon"><Check size={26} color="var(--green)" /></div><p>¡Método vinculado!</p></div>
                  ) : (
                    <>
                      <p className="cm-hint">Conecta tu billetera digital con un solo toque</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(['apple_pay', 'google_pay'] as const).map(b => (
                          <motion.button key={b} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => addDigital(b)} className="cm-digital-btn"
                            style={{ background: BRAND_LOGOS[b].gradient }}>
                            <span className="cm-d-logo">{b === 'apple_pay' ? '' : '𝐆'}</span>
                            <div>
                              <div className="cm-d-name">{BRAND_LOGOS[b].label}</div>
                              <div className="cm-d-sub">Toca para vincular</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {step === 'card' && (
                <motion.div key="card" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {done ? (
                    <div className="cm-done"><div className="cm-done-icon"><Check size={26} color="var(--green)" /></div><p>¡Tarjeta vinculada!</p></div>
                  ) : (
                    <>
                      {/* Card preview */}
                      <div className="card-preview" style={{ background: color }}>
                        <div className="cp-top">
                          <div className="cp-chip" />
                          <span className="cp-brand">{BRAND_LOGOS[brand]?.label ?? ''}</span>
                        </div>
                        <div className="cp-num">
                          {cardNum ? cardNum.replace(/\d(?=.{4})/g, '•') : '•••• •••• •••• ••••'}
                        </div>
                        <div className="cp-bottom">
                          <div>
                            <div className="cp-label">TITULAR</div>
                            <div className="cp-value">{holder || 'NOMBRE APELLIDO'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="cp-label">EXPIRA</div>
                            <div className="cp-value">{expiry || 'MM/AA'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Color picker */}
                      <div className="cm-colors">
                        {CARD_COLORS.map(c => (
                          <button key={c} type="button" onClick={() => setColor(c)} className={`cm-color-dot ${color === c ? 'active' : ''}`} style={{ background: c }} />
                        ))}
                      </div>

                      <form onSubmit={submitCard} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="cm-field">
                          <label>Número de tarjeta</label>
                          <div className="cm-input-wrap">
                            <input className="cm-input" placeholder="0000 0000 0000 0000" value={cardNum}
                              onChange={e => { setCardNum(formatCardNum(e.target.value)); setErr('') }}
                              maxLength={19} autoFocus inputMode="numeric" />
                            <span className="cm-brand-tag">{BRAND_LOGOS[brand]?.label}</span>
                          </div>
                        </div>
                        <div className="cm-field">
                          <label>Titular de la tarjeta</label>
                          <input className="cm-input" placeholder="Como aparece en la tarjeta" value={holder}
                            onChange={e => { setHolder(e.target.value.toUpperCase()); setErr('') }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                          <div className="cm-field">
                            <label>Expiración</label>
                            <input className="cm-input" placeholder="MM/AA" value={expiry} maxLength={5}
                              onChange={e => { setExpiry(formatExpiry(e.target.value)); setErr('') }} inputMode="numeric" />
                          </div>
                          <div className="cm-field">
                            <label>CVV</label>
                            <input className="cm-input" placeholder="•••" value={cvv} maxLength={4} type="password"
                              onChange={e => { setCvv(e.target.value.replace(/\D/g, '')); setErr('') }} inputMode="numeric" />
                          </div>
                          <div className="cm-field">
                            <label>Alias (opcional)</label>
                            <input className="cm-input" placeholder="Ej: Principal" value={nickname}
                              onChange={e => setNickname(e.target.value)} />
                          </div>
                        </div>
                        {err && <p className="cm-err">{err}</p>}
                        <div className="cm-type-tabs">
                          {(['credit', 'debit'] as const).map(c => (
                            <button key={c} type="button" onClick={() => setCategory(c)} className={`cm-type-tab ${category === c ? 'active' : ''}`}>
                              {c === 'credit' ? 'Crédito' : 'Débito'}
                            </button>
                          ))}
                        </div>
                        <motion.button type="submit" className="cm-submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Check size={14} /> Vincular tarjeta
                        </motion.button>
                      </form>
                    </>
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

export const addCardStyles = `
  .cm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 200; }
  .cm-modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 18px; padding: 26px; width: 480px; max-width: calc(100vw - 32px); max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
  .cm-header { display: flex; align-items: center; justify-content: space-between; }
  .cm-header h2 { font-size: 16px; font-weight: 700; }
  .cm-back { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); font-size: 14px; }
  .cm-close { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); }
  .cm-hint { font-size: 13px; color: var(--text-secondary); }

  .cm-choose { display: flex; flex-direction: column; gap: 14px; }
  .cm-option-grid { display: flex; flex-direction: column; gap: 8px; }
  .cm-option { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: border-color 0.15s; text-align: left; }
  .cm-option:hover { border-color: var(--accent); }
  .cm-opt-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cm-opt-label { font-size: 14px; font-weight: 600; color: var(--text-primary); display: block; }
  .cm-opt-sub { font-size: 12px; color: var(--text-secondary); display: block; margin-top: 2px; }

  .cm-digital { display: flex; flex-direction: column; gap: 16px; }
  .cm-digital-btn { display: flex; align-items: center; gap: 16px; border: none; border-radius: 13px; padding: 18px 20px; cursor: pointer; transition: opacity 0.15s; }
  .cm-digital-btn:hover { opacity: 0.9; }
  .cm-d-logo { font-size: 28px; flex-shrink: 0; color: white; }
  .cm-d-name { font-size: 15px; font-weight: 700; color: white; }
  .cm-d-sub { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px; }

  .card-preview {
    border-radius: 14px; padding: 20px 22px; height: 160px;
    display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .card-preview::before { content: ''; position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.08); }
  .card-preview::after { content: ''; position: absolute; bottom: -40px; right: 20px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.05); }
  .cp-top { display: flex; align-items: center; justify-content: space-between; }
  .cp-chip { width: 32px; height: 24px; background: linear-gradient(135deg,#d4af37,#ffd700); border-radius: 4px; }
  .cp-brand { font-size: 15px; font-weight: 800; color: white; opacity: 0.9; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.5px; }
  .cp-num { font-size: 18px; font-weight: 700; color: white; letter-spacing: 3px; font-family: monospace; }
  .cp-bottom { display: flex; align-items: flex-end; justify-content: space-between; }
  .cp-label { font-size: 9px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
  .cp-value { font-size: 13px; font-weight: 600; color: white; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.5px; }

  .cm-colors { display: flex; gap: 8px; align-items: center; justify-content: center; }
  .cm-color-dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.15s; }
  .cm-color-dot.active { transform: scale(1.25); outline: 2px solid white; outline-offset: 2px; }

  .cm-field { display: flex; flex-direction: column; gap: 5px; }
  .cm-field label { font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
  .cm-input-wrap { position: relative; }
  .cm-input {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
    padding: 9px 12px; color: var(--text-primary); font-size: 13px; outline: none;
    font-family: inherit; width: 100%; box-sizing: border-box; transition: border-color 0.15s;
  }
  .cm-input:focus { border-color: var(--accent); }
  .cm-brand-tag { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: 700; color: var(--text-dim); }
  .cm-err { font-size: 12px; color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 7px 11px; }
  .cm-type-tabs { display: flex; gap: 4px; background: var(--bg-card); border-radius: 8px; padding: 3px; }
  .cm-type-tab { flex: 1; padding: 6px; border-radius: 6px; border: none; background: none; color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .cm-type-tab.active { background: var(--accent); color: white; }
  .cm-submit { display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--accent); color: white; border: none; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
  .cm-done { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 24px 0; }
  .cm-done-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(34,197,94,0.12); display: flex; align-items: center; justify-content: center; }
  .cm-done p { font-size: 15px; font-weight: 600; color: var(--text-primary); }
`
