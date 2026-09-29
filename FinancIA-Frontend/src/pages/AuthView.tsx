import { useState } from 'react'
import { Check } from 'lucide-react'
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
        <div className="auth-brand">
          <div className="auth-brand-icon" aria-hidden="true">F</div>
          FinancIA
        </div>
        <h1>Tu dinero, más claro.</h1>
        <p>Organiza tus cuentas, entiende tus hábitos y avanza hacia tus metas con FinancIA.</p>
        <div className="auth-benefits">
          <span><Check strokeWidth={2.25} aria-hidden="true" />Resumen financiero</span>
          <span><Check strokeWidth={2.25} aria-hidden="true" />Seguimiento de metas</span>
          <span><Check strokeWidth={2.25} aria-hidden="true" />Asistencia personalizada</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-heading">
          <h2>{requiresTwoFactor ? 'Verifica tu acceso' : mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
          <p>{requiresTwoFactor ? 'Completa el segundo paso para entrar a tu panel.' : 'Ingresa tus datos para continuar.'}</p>
        </div>

        {!requiresTwoFactor && (
          <div className="auth-tabs" role="tablist" aria-label="Acceso a FinancIA">
            <button className={mode === 'login' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'login'} onClick={() => changeMode('login')}>Iniciar sesión</button>
            <button className={mode === 'register' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'register'} onClick={() => changeMode('register')}>Crear cuenta</button>
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
