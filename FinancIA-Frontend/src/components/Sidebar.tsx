import { navigationItems } from '../data'
import type { ViewId } from '../types'

type SidebarProps = {
  activeView: ViewId
  onChangeView: (view: ViewId) => void
  onNewConsultation: () => void
}

export function Sidebar({ activeView, onChangeView, onNewConsultation }: SidebarProps) {
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

      <div className="profile-box">
        <div className="avatar-mini">A</div>
        <div>
          <strong>Mi Perfil</strong>
          <small>Ajustes</small>
        </div>
      </div>
    </aside>
  )
}
