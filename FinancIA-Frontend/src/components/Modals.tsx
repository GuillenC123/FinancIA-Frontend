import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChartPie, MessageSquarePlus, ShieldCheck, X } from 'lucide-react'
import { confirmTwoFactor, setupTwoFactor } from '../api'
import type { DetailModalProps } from '../types'

const CloseIcon = () => <X size={18} strokeWidth={2} aria-hidden="true" />

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
          <div className="modal-icon" aria-hidden="true"><MessageSquarePlus size={20} strokeWidth={1.75} /></div>
          <div>
            <h2 id="consultation-title">Nueva consulta</h2>
            <p>Pregunta algo sobre tus finanzas y recibe una orientación personalizada.</p>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar"><CloseIcon /></button>
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
type TwoFactorModalProps = {
  onClose: () => void
  onActivated: () => void
  onAlreadyEnabled: () => void
}

export function TwoFactorModal({ onClose, onActivated, onAlreadyEnabled }: TwoFactorModalProps) {
  const [qrImage, setQrImage] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const alreadyEnabledRef = useRef(onAlreadyEnabled)

  useEffect(() => {
    alreadyEnabledRef.current = onAlreadyEnabled
  }, [onAlreadyEnabled])

  useEffect(() => {
    setupTwoFactor()
      .then((response) => setQrImage(response.qrImage))
      .catch((requestError: unknown) => {
        const message = requestError instanceof Error ? requestError.message : ''
        // La sesion puede venir de antes de que guardaramos el estado del 2FA: el backend
        // es la fuente de verdad, asi que su error corrige lo que teniamos registrado.
        if (message.includes('ya tiene activado')) {
          alreadyEnabledRef.current()
        } else {
          setError(message || 'No se pudo generar el código QR.')
        }
      })
  }, [])

  const confirmSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await confirmTwoFactor(code)
      onActivated()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo activar la verificación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card details-modal" role="dialog" aria-modal="true" aria-labelledby="twofactor-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div className="modal-icon" aria-hidden="true"><ShieldCheck size={20} strokeWidth={1.75} /></div>
          <div>
            <h2 id="twofactor-title">Verificación en dos pasos</h2>
            <p>Además de tu contraseña, pediremos un código temporal al iniciar sesión.</p>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar"><CloseIcon /></button>
        </div>

        <form onSubmit={confirmSetup}>
          <div className="qr-step">
            {qrImage ? (
              <img src={qrImage} alt="Código QR para la app de autenticación" />
            ) : (
              <div className="qr-placeholder">Generando código…</div>
            )}
            <ol>
              <li>Abre Google Authenticator en tu teléfono.</li>
              <li>Escanea este código QR.</li>
              <li>Escribe abajo el código de 6 dígitos que aparece.</li>
            </ol>
          </div>

          <label htmlFor="twofactor-code">Código de verificación</label>
          <input
            id="twofactor-code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            minLength={6}
            maxLength={6}
            required
            autoFocus
            autoComplete="one-time-code"
            placeholder="000000"
          />

          {error && <div className="auth-feedback error">{error}</div>}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="modal-primary" type="submit" disabled={loading || !qrImage || code.length < 6}>
              {loading ? 'Activando...' : 'Confirmar y activar'}
            </button>
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
          <div className="modal-icon" aria-hidden="true"><ChartPie size={20} strokeWidth={1.75} /></div>
          <div>
            <h2 id="details-title">{title}</h2>
            <p>Resumen generado con tus datos de ejemplo.</p>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar"><CloseIcon /></button>
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
