import { useState } from 'react'
import { quickQuestions } from '../data'

type AsistenteViewProps = {
  onConsult: (question: string) => void
}

export function AsistenteView({ onConsult }: AsistenteViewProps) {
  const [selectedQuestion, setSelectedQuestion] = useState('¿Cómo van mis gastos esta semana?')

  const selectQuestion = (question: string) => {
    setSelectedQuestion(question)
    onConsult(question)
  }

  return (
    <>
      <header className="chat-header">
        <h2>Tu Ayudante FinancIA</h2>
        <p>Listo para ayudarte con tus finanzas hoy.</p>
      </header>

      <section className="quick-questions">
        <h3>Preguntas rápidas</h3>
        <div className="question-grid">
          {quickQuestions.map((question, index) => (
            <button
              key={question}
              className={`question-card ${selectedQuestion === question ? 'selected' : ''}`}
              type="button"
              onClick={() => selectQuestion(question)}
            >
              <span className="question-icon">{index === 0 ? '📊' : index === 1 ? '💸' : '💻'}</span>
              <span>{question}</span>
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
