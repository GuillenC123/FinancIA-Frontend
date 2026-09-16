import { useState } from 'react'
import './App.css'

const navigationItems = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'movimientos', label: 'Movimientos', icon: '💳' },
  { id: 'metas', label: 'Metas', icon: '🎯' },
  { id: 'asistente', label: 'Asistente IA', icon: '🤖' },
]

const summaryCards = [
  { label: 'Entró', value: 'S/ 5,200', tone: 'primary', icon: '↓' },
  { label: 'Gasté', value: 'S/ 3,100', tone: 'danger', icon: '↑' },
  { label: 'Queda para ahorrar', value: 'S/ 2,100', tone: 'success', icon: '💰' },
]

const quickQuestions = [
  '¿En qué gasté más este mes?',
  '¿Cuánto dinero puedo guardar esta semana?',
  '¿Cómo voy con el dinero para mi Laptop?',
]

const movimientos = [
  { id: 1, name: 'Comida', detail: 'Salida de: Billetera', amount: '- S/ 45.00', type: 'expense' },
  { id: 2, name: 'Sueldo', detail: 'Entró a: Banco', amount: '+ S/ 1,500.00', type: 'income' },
  { id: 3, name: 'Transporte', detail: 'Salida de: Yape', amount: '- S/ 12.00', type: 'expense' },
]

function App() {
  const [activeView, setActiveView] = useState('inicio')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const openNewConsultation = () => setModal({ type: 'consultation' })

  const openDetails = (title, content) => setModal({ type: 'details', title, content })

  const handleConsultation = (question) => {
    setModal(null)
    setActiveView('asistente')
    showToast(`Consulta preparada: ${question}`)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-icon">🤖</div>
          <div>
            <h1>FinancIA</h1>
            <p>AI Financial Assistant</p>
          </div>
        </div>

        <button className="primary-button" type="button" onClick={openNewConsultation}>
          <span>＋</span> Nueva Consulta
        </button>

        <nav className="nav-list" aria-label="Navegación principal">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
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
        <DetailsModal
          title={modal.title}
          content={modal.content}
          onClose={() => setModal(null)}
        />
      )}
      {toast && <div className="toast-message">{toast}</div>}
    </div>
  )
}

function DashboardView({ onOpenDetails }) {
  return (
    <>
      <header className="welcome-block">
        <h2>¡Hola!</h2>
        <p>Aquí tienes el resumen de tu mes.</p>
      </header>

      <section className="summary-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className={`summary-card ${card.tone}`}>
            <div className="summary-top">
              <div className="summary-icon">{card.icon}</div>
              <span>{card.label}</span>
            </div>
            <strong>{card.value}</strong>
            <div className="progress-bar"><span /></div>
          </article>
        ))}
      </section>

      <section className="analytics-grid">
        <div className="panel-card donut-panel">
          <h3>Gastos por Categoría</h3>
          <div className="donut-chart">
            <div className="donut-inner">
              <span>Total</span>
              <strong>S/ 3,100</strong>
            </div>
          </div>
          <div className="legend">
            <span><i className="dot blue" />Hogar</span>
            <span><i className="dot amber" />Comida</span>
            <span><i className="dot gray" />Otros</span>
          </div>
        </div>

        <div className="panel-card chart-panel">
          <h3>Tendencia Mensual</h3>
          <div className="bars">
            {['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((month, index) => (
              <div key={month} className="bar-group">
                <div className="bar" style={{ height: `${35 + index * 15}%` }} />
                <span>{month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="insight-card">
        <div className="spark-icon">✦</div>
        <div>
          <h4>Tarjeta mágica de FinancIA</h4>
          <p>
            ¡Excelente trabajo este mes! Estás gastando un 15% menos en <strong>Comida</strong>{' '}
            en comparación con el mes pasado. Si mantienes este ritmo, alcanzarás tu meta de ahorro para el viaje de los sueños.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenDetails(
            'Análisis de tus gastos',
            'Tu categoría Comida bajó 15% frente al mes anterior. Si mantienes este ritmo, puedes reservar S/ 300 adicionales para tu meta de Viaje a Cusco.',
          )}
        >
          Ver detalles
        </button>
      </section>
    </>
  )
}

