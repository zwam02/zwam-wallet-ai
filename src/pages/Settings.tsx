import { motion } from 'framer-motion'
import { Moon, Sun, Bell, Shield, Globe, DollarSign, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? 'on' : ''}`}
      aria-checked={checked}
    >
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

export default function Settings() {
  const { settings, updateSettings, updateNotification } = useApp()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-subtitle">Configura tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="settings-profile">
        <div className="profile-avatar">JD</div>
        <div>
          <h2 className="profile-name">Juan Díaz</h2>
          <p className="profile-email">juan@zwam.ai</p>
        </div>
        <div className="profile-plan-badge">Pro Plan</div>
      </div>

      <div className="settings-grid">
        {/* Apariencia */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              {settings.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            </div>
            <h3>Apariencia</h3>
          </div>
          <div className="settings-rows">
            <div className="settings-row">
              <div>
                <span className="row-label">Tema</span>
                <span className="row-desc">{settings.theme === 'dark' ? 'Modo oscuro activo' : 'Modo claro activo'}</span>
              </div>
              <div className="theme-tabs">
                <button onClick={() => updateSettings({ theme: 'dark' })} className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}>
                  <Moon size={13} /> Oscuro
                </button>
                <button onClick={() => updateSettings({ theme: 'light' })} className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}>
                  <Sun size={13} /> Claro
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Moneda e idioma */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><Globe size={14} /></div>
            <h3>Región</h3>
          </div>
          <div className="settings-rows">
            <div className="settings-row">
              <div>
                <span className="row-label">Moneda</span>
                <span className="row-desc">Moneda predeterminada</span>
              </div>
              <Select value={settings.currency} options={['USD', 'EUR', 'MXN', 'ARS', 'COP']} onChange={v => updateSettings({ currency: v })} />
            </div>
            <div className="settings-row">
              <div>
                <span className="row-label">Idioma</span>
                <span className="row-desc">Idioma de la interfaz</span>
              </div>
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
                <div>
                  <span className="row-label">{label}</span>
                  <span className="row-desc">{desc}</span>
                </div>
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
              <div>
                <span className="row-label">Sesión activa</span>
                <span className="row-desc">Este dispositivo · hace 2 min</span>
              </div>
              <span className="badge-active"><Check size={10} /> Activo</span>
            </div>
          </div>
        </motion.div>

        {/* Datos */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon"><DollarSign size={14} /></div>
            <h3>Datos y privacidad</h3>
          </div>
          <div className="settings-rows">
            {[
              { label: 'Exportar mis datos', desc: 'Descarga tu historial en CSV', action: () => exportCSV() },
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

        {/* Resumen de configuración */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="settings-card summary-card">
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
              { label: 'Notif. activas', value: Object.values(settings.notifications).filter(Boolean).length + '/4' },
              { label: 'Plan', value: 'Pro' },
            ].map(({ label, value }) => (
              <div key={label} className="summary-item">
                <span className="sum-label">{label}</span>
                <span className="sum-value">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .page { padding: 24px 28px; max-width: 960px; overflow-y: auto; height: 100vh; box-sizing: border-box; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
        .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .settings-profile { display: flex; align-items: center; gap: 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }
        .profile-avatar { width: 44px; height: 44px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: white; flex-shrink: 0; }
        .profile-name { font-size: 15px; font-weight: 700; }
        .profile-email { font-size: 12px; color: var(--text-secondary); margin-top: 1px; }
        .profile-plan-badge { margin-left: auto; background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); padding: 4px 11px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
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
        .summary-card { grid-column: span 2; }
        .summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .summary-item { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 3px; }
        .sum-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.4px; }
        .sum-value { font-size: 14px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </div>
  )
}

function exportCSV() {
  try {
    const { transactions } = (window as any).__zwam_ctx__ || {}
    const rows = [['ID','Descripción','Monto','Tipo','Categoría','Fecha','Billetera']]
    const data = JSON.parse(localStorage.getItem('zwam-txs') || '[]')
    if (!data.length) {
      alert('No hay datos para exportar aún. Agrega transacciones primero.')
      return
    }
    data.forEach((t: any) => rows.push([t.id, t.description, t.amount, t.type, t.category, t.date, t.wallet]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'zwam-transacciones.csv'; a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Exportación disponible una vez que agregues transacciones.')
  }
}
