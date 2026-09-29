import { useState, type FormEvent } from 'react'
import { CircleAlert, Info } from 'lucide-react'
import { registerUser, saveToken, saveTwoFactorEnabled } from '../api'

type RegisterViewProps = {
  onAuthenticated: (token: string) => void
}

export function RegisterView({ onAuthenticated }: RegisterViewProps) {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await registerUser({ name, lastName, email, password, role: 'USER' })
      saveToken(response.token)
      saveTwoFactorEnabled(false)
      onAuthenticated(response.token)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-form-grid">
        <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required minLength={3} autoComplete="given-name" placeholder="Tu nombre" /></label>
        <label>Apellido<input value={lastName} onChange={(event) => setLastName(event.target.value)} required minLength={3} autoComplete="family-name" placeholder="Tu apellido" /></label>
      </div>
      <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="tucorreo@ejemplo.com" /></label>
      <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" /></label>
      <small className="password-hint"><Info size={14} strokeWidth={2} aria-hidden="true" />Usa al menos 8 caracteres, con mayúscula, minúscula, número y símbolo.</small>
      {error && <div className="auth-feedback error" role="alert"><CircleAlert size={16} strokeWidth={2} aria-hidden="true" />{error}</div>}
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
      </button>
    </form>
  )
}
