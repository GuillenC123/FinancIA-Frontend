import { useState, type FormEvent } from 'react'
import type { DetailModalProps } from '../types'

type ConsultationModalProps = {
  onClose: () => void
  onSubmit: (question: string) => void
}

export function ConsultationModal({ onClose, onSubmit }: ConsultationModalProps) {
  const [question, setQuestion] = useState('')
  const suggestions = [
    '¿En qué estoy gastando más?',
    '¿Cuánto puedo ahorrar esta semana?',
    '¿Cómo avanzo con mis metas?',
  ]

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
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
            rows={4}
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

export function DetailsModal({ title, content, onClose }: DetailModalProps) {
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
