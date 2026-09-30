import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeftRight,
  ChevronsUpDown,
  House,
  LogOut,
  MessagesSquare,
  Plus,
  ShieldCheck,
  ShieldPlus,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { CurrentUser } from '../api'
import { navigationItems } from '../data'
import type { ViewId } from '../types'

const navIcons: Record<ViewId, LucideIcon> = {
  inicio: House,
  movimientos: ArrowLeftRight,
  metas: Target,
  asistente: MessagesSquare,
}

type SidebarProps = {
  activeView: ViewId
  onChangeView: (view: ViewId) => void
  onNewConsultation: () => void
  onLogout: () => void
  user: CurrentUser | null
  twoFactorEnabled: boolean
  onActivateTwoFactor: () => void
}

export function Sidebar({
  activeView,
  onChangeView,
  onNewConsultation,
  onLogout,
  user,
  twoFactorEnabled,
  onActivateTwoFactor,
}: SidebarProps) {
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
        <div className="brand-mark" aria-hidden="true">F</div>
        <div>
          <h1>FinancIA</h1>
          <p>Tu asistente financiero</p>
        </div>
      </div>

      <button className="primary-button" type="button" onClick={onNewConsultation}>
        <Plus size={18} strokeWidth={2} aria-hidden="true" />
        <span className="button-label">Nueva consulta</span>
      </button>

      <nav className="nav-list" aria-label="Navegación principal">
        {navigationItems.map((item) => {
          const Icon = navIcons[item.id]
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onChangeView(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              <span className="nav-icon"><Icon size={19} strokeWidth={1.75} aria-hidden="true" /></span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="profile-area" ref={profileRef}>
        {menuOpen && (
          <div className="profile-menu" role="menu">
            {twoFactorEnabled ? (
              <button type="button" role="menuitem" className="menu-status" disabled>
                <ShieldCheck size={17} strokeWidth={1.75} aria-hidden="true" />
                Verificación en dos pasos activada
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onActivateTwoFactor()
                }}
              >
                <ShieldPlus size={17} strokeWidth={1.75} aria-hidden="true" />
                Activar verificación en dos pasos
              </button>
            )}
            <div className="menu-divider" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="danger"
              onClick={() => {
                setMenuOpen(false)
                onLogout()
              }}
            >
              <LogOut size={17} strokeWidth={1.75} aria-hidden="true" />
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
          aria-label={`Menú de perfil: ${fullName}`}
          title={user?.email}
        >
          <div className="avatar-mini" aria-hidden="true">{initial}</div>
          <div className="profile-identity">
            <strong>{fullName}</strong>
            <small>{user?.email ?? 'Ajustes'}</small>
          </div>
          <span className="profile-caret" aria-hidden="true"><ChevronsUpDown size={16} strokeWidth={1.75} /></span>
        </button>
      </div>
    </aside>
  )
}
