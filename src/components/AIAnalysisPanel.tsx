import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, Target, ChevronRight, RefreshCw, Send } from 'lucide-react'
import { useApp, fmtCurrency } from '../context/AppContext'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

type Insight = { type: 'good' | 'warning' | 'tip' | 'action'; text: string }

function buildInsights(
  transactions: ReturnType<typeof useApp>['transactions'],
  wallets: ReturnType<typeof useApp>['wallets'],
  connectedWallets: ReturnType<typeof useApp>['connectedWallets'],
  budgets: ReturnType<typeof useApp>['budgets'],
  currency: ReturnType<typeof useApp>['settings']['currency'],
): { insights: Insight[]; score: number; income: number; expense: number; savingsRate: number; totalFiat: number; totalWeb3: number; grandTotal: number } {
  const fmt = (n: number) => fmtCurrency(n, currency)

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netSavings = income - expense
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0
  const totalFiat = wallets.reduce((s, w) => s + w.balance, 0)
  const totalWeb3 = connectedWallets.reduce((s, w) => s + w.usdBalance, 0)
  const grandTotal = totalFiat + totalWeb3

  const spent: Record<string, number> = {}
  const counts: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spent[t.category] = (spent[t.category] ?? 0) + t.amount
    counts[t.category] = (counts[t.category] ?? 0) + 1
  })
  const topCats = Object.entries(spent).sort(([, a], [, b]) => b - a)
  const overBudget = budgets.filter(b => (spent[b.category] ?? 0) > b.limit)
  const nearBudget = budgets.filter(b => { const p = (spent[b.category] ?? 0) / b.limit; return p >= 0.75 && p < 1 })

  const subs = transactions.filter(t => t.type === 'expense' && (t.category === 'Suscripciones' || ['Netflix', 'Spotify', 'Disney', 'Apple', 'YouTube', 'Amazon Prime', 'HBO', 'Gym'].some(k => t.description.toLowerCase().includes(k.toLowerCase()))))
  const subTotal = subs.reduce((s, t) => s + t.amount, 0)

  // Month-over-month
  const now = new Date()
  const thisMonth = now.getMonth()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const txThisMonth = transactions.filter(t => new Date(t.date).getMonth() === thisMonth && t.type === 'expense')
  const txLastMonth = transactions.filter(t => new Date(t.date).getMonth() === lastMonth && t.type === 'expense')
  const spentThis = txThisMonth.reduce((s, t) => s + t.amount, 0)
  const spentLast = txLastMonth.reduce((s, t) => s + t.amount, 0)

  const insights: Insight[] = []

  if (savingsRate >= 30) insights.push({ type: 'good', text: `¡Excelente! Ahorras el ${savingsRate}% de tus ingresos, superando la meta recomendada del 20%. Estás en camino a la libertad financiera.` })
  else if (savingsRate >= 15) insights.push({ type: 'tip', text: `Ahorras el ${savingsRate}% de tus ingresos. Con ${fmt(income * 0.05)} más de ahorro mensual alcanzarías la meta del 20%.` })
  else if (income > 0) insights.push({ type: 'warning', text: `Tasa de ahorro del ${savingsRate}%. Necesitas reducir ${fmt(income * 0.2 - netSavings)} más para alcanzar el 20% recomendado.` })

  if (overBudget.length > 0) insights.push({ type: 'warning', text: `Presupuesto excedido en ${overBudget.map(b => b.category).join(', ')}. Ajusta tus hábitos en las próximas semanas.` })
  else if (nearBudget.length > 0) insights.push({ type: 'warning', text: `Cerca del límite en ${nearBudget.map(b => b.category).join(', ')} (+75%). Modera los gastos para no sobrepasarlo.` })
  else if (budgets.length > 0) insights.push({ type: 'good', text: `Todos tus presupuestos bajo control este mes. ¡Buen trabajo!` })

  if (spentLast > 0 && spentThis > 0) {
    const diff = Math.round(((spentThis - spentLast) / spentLast) * 100)
    if (diff > 15) insights.push({ type: 'warning', text: `Gastos este mes: ${fmt(spentThis)} (+${diff}% vs mes anterior). Tendencia al alza — revisa dónde aumentó.` })
    else if (diff < -10) insights.push({ type: 'good', text: `Gastos este mes: ${fmt(spentThis)} (${diff}% vs mes anterior). Vas mejorando tu control de gastos.` })
  }

  if (topCats[0]) {
    const [cat, val] = topCats[0]
    const pct = income > 0 ? Math.round((val / income) * 100) : 0
    if (pct > 40) insights.push({ type: 'warning', text: `${cat} consume el ${pct}% de tus ingresos (${fmt(val)}). Se recomienda que ninguna categoría supere el 30%.` })
    else insights.push({ type: 'good', text: `Mayor gasto en ${cat}: ${fmt(val)} (${pct}% de ingresos). Dentro del rango saludable.` })
  }

  if (subTotal > 0) insights.push({ type: 'tip', text: `Suscripciones detectadas: ${fmt(subTotal)}/mes (${subs.length} servicios). Al año son ${fmt(subTotal * 12)}. ¿Usas todos?` })

  if (totalWeb3 > 0) {
    const pct = Math.round((totalWeb3 / grandTotal) * 100)
    if (pct > 35) insights.push({ type: 'warning', text: `El ${pct}% de tu patrimonio está en cripto (${fmt(totalWeb3)}). Alta exposición a volatilidad. Considera diversificar.` })
    else insights.push({ type: 'good', text: `${fmt(totalWeb3)} en wallets Web3 (${pct}% del total). Diversificación equilibrada.` })
  }

  const recurring = transactions.filter(t => t.recurring)
  if (recurring.length > 0) {
    const totalRecurring = recurring.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    insights.push({ type: 'tip', text: `Tienes ${recurring.length} transacción${recurring.length > 1 ? 'es' : ''} recurrente${recurring.length > 1 ? 's' : ''} por ${fmt(totalRecurring)}/mes. Asegúrate de planificarlas en tu presupuesto.` })
  }

  if (netSavings > 1000) insights.push({ type: 'action', text: `Tienes ${fmt(netSavings)} disponibles. Invertir el 50% en ETF globales podría generar ~8% anual (${fmt(netSavings * 0.5 * 0.08)}/año).` })

  const avgPerDay = transactions.length > 0 ? (transactions.length / 30).toFixed(1) : '0'
  if (parseFloat(avgPerDay) > 0) insights.push({ type: 'tip', text: `Registras ~${avgPerDay} movimientos/día. Hábito financiero activo — la consistencia es clave.` })

  const score = Math.min(100, Math.max(10,
    (savingsRate >= 20 ? 30 : Math.round(savingsRate * 1.5)) +
    (expense < income ? 25 : 10) +
    (overBudget.length === 0 ? 20 : Math.max(0, 20 - overBudget.length * 5)) +
    (subs.length <= 3 ? 15 : 8) +
    (totalWeb3 > 0 && totalWeb3 / grandTotal < 0.3 ? 10 : totalWeb3 === 0 ? 7 : 5)
  ))

  return { insights, score, income, expense, savingsRate, totalFiat, totalWeb3, grandTotal }
}

