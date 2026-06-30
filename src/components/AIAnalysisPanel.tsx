import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, Target, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

type Insight = { type: 'good' | 'warning' | 'tip' | 'action'; text: string }

export default function AIAnalysisPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { transactions, wallets, connectedWallets, budgets } = useApp()
  const [phase, setPhase] = useState<'thinking' | 'ready'>('thinking')
  const [visibleInsights, setVisibleInsights] = useState(0)

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netSavings = income - expense
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0
  const totalFiat = wallets.reduce((s, w) => s + w.balance, 0)
  const totalWeb3 = connectedWallets.reduce((s, w) => s + w.usdBalance, 0)
  const grandTotal = totalFiat + totalWeb3

  const spent: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => { spent[t.category] = (spent[t.category] ?? 0) + t.amount })
  const topCats = Object.entries(spent).sort(([, a], [, b]) => b - a).slice(0, 3)
  const overBudget = budgets.filter(b => (spent[b.category] ?? 0) > b.limit)

  const subs = transactions.filter(t => t.type === 'expense' && ['Netflix', 'Spotify', 'Gym', 'Amazon', 'Apple'].some(k => t.description.includes(k)))
  const subTotal = subs.reduce((s, t) => s + t.amount, 0)

  const catsByFreq: Record<string, number> = {}
  transactions.forEach(t => { catsByFreq[t.category] = (catsByFreq[t.category] ?? 0) + 1 })

  const insights: Insight[] = []

  // Savings
  if (savingsRate >= 30) insights.push({ type: 'good', text: `Excelente: ahorras el ${savingsRate}% de tus ingresos. Superas la meta recomendada del 20%.` })
  else if (savingsRate >= 15) insights.push({ type: 'tip', text: `Ahorras el ${savingsRate}% de tus ingresos. Con pequeños ajustes en gastos, puedes superar el 20%.` })
  else if (income > 0) insights.push({ type: 'warning', text: `Tasa de ahorro del ${savingsRate}%. Reduce al menos $${fmt(income * 0.2 - netSavings)} más para alcanzar el objetivo del 20%.` })

  // Top category
  if (topCats[0]) {
    const [cat, val] = topCats[0]
    const pct = income > 0 ? Math.round((val / income) * 100) : 0
    if (pct > 35) insights.push({ type: 'warning', text: `${cat} representa el ${pct}% de tus ingresos ($${fmt(val)}). Considera reducirlo.` })
    else insights.push({ type: 'good', text: `Tu mayor categoría es ${cat} con $${fmt(val)} (${pct}% de ingresos) — dentro de lo saludable.` })
  }

  // Over budget
  if (overBudget.length > 0) {
    insights.push({ type: 'warning', text: `Has superado el presupuesto en ${overBudget.map(b => b.category).join(', ')}. Ajusta tus límites o reduce gastos.` })
  } else if (budgets.length > 0) {
    insights.push({ type: 'good', text: `Ningún presupuesto superado este mes. Buen control de gastos.` })
  }

  // Subscriptions
  if (subTotal > 0) insights.push({ type: 'tip', text: `Suscripciones: $${fmt(subTotal)}/mes (${subs.length} servicios). Revisa cuáles usas realmente.` })

  // Web3
  if (totalWeb3 > 0) {
    const web3Pct = Math.round((totalWeb3 / grandTotal) * 100)
    if (web3Pct > 30) insights.push({ type: 'warning', text: `El ${web3Pct}% de tu patrimonio está en cripto ($${fmt(totalWeb3)}). Alta exposición a volatilidad.` })
    else insights.push({ type: 'good', text: `Tienes $${fmt(totalWeb3)} en wallets Web3 (${web3Pct}% del total). Diversificación razonable.` })
  }

  // Investment opportunity
  if (netSavings > 500) {
    insights.push({ type: 'action', text: `Tienes $${fmt(netSavings)} disponibles. Invertir el 50% en ETF globales podría generar ~8% anual.` })
  }

  // Transaction frequency
  const avgPerDay = (transactions.length / 30).toFixed(1)
  insights.push({ type: 'tip', text: `Registras ~${avgPerDay} movimientos/día. Hábito financiero activo — continúa así.` })

  // Score
  const score = Math.min(100, Math.max(10,
    (savingsRate >= 20 ? 30 : Math.round(savingsRate * 1.5)) +
    (expense < income ? 25 : 10) +
    (overBudget.length === 0 ? 20 : Math.max(0, 20 - overBudget.length * 5)) +
    (subs.length <= 3 ? 15 : 8) +
    (totalWeb3 > 0 && totalWeb3 / grandTotal < 0.3 ? 10 : 5)
  ))

  useEffect(() => {
    if (!open) { setPhase('thinking'); setVisibleInsights(0); return }
    setPhase('thinking')
    setVisibleInsights(0)
    const t = setTimeout(async () => {
      setPhase('ready')
      for (let i = 1; i <= insights.length; i++) {
        await sleep(200)
        setVisibleInsights(i)
      }
    }, 2200)
    return () => clearTimeout(t)
  }, [open])

  const iconMap = {
    good: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    tip: { icon: Lightbulb, color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' },
    action: { icon: Target, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="panel-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="ai-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 340, damping: 35 }}>
            <div className="panel-header">
              <div className="panel-title-group">
                <div className="ai-orb"><Sparkles size={16} /></div>
                <div>
                  <h2>Análisis IA</h2>
                  <p>{transactions.length} transacciones analizadas</p>
                </div>
              </div>
              <button onClick={onClose} className="panel-close"><X size={15} /></button>
            </div>

            {phase === 'thinking' ? (
              <div className="thinking-state">
                <motion.div className="thinking-orb" animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity }}>
                  <Sparkles size={28} />
                </motion.div>
                <p className="thinking-text">Analizando tus finanzas...</p>
                <div className="thinking-steps">
                  {['Procesando transacciones', 'Calculando patrones de gasto', 'Generando recomendaciones'].map((s, i) => (
                    <motion.div key={s} className="thinking-step" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.4 }}>
                      <motion.div className="step-dot" animate={{ scale: [1, 1.4, 1] }} transition={{ delay: 0.3 + i * 0.4, duration: 0.5 }} />
                      <span>{s}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="panel-body">
                {/* Score */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="score-section">
                  <div className="score-ring-wrap">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="7" />
                      <motion.circle cx="48" cy="48" r="40" fill="none"
                        stroke={score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                        transform="rotate(-90 48 48)"
                        initial={{ strokeDashoffset: `${2 * Math.PI * 40}` }}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 40 * (1 - score / 100)}` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="score-center">
                      <motion.span className="score-num" style={{ color: score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        {score}
                      </motion.span>
                      <span className="score-sub">/ 100</span>
                    </div>
                  </div>
                  <div className="score-info">
                    <h3 className="score-title">{score >= 75 ? 'Salud Excelente' : score >= 55 ? 'Salud Buena' : score >= 35 ? 'Necesita Mejoras' : 'Salud Crítica'}</h3>
                    <p className="score-desc">{score >= 75 ? 'Tus finanzas están en muy buen estado. Sigue así.' : score >= 55 ? 'Vas por buen camino con margen de mejora.' : 'Hay áreas importantes que mejorar.'}</p>
                    <div className="kpis">
                      <div className="kpi"><TrendingUp size={11} color="#22c55e" /><span>${fmt(income)}</span><small>ingresos</small></div>
                      <div className="kpi"><TrendingDown size={11} color="#ef4444" /><span>${fmt(expense)}</span><small>gastos</small></div>
                      <div className="kpi"><Sparkles size={11} color="#6c63ff" /><span>{savingsRate}%</span><small>ahorro</small></div>
                    </div>
                  </div>
                </motion.div>

                {/* Insights */}
                <div className="insights-section">
                  <h4 className="section-title"><Sparkles size={12} /> Recomendaciones personalizadas</h4>
                  {insights.slice(0, visibleInsights).map((ins, i) => {
                    const { icon: Icon, color, bg } = iconMap[ins.type]
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="ai-insight">
                        <div className="ai-insight-icon" style={{ background: bg, color }}><Icon size={13} /></div>
                        <p>{ins.text}</p>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Summary table */}
                {visibleInsights >= insights.length && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="summary-table">
                    <h4 className="section-title"><ChevronRight size={12} /> Resumen patrimonial</h4>
                    {[
                      { label: 'Billeteras fiat', value: `$${fmt(totalFiat)}`, color: '#6c63ff' },
                      ...(totalWeb3 > 0 ? [{ label: 'Wallets Web3', value: `$${fmt(totalWeb3)}`, color: '#f59e0b' }] : []),
                      { label: 'Total neto', value: `$${fmt(grandTotal)}`, color: '#22c55e' },
                      { label: 'Ahorro neto', value: `$${fmt(netSavings)}`, color: netSavings >= 0 ? '#22c55e' : '#ef4444' },
                    ].map(r => (
                      <div key={r.label} className="summary-row">
                        <span>{r.label}</span>
                        <span style={{ color: r.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{r.value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export const aiPanelStyles = `
  .panel-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 150; }
  .ai-panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: 380px;
    background: var(--bg-secondary); border-left: 1px solid var(--border);
    z-index: 151; display: flex; flex-direction: column; overflow: hidden;
  }
  .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .panel-title-group { display: flex; align-items: center; gap: 12px; }
  .ai-orb { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); display: flex; align-items: center; justify-content: center; }
  .panel-title-group h2 { font-size: 15px; font-weight: 700; }
  .panel-title-group p { font-size: 11px; color: var(--text-dim); margin-top: 1px; }
  .panel-close { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); }

  .thinking-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 32px; }
  .thinking-orb { width: 72px; height: 72px; border-radius: 50%; background: var(--accent-dim); color: var(--accent-light); border: 2px solid rgba(108,99,255,0.3); display: flex; align-items: center; justify-content: center; }
  .thinking-text { font-size: 15px; font-weight: 600; color: var(--text-secondary); }
  .thinking-steps { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .thinking-step { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-dim); }
  .step-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

  .panel-body { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }

  .score-section { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .score-ring-wrap { position: relative; flex-shrink: 0; width: 96px; height: 96px; }
  .score-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-size: 26px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; line-height: 1; }
  .score-sub { font-size: 10px; color: var(--text-dim); }
  .score-info { flex: 1; }
  .score-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .score-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px; }
  .kpis { display: flex; gap: 10px; }
  .kpi { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .kpi span { font-size: 11px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
  .kpi small { font-size: 9px; color: var(--text-dim); }

  .insights-section { display: flex; flex-direction: column; gap: 8px; }
  .section-title { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .ai-insight { display: flex; align-items: flex-start; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; padding: 10px 12px; }
  .ai-insight-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ai-insight p { font-size: 12px; color: var(--text-secondary); line-height: 1.55; }

  .summary-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; border-bottom: 1px solid var(--border); font-size: 13px; }
  .summary-row:last-child { border-bottom: none; }
  .summary-row span:first-child { color: var(--text-secondary); font-size: 12px; }
`
