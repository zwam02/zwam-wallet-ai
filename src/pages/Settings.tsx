import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Bell, Shield, Globe, DollarSign, Check, User, Camera, Plus, Trash2, Target } from 'lucide-react'
import { useApp } from '../context/AppContext'

const AVATAR_COLORS = ['#6c63ff', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#ef4444', '#8b5cf6']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`toggle ${checked ? 'on' : ''}`} aria-checked={checked}>
      <motion.div className="toggle-knob" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  )
}

function Select<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as T)} className="settings-select">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Settings() {
  const { profile, updateProfile, settings, updateSettings, updateNotification, budgets, setBudget, removeBudget, exportCSV, transactions } = useApp()

  const [editingProfile, setEditingProfile] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [newBudgetCat, setNewBudgetCat] = useState('')
  const [newBudgetLimit, setNewBudgetLimit] = useState('')
  const [editingBudget, setEditingBudget] = useState<string | null>(null)
  const [budgetVal, setBudgetVal] = useState('')

  const allCategories = Array.from(new Set(transactions.map(t => t.category)))
  const availableCats = allCategories.filter(c => !budgets.find(b => b.category === c))

  function saveProfile() {
    if (!draft.name.trim()) return
    updateProfile(draft)
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditingProfile(false) }, 900)
  }

  function startEditBudget(cat: string, current: number) {
    setEditingBudget(cat)
    setBudgetVal(String(current))
  }

  function confirmBudgetEdit(cat: string) {
    const val = Number(budgetVal)
    if (!isNaN(val) && val > 0) setBudget(cat, val)
    setEditingBudget(null)
  }

  function addBudget() {
    const val = Number(newBudgetLimit)
    if (!newBudgetCat || isNaN(val) || val <= 0) return
    setBudget(newBudgetCat, val)
    setNewBudgetCat('')
    setNewBudgetLimit('')
  }

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

  // spend per category this month
  const spent: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spent[t.category] = (spent[t.category] ?? 0) + t.amount
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-subtitle">Configura tu cuenta, perfil y preferencias</p>
        </div>
      </div>

      {/* ── Perfil ── */}
      <AnimatePresence mode="wait">
        {!editingProfile ? (
          <motion.div key="profile-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="settings-profile">
            <div className="profile-avatar" style={{ background: profile.avatarColor }}>
              {getInitials(profile.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email || 'Sin email'}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            </div>
            <div className="profile-plan-badge">{profile.plan} Plan</div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setDraft(profile); setEditingProfile(true) }} className="edit-profile-btn">
              <User size={13} /> Editar perfil
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="profile-edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="profile-edit-card">
            <div className="profile-edit-header">
              <h3>Editar perfil</h3>
              <button onClick={() => setEditingProfile(false)} className="cancel-btn">Cancelar</button>
            </div>

            <div className="profile-edit-body">
              {/* Avatar */}
              <div className="avatar-section">
                <div className="edit-avatar" style={{ background: draft.avatarColor }}>
                  {getInitials(draft.name || 'U')}
                </div>
                <div>
                  <p className="avatar-label">Color del avatar</p>
                  <div className="color-row">
                    {AVATAR_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setDraft(d => ({ ...d, avatarColor: c }))}
                        style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: draft.avatarColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', outline: draft.avatarColor === c ? `2px solid ${c}` : 'none' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="edit-fields">
                <div className="field-row">
                  <div className="field">
                    <label>Nombre completo</label>
                    <input className="field-input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Tu nombre" />
                  </div>
                  <div className="field">
                    <label>Correo electrónico</label>
                    <input className="field-input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Teléfono</label>
                    <input className="field-input" type="tel" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder="+34 600 000 000" />
                  </div>
                  <div className="field">
                    <label>Plan</label>
                    <select className="field-input" value={draft.plan} onChange={e => setDraft(d => ({ ...d, plan: e.target.value as typeof draft.plan }))}>
                      <option value="Free">Free</option>
                      <option value="Pro">Pro</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Bio</label>
                  <textarea className="field-input" rows={2} value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} placeholder="Cuéntanos algo sobre ti..." style={{ resize: 'vertical' }} />
                </div>
              </div>

              <motion.button onClick={saveProfile} className={`save-btn ${saved ? 'done' : ''}`} whileHover={{ scale: saved ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
                {saved ? <><Check size={14} /> Guardado</> : 'Guardar cambios'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="settings-grid">
        {/* Apariencia */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">{settings.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}</div>
            <h3>Apariencia</h3>
          </div>
          <div className="settings-rows">
            <div className="settings-row">
              <div>
                <span className="row-label">Tema</span>
                <span className="row-desc">{settings.theme === 'dark' ? 'Modo oscuro activo' : 'Modo claro activo'}</span>
              </div>
              <div className="theme-tabs">
                <button onClick={() => updateSettings({ theme: 'dark' })} className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}><Moon size={13} /> Oscuro</button>
                <button onClick={() => updateSettings({ theme: 'light' })} className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}><Sun size={13} /> Claro</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Región */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Globe size={14} /></div>
            <h3>Región</h3>
          </div>
          <div className="settings-rows">
            <div className="settings-row">
              <div><span className="row-label">Moneda</span><span className="row-desc">Moneda predeterminada</span></div>
              <Select value={settings.currency} options={['USD', 'EUR', 'MXN', 'ARS', 'COP']} onChange={v => updateSettings({ currency: v })} />
            </div>
            <div className="settings-row">
              <div><span className="row-label">Idioma</span><span className="row-desc">Idioma de la interfaz</span></div>
              <Select value={settings.language} options={['Español', 'English']} onChange={v => updateSettings({ language: v })} />
            </div>
          </div>
        </motion.div>

        {/* Notificaciones */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Bell size={14} /></div>
            <h3>Notificaciones</h3>
          </div>
          <div className="settings-rows">
            {([
              { key: 'gastos', label: 'Alertas de gastos', desc: 'Avisa cuando superas tu presupuesto' },
              { key: 'resumen', label: 'Resumen semanal', desc: 'Recibe un resumen cada lunes' },
              { key: 'ia', label: 'Recomendaciones IA', desc: 'Insights personalizados de tu perfil' },
              { key: 'suscripciones', label: 'Suscripciones', desc: 'Alerta antes de cobros recurrentes' },
            ] as const).map(({ key, label, desc }) => (
              <div key={key} className="settings-row">
                <div><span className="row-label">{label}</span><span className="row-desc">{desc}</span></div>
                <Toggle checked={settings.notifications[key]} onChange={v => updateNotification(key, v)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Seguridad */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Shield size={14} /></div>
            <h3>Seguridad</h3>
          </div>
          <div className="settings-rows">
            <div className="settings-row">
              <div>
                <span className="row-label">Autenticación en 2 pasos</span>
                <span className="row-desc">{settings.twoFactor ? 'Habilitada — tu cuenta está protegida' : 'Recomendado para mayor seguridad'}</span>
              </div>
              <Toggle checked={settings.twoFactor} onChange={v => updateSettings({ twoFactor: v })} />
            </div>
            <div className="settings-row">
              <div><span className="row-label">Sesión activa</span><span className="row-desc">Este dispositivo · hace 2 min</span></div>
              <span className="badge-active"><Check size={10} /> Activo</span>
            </div>
          </div>
        </motion.div>

        {/* Datos y privacidad */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><DollarSign size={14} /></div>
            <h3>Datos y privacidad</h3>
          </div>
          <div className="settings-rows">
            {[
              { label: 'Exportar mis datos', desc: 'Descarga tu historial en CSV', action: exportCSV },
              { label: 'Limpiar historial', desc: 'Elimina transacciones antiguas', action: () => alert('Función en desarrollo') },
              { label: 'Eliminar cuenta', desc: 'Esta acción es irreversible', action: () => alert('Función en desarrollo'), danger: true },
            ].map(item => (
              <div key={item.label} className="settings-row">
                <div>
                  <span className="row-label" style={item.danger ? { color: 'var(--red)' } : {}}>{item.label}</span>
                  <span className="row-desc">{item.desc}</span>
                </div>
                <button onClick={item.action} className={`action-btn ${item.danger ? 'danger' : ''}`}>
                  {item.label === 'Exportar mis datos' ? 'Exportar' : item.label === 'Limpiar historial' ? 'Limpiar' : 'Eliminar'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resumen */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Check size={14} /></div>
            <h3>Configuración actual</h3>
          </div>
          <div className="summary-grid">
            {[
              { label: 'Tema', value: settings.theme === 'dark' ? 'Oscuro' : 'Claro' },
              { label: 'Moneda', value: settings.currency },
              { label: 'Idioma', value: settings.language },
              { label: '2FA', value: settings.twoFactor ? 'Activo' : 'Inactivo' },
              { label: 'Notif.', value: Object.values(settings.notifications).filter(Boolean).length + '/4' },
              { label: 'Plan', value: profile.plan },
            ].map(({ label, value }) => (
              <div key={label} className="summary-item">
                <span className="sum-label">{label}</span>
                <span className="sum-value">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Presupuestos */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="settings-card budget-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Target size={14} /></div>
            <h3>Presupuestos mensuales</h3>
          </div>

          <div className="budget-list">
            {budgets.map(b => {
              const s = spent[b.category] ?? 0
              const pct = Math.min(100, Math.round((s / b.limit) * 100))
              const over = s > b.limit
              const warn = pct >= 75 && !over
              const color = over ? 'var(--red)' : warn ? 'var(--yellow)' : 'var(--green)'

              return (
                <div key={b.category} className="budget-row">
                  <div className="budget-row-top">
                    <span className="budget-cat">{b.category}</span>
                    {editingBudget === b.category ? (
                      <div className="budget-edit-inline">
                        <input className="budget-input" type="number" value={budgetVal} onChange={e => setBudgetVal(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && confirmBudgetEdit(b.category)} />
                        <button onClick={() => confirmBudgetEdit(b.category)} className="budget-save"><Check size={11} /></button>
                        <button onClick={() => setEditingBudget(null)} className="budget-cancel">✕</button>
                      </div>
                    ) : (
                      <div className="budget-amounts">
                        <span style={{ color }}>${fmt(s)}</span>
                        <span className="budget-sep">/</span>
                        <button onClick={() => startEditBudget(b.category, b.limit)} className="budget-limit-btn">${fmt(b.limit)}</button>
                        <button onClick={() => removeBudget(b.category)} className="budget-remove"><Trash2 size={11} /></button>
                      </div>
                    )}
                  </div>
                  <div className="budget-bar-bg">
                    <motion.div className="budget-bar-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                  </div>
                  <span className="budget-pct-label" style={{ color }}>{pct}% usado{over ? ' — ¡Superado!' : warn ? ' — ¡Cerca del límite!' : ''}</span>
                </div>
              )
            })}
          </div>

          {availableCats.length > 0 && (
            <div className="add-budget-row">
              <select className="budget-cat-select" value={newBudgetCat} onChange={e => setNewBudgetCat(e.target.value)}>
                <option value="">Categoría...</option>
                {availableCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="budget-limit-input" type="number" placeholder="Límite $" value={newBudgetLimit} onChange={e => setNewBudgetLimit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBudget()} />
              <button onClick={addBudget} className="add-budget-btn"><Plus size={13} /> Añadir</button>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        .page { padding: 24px 28px; height: 100vh; box-sizing: border-box; overflow-y: auto; }
        .page-header { margin-bottom: 14px; }
        .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

        /* Profile view */
        .settings-profile { display: flex; align-items: center; gap: 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 14px; }
        .profile-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: white; flex-shrink: 0; transition: background 0.3s; }
        .profile-name { font-size: 15px; font-weight: 700; }
        .profile-email { font-size: 12px; color: var(--text-secondary); margin-top: 1px; }
        .profile-bio { font-size: 11px; color: var(--text-dim); margin-top: 3px; font-style: italic; }
        .profile-plan-badge { background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); padding: 4px 11px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .edit-profile-btn { display: flex; align-items: center; gap: 6px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 7px 13px; font-size: 12px; font-weight: 600; color: var(--text-secondary); cursor: pointer; white-space: nowrap; }
        .edit-profile-btn:hover { color: var(--text-primary); border-color: var(--accent); }

        /* Profile edit */
        .profile-edit-card { background: var(--bg-card); border: 1px solid var(--accent); border-radius: 12px; padding: 20px; margin-bottom: 14px; }
        .profile-edit-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .profile-edit-header h3 { font-size: 14px; font-weight: 700; }
        .cancel-btn { background: none; border: none; color: var(--text-dim); font-size: 13px; cursor: pointer; }
        .cancel-btn:hover { color: var(--text-primary); }
        .profile-edit-body { display: flex; flex-direction: column; gap: 16px; }
        .avatar-section { display: flex; align-items: center; gap: 16px; }
        .edit-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: white; flex-shrink: 0; }
        .avatar-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .color-row { display: flex; gap: 7px; align-items: center; }
        .edit-fields { display: flex; flex-direction: column; gap: 12px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
        .field-input { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text-primary); font-size: 13px; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
        .field-input:focus { border-color: var(--accent); }
        .save-btn { padding: 11px; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .save-btn.done { background: var(--green); }

        /* Settings grid */
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 24px; }
        .settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .budget-card { grid-column: span 2; }
        .settings-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .settings-icon { width: 26px; height: 26px; background: var(--accent-dim); color: var(--accent-light); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .settings-card-header h3 { font-size: 13px; font-weight: 600; }
        .settings-rows { display: flex; flex-direction: column; gap: 2px; }
        .settings-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 6px; border-radius: 7px; gap: 12px; }
        .settings-row:hover { background: var(--bg-card-hover); }
        .row-label { font-size: 13px; font-weight: 500; display: block; }
        .row-desc { font-size: 11px; color: var(--text-dim); display: block; margin-top: 1px; }
        .theme-tabs { display: flex; gap: 4px; flex-shrink: 0; }
        .theme-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-secondary); font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .theme-btn.active { background: var(--accent-dim); color: var(--accent-light); border-color: rgba(108,99,255,0.3); }
        .settings-select { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 7px; padding: 6px 10px; color: var(--text-primary); font-size: 12px; cursor: pointer; outline: none; flex-shrink: 0; }
        .toggle { width: 40px; height: 22px; border-radius: 11px; border: none; background: var(--border); cursor: pointer; padding: 3px; display: flex; align-items: center; flex-shrink: 0; transition: background 0.2s; }
        .toggle.on { background: var(--accent); justify-content: flex-end; }
        .toggle-knob { width: 16px; height: 16px; border-radius: 50%; background: white; flex-shrink: 0; }
        .badge-active { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--green); background: rgba(34,197,94,0.12); padding: 4px 10px; border-radius: 20px; flex-shrink: 0; }
        .action-btn { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 7px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: var(--text-secondary); cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .action-btn:hover { color: var(--text-primary); border-color: var(--accent); }
        .action-btn.danger { color: var(--red); }
        .action-btn.danger:hover { border-color: var(--red); background: rgba(239,68,68,0.08); }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .summary-item { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 3px; }
        .sum-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.4px; }
        .sum-value { font-size: 14px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }

        /* Budgets */
        .budget-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
        .budget-row { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 9px; padding: 12px; }
        .budget-row-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
        .budget-cat { font-size: 13px; font-weight: 600; }
        .budget-amounts { display: flex; align-items: center; gap: 4px; font-size: 12px; font-family: 'Space Grotesk', sans-serif; }
        .budget-sep { color: var(--text-dim); }
        .budget-limit-btn { background: none; border: none; color: var(--text-secondary); font-size: 12px; font-family: 'Space Grotesk', sans-serif; cursor: pointer; padding: 0; text-decoration: underline dotted; text-underline-offset: 2px; }
        .budget-limit-btn:hover { color: var(--accent-light); }
        .budget-remove { background: none; border: none; color: var(--text-dim); cursor: pointer; display: flex; align-items: center; padding: 2px; border-radius: 4px; }
        .budget-remove:hover { color: var(--red); }
        .budget-bar-bg { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
        .budget-bar-fill { height: 100%; border-radius: 2px; }
        .budget-pct-label { font-size: 10px; color: var(--text-dim); }
        .budget-edit-inline { display: flex; align-items: center; gap: 4px; }
        .budget-input { background: var(--bg-card); border: 1px solid var(--accent); border-radius: 5px; padding: 3px 7px; color: var(--text-primary); font-size: 12px; outline: none; width: 70px; font-family: 'Space Grotesk', sans-serif; }
        .budget-save { background: var(--green); color: white; border: none; border-radius: 4px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .budget-cancel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-dim); font-size: 11px; }
        .add-budget-row { display: flex; align-items: center; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border); }
        .budget-cat-select { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px; color: var(--text-primary); font-size: 12px; outline: none; flex: 1; }
        .budget-limit-input { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px; color: var(--text-primary); font-size: 12px; outline: none; width: 110px; font-family: 'Space Grotesk', sans-serif; }
        .budget-limit-input:focus, .budget-cat-select:focus { border-color: var(--accent); }
        .add-budget-btn { display: flex; align-items: center; gap: 5px; background: var(--accent); color: white; border: none; border-radius: 7px; padding: 7px 13px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
      `}</style>
    </div>
  )
}
