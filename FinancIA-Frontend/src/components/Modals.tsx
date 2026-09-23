import { useState, type FormEvent } from 'react'
import { confirmTwoFactor, setupTwoFactor } from '../api'
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

type SecurityModalProps = {
  onClose: () => void
  onLogout: () => void
  onNotify: (message: string) => void
}

export function SecurityModal({ onClose, onLogout, onNotify }: SecurityModalProps) {
  const [qrImage, setQrImage] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyEnabled, setAlreadyEnabled] = useState(false)

  const startSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await setupTwoFactor()
      setQrImage(response.qrImage)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : ''
      // El backend no expone si el 2FA ya esta activo, asi que se deduce de este error.
      if (message.includes('ya tiene activado')) {
        setAlreadyEnabled(true)
      } else {
        setError(message || 'No se pudo generar el código QR.')
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await confirmTwoFactor(code)
      onClose()
      onNotify('Verificación en dos pasos activada')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo activar la verificación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card details-modal" role="dialog" aria-modal="true" aria-labelledby="security-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div className="modal-icon">🔒</div>
          <div>
            <h2 id="security-title">Seguridad</h2>
            <p>Protege tu cuenta con un segundo paso al iniciar sesión.</p>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {!qrImage ? (
          <>
            <div className="detail-highlight">
              <span>Verificación en dos pasos</span>
              <strong>
                {alreadyEnabled
                  ? 'Ya está activada en tu cuenta. Cada vez que inicies sesión te pediremos el código de 6 dígitos de tu app de autenticación.'
                  : 'Además de tu contraseña, necesitarás un código temporal de 6 dígitos generado por una app como Google Authenticator.'}
              </strong>
            </div>
            {error && <div className="auth-feedback error">{error}</div>}
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={onLogout}>Cerrar sesión</button>
              {alreadyEnabled ? (
                <button className="modal-primary" type="button" onClick={onClose}>Entendido</button>
              ) : (
                <button className="modal-primary" type="button" onClick={startSetup} disabled={loading}>
                  {loading ? 'Generando...' : 'Activar verificación'}
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={confirmSetup}>
            <div className="qr-step">
              <img src={qrImage} alt="Código QR para la app de autenticación" />
              <ol>
                <li>Abre Google Authenticator en tu teléfono.</li>
                <li>Escanea este código QR.</li>
                <li>Escribe abajo el código de 6 dígitos que aparece.</li>
              </ol>
            </div>

            <label htmlFor="security-code">Código de verificación</label>
            <input
              id="security-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              required
              autoFocus
            />

            {error && <div className="auth-feedback error">{error}</div>}

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
              <button className="modal-primary" type="submit" disabled={loading || code.length < 6}>
                {loading ? 'Activando...' : 'Confirmar y activar'}
              </button>
            </div>
          </form>
        )}
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
