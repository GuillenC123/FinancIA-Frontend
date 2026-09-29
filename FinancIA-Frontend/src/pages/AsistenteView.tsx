import { useState } from 'react'
import { ChartPie, Laptop, PiggyBank, Ticket, Utensils, type LucideIcon } from 'lucide-react'
import { quickQuestions } from '../data'

type AsistenteViewProps = {
  onConsult: (question: string) => void
}

const questionIcons: LucideIcon[] = [ChartPie, PiggyBank, Laptop]

export function AsistenteView({ onConsult }: AsistenteViewProps) {
  const [selectedQuestion, setSelectedQuestion] = useState('¿Cómo van mis gastos esta semana?')

  const selectQuestion = (question: string) => {
    setSelectedQuestion(question)
    onConsult(question)
  }

  return (
    <>
      <header className="chat-header">
        <h2>Asistente FinancIA</h2>
        <p>Listo para ayudarte con tus finanzas hoy.</p>
      </header>

      <section className="quick-questions">
        <h3>Preguntas rápidas</h3>
        <div className="question-grid">
          {quickQuestions.map((question, index) => {
            const Icon = questionIcons[index] ?? ChartPie
            return (
              <button
                key={question}
                className={`question-card ${selectedQuestion === question ? 'selected' : ''}`}
                type="button"
                onClick={() => selectQuestion(question)}
                aria-pressed={selectedQuestion === question}
              >
                <span className="question-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.75} /></span>
                <span>{question}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="chat-box" aria-label="Conversación">
        <div className="user-bubble">{selectedQuestion}</div>
        <div className="assistant-row">
          <div className="assistant-avatar" aria-hidden="true">F</div>
          <div className="assistant-card">
            <div className="assistant-label">Análisis FinancIA</div>
            <p>Vas muy bien. Este es un resumen rápido de tus gastos recientes:</p>
            <div className="mini-list">
              <div className="mini-item">
                <span className="mini-icon expense" aria-hidden="true"><Utensils size={15} strokeWidth={1.75} /></span>
                <span>Comida</span>
                <strong>- S/ 200</strong>
              </div>
              <div className="mini-item">
                <span className="mini-icon entertainment" aria-hidden="true"><Ticket size={15} strokeWidth={1.75} /></span>
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