// ── AI Chat ──────────────────────────────────────────────────────────────
type ChatMsg = { role: 'user' | 'assistant'; text: string }

async function askAI(question: string, context: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return 'Para usar el chat con IA, configura la variable VITE_OPENAI_API_KEY con tu clave de OpenAI.'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Eres ZwamAI, un asistente de finanzas personales. Responde en español, de forma concisa (máximo 3 párrafos). Contexto del usuario: ${context}` },
        { role: 'user', content: question },
      ],
      max_tokens: 300,
    }),
  })
  if (!res.ok) return 'Hubo un error al consultar la IA. Verifica tu clave de API.'
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'Sin respuesta.'
}

export default function AIAnalysisPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { transactions, wallets, connectedWallets, budgets, settings } = useApp()
  const [phase, setPhase] = useState<'thinking' | 'ready'>('thinking')
  const [visibleInsights, setVisibleInsights] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)

  const { insights, score, income, expense, savingsRate, totalFiat, totalWeb3, grandTotal } =
    buildInsights(transactions, wallets, connectedWallets, budgets, settings.currency)

  const fmt = (n: number) => fmtCurrency(n, settings.currency)

  function refresh() {
    setKey(k => k + 1)
    setPhase('thinking')
    setVisibleInsights(0)
  }

  useEffect(() => {
    if (!open) { setPhase('thinking'); setVisibleInsights(0); return }
    setPhase('thinking')
    setVisibleInsights(0)
    const t = setTimeout(async () => {
      setPhase('ready')
      for (let i = 1; i <= insights.length; i++) {
        await sleep(180)
        setVisibleInsights(i)
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [open, key])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return
    const q = chatInput.trim()
    setChatInput('')
    setChatMsgs(prev => [...prev, { role: 'user', text: q }])
    setChatLoading(true)
    const ctx = `Ingresos totales: ${fmt(income)}, Gastos totales: ${fmt(expense)}, Tasa de ahorro: ${savingsRate}%, Patrimonio total: ${fmt(grandTotal)}, Número de transacciones: ${transactions.length}`
    const answer = await askAI(q, ctx)
    setChatMsgs(prev => [...prev, { role: 'assistant', text: answer }])
    setChatLoading(false)
  }

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
                  <h2>ZwamAI</h2>
                  <p>{transactions.length} transacciones · Score {score}/100</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={refresh} className="panel-close" title="Actualizar análisis"><RefreshCw size={13} /></button>
                <button onClick={() => setChatOpen(v => !v)} className="panel-close" title="Chat con IA" style={{ background: chatOpen ? 'var(--accent-dim)' : undefined, color: chatOpen ? 'var(--accent-light)' : undefined }}>
                  <Send size={13} />
                </button>
                <button onClick={onClose} className="panel-close"><X size={15} /></button>
              </div>
            </div>

            {phase === 'thinking' ? (
              <div className="thinking-state">
                <motion.div className="thinking-orb" animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity }}>
                  <Sparkles size={28} />
                </motion.div>
                <p className="thinking-text">Analizando tus finanzas...</p>
                <div className="thinking-steps">
                  {['Procesando transacciones', 'Calculando patrones', 'Generando recomendaciones'].map((s, i) => (
                    <motion.div key={s} className="thinking-step" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.4 }}>
                      <motion.div className="step-dot" animate={{ scale: [1, 1.4, 1] }} transition={{ delay: 0.3 + i * 0.4, duration: 0.5 }} />
                      <span>{s}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : chatOpen ? (
              <div className="chat-panel">
                <div className="chat-msgs">
                  {chatMsgs.length === 0 && (
                    <div className="chat-empty">
                      <Sparkles size={22} color="var(--accent-light)" />
                      <p>Hazme una pregunta sobre tus finanzas</p>
                      <div className="chat-suggestions">
                        {['¿Cómo puedo ahorrar más?', '¿En qué gasto más?', 'Dame un plan de ahorro'].map(s => (
                          <button key={s} className="chat-suggestion" onClick={() => { setChatInput(s); }}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMsgs.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`chat-msg ${m.role}`}>
                      <p>{m.text}</p>
                    </motion.div>
                  ))}
                  {chatLoading && (
                    <div className="chat-msg assistant">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        <p>Analizando...</p>
                      </motion.div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-row">
                  <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Pregúntame sobre tus finanzas..." />
                  <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="chat-send">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel-body">
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
                    <h3 className="score-title">{score >= 75 ? '🟢 Salud Excelente' : score >= 55 ? '🟡 Salud Buena' : score >= 35 ? '🟠 Necesita Mejoras' : '🔴 Salud Crítica'}</h3>
                    <p className="score-desc">{score >= 75 ? 'Finanzas sólidas. Sigue así y considera crecer tu inversión.' : score >= 55 ? 'Buen camino con margen de mejora.' : 'Hay áreas importantes que atender.'}</p>
                    <div className="kpis">
                      <div className="kpi"><TrendingUp size={11} color="#22c55e" /><span>{fmt(income)}</span><small>ingresos</small></div>
                      <div className="kpi"><TrendingDown size={11} color="#ef4444" /><span>{fmt(expense)}</span><small>gastos</small></div>
                      <div className="kpi"><Sparkles size={11} color="#6c63ff" /><span>{savingsRate}%</span><small>ahorro</small></div>
                    </div>
                  </div>
                </motion.div>

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

                {visibleInsights >= insights.length && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="summary-table">
                    <h4 className="section-title"><ChevronRight size={12} /> Resumen patrimonial</h4>
                    {[
                      { label: 'Billeteras fiat', value: fmt(totalFiat), color: '#6c63ff' },
                      ...(totalWeb3 > 0 ? [{ label: 'Wallets Web3', value: fmt(totalWeb3), color: '#f59e0b' }] : []),
                      { label: 'Total neto', value: fmt(grandTotal), color: '#22c55e' },
                      { label: 'Ahorro neto', value: fmt(income - expense), color: income - expense >= 0 ? '#22c55e' : '#ef4444' },
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
    position: fixed; top: 0; right: 0; bottom: 0; width: 390px;
    background: var(--bg-secondary); border-left: 1px solid var(--border);
    z-index: 151; display: flex; flex-direction: column; overflow: hidden;
  }
  @media (max-width: 480px) { .ai-panel { width: 100%; } }
  .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .panel-title-group { display: flex; align-items: center; gap: 12px; }
  .ai-orb { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-dim); color: var(--accent-light); border: 1px solid rgba(108,99,255,0.3); display: flex; align-items: center; justify-content: center; }
  .panel-title-group h2 { font-size: 15px; font-weight: 700; }
  .panel-title-group p { font-size: 11px; color: var(--text-dim); margin-top: 1px; }
  .panel-close { background: var(--bg-card); border: 1px solid var(--border); border-radius: 7px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); transition: all 0.15s; }
  .panel-close:hover { color: var(--text-primary); border-color: var(--accent); }

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
  .score-info { flex: 1; min-width: 0; }
  .score-title { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
  .score-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px; }
  .kpis { display: flex; gap: 10px; flex-wrap: wrap; }
  .kpi { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .kpi span { font-size: 11px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
  .kpi small { font-size: 9px; color: var(--text-dim); }

  .insights-section { display: flex; flex-direction: column; gap: 8px; }
  .section-title { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.7px; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .ai-insight { display: flex; align-items: flex-start; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; padding: 11px 12px; }
  .ai-insight-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .ai-insight p { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

  .summary-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; border-bottom: 1px solid var(--border); font-size: 13px; }
  .summary-row:last-child { border-bottom: none; }
  .summary-row span:first-child { color: var(--text-secondary); font-size: 12px; }

  /* Chat */
  .chat-panel { flex: 1; display: flex; flex-direction: column; min-height: 0; }
  .chat-msgs { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
  .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 20px; color: var(--text-dim); }
  .chat-empty p { font-size: 14px; }
  .chat-suggestions { display: flex; flex-direction: column; gap: 7px; width: 100%; }
  .chat-suggestion { background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; padding: 9px 14px; font-size: 13px; color: var(--text-secondary); cursor: pointer; text-align: left; transition: border-color 0.15s; }
  .chat-suggestion:hover { border-color: var(--accent); color: var(--accent-light); }
  .chat-msg { max-width: 88%; padding: 10px 13px; border-radius: 12px; font-size: 13px; line-height: 1.55; }
  .chat-msg.user { background: var(--accent); color: white; align-self: flex-end; border-radius: 12px 12px 3px 12px; }
  .chat-msg.assistant { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); align-self: flex-start; border-radius: 12px 12px 12px 3px; }
  .chat-msg p { margin: 0; }
  .chat-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .chat-input { flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; padding: 9px 12px; color: var(--text-primary); font-size: 13px; outline: none; font-family: inherit; }
  .chat-input:focus { border-color: var(--accent); }
  .chat-send { background: var(--accent); color: white; border: none; border-radius: 9px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
`
