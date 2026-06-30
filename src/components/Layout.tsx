import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Wallet, Sparkles, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Movimientos' },
  { to: '/wallets', icon: Wallet, label: 'Billeteras' },
  { to: '/insights', icon: Sparkles, label: 'IA Insights' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

export default function Layout() {
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
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <span className="user-name">Juan Díaz</span>
            <span className="user-plan">Pro Plan</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 12px;
          gap: 8px;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px;
          margin-bottom: 28px;
        }
        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: white;
        }
        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: color 0.15s;
        }
        .nav-item:hover { color: var(--text-primary); }
        .nav-item.active { color: var(--text-primary); }
        .nav-active-bg {
          position: absolute;
          inset: 0;
          background: var(--accent-dim);
          border-radius: 8px;
          border: 1px solid rgba(108, 99, 255, 0.2);
          z-index: -1;
        }
        .sidebar-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border-top: 1px solid var(--border);
          margin-top: 8px;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
        }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .user-plan { font-size: 11px; color: var(--accent-light); }
        .main-content {
          flex: 1;
          overflow: hidden;
          background: var(--bg-primary);
        }
      `}</style>
    </div>
  )
}
