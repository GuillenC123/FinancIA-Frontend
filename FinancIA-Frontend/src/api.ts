const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'financia_token'

export type RegisterPayload = {
  name: string
  lastName: string
  email: string
  password: string
  role: 'USER'
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  requires2fa: boolean
  token?: string
  preAuthToken?: string
}

export type AuthResponse = {
  token: string
}

type BackendError = {
  message?: string
  errors?: Record<string, string>
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getBackendError(payload, response.status))
  }

  return payload as T
}

function getBackendError(payload: BackendError | null, status: number) {
  const errorValues = payload?.errors ? Object.values(payload.errors) : []
  if (errorValues.length > 0) {
    return errorValues.join(' ')
  }
  return payload?.message ?? `No se pudo completar la solicitud (${status}).`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function registerUser(payload: RegisterPayload) {
  return request<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload: LoginPayload) {
  return request<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyTwoFactor(preToken: string, code: string) {
  return request<AuthResponse>('/api/v1/auth/verify-2fa', {
    method: 'POST',
    body: JSON.stringify({ preToken, code }),
  })
}
