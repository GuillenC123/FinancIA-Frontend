import { useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar'
import { ConsultationModal, DetailsModal } from './components/Modals'
import { AsistenteView } from './pages/AsistenteView'
import { DashboardView } from './pages/DashboardView'
import { MetasView } from './pages/MetasView'
import { MovimientosView } from './pages/MovimientosView'
import type { ModalState, ViewId } from './types'

function App() {
  const [activeView, setActiveView] = useState<ViewId>('inicio')
  const [modal, setModal] = useState<ModalState>(null)
  const [toast, setToast] = useState('')

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

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        onNewConsultation={() => setModal({ type: 'consultation' })}
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
      {toast && <div className="toast-message">{toast}</div>}
    </div>
  )
}

export default App
