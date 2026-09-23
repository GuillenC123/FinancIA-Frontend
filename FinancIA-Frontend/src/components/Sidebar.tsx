import { navigationItems } from '../data'
import type { ViewId } from '../types'

type SidebarProps = {
  activeView: ViewId
  onChangeView: (view: ViewId) => void
  onNewConsultation: () => void
  onLogout: () => void
}

export function Sidebar({ activeView, onChangeView, onNewConsultation, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-icon">🤖</div>
        <div>
          <h1>FinancIA</h1>
          <p>AI Financial Assistant</p>
        </div>
      </div>

      <button className="primary-button" type="button" onClick={onNewConsultation}>
        <span>＋</span> Nueva Consulta
      </button>

      <nav className="nav-list" aria-label="Navegación principal">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onChangeView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="profile-box" type="button" onClick={onLogout} title="Cerrar sesión">
        <div className="avatar-mini">A</div>
        <div>
          <strong>Mi Perfil</strong>
          <small>Ajustes</small>
        </div>
      </button>
    </aside>
  )
}
