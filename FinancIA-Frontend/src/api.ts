const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const TOKEN_KEY = 'financia_token'
const TWO_FACTOR_KEY = 'financia_2fa'

export type NotificationMessage = {
  type: string
  header: string
  body: string
  timestamp: string
  data?: Record<string, unknown>
}

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

export type FinancialEvolution = {
  currency: string
  periods: Array<{
    period: string
    totalIncome: number
    totalExpenses: number
  }>
}

export type ExpensesByCategory = {
  totalExpenses: number
  currency: string
  categories: Array<{
    categoryId: string
    name: string
    amount: number
    procentage: number
  }>
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

export type CreatedMovement = {
  id: string
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
  status: 'INICIADA' | 'EN_PROCESO' | 'PAUSADA' | 'REANUDADA' | 'COMPLETADA' | 'FINALIZADA' | 'CANCELADA'
}

export type Account = {
  id: string
  name: string
  type: 'EFECTIVO' | 'BANCO' | 'BILLETERA_DIGITAL' | 'OTRO'
  currentBalance: number
  creationDate: string
  active: boolean
}

export type FinancialCategory = {
  id: string
  name: string
  type: 'INGRESOS' | 'GASTOS' | 'AHORRO'
  creationDate?: string
  active?: boolean
}

export type Transfer = {
  id: string
  accountOrigin: { id: string; name: string }
  accountDestination: { id: string; name: string }
  description: string
  creationDate: string
  amount: number
}

export type BudgetCategory = {
  id: string
  categoryId: string
  amountLimit: number
}

export type Budget = {
  id: string
  userId: string
  name: string
  periodStart: string
  periodEnd: string
  amountLimitTotal: number
  active: boolean
  creationDate: string
  updateDate: string
  categories: BudgetCategory[]
}

export type BudgetConsumption = {
  budgetId: string
  amountLimitTotal: number
  spent: number
  available: number
  exceeded: number
  categories: Array<{
    categoryId: string
    amountLimit: number
    spent: number
    available: number
    exceeded: number
  }>
}

export type Subscription = {
  id: string
  name: string
  amount: number
  frequency: 'MENSUAL' | 'ANUAL' | 'SEMANAL'
  type: 'INGRESO' | 'EGRESO' | 'AHORRO'
  dateNextPayment: string
  active: boolean
}

export type VoucherAnalysis = {
  companyName: string | null
  ruc: string | null
  dateIssued: string | null
  totalAmount: number | null
  paymentMethod: string | null
  expenseCategory: string | null
  description: string | null
  category: Array<{ id: string; name: string; type: string }> | null
  accounts: Array<{ id: string; name: string; type: string }> | null
}

export type Contribution = {
  id: string
  objective: {
    id: string
    name: string
    description: string
    currentAmount: number
    targetAmount: number
    percentageProgress: number
    status: FinancialObjective['status']
  }
  amount: number
  date: string
  description: string
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
  if (options.body !== undefined && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

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

export function getNotificationsWebSocketUrl(token: string) {
  const baseUrl = new URL(API_BASE_URL || window.location.origin, window.location.origin)
  baseUrl.protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  baseUrl.pathname = '/ws/notifications'
  baseUrl.search = ''
  baseUrl.searchParams.set('token', token)
  return baseUrl.toString()
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
  return request<DashboardSummary>(`/api/v1/user/dashboard/sumary?from=${encodeURIComponent(from)}`)
}

export function getFinancialEvolution() {
  return request<FinancialEvolution>('/api/v1/user/dashboard/evolution')
}

export function getExpensesByCategory(from: string, until: string) {
  const query = new URLSearchParams({ from, until })
  return request<ExpensesByCategory>(`/api/v1/user/dashboard/expenses-category?${query}`)
}

export function getMovements() {
  return getAllPages<Movement>('/api/v1/movements/my-movements', 'date_issue')
}

export function getMovement(id: string) {
  return request<Movement>(`/api/v1/movements/my-movements/${encodeURIComponent(id)}`)
}

export function getFinancialObjectives() {
  return getAllPages<FinancialObjective>('/api/v1/objectives', 'startDate')
}

export function getFinancialObjective(id: string) {
  return request<FinancialObjective>(`/api/v1/objectives/${encodeURIComponent(id)}`)
}

async function getAllPages<T>(path: string, sortBy: string): Promise<PaginationResponse<T>> {
  const content: T[] = []
  let pageNum = 0
  let page: PaginationResponse<T>

  do {
    page = await request<PaginationResponse<T>>(
      `${path}?pageNum=${pageNum}&pageSize=100&sortBy=${sortBy}&direction=desc`,
    )
    content.push(...page.content)
    pageNum += 1
  } while (!page.last && page.content.length > 0)

  return { ...page, content, totalElements: content.length }
}

export function createMovement(payload: {
  accountId: string
  category: { categoryId: string; name: string; type: string; parentCategoryId?: string }
  type: 'INGRESO' | 'EGRESO' | 'AHORRO'
  amount: number
  description: string
}) {
  return request<CreatedMovement>('/api/v1/movements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteMovement(id: string) {
  return request<void>(`/api/v1/movements/my-movements/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function uploadMovementReceipt(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<void>(`/api/v1/movements/my-movements/${encodeURIComponent(id)}/submit-voucher`, {
    method: 'POST',
    body: formData,
  })
}

async function prepareVoucherForAnalysis(file: File) {
  if (!file.type.startsWith('image/')) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No se pudo leer la imagen para prepararla para el análisis.')
  }

  try {
    const scale = Math.min(768 / bitmap.width, 1536 / bitmap.height, 1)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo preparar la imagen para el análisis.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const compressed = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen para el análisis.')),
        'image/jpeg',
        0.82,
      )
    })
    const fileName = file.name.replace(/\.[^.]+$/, '') || file.name
    return new File([compressed], `${fileName}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified })
  } finally {
    bitmap.close()
  }
}

export function analyzeVoucher(file: File) {
  const formData = new FormData()
  return prepareVoucherForAnalysis(file).then((preparedFile) => {
    formData.append('file', preparedFile)
    return request<VoucherAnalysis>('/api/v1/voucher/analyzer', {
      method: 'POST',
      body: formData,
    })
  })
}

export function createObjective(payload: {
  name: string
  description: string
  targetAmount: number
  targetDate: string
}) {
  return request<FinancialObjective>('/api/v1/objectives', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateObjectiveStatus(id: string, objectiveState: FinancialObjective['status']) {
  return request<void>(`/api/v1/objectives/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ objectiveState }),
  })
}

export function contributeToObjective(id: string, payload: {
  accountId: string
  categoryId: string
  amount: number
  description: string
}) {
  return request<void>(`/api/v1/objectives/${encodeURIComponent(id)}/contribution`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getObjectiveContributions(id: string) {
  return getAllPages<Contribution>(`/api/v1/objectives/contributions/objective/${encodeURIComponent(id)}`, 'date')
}

export function getObjectiveContribution(id: string) {
  return request<Contribution>(`/api/v1/objectives/contributions/${encodeURIComponent(id)}`)
}

export function getAccounts() {
  return request<Account[]>('/api/v1/accounts/my-accounts')
}

export function getAccount(id: string) {
  return request<Account>(`/api/v1/accounts/my-account/${encodeURIComponent(id)}`)
}

export function createAccount(payload: {
  name: string
  type: Account['type']
  initialBalance: number
}) {
  return request<Account>('/api/v1/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function changeAccountStatus(id: string) {
  return request<void>(`/api/v1/accounts/my-account/${encodeURIComponent(id)}/changeStatus`, { method: 'PUT' })
}

export function createTransfer(payload: {
  idSource: string
  idTarget: string
  amount: number
  description: string
}) {
  return request<void>('/api/v1/accounts/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTransfers() {
  return getAllPages<Transfer>('/api/v1/transfers/my-transfers', 'fecha_creacion')
}

export function getTransfersByAccount(accountId: string) {
  return getAllPages<Transfer>(
    `/api/v1/transfers/my-transfers/account/${encodeURIComponent(accountId)}`,
    'fecha_creacion',
  )
}

export function getTransfer(id: string) {
  return request<Transfer>(`/api/v1/transfers/my-transfers/${encodeURIComponent(id)}`)
}

export function updateTransfer(id: string, payload: { newAmount: number; newDescription: string }) {
  return request<void>(`/api/v1/transfers/my-transfers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTransfer(id: string) {
  return request<void>(`/api/v1/transfers/my-transfers/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function getGlobalCategories() {
  return request<FinancialCategory[]>('/api/v1/categories/global')
}

export function getUserCategories() {
  return request<FinancialCategory[]>('/api/v1/categories/of-user')
}

export function createUserCategory(payload: {
  name: string
  type: FinancialCategory['type']
  parentCategoryId: string
  active: true
}) {
  return request<FinancialCategory>('/api/v1/categories/of-user', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCategory(id: string) {
  return request<FinancialCategory & { parentCategoryId: string }>(
    `/api/v1/categories/category/${encodeURIComponent(id)}`,
  )
}

export function updateUserCategory(id: string, payload: {
  name: string
  type: FinancialCategory['type']
  parentCategoryId: string
  active: true
}) {
  return request<FinancialCategory>(`/api/v1/categories/of-user/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteUserCategory(id: string) {
  return request<void>(`/api/v1/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function getBudgets() {
  return request<Budget[]>('/api/v1/budgets')
}

export function getBudget(id: string) {
  return request<Budget>(`/api/v1/budgets/${encodeURIComponent(id)}`)
}

export function createBudget(payload: {
  name: string
  periodStart: string
  periodEnd: string
  amountLimitTotal: number
  categories: Array<{ categoryId: string; amountLimit: number }>
}) {
  return request<Budget>('/api/v1/budgets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateBudget(id: string, payload: {
  name: string
  periodStart: string
  periodEnd: string
  amountLimitTotal: number
  categories: Array<{ categoryId: string; amountLimit: number }>
}) {
  return request<Budget>(`/api/v1/budgets/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function changeBudgetStatus(id: string, active: boolean) {
  return request<Budget>(`/api/v1/budgets/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  })
}

export function getBudgetConsumption(id: string) {
  return request<BudgetConsumption>(`/api/v1/budgets/${encodeURIComponent(id)}/consumption`)
}

export function getSubscriptions() {
  return request<Subscription[]>('/api/v1/subscriptions/my-subs')
}

export function getSubscription(id: string) {
  return request<Subscription>(`/api/v1/subscriptions/my-subs/${encodeURIComponent(id)}`)
}

export function createSubscription(payload: {
  payingAccountId: string
  categoryId: string
  name: string
  amount: number
  frequency: Subscription['frequency']
  type: Subscription['type']
  payDay: number
}) {
  return request<Subscription>('/api/v1/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function toggleSubscription(id: string) {
  return request<void>(`/api/v1/subscriptions/my-subs/${encodeURIComponent(id)}`, { method: 'PUT' })
}

export function changePassword(newPassword: string) {
  return request<void>('/api/v1/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  })
}

export function suspendUser() {
  return request<void>('/api/v1/users/me', { method: 'DELETE' })
}
