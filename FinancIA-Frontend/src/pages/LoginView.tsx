import { useState, type FormEvent } from 'react'
import { loginUser, saveToken, saveTwoFactorEnabled, verifyTwoFactor } from '../api'

type LoginViewProps = {
  onAuthenticated: (token: string) => void
  onTwoFactorChange: (requiresTwoFactor: boolean) => void
  onBackToLogin: () => void
}

export function LoginView({ onAuthenticated, onTwoFactorChange, onBackToLogin }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [preToken, setPreToken] = useState('')
  const [code, setCode] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const setTwoFactor = (value: boolean) => {
    setRequiresTwoFactor(value)
    onTwoFactorChange(value)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      if (requiresTwoFactor) {
        const response = await verifyTwoFactor(preToken, code)
        saveToken(response.token)
        saveTwoFactorEnabled(true)
        onAuthenticated(response.token)
        return
      }

      const response = await loginUser({ email, password })
      if (response.requires2fa && response.preAuthToken) {
        setPreToken(response.preAuthToken)
        setTwoFactor(true)
        setNotice('Revisa tu aplicación de autenticación e ingresa el código de 6 dígitos.')
      } else if (response.token) {
        saveToken(response.token)
        saveTwoFactorEnabled(false)
        onAuthenticated(response.token)
      } else {
        throw new Error('El backend no devolvió un token válido.')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  const returnToLogin = () => {
    setTwoFactor(false)
    setPreToken('')
    setCode('')
    setError('')
    setNotice('')
    onBackToLogin()
  }

  return (
    <>
      <form className="auth-form" onSubmit={submit}>
        {requiresTwoFactor ? (
          <label>Código de verificación<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" minLength={6} maxLength={6} required autoFocus /></label>
        ) : (
          <>
            <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
          </>
        )}

        {error && <div className="auth-feedback error">{error}</div>}
        {notice && <div className="auth-feedback notice">{notice}</div>}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Conectando...' : requiresTwoFactor ? 'Verificar y entrar' : 'Entrar al panel'}
        </button>
      </form>

      {requiresTwoFactor && <button className="auth-back" type="button" onClick={returnToLogin}>Volver al inicio de sesión</button>}
    </>
  )
}
