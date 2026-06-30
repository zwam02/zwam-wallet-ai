import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info, PieChart, Target } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })
const PALETTE = ['#6c63ff', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6', '#14b8a6']

export default function Insights() {
  const { transactions, budgets } = useApp()

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
    })
    return Array.from(map.entries())
      .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const map = new Map<string, { ingresos: number; gastos: number }>()
    transactions.forEach(t => {
      const d = new Date(t.date)
      const label = months[d.getMonth()]
      const entry = map.get(label) ?? { ingresos: 0, gastos: 0 }
      if (t.type === 'income') entry.ingresos += t.amount
      else entry.gastos += t.amount
      map.set(label, entry)
    })
    return months.filter(m => map.has(m)).map(m => ({ month: m, ...map.get(m)! }))
  }, [transactions])

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

  const subs = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && ['Netflix', 'Spotify', 'Gym', 'Amazon', 'Apple'].some(k => t.description.includes(k)))
  , [transactions])

  // Budget progress
  const spent: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spent[t.category] = (spent[t.category] ?? 0) + t.amount
  })
  const overBudget = budgets.filter(b => (spent[b.category] ?? 0) > b.limit)
  const nearBudget = budgets.filter(b => { const pct = (spent[b.category] ?? 0) / b.limit; return pct >= 0.75 && pct <= 1 })

  const insights = useMemo(() => {
    const list = []

    if (overBudget.length > 0) {
      const cats = overBudget.map(b => b.category).join(', ')
      list.push({ id: 'overbudget', type: 'warning', title: `Presupuesto superado en ${overBudget.length} categoría${overBudget.length > 1 ? 's' : ''}`, description: `Has excedido el límite en: ${cats}. Revisa tus gastos esta semana.`, action: 'Ver presupuestos' })
    }

    if (nearBudget.length > 0 && overBudget.length === 0) {
      list.push({ id: 'near', type: 'warning', title: `Cerca del límite en ${nearBudget.map(b => b.category).join(', ')}`, description: `Ya superaste el 75% de tu presupuesto. Modera los gastos para no sobrepasarlo.`, action: 'Ver presupuestos' })
    }

    if (savingsRate >= 20) {
      list.push({ id: 'savings', type: 'success', title: 'Buen ritmo de ahorro', description: `Estás ahorrando el ${savingsRate}% de tus ingresos. ${savingsRate >= 30 ? '¡Excelente, superas la meta recomendada del 20%!' : 'Estás en buen camino.'}`, action: 'Ver billeteras' })
    } else if (income > 0) {
      list.push({ id: 'savings', type: 'warning', title: 'Tasa de ahorro baja', description: `Solo estás ahorrando el ${savingsRate}% de tus ingresos. Se recomienda al menos el 20%.`, action: 'Ver gastos' })
    }

    const topCat = categoryData[0]
    if (topCat) {
      const pct = income > 0 ? Math.round((topCat.value / income) * 100) : 0
      list.push({ id: 'top-cat', type: pct > 40 ? 'warning' : 'info', title: `Mayor gasto: ${topCat.name}`, description: `Has gastado $${fmt(topCat.value)} en ${topCat.name} (${pct}% de tus ingresos).`, action: 'Ver movimientos' })
    }

    if (subs.length > 0) {
      const subTotal = subs.reduce((s, t) => s + t.amount, 0)
      list.push({ id: 'subs', type: 'warning', title: `${subs.length} suscripción${subs.length > 1 ? 'es' : ''} detectada${subs.length > 1 ? 's' : ''}`, description: `Total en suscripciones: $${fmt(subTotal)}/mes. Revisa si las usas todas.`, action: 'Ver suscripciones' })
    }

    if (income - expense > 1000) {
      list.push({ id: 'invest', type: 'info', title: 'Oportunidad de inversión', description: `Tienes $${fmt(income - expense)} disponibles. Con un perfil moderado podrías generar 7-9% anual.`, action: 'Ver billeteras' })
    }

    if (list.length === 0) {
      list.push({ id: 'empty', type: 'info', title: 'Agrega transacciones', description: 'Una vez que agregues más movimientos, el sistema generará recomendaciones personalizadas.', action: '' })
    }

    return list
  }, [transactions, categoryData, savingsRate, subs, overBudget, nearBudget])

  const iconMap = {
    warning: { icon: AlertTriangle, color: 'var(--yellow)', bg: 'rgba(245,158,11,0.12)' },
    success: { icon: CheckCircle, color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
    info: { icon: Info, color: 'var(--accent-light)', bg: 'var(--accent-dim)' },
  }

  const score = Math.min(100, Math.max(0,
    (savingsRate >= 20 ? 30 : Math.round(savingsRate * 1.5)) +
    (expense < income ? 30 : 10) +
    (subs.length <= 3 ? 20 : 10) +
    (overBudget.length === 0 ? 20 : Math.max(0, 20 - overBudget.length * 5))
  ))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">IA Insights</h1>
          <p className="page-subtitle">Análisis en tiempo real · {transactions.length} transacciones</p>
        </div>
        <div className="ai-badge"><Sparkles size={12} /><span>Actualizado</span></div>
      </div>

      <div className="insights-layout">
        {/* LEFT */}
        <div className="col-left">
          <div className="section-label"><Sparkles size={13} color="var(--accent-light)" /><span>Recomendaciones</span></div>
          {insights.map((ins, i) => {
            const { icon: Icon, color, bg } = iconMap[ins.type as keyof typeof iconMap]
            return (
              <motion.div key={ins.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="insight-card">
                <div className="insight-icon" style={{ background: bg, color }}><Icon size={15} /></div>
                <div className="insight-body">
                  <h4>{ins.title}</h4>
                  <p>{ins.description}</p>
                </div>
              </motion.div>
            )
          })}

          {/* Budget progress */}
          {budgets.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mini-card">
              <div className="mini-header">
                <Target size={13} />
                <span>Presupuestos del mes</span>
                <Link to="/settings" className="mini-link">Gestionar</Link>
              </div>
              <div className="budget-bars">
                {budgets.map(b => {
                  const s = spent[b.category] ?? 0
                  const pct = Math.min(100, Math.round((s / b.limit) * 100))
                  const over = s > b.limit
                  const warn = pct >= 75 && !over
                  const color = over ? 'var(--red)' : warn ? 'var(--yellow)' : 'var(--green)'
                  return (
                    <div key={b.category} className="bbar-row">
                      <div className="bbar-labels">
                        <span>{b.category}</span>
                        <span style={{ color, fontFamily: "'Space Grotesk', sans-serif", fontSize: 11 }}>${fmt(s)} / ${fmt(b.limit)}</span>
                      </div>
                      <div className="bbar-track">
                        <motion.div className="bbar-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {monthlyData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mini-card">
              <div className="mini-header"><TrendingUp size={13} /><span>Ingresos vs Gastos por mes</span></div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthlyData} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`$${fmt(v)}`, '']} />
                  <Bar dataKey="ingresos" fill="#6c63ff" radius={[3, 3, 0, 0]} name="Ingresos" />
                  <Bar dataKey="gastos" fill="#ef4444" radius={[3, 3, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* RIGHT */}
        <div className="col-right">
          {categoryData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="pie-card">
              <div className="section-label"><PieChart size={13} /><span>Gastos por categoría</span></div>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={categoryData[i].color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${fmt(v)}`, '']} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="legend">
                {categoryData.slice(0, 6).map(d => (
                  <div key={d.name} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="legend-name">{d.name}</span>
                    <span className="legend-val">${fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="score-card">
            <div className="section-label"><TrendingUp size={13} /><span>Salud Financiera</span></div>
            <div className="score-display">
              <span className="score-num" style={{ color: score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)' }}>{score}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="score-bar-bg">
              <motion.div className="score-bar-fill" style={{ background: score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)' }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ delay: 0.5, duration: 0.9 }} />
            </div>
            <div className="pillars">
              {[
                { label: 'Ahorro', val: Math.min(100, savingsRate * 4) },
                { label: 'Balance', val: income > 0 ? Math.min(100, Math.round((income / (expense || 1)) * 50)) : 50 },
                { label: 'Presup.', val: budgets.length === 0 ? 70 : Math.max(0, 100 - overBudget.length * 25) },
                { label: 'Control', val: subs.length <= 2 ? 90 : subs.length <= 4 ? 65 : 40 },
              ].map(p => (
                <div key={p.label} className="pillar">
                  <div className="pillar-bar-bg">
                    <motion.div className="pillar-bar-fill" style={{ background: p.val >= 70 ? 'var(--green)' : p.val >= 45 ? 'var(--yellow)' : 'var(--red)', height: `${p.val}%` }} initial={{ height: 0 }} animate={{ height: `${p.val}%` }} transition={{ delay: 0.6, duration: 0.7 }} />
                  </div>
                  <span className="pillar-label">{p.label}</span>
                  <span className="pillar-val">{p.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .page { padding: 20px 24px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
        .page-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .ai-badge { display: flex; align-items: center; gap: 6px; background: var(--accent-dim); border: 1px solid rgba(108,99,255,0.3); color: var(--accent-light); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .insights-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1; min-height: 0; overflow: hidden; }
        .col-left, .col-right { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-right: 2px; }
        .section-label { display: flex; align-items: center; gap: 7px; }
        .section-label span { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
        .insight-card { display: flex; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px; padding: 13px; }
        .insight-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .insight-body h4 { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
        .insight-body p { font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
        .mini-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px; padding: 14px; }
        .mini-header { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
        .mini-link { margin-left: auto; font-size: 11px; color: var(--accent-light); text-decoration: none; font-weight: 600; }
        .budget-bars { display: flex; flex-direction: column; gap: 10px; }
        .bbar-row { display: flex; flex-direction: column; gap: 4px; }
        .bbar-labels { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); }
        .bbar-track { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .bbar-fill { height: 100%; border-radius: 3px; }
        .pie-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px; padding: 14px; }
        .legend { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .legend-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .legend-name { flex: 1; color: var(--text-secondary); }
        .legend-val { font-weight: 600; font-family: 'Space Grotesk', sans-serif; font-size: 11px; }
        .score-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 11px; padding: 14px; }
        .score-display { display: flex; align-items: baseline; gap: 4px; margin: 10px 0 8px; }
        .score-num { font-size: 44px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; letter-spacing: -2px; }
        .score-label { font-size: 16px; color: var(--text-dim); }
        .score-bar-bg { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 14px; }
        .score-bar-fill { height: 100%; border-radius: 3px; }
        .pillars { display: flex; gap: 14px; justify-content: space-around; }
        .pillar { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .pillar-bar-bg { width: 26px; height: 56px; background: var(--border); border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden; }
        .pillar-bar-fill { width: 100%; border-radius: 4px; }
        .pillar-label { font-size: 9px; color: var(--text-dim); text-align: center; }
        .pillar-val { font-size: 11px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        :root { --yellow: #f59e0b; }
      `}</style>
    </div>
  )
}