function MovimientosView({ onNotify }) {
  const [filter, setFilter] = useState('all')
  const [account, setAccount] = useState('all')
  const [month, setMonth] = useState('Mayo')
  const [openMenu, setOpenMenu] = useState(null)
  const filteredMovimientos = movimientos.filter((item) => {
    const matchesType = filter === 'all' || item.type === filter
    const matchesAccount = account === 'all' || item.detail.toLowerCase().includes(account)
    return matchesType && matchesAccount
  })

  return (
    <>
      <header className="page-header">
        <h2>Mis Movimientos</h2>
        <p>Revisa y gestiona todos tus ingresos y gastos aquí.</p>
      </header>

      <section className="filters-bar">
        <div className="filter-row">
          <button type="button" className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todo</button>
          <button type="button" className={`filter-chip ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>↗ Solo lo que gané</button>
          <button type="button" className={`filter-chip ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')}>↘ Solo lo que gasté</button>
        </div>

        <div className="select-row">
          <div className="select-control">
            <span className="select-icon">▣</span>
            <span className="select-label">Periodo</span>
            <button className="select-trigger" type="button" onClick={() => setOpenMenu(openMenu === 'month' ? null : 'month')}>
              {month}
            </button>
            <span className="select-chevron">⌄</span>
            {openMenu === 'month' && (
              <div className="select-menu">
                {['Mayo', 'Abril', 'Marzo'].map((option) => (
                  <button key={option} type="button" className={month === option ? 'selected' : ''} onClick={() => {
                    setMonth(option)
                    setOpenMenu(null)
                    onNotify('El periodo seleccionado se aplicará al conectar la API.')
                  }}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="select-control account-control">
            <span className="select-icon">▤</span>
            <span className="select-label">Cuenta</span>
            <button className="select-trigger" type="button" onClick={() => setOpenMenu(openMenu === 'account' ? null : 'account')}>
              {account === 'all' ? 'Todas las Cuentas' : account[0].toUpperCase() + account.slice(1)}
            </button>
            <span className="select-chevron">⌄</span>
            {openMenu === 'account' && (
              <div className="select-menu">
                {[
                  ['all', 'Todas las Cuentas'],
                  ['banco', 'Banco'],
                  ['billetera', 'Billetera'],
                  ['yape', 'Yape'],
                ].map(([value, label]) => (
                  <button key={value} type="button" className={account === value ? 'selected' : ''} onClick={() => {
                    setAccount(value)
                    setOpenMenu(null)
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="transactions-block">
        <h3>Hoy</h3>
        {filteredMovimientos.map((item) => (
          <article key={item.id} className="transaction-row">
            <div className="transaction-main">
              <div className={`transaction-icon ${item.type}`}>
                {item.type === 'expense' ? '🍽️' : '💵'}
              </div>
              <div>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </div>
            </div>
            <div className={`amount ${item.type}`}>{item.amount}</div>
          </article>
        ))}

        {filteredMovimientos.length === 0 && (
          <div className="empty-state">No hay movimientos que coincidan con este filtro.</div>
        )}

        <h3 className="group-label">Ayer</h3>
        <article className="transaction-row">
          <div className="transaction-main">
            <div className="transaction-icon expense">🚇</div>
            <div>
              <strong>Transporte</strong>
              <small>Salida de: Yape</small>
            </div>
          </div>
          <div className="amount expense">- S/ 12.00</div>
        </article>
      </section>
    </>
  )
}

function AsistenteView({ onConsult }) {
  const [selectedQuestion, setSelectedQuestion] = useState('¿Cómo van mis gastos esta semana?')

  return (
    <>
      <header className="chat-header">
        <h2>Tu Ayudante FinancIA</h2>
        <p>Listo para ayudarte con tus finanzas hoy.</p>
      </header>

      <section className="quick-questions">
        <h3>Preguntas rápidas</h3>
        <div className="question-grid">
          {quickQuestions.map((q, index) => (
            <button
              key={q}
              className={`question-card ${selectedQuestion === q ? 'selected' : ''}`}
              type="button"
              onClick={() => {
                setSelectedQuestion(q)
                onConsult(q)
              }}
            >
              <span className="question-icon">{index === 0 ? '📊' : index === 1 ? '💸' : '💻'}</span>
              <span>{q}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="chat-box">
        <div className="user-bubble">{selectedQuestion}</div>
        <div className="assistant-row">
          <div className="assistant-avatar">🤖</div>
          <div className="assistant-card">
            <div className="assistant-label">Análisis FinancIA</div>
            <p>¡Vas muy bien! Aquí tienes un resumen rápido de tus gastos recientes:</p>
            <div className="mini-list">
              <div className="mini-item">
                <span className="mini-icon expense">🍽️</span>
                <span>Comida</span>
                <strong>- S/ 200</strong>
              </div>
              <div className="mini-item">
                <span className="mini-icon entertainment">🎉</span>
                <span>Diversión</span>
                <strong>- S/ 100</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function MetasView({ onOpenDetails, onNotify }) {
  const metas = [
    {
      title: 'Viaje a Cusco',
      amount: 'S/ 3,200',
      saved: 'S/ 1,800',
      progress: 56,
      deadline: '12 Oct 2026',
      color: 'purple',
    },
    {
      title: 'Emergencia',
      amount: 'S/ 2,500',
      saved: 'S/ 1,300',
      progress: 52,
      deadline: '30 Sep 2026',
      color: 'green',
    },
    {
      title: 'Laptop nueva',
      amount: 'S/ 4,200',
      saved: 'S/ 2,100',
      progress: 50,
      deadline: '18 Nov 2026',
      color: 'blue',
    },
  ]

  return (
    <>
      <header className="page-header">
        <h2>Metas</h2>
        <p>Organiza tus objetivos financieros y sigue tu progreso mes a mes.</p>
      </header>

      <section className="meta-summary">
        <div className="summary-box highlight">
          <span>Total ahorrado</span>
          <strong>S/ 5,200</strong>
          <small>+ S/ 480 este mes</small>
        </div>
        <div className="summary-box">
          <span>Meta activa</span>
          <strong>3</strong>
          <small>Objetivos en curso</small>
        </div>
        <div className="summary-box">
          <span>Progreso global</span>
          <strong>53%</strong>
          <small>Meta combinada</small>
        </div>
      </section>

      <section className="meta-grid">
        {metas.map((meta) => (
          <article key={meta.title} className="meta-card">
            <div className="meta-head">
              <div className={`meta-badge ${meta.color}`} />
              <div>
                <h3>{meta.title}</h3>
                <span>{meta.deadline}</span>
              </div>
            </div>

            <div className="meta-values">
              <strong>{meta.saved}</strong>
              <span>de {meta.amount}</span>
            </div>

            <div className="meta-progress">
              <span style={{ width: `${meta.progress}%` }} />
            </div>

            <div className="meta-footer">
              <small>{meta.progress}% completado</small>
              <button
                type="button"
                onClick={() => onOpenDetails(
                  meta.title,
                  `Has alcanzado ${meta.progress}% de tu objetivo. Te faltan ${meta.amount.replace(meta.saved, '').trim()} para completar esta meta antes del ${meta.deadline}.`,
                )}
              >
                Ver detalle
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="quick-plan">
        <div>
          <h3>Plan recomendado</h3>
          <p>Asigna S/ 300 mensuales a tu meta de viaje para lograrla 2 meses antes de la fecha prevista.</p>
        </div>
        <button type="button" onClick={() => onNotify('Puedes ajustar tu aporte mensual cuando conectemos tus cuentas reales.')}>Ajustar aporte</button>
      </section>
    </>
  )
}

function ConsultationModal({ onClose, onSubmit }) {
  const [question, setQuestion] = useState('')

  const suggestions = [
    '¿En qué estoy gastando más?',
    '¿Cuánto puedo ahorrar esta semana?',
    '¿Cómo avanzo con mis metas?',
  ]

  const submitQuestion = (event) => {
    event.preventDefault()
    if (question.trim()) onSubmit(question.trim())
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card consultation-modal" role="dialog" aria-modal="true" aria-labelledby="consultation-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div className="modal-icon">🤖</div>
          <div>
            <h2 id="consultation-title">Nueva consulta</h2>
            <p>Pregunta algo sobre tus finanzas y recibe una orientación personalizada.</p>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={submitQuestion}>
          <label htmlFor="consultation-input">¿Qué quieres analizar?</label>
          <textarea
            id="consultation-input"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ejemplo: ¿Cómo puedo ahorrar más este mes?"
            rows="4"
            autoFocus
          />
          <div className="suggestion-list">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)}>{suggestion}</button>
            ))}
          </div>
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="modal-primary" type="submit" disabled={!question.trim()}>Analizar consulta</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailsModal({ title, content, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div className="modal-icon">✦</div>
          <div>
            <h2 id="details-title">{title}</h2>
            <p>Resumen generado con tus datos de ejemplo.</p>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="detail-highlight">
          <span>Recomendación FinancIA</span>
          <strong>{content}</strong>
        </div>
        <div className="details-list">
          <div><span>Estado</span><strong>En buen camino</strong></div>
          <div><span>Próxima revisión</span><strong>En 7 días</strong></div>
          <div><span>Impacto estimado</span><strong className="positive-text">+ S/ 300</strong></div>
        </div>
        <button className="modal-primary full-width" type="button" onClick={onClose}>Entendido</button>
      </div>
    </div>
  )
}

export default App
