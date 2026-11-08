import { useEffect, useState } from 'react'
import './App.css'
import {
  ApiError,
  clearToken,
  getCurrentUser,
  getToken,
  getTwoFactorEnabled,
  saveTwoFactorEnabled,
  type CurrentUser,
} from './api'
import { Sidebar } from './components/Sidebar'
import { ConsultationModal, DetailsModal, ProfileSettingsModal, TwoFactorModal } from './components/Modals'
import { Notifications } from './components/Notifications'
import { AuthView } from './pages/AuthView'
import { AsistenteView } from './pages/AsistenteView'
import { DashboardView } from './pages/DashboardView'
import { GestionView } from './pages/GestionView'
import { MetasView } from './pages/MetasView'
import { MovimientosView } from './pages/MovimientosView'
import { AdminView } from './pages/AdminView'
import type { ModalState, ViewId } from './types'

const adminViews: ViewId[] = ['admin-dashboard', 'admin-users', 'admin-categories', 'admin-audit']

function App() {
  const [token, setToken] = useState<string | null>(() => getToken())
  const [activeView, setActiveView] = useState<ViewId>('inicio')
  const [modal, setModal] = useState<ModalState>(null)
  const [toast, setToast] = useState('')
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [userError, setUserError] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => getTwoFactorEnabled())

  useEffect(() => {
    if (!token) return

    let cancelled = false
    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser)
          setUserError('')
        }
      })
      .catch((requestError: unknown) => {
        if (cancelled) return
        if (requestError instanceof ApiError && requestError.status === 401) {
          clearToken()
          setToken(null)
          setUser(null)
          setTwoFactorEnabled(false)
          return
        }
        setUserError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el perfil.')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const openDetails = (title: string, content: string) => {
    setModal({ type: 'details', title, content })
  }

  const authenticate = (newToken: string) => {
    setToken(newToken)
    setUserError('')
    setTwoFactorEnabled(getTwoFactorEnabled())
  }

  const logout = () => {
    clearToken()
    setToken(null)
    setUser(null)
    setUserError('')
    setTwoFactorEnabled(false)
    setActiveView('inicio')
  }

  const markTwoFactorEnabled = (message: string) => {
    saveTwoFactorEnabled(true)
    setTwoFactorEnabled(true)
    setModal(null)
    showToast(message)
  }

  if (!token) {
    return <AuthView onAuthenticated={authenticate} />
  }

  const isAdmin = user?.role.toUpperCase() === 'ADMIN'
  const visibleView = isAdmin
    ? adminViews.includes(activeView) ? activeView : 'admin-dashboard'
    : adminViews.includes(activeView) ? 'inicio' : activeView

  return (
    <div className="app-shell">
      <Sidebar
        activeView={visibleView}
        onChangeView={setActiveView}
        onNewConsultation={() => setModal({ type: 'consultation' })}
        onLogout={logout}
        user={user}
        twoFactorEnabled={twoFactorEnabled}
        onActivateTwoFactor={() => setModal({ type: 'twofactor' })}
        onManageProfile={() => setModal({ type: 'profileSettings' })}
      />

      <main className="content-panel">
        {userError && <div className="auth-feedback error" role="alert">{userError}</div>}
        {isAdmin ? (
          <AdminView activeView={visibleView} />
        ) : (
          <>
            {visibleView === 'inicio' && <DashboardView userName={user?.name} onOpenDetails={openDetails} />}
            {visibleView === 'movimientos' && <MovimientosView onOpenDetails={openDetails} />}
            {visibleView === 'asistente' && <AsistenteView />}
            {visibleView === 'metas' && <MetasView onOpenDetails={openDetails} />}
            {visibleView === 'gestion' && <GestionView onOpenDetails={openDetails} />}
          </>
        )}
      </main>

      {modal?.type === 'consultation' && (
        <ConsultationModal onClose={() => setModal(null)} />
      )}
      {modal?.type === 'details' && (
        <DetailsModal title={modal.title} content={modal.content} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'twofactor' && (
        <TwoFactorModal
          onClose={() => setModal(null)}
          onActivated={() => markTwoFactorEnabled('Verificación en dos pasos activada')}
          onAlreadyEnabled={() => markTwoFactorEnabled('Ya tenías la verificación en dos pasos activada')}
        />
      )}
      {modal?.type === 'profileSettings' && (
        <ProfileSettingsModal
          onClose={() => setModal(null)}
          onPasswordChanged={() => showToast('Contraseña actualizada')}
          onAccountSuspended={() => {
            setModal(null)
            logout()
          }}
        />
      )}
      <Notifications token={token} />
      {toast && <div className="toast-message">{toast}</div>}
    </div>
  )
}

export default App
