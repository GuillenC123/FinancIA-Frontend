import { LockKeyhole, MessageSquareText, Sparkles } from 'lucide-react'

const suggestedQuestions = [
  '¿Cómo puedo organizar mejor mis gastos?',
  '¿Qué puedo hacer para ahorrar más?',
  'Ayúdame a entender mis hábitos financieros',
]

export function AsistenteView() {
  return (
    <>
      <header className="chat-header">
        <h2>Asistente FinancIA</h2>
        <p>Consulta tus finanzas con ayuda personalizada.</p>
      </header>
      <section className="assistant-preview panel-card" aria-label="Vista previa del asistente financiero">
        <div className="assistant-preview-heading">
          <div className="assistant-preview-icon" aria-hidden="true"><Sparkles size={20} /></div>
          <div>
            <h3>Tu asistente financiero</h3>
            <p>Una forma más sencilla de conversar sobre tus finanzas.</p>
          </div>
          <span className="coming-soon"><LockKeyhole size={14} aria-hidden="true" />Próximamente</span>
        </div>

        <div className="assistant-preview-message">
          <span className="assistant-avatar" aria-hidden="true">F</span>
          <p>Pronto podrás preguntarme sobre tus movimientos, presupuestos y metas.</p>
        </div>

        <div className="assistant-preview-questions" aria-label="Ejemplos de preguntas">
          {suggestedQuestions.map((question) => (
            <div className="assistant-preview-question" key={question}>
              <MessageSquareText size={16} aria-hidden="true" />
              {question}
            </div>
          ))}
        </div>

        <div className="assistant-preview-composer">
          <input type="text" placeholder="El chat estará disponible próximamente" disabled aria-label="Chat próximamente disponible" />
          <button type="button" disabled aria-label="Enviar mensaje"><Sparkles size={17} aria-hidden="true" /></button>
        </div>
        <small className="assistant-preview-note">Esta vista es una presentación; todavía no envía mensajes al backend.</small>
      </section>
    </>
  )
}
