import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info, PieChart } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { aiInsights, categoryData } from '../data/mock'

const iconMap = {
  warning: { icon: AlertTriangle, color: 'var(--yellow)', bg: 'rgba(245,158,11,0.12)' },
  success: { icon: CheckCircle, color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  info: { icon: Info, color: 'var(--accent-light)', bg: 'var(--accent-dim)' },
}

const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 })

export default function Insights() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">IA Insights</h1>
          <p className="page-subtitle">Análisis inteligente de tus finanzas</p>
        </div>
        <div className="ai-badge">
          <Sparkles size={13} />
          <span>Actualizado ahora</span>
        </div>
      </div>

      <div className="insights-layout">
        <div className="insights-col">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-title-row">
            <Sparkles size={15} color="var(--accent-light)" />
            <h3>Recomendaciones</h3>
          </motion.div>
          {aiInsights.map((insight, i) => {
            const { icon: Icon, color, bg } = iconMap[insight.type as keyof typeof iconMap]
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="insight-card"
              >
                <div className="insight-icon" style={{ background: bg, color }}>
                  <Icon size={16} />
                </div>
                <div className="insight-body">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                  <button className="insight-action">{insight.action} →</button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="insights-col">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pie-card">
            <div className="section-title-row" style={{ marginBottom: 16 }}>
              <PieChart size={15} color="var(--text-secondary)" />
              <h3>Gastos por categoría</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  formatter={(v: number) => [`$${fmt(v)}`, '']}
                />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="legend">
              {categoryData.map(d => (
                <div key={d.name} className="legend-item">
                  <span className="legend-dot" style={{ background: d.color }} />
                  <span className="legend-name">{d.name}</span>
                  <span className="legend-val">${fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="score-card">
            <div className="section-title-row" style={{ marginBottom: 12 }}>
              <TrendingUp size={15} color="var(--text-secondary)" />
              <h3>Salud Financiera</h3>
            </div>
            <div className="score-display">
              <span className="score-num">82</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="score-bar-bg">
              <motion.div className="score-bar-fill" initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ delay: 0.5, duration: 1 }} />
            </div>
            <div className="score-pillars">
              {[
                { label: 'Ahorro', val: 88 },
                { label: 'Deuda', val: 95 },
                { label: 'Inversión', val: 72 },
                { label: 'Gasto', val: 74 },
              ].map(p => (
                <div key={p.label} className="pillar">
                  <div className="pillar-bar-bg">
                    <motion.div
                      className="pillar-bar-fill"
                      style={{ background: p.val >= 80 ? 'var(--green)' : p.val >= 60 ? 'var(--yellow)' : 'var(--red)' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${p.val}%` }}
                      transition={{ delay: 0.6, duration: 0.7 }}
                    />
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
        .page { padding: 32px 36px; max-width: 1100px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
        .page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 3px; }
        .ai-badge { display: flex; align-items: center; gap: 6px; background: var(--accent-dim); border: 1px solid rgba(108,99,255,0.3); color: var(--accent-light); padding: 7px 13px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .insights-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .insights-col { display: flex; flex-direction: column; gap: 12px; }
        .section-title-row { display: flex; align-items: center; gap: 8px; }
        .section-title-row h3 { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
        .insight-card {
          display: flex; gap: 14px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px;
          transition: border-color 0.2s;
        }
        .insight-card:hover { border-color: var(--border); }
        .insight-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .insight-body { display: flex; flex-direction: column; gap: 4px; }
        .insight-body h4 { font-size: 14px; font-weight: 600; }
        .insight-body p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
        .insight-action { background: none; border: none; color: var(--accent-light); font-size: 12px; font-weight: 500; cursor: pointer; padding: 0; margin-top: 4px; text-align: left; }
        .pie-card, .score-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 12px; padding: 20px;
        }
        .legend { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .legend-name { flex: 1; color: var(--text-secondary); }
        .legend-val { font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .score-display { display: flex; align-items: baseline; gap: 4px; margin-bottom: 10px; }
        .score-num { font-size: 48px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--green); letter-spacing: -2px; }
        .score-label { font-size: 18px; color: var(--text-dim); }
        .score-bar-bg { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
        .score-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--green)); border-radius: 3px; }
        .score-pillars { display: flex; gap: 16px; justify-content: space-around; }
        .pillar { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .pillar-bar-bg { width: 28px; height: 64px; background: var(--border); border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden; }
        .pillar-bar-fill { width: 100%; border-radius: 4px; }
        .pillar-label { font-size: 10px; color: var(--text-dim); }
        .pillar-val { font-size: 12px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </div>
  )
}
