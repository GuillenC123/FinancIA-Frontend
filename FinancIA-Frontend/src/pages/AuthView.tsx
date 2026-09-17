import { useState } from 'react'
import { LoginView } from './LoginView'
import { RegisterView } from './RegisterView'

type AuthViewProps = {
  onAuthenticated: (token: string) => void
}

type AuthMode = 'login' | 'register'

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setRequiresTwoFactor(false)
  }

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <div className="auth-brand-icon">🤖</div>
        <span className="auth-eyebrow">FINANZAS PERSONALES</span>
        <h1>Tu dinero, más claro.</h1>
        <p>Organiza tus cuentas, entiende tus hábitos y avanza hacia tus metas con FinancIA.</p>
        <div className="auth-benefits">
          <span>✓ Resumen financiero</span>
          <span>✓ Seguimiento de metas</span>
          <span>✓ Asistencia personalizada</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-heading">
          <span className="auth-mini-label">Bienvenido a FinancIA</span>
          <h2>{requiresTwoFactor ? 'Verifica tu acceso' : mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
          <p>{requiresTwoFactor ? 'Completa el segundo paso para entrar a tu panel.' : 'Ingresa tus datos para continuar.'}</p>
        </div>

        {!requiresTwoFactor && (
          <div className="auth-tabs" role="tablist" aria-label="Acceso a FinancIA">
            <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => changeMode('login')}>Iniciar sesión</button>
            <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => changeMode('register')}>Crear cuenta</button>
          </div>
        )}

        {mode === 'login' ? (
          <LoginView
            onAuthenticated={onAuthenticated}
            onTwoFactorChange={setRequiresTwoFactor}
            onBackToLogin={() => setMode('login')}
          />
        ) : (
          <RegisterView onAuthenticated={onAuthenticated} />
        )}
      </section>
    </main>
  )
}
