import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Globe, ChevronRight } from 'lucide-react'

const sections = [
  {
    title: 'Cuenta',
    icon: User,
    items: ['Perfil personal', 'Cambiar contraseña', 'Autenticación en 2 pasos'],
  },
  {
    title: 'Notificaciones',
    icon: Bell,
    items: ['Alertas de gastos', 'Resumen semanal', 'Recomendaciones IA'],
  },
  {
    title: 'Seguridad',
    icon: Shield,
    items: ['Dispositivos activos', 'Historial de acceso', 'Cerrar todas las sesiones'],
  },
  {
    title: 'Apariencia',
    icon: Palette,
    items: ['Tema oscuro / claro', 'Moneda predeterminada', 'Idioma de la app'],
  },
  {
    title: 'Privacidad',
    icon: Globe,
    items: ['Datos de uso', 'Exportar mis datos', 'Eliminar cuenta'],
  },
]

export default function Settings() {
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
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="settings-card"
          >
            <div className="settings-card-header">
              <div className="settings-icon">
                <section.icon size={15} />
              </div>
              <h3>{section.title}</h3>
            </div>
            <div className="settings-items">
              {section.items.map(item => (
                <motion.button
                  key={item}
                  whileHover={{ x: 3 }}
                  className="settings-item"
                >
                  <span>{item}</span>
                  <ChevronRight size={14} color="var(--text-dim)" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .page { padding: 32px 36px; max-width: 900px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
        .page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 3px; }
        .settings-profile {
          display: flex; align-items: center; gap: 16px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px 24px; margin-bottom: 20px;
        }
        .profile-avatar {
          width: 52px; height: 52px; background: var(--accent);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: white; flex-shrink: 0;
        }
        .profile-name { font-size: 17px; font-weight: 700; }
        .profile-email { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
        .profile-plan-badge {
          margin-left: auto;
          background: var(--accent-dim); color: var(--accent-light);
          border: 1px solid rgba(108,99,255,0.3);
          padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
        }
        .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .settings-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 12px; padding: 18px; overflow: hidden;
        }
        .settings-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .settings-icon {
          width: 28px; height: 28px; background: var(--accent-dim);
          color: var(--accent-light); border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .settings-card-header h3 { font-size: 14px; font-weight: 600; }
        .settings-items { display: flex; flex-direction: column; }
        .settings-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 8px; border-radius: 7px; border: none;
          background: none; color: var(--text-secondary);
          font-size: 13px; cursor: pointer; text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .settings-item:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .settings-item span { flex: 1; }
      `}</style>
    </div>
  )
}
