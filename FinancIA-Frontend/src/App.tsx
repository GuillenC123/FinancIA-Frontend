import { useEffect, useState } from 'react'
import './App.css'
import {
  clearToken,
  getCurrentUser,
  getToken,
  getTwoFactorEnabled,
  saveTwoFactorEnabled,
  type CurrentUser,
} from './api'
import { Sidebar } from './components/Sidebar'
import { ConsultationModal, DetailsModal, TwoFactorModal } from './components/Modals'
import { AuthView } from './pages/AuthView'
import { AsistenteView } from './pages/AsistenteView'
import { DashboardView } from './pages/DashboardView'
import { MetasView } from './pages/MetasView'
import { MovimientosView } from './pages/MovimientosView'
import type { ModalState, ViewId } from './types'

function App() {
  const [token, setToken] = useState<string | null>(() => getToken())
  const [activeView, setActiveView] = useState<ViewId>('inicio')
  const [modal, setModal] = useState<ModalState>(null)
  const [toast, setToast] = useState('')
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => getTwoFactorEnabled())

  useEffect(() => {
    if (!token) return
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
  }, [token])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const handleConsultation = (question: string) => {
    setModal(null)
    setActiveView('asistente')
    showToast(`Consulta preparada: ${question}`)
  }

  const openDetails = (title: string, content: string) => {
    setModal({ type: 'details', title, content })
  }

  const authenticate = (newToken: string) => {
    setToken(newToken)
    setTwoFactorEnabled(getTwoFactorEnabled())
  }

  const logout = () => {
    clearToken()
    setToken(null)
    setUser(null)
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

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        onNewConsultation={() => setModal({ type: 'consultation' })}
        onLogout={logout}
        user={user}
        twoFactorEnabled={twoFactorEnabled}
        onActivateTwoFactor={() => setModal({ type: 'twofactor' })}
      />

      <main className="content-panel">
        {activeView === 'inicio' && <DashboardView onOpenDetails={openDetails} />}
        {activeView === 'movimientos' && <MovimientosView onNotify={showToast} />}
        {activeView === 'asistente' && <AsistenteView onConsult={handleConsultation} />}
        {activeView === 'metas' && <MetasView onOpenDetails={openDetails} onNotify={showToast} />}
      </main>

      {modal?.type === 'consultation' && (
        <ConsultationModal onClose={() => setModal(null)} onSubmit={handleConsultation} />
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
      {toast && <div className="toast-message">{toast}</div>}
    </div>
  )
}

export default App
