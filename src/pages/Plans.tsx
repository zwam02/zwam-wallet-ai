import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, Zap, Building2, X, Crown } from 'lucide-react'
import { useApp } from '../context/AppContext'

type PlanId = 'Free' | 'Pro' | 'Business'

const plans: {
  id: PlanId
  name: string
  price: string
  period: string
  description: string
  icon: typeof Sparkles
  color: string
  badge?: string
  features: string[]
  missing: string[]
}[] = [
  {
    id: 'Free',
    name: 'Free',
    price: '$0',
    period: 'para siempre',
    description: 'Para empezar a controlar tus finanzas.',
    icon: Zap,
    color: '#9090a8',
    features: [
      'Hasta 2 billeteras',
      'Hasta 50 transacciones',
      'Dashboard básico',
      'Categorías de gasto',
    ],
    missing: [
      'IA Insights',
      'Billeteras Web3',
      'Exportar CSV',
      'Presupuestos ilimitados',
      'Soporte prioritario',
    ],
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: '$9,99',
    period: 'por mes',
    description: 'Para usuarios que quieren el control total.',
    icon: Sparkles,
    color: '#6c63ff',
    badge: 'Más popular',
    features: [
      'Billeteras ilimitadas',
      'Transacciones ilimitadas',
      'IA Insights completo',
      'Billeteras Web3 / Cripto',
      'Exportar CSV',
      'Presupuestos ilimitados',
      'Gráficos avanzados',
      'Soporte prioritario',
    ],
    missing: [
      'API de integración',
      'Multiusuario / equipo',
    ],
  },
  {
    id: 'Business',
    name: 'Business',
    price: '$24,99',
    period: 'por mes',
    description: 'Para equipos y negocios en crecimiento.',
    icon: Building2,
    color: '#f59e0b',
    badge: 'Empresas',
    features: [
      'Todo lo de Pro',
      'Hasta 10 usuarios del equipo',
      'API REST de integración',
      'Dashboard de empresa',
      'Reportes automáticos PDF',
      'Roles y permisos',
      'Soporte 24/7 dedicado',
      'SLA garantizado',
    ],
    missing: [],
  },
]

