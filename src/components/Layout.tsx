import { Outlet, NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Wallet, Sparkles, Settings, CreditCard, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Movimientos' },
  { to: '/wallet', icon: Wallet, label: 'Billeteras' },
  { to: '/insights', icon: Sparkles, label: 'IA Insights' },
  { to: '/plans', icon: CreditCard, label: 'Planes' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const { profile } = useApp()
  const [showLogout, setShowLogout] = useState(false)

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">Z</div>
          <span className="logo-text">Zwam</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      className="nav-active-bg"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <Icon size={18} />
                  <span>{label}</span>
                  {label === 'Planes' && profile.plan !== 'Business' && (
                    <span className="nav-plan-badge">{profile.plan}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer-wrap">
          <Link to="/settings" className="sidebar-footer">
            <div className="user-avatar" style={{ background: profile.avatarColor }}>
              {getInitials(profile.name)}
            </div>
            <div className="user-info">
              <span className="user-name">{profile.name}</span>
              <span className="user-plan">{profile.plan} Plan</span>
            </div>
          </Link>
          <div className="logout-wrap">
            <button className="logout-btn" onClick={() => setShowLogout(true)} title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <AnimatePresence>
        {showLogout && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogout(false)}>
            <motion.div className="logout-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="logout-icon"><LogOut size={22} color="var(--text-secondary)" /></div>
              <h3>¿Cerrar sesión?</h3>
              <p>Volverás a la pantalla de inicio de sesión.</p>
              <div className="logout-actions">
                <button onClick={() => setShowLogout(false)} className="btn-cancel">Cancelar</button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setShowLogout(false); onLogout() }} className="btn-logout-confirm">
                  Cerrar sesión
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .layout { display: flex; height: 100vh; overflow: hidden; }
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 24px 12px; gap: 8px;
        }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 8px; margin-bottom: 28px; }
        .logo-icon {
          width: 32px; height: 32px; background: var(--accent);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; color: white;
        }
        .logo-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 18px; color: var(--text-primary); letter-spacing: -0.3px; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          color: var(--text-secondary); text-decoration: none;
          font-size: 14px; font-weight: 500; position: relative;
          transition: color 0.15s;
        }
        .nav-item:hover { color: var(--text-primary); }
        .nav-item.active { color: var(--text-primary); }
        .nav-active-bg {
          position: absolute; inset: 0;
          background: var(--accent-dim); border-radius: 8px;
          border: 1px solid rgba(108,99,255,0.2); z-index: -1;
        }
        .nav-plan-badge {
          margin-left: auto; font-size: 9px; font-weight: 700; text-transform: uppercase;
          background: var(--accent-dim); color: var(--accent-light);
          border: 1px solid rgba(108,99,255,0.25); padding: 2px 6px; border-radius: 10px;
          letter-spacing: 0.3px; position: relative; z-index: 1;
        }
        .sidebar-footer-wrap {
          display: flex; align-items: center;
          border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; gap: 4px;
        }
        .sidebar-footer {
          display: flex; align-items: center; gap: 10px;
          padding: 8px; border-radius: 8px; text-decoration: none;
          flex: 1; transition: background 0.15s; cursor: pointer; min-width: 0;
        }
        .sidebar-footer:hover { background: var(--bg-card-hover); }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: white; flex-shrink: 0;
          transition: background 0.3s;
        }
        .user-info { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-plan { font-size: 11px; color: var(--accent-light); }
        .logout-wrap { flex-shrink: 0; }
        .logout-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--bg-card); color: var(--text-dim); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .logout-btn:hover { color: #ef4444; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }
        .main-content { flex: 1; overflow: hidden; background: var(--bg-primary); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 300; }
        .logout-modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 28px; width: 320px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
        .logout-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .logout-modal h3 { font-size: 16px; font-weight: 700; }
        .logout-modal p { font-size: 13px; color: var(--text-secondary); }
        .logout-actions { display: flex; gap: 8px; width: 100%; }
        .btn-cancel { flex: 1; padding: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 9px; color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-logout-confirm { flex: 1; padding: 10px; background: #ef4444; border: none; border-radius: 9px; color: white; font-size: 13px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  )
}
