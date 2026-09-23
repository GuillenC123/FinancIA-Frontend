import { useEffect, useRef, useState } from 'react'
import type { CurrentUser } from '../api'
import { navigationItems } from '../data'
import type { ViewId } from '../types'

type SidebarProps = {
  activeView: ViewId
  onChangeView: (view: ViewId) => void
  onNewConsultation: () => void
  onLogout: () => void
  user: CurrentUser | null
}

export function Sidebar({ activeView, onChangeView, onNewConsultation, onLogout, user }: SidebarProps) {
  const fullName = user ? `${user.name} ${user.lastName}` : 'Mi Perfil'
  const initial = user?.name.charAt(0).toUpperCase() ?? 'A'
  const [menuOpen, setMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const closeOnOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

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

      <div className="profile-area" ref={profileRef}>
        {menuOpen && (
          <div className="profile-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false)
                onLogout()
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}

        <button
          className="profile-box"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="avatar-mini">{initial}</div>
          <div className="profile-identity">
            <strong>{fullName}</strong>
            <small>{user?.email ?? 'Ajustes'}</small>
          </div>
          <span className="profile-caret" aria-hidden="true">{menuOpen ? '▾' : '▴'}</span>
        </button>
      </div>
    </aside>
  )
}
