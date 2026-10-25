const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const TOKEN_KEY = 'financia_token'
const TWO_FACTOR_KEY = 'financia_2fa'

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

export type TwoFactorSetupResponse = {
  qrImage: string
}

export type CurrentUser = {
  name: string
  lastName: string
  email: string
  status: string
  role: string
}

export type DashboardSummary = {
  detailedFinancialSummary: {
    totalBalance: number
    income: number
    costs: number
    periodBalance: number
    currency: string
  }
  comparisonPreviousPeriod: {
    revenueVariationPercentage: number | null
    variationExpensesPercentage: number | null
  }
  budget: {
    totalAmount: number
    amountSpent: number
    availableAmount: number
    percentageConsumed: number
  }
  goals: {
    active: number
    completed: number
    totalProgressPercentage: number
  }
}

export type PaginationResponse<T> = {
  content: T[]
  pageNum: number
  pageSize: number
  totalPages: number
  totalElements: number
  last: boolean
}

export type Movement = {
  movementId: string
  account: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
    type: string
  }
  amount: number
  description: string
  dateIssue: string
  receiptUrl: string | null
}

export type FinancialObjective = {
  id: string
  name: string
  description: string
  currentAmount: number
  targetAmount: number
  percentageProgress: number
  startDate: string
  targetDate: string
  status: 'INICIADA' | 'EN_PROCESO' | 'PAUSADA' | 'REANUDADA' | 'COMPLETADA' | 'CANCELADA'
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

type BackendError = {
  message?: string
  errors?: Record<string, unknown>
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const text = await response.text()
  let payload: unknown = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    throw new ApiError(getBackendError(payload, response.status), response.status)
  }

  return payload as T
}

function getBackendError(payload: unknown, status: number) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    const error = payload as BackendError
    const errorValues = error.errors ? Object.values(error.errors).filter((value): value is string => typeof value === 'string') : []
    if (errorValues.length > 0) return errorValues.join(' ')
    if (error.message) return error.message
  }
  return `No se pudo completar la solicitud (${status}).`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TWO_FACTOR_KEY)
}

// El backend no expone si el 2FA esta activo, pero el login lo indica en requires2fa.
export function getTwoFactorEnabled() {
  return localStorage.getItem(TWO_FACTOR_KEY) === 'true'
}

export function saveTwoFactorEnabled(enabled: boolean) {
  localStorage.setItem(TWO_FACTOR_KEY, String(enabled))
}

export function getCurrentUser() {
  return request<CurrentUser>('/api/v1/users/me')
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

export function setupTwoFactor() {
  return request<TwoFactorSetupResponse>('/api/v1/auth/2fa/setup', { method: 'POST' })
}

export function confirmTwoFactor(code: string) {
  return request<unknown>('/api/v1/auth/2fa/confirm', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function getDashboardSummary(from: string) {
  return request<DashboardSummary>(`/api/v1/user/dashboard?from=${encodeURIComponent(from)}`)
}

export function getMovements() {
  return request<PaginationResponse<Movement>>(
    '/api/v1/movements/my-movements?pageNum=0&pageSize=100&sortBy=date_issue&direction=desc',
  )
}

export function getFinancialObjectives() {
  return request<PaginationResponse<FinancialObjective>>(
    '/api/v1/objectives?pageNum=0&pageSize=100&sortBy=startDate&direction=desc',
  )
}