export default function Plans() {
  const { profile, updateProfile } = useApp()
  const [selected, setSelected] = useState<PlanId | null>(null)
  const [success, setSuccess] = useState(false)

  function handleUpgrade(planId: PlanId) {
    if (planId === profile.plan) return
    setSelected(planId)
  }

  function confirmUpgrade() {
    if (!selected) return
    updateProfile({ plan: selected })
    const accounts: Record<string, { name: string; password: string; plan: PlanId }> =
      JSON.parse(localStorage.getItem('zwam-accounts') || '{}')
    const email = localStorage.getItem('zwam-auth-email') || ''
    if (accounts[email]) {
      accounts[email].plan = selected
      localStorage.setItem('zwam-accounts', JSON.stringify(accounts))
    }
    setSuccess(true)
    setTimeout(() => { setSelected(null); setSuccess(false) }, 1800)
  }

  return (
    <div className="plans-page">
      <div className="plans-header">
        <div>
          <h1 className="plans-title">Planes y Suscripción</h1>
          <p className="plans-sub">Tu plan actual: <strong style={{ color: 'var(--accent-light)' }}>{profile.plan}</strong></p>
        </div>
        <div className="current-badge">
          <Crown size={13} />
          {profile.plan}
        </div>
      </div>

      <div className="plans-grid">
        {plans.map((plan, i) => {
          const Icon = plan.icon
          const isCurrent = plan.id === profile.plan
          const isPro = plan.id === 'Pro'
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`plan-card ${isPro ? 'plan-featured' : ''} ${isCurrent ? 'plan-current' : ''}`}
            >
              {plan.badge && (
                <div className="plan-badge" style={{ background: `${plan.color}22`, color: plan.color, border: `1px solid ${plan.color}44` }}>
                  {plan.badge}
                </div>
              )}
              {isCurrent && (
                <div className="plan-current-tag">Plan actual</div>
              )}
              <div className="plan-icon" style={{ background: `${plan.color}18`, color: plan.color }}>
                <Icon size={20} />
              </div>
              <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
              <div className="plan-pricing">
                <span className="plan-price">{plan.price}</span>
                <span className="plan-period">/{plan.period}</span>
              </div>
              <p className="plan-desc">{plan.description}</p>

              <div className="plan-features">
                {plan.features.map(f => (
                  <div key={f} className="plan-feature">
                    <Check size={12} color={plan.color} />
                    <span>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="plan-feature missing">
                    <X size={12} color="var(--text-dim)" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent}
                className={`plan-btn ${isPro ? 'plan-btn-primary' : ''} ${isCurrent ? 'plan-btn-disabled' : ''}`}
                style={isPro && !isCurrent ? { background: plan.color } : {}}
              >
                {isCurrent ? 'Plan actual' : plan.id === 'Free' ? 'Bajar a Free' : `Actualizar a ${plan.name}`}
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="plans-faq">
        <h3>Preguntas frecuentes</h3>
        <div className="faq-grid">
          {[
            { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes subir o bajar de plan cuando quieras. Los cambios se aplican de forma inmediata.' },
            { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas Visa, Mastercard, American Express y PayPal.' },
            { q: '¿Hay descuento anual?', a: 'Sí, pagando anualmente obtienes 2 meses gratis (equivale a un 16% de descuento).' },
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Claro. Sin permanencia ni penalizaciones. Cancela desde Ajustes con un clic.' },
          ].map(({ q, a }) => (
            <div key={q} className="faq-item">
              <p className="faq-q">{q}</p>
              <p className="faq-a">{a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="confirm-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={e => e.stopPropagation()}>
              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="success-state">
                  <div className="success-icon"><Check size={28} color="var(--green)" /></div>
                  <p>¡Plan actualizado a <strong>{selected}</strong>!</p>
                </motion.div>
              ) : (
                <>
                  <h3>Confirmar cambio de plan</h3>
                  <p>¿Quieres cambiar tu plan de <strong>{profile.plan}</strong> a <strong>{selected}</strong>?</p>
                  <div className="confirm-actions">
                    <button onClick={() => setSelected(null)} className="btn-cancel">Cancelar</button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmUpgrade} className="btn-confirm">
                      Confirmar
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .plans-page { padding: 24px 28px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }
        .plans-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .plans-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .plans-sub { font-size: 13px; color: var(--text-secondary); margin-top: 3px; }
        .current-badge { display: flex; align-items: center; gap: 7px; background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }

        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; flex-shrink: 0; }
        .plan-card {
          background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;
          padding: 22px; display: flex; flex-direction: column; gap: 12px;
          position: relative; transition: border-color 0.2s;
        }
        .plan-card:hover { border-color: var(--accent); }
        .plan-featured { border-color: #6c63ff; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(108,99,255,0.05) 100%); }
        .plan-current { border-color: var(--green); }
        .plan-badge {
          position: absolute; top: -1px; right: 16px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 3px 10px; border-radius: 0 0 8px 8px;
        }
        .plan-current-tag {
          position: absolute; top: -1px; left: 16px;
          font-size: 10px; font-weight: 700; color: var(--green);
          background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
          padding: 3px 10px; border-radius: 0 0 8px 8px;
        }
        .plan-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-top: 8px; }
        .plan-name { font-size: 20px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.4px; }
        .plan-pricing { display: flex; align-items: baseline; gap: 4px; }
        .plan-price { font-size: 32px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; letter-spacing: -1px; color: var(--text-primary); }
        .plan-period { font-size: 13px; color: var(--text-secondary); }
        .plan-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
        .plan-features { display: flex; flex-direction: column; gap: 7px; flex: 1; }
        .plan-feature { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
        .plan-feature.missing { opacity: 0.4; }
        .plan-btn {
          padding: 11px; border-radius: 10px; border: 1px solid var(--border);
          background: var(--bg-secondary); color: var(--text-secondary);
          font-size: 13px; font-weight: 700; cursor: pointer; text-align: center;
          transition: all 0.15s; margin-top: 4px;
        }
        .plan-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent-light); }
        .plan-btn-primary { color: white; border-color: transparent; }
        .plan-btn-primary:hover { opacity: 0.9; }
        .plan-btn-disabled { opacity: 0.6; cursor: default; }

        .plans-faq { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; flex-shrink: 0; }
        .plans-faq h3 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .faq-item { display: flex; flex-direction: column; gap: 5px; }
        .faq-q { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .faq-a { font-size: 12px; color: var(--text-secondary); line-height: 1.55; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; }
        .confirm-modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 28px; width: 360px; display: flex; flex-direction: column; gap: 16px; }
        .confirm-modal h3 { font-size: 16px; font-weight: 700; }
        .confirm-modal p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .confirm-actions { display: flex; gap: 8px; }
        .btn-cancel { flex: 1; padding: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-confirm { flex: 1; padding: 10px; background: var(--accent); border: none; border-radius: 9px; color: white; font-size: 13px; font-weight: 700; cursor: pointer; }
        .success-state { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 12px 0; }
        .success-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(34,197,94,0.12); display: flex; align-items: center; justify-content: center; }
        .success-state p { font-size: 15px; font-weight: 600; color: var(--text-primary); }
      `}</style>
    </div>
  )
}
