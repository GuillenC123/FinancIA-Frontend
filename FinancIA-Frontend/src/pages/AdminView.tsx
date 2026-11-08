import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FolderKanban,
  RefreshCw,
  Search,
  ShieldCheck,
  Tags,
  Users,
} from 'lucide-react'
import {
  createAdminCategory,
  getAdminAudit,
  getAdminCategories,
  getAdminDashboard,
  getAdminUser,
  getAdminUsers,
  renameAdminCategory,
  updateAdminCategoryStatus,
  updateAdminUserStatus,
  type AdminAuditAction,
  type AdminAuditEntry,
  type AdminCategory,
  type AdminDashboard,
  type AdminPage,
  type AdminUser,
  type AdminUserStatus,
} from '../api'
import type { ViewId } from '../types'

const PAGE_SIZE = 20
const userStatuses: AdminUserStatus[] = ['ACTIVO', 'SUSPENDIDO', 'INACTIVO', 'ELIMINADO']
const categoryTypes: AdminCategory['type'][] = ['INGRESOS', 'GASTOS', 'AHORRO']
const auditActions: AdminAuditAction[] = [
  'CATEGORY_CREATED',
  'CATEGORY_RENAMED',
  'CATEGORY_STATUS_CHANGED',
  'USER_STATUS_CHANGED',
]

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initialPeriod() {
  const today = new Date()
  return { from: localDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: localDate(today) }
}

function currentDateInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = new Map(parts.map(({ type, value }) => [type, value]))
  return `${values.get('year')}-${values.get('month')}-${values.get('day')}`
}

function periodError(from: string, to: string, timeZone: string) {
  if (!from || !to) return 'Selecciona ambas fechas para consultar el periodo.'
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  const todayValue = timeZone ? currentDateInTimeZone(timeZone) : localDate(new Date())
  const today = Date.parse(`${todayValue}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Ingresa fechas válidas.'
  if (start > end) return 'La fecha inicial no puede ser posterior a la fecha final.'
  if (end > today) return 'El periodo no puede incluir fechas futuras.'
  if ((end - start) / 86_400_000 + 1 > 366) return 'El periodo no puede superar 366 días.'
  return ''
}

function dateLabel(value: string) {
  if (!value) return '—'
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('es-PE')
}

function timestampLabel(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('es-PE')
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intenta nuevamente.'
}

function statusLabel(status: AdminUserStatus) {
  return {
    ACTIVO: 'Activo',
    SUSPENDIDO: 'Suspendido',
    INACTIVO: 'Inactivo',
    ELIMINADO: 'Eliminado',
  }[status]
}

function actionLabel(action: AdminAuditAction) {
  return {
    CATEGORY_CREATED: 'Categoría creada',
    CATEGORY_RENAMED: 'Categoría renombrada',
    CATEGORY_STATUS_CHANGED: 'Estado de categoría cambiado',
    USER_STATUS_CHANGED: 'Estado de usuario cambiado',
  }[action]
}

function buildRegistrationSeries(data: AdminDashboard) {
  const counts = new Map(data.registrations.map((item) => [item.date, item.count]))
  const series: Array<{ date: string; count: number }> = []
  const cursor = new Date(`${data.period.from}T00:00:00Z`)
  const end = new Date(`${data.period.to}T00:00:00Z`)
  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10)
    series.push({ date, count: counts.get(date) ?? 0 })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return series
}

function AdminHeader({ title, description, children }: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <header className="admin-page-header">
      <div>
        <span className="admin-eyebrow"><ShieldCheck size={15} aria-hidden="true" /> Administración</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </header>
  )
}

function AdminError({ children }: { children: string }) {
  return <div className="admin-error" role="alert"><CircleAlert size={18} aria-hidden="true" />{children}</div>
}

function EmptyState({ children }: { children: string }) {
  return <p className="admin-empty">{children}</p>
}

export function AdminView({ activeView }: { activeView: ViewId }) {
  if (activeView === 'admin-users') return <UsersSection />
  if (activeView === 'admin-categories') return <CategoriesSection />
  if (activeView === 'admin-audit') return <AuditSection />
  return <DashboardSection />
}

function DashboardSection() {
  const [period, setPeriod] = useState(initialPeriod)
  const [appliedPeriod, setAppliedPeriod] = useState<{ from: string; to: string } | null>(null)
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [timeZone, setTimeZone] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const validationError = periodError(period.from, period.to, timeZone)

  useEffect(() => {
    let cancelled = false
    getAdminDashboard(appliedPeriod?.from, appliedPeriod?.to)
      .then((result) => {
        if (!cancelled) {
          setDashboard(result)
          setPeriod(result.period)
          setTimeZone(result.timeZone)
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorText(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [appliedPeriod])

  const series = useMemo(() => dashboard ? buildRegistrationSeries(dashboard) : [], [dashboard])
  const maxRegistrations = Math.max(1, ...series.map((item) => item.count))

  const submitPeriod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validationError) {
      setLoading(true)
      setError('')
      setDashboard(null)
      setAppliedPeriod({ ...period })
    }
  }

  return (
    <section className="admin-view">
      <AdminHeader
        title="Resumen administrativo"
        description="Indicadores agregados del sistema. Este panel no expone movimientos ni saldos personales."
      >
        <form className="admin-period-form" onSubmit={submitPeriod}>
          <label>
            <span>Desde</span>
            <input type="date" value={period.from} max={timeZone ? currentDateInTimeZone(timeZone) : localDate(new Date())} onChange={(event) => setPeriod({ ...period, from: event.target.value })} />
          </label>
          <label>
            <span>Hasta</span>
            <input type="date" value={period.to} max={timeZone ? currentDateInTimeZone(timeZone) : localDate(new Date())} onChange={(event) => setPeriod({ ...period, to: event.target.value })} />
          </label>
          <button className="primary-button admin-submit" type="submit" disabled={Boolean(validationError) || loading}>
            <RefreshCw size={16} aria-hidden="true" /> Actualizar
          </button>
        </form>
      </AdminHeader>

      {validationError && <AdminError>{validationError}</AdminError>}
      {error && <AdminError>{error}</AdminError>}
      {loading && <p className="admin-loading" role="status">Cargando indicadores…</p>}
      {dashboard && (
        <>
          <div className="admin-period-caption">
            <CalendarDays size={16} aria-hidden="true" />
            <span>{dateLabel(dashboard.period.from)} – {dateLabel(dashboard.period.to)}</span>
            <span>Zona horaria: {dashboard.timeZone}</span>
          </div>
          <div className="admin-metric-grid">
            <MetricCard icon={<Users size={18} />} label="Usuarios registrados" value={dashboard.overview.users.total} detail={`${dashboard.overview.users.registeredInPeriod} en el periodo`} />
            <MetricCard icon={<Activity size={18} />} label="Usuarios activos" value={dashboard.overview.users.active} detail={`${dashboard.overview.users.suspended} suspendidos`} />
            <MetricCard icon={<CircleAlert size={18} />} label="Usuarios suspendidos" value={dashboard.overview.users.suspended} detail="Cuentas con acceso suspendido" />
            <MetricCard icon={<Users size={18} />} label="Inactivos y eliminados" value={dashboard.overview.users.inactive + dashboard.overview.users.deleted} detail={`${dashboard.overview.users.inactive} inactivos · ${dashboard.overview.users.deleted} eliminados`} />
            <MetricCard icon={<ShieldCheck size={18} />} label="Administradores" value={dashboard.overview.users.administrators} detail="Cuentas con rol administrativo" />
            <MetricCard icon={<Tags size={18} />} label="Categorías globales" value={dashboard.overview.categories.total} detail={`${dashboard.overview.categories.active} activas · ${dashboard.overview.categories.inactive} inactivas`} />
            <MetricCard icon={<FolderKanban size={18} />} label="Presupuestos" value={dashboard.overview.budgets.total} detail={`${dashboard.overview.budgets.active} activos · ${dashboard.overview.budgets.inactive} inactivos · ${dashboard.overview.budgets.createdInPeriod} nuevos`} />
            <MetricCard icon={<Check size={18} />} label="Metas financieras" value={dashboard.overview.goals.total} detail={`${dashboard.overview.goals.completed} completadas · ${dashboard.overview.goals.startedInPeriod} iniciadas`} />
            <MetricCard icon={<ClipboardList size={18} />} label="Análisis OCR" value={dashboard.overview.ocr.total} detail={`${dashboard.overview.ocr.successful} exitosos · ${dashboard.overview.ocr.failed} fallidos`} />
          </div>

          <section className="panel-card admin-chart-card" aria-labelledby="admin-registrations-title">
            <div className="admin-card-heading">
              <div>
                <h3 id="admin-registrations-title">Registros de usuarios</h3>
                <p>Altas de cuentas de usuario por día durante el periodo seleccionado.</p>
              </div>
              <strong>{dashboard.overview.users.registeredInPeriod}</strong>
            </div>
            {series.length === 0 ? <EmptyState>No hay datos de registros para este periodo.</EmptyState> : (
              <div className="admin-chart-scroll" role="img" aria-label="Gráfico de registros diarios de usuarios">
                <div className="admin-chart-bars">
                  {series.map((item, index) => (
                    <div className="admin-chart-column" key={item.date} title={`${dateLabel(item.date)}: ${item.count}`}>
                      <span className="admin-chart-value">{item.count || ''}</span>
                      <span className="admin-chart-bar" style={{ height: `${Math.max(3, (item.count / maxRegistrations) * 100)}%` }} />
                      {(index === 0 || index === series.length - 1 || index % Math.ceil(series.length / 8) === 0) && (
                        <small>{dateLabel(item.date)}</small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          <p className="admin-generated">Información generada: {timestampLabel(dashboard.generatedAt)}.</p>
        </>
      )}
    </section>
  )
}

function MetricCard({ icon, label, value, detail }: {
  icon: ReactNode
  label: string
  value: number
  detail: string
}) {
  return (
    <article className="admin-metric-card">
      <span className="admin-metric-icon" aria-hidden="true">{icon}</span>
      <div>
        <span className="admin-metric-label">{label}</span>
        <strong>{value.toLocaleString('es-PE')}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function UsersSection() {
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AdminUserStatus | ''>('')
  const [page, setPage] = useState(0)
  const [users, setUsers] = useState<AdminPage<AdminUser> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userLoading, setUserLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [changingStatus, setChangingStatus] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    getAdminUsers({ search, status, page, size: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) setUsers(result)
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorText(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [search, status, page, refreshKey])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setPage(0)
    setSearch(draftSearch.trim())
  }

  const changeFilterStatus = (nextStatus: AdminUserStatus | '') => {
    setLoading(true)
    setError('')
    setPage(0)
    setStatus(nextStatus)
  }

  const changePage = (nextPage: number) => {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  const openUser = (id: string) => {
    setSelectedUser(null)
    setReason('')
    setUserLoading(true)
    getAdminUser(id)
      .then(setSelectedUser)
      .catch((requestError: unknown) => setError(errorText(requestError)))
      .finally(() => setUserLoading(false))
  }

  const changeStatus = async (targetStatus: 'ACTIVO' | 'SUSPENDIDO') => {
    if (!selectedUser || reason.trim().length === 0 || reason.trim().length > 500) return
    setChangingStatus(true)
    setError('')
    try {
      const updated = await updateAdminUserStatus(selectedUser.id, targetStatus, reason.trim())
      setSelectedUser(updated)
      setReason('')
      setLoading(true)
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setChangingStatus(false)
    }
  }

  return (
    <section className="admin-view">
      <AdminHeader title="Gestión de usuarios" description="Busca cuentas, consulta su información y administra el estado de usuarios." />
      <section className="panel-card admin-section-card">
        <form className="admin-filter-form" onSubmit={submitSearch}>
          <label className="admin-search-field">
            <span>Buscar por nombre o correo</span>
            <span className="admin-input-with-icon"><Search size={17} aria-hidden="true" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Nombre o correo electrónico" /></span>
          </label>
          <label>
            <span>Estado</span>
            <select value={status} onChange={(event) => changeFilterStatus(event.target.value as AdminUserStatus | '')}>
              <option value="">Todos los estados</option>
              {userStatuses.map((value) => <option value={value} key={value}>{statusLabel(value)}</option>)}
            </select>
          </label>
          <button type="submit" className="secondary-button"><Search size={16} aria-hidden="true" /> Buscar</button>
        </form>
        {error && <AdminError>{error}</AdminError>}
        {loading && <p className="admin-loading" role="status">Cargando usuarios…</p>}
        {!loading && users?.content.length === 0 && <EmptyState>No se encontraron usuarios con esos criterios.</EmptyState>}
        {users && users.content.length > 0 && (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead><tr><th>Usuario</th><th>Correo</th><th>Estado</th><th>Registro</th><th aria-label="Acciones" /></tr></thead>
                <tbody>
                  {users.content.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.name} {item.lastName}</strong><small>{item.role === 'ADMIN' ? 'Administrador' : 'Usuario'}</small></td>
                      <td>{item.email}</td>
                      <td><span className={`admin-status status-${item.status.toLowerCase()}`}>{statusLabel(item.status)}</span></td>
                      <td>{dateLabel(item.creationDate)}</td>
                      <td><button className="secondary-button admin-small-button" type="button" onClick={() => openUser(item.id)}>Ver detalle</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={users.page} totalPages={users.totalPages} totalElements={users.totalElements} onChange={changePage} />
          </>
        )}
      </section>
      {userLoading && <p className="admin-loading" role="status">Cargando detalle del usuario…</p>}
      {selectedUser && (
        <section className="panel-card admin-section-card admin-user-detail">
          <div className="admin-card-heading">
            <div><h3>{selectedUser.name} {selectedUser.lastName}</h3><p>{selectedUser.email}</p></div>
            <span className={`admin-status status-${selectedUser.status.toLowerCase()}`}>{statusLabel(selectedUser.status)}</span>
          </div>
          <dl className="admin-user-fields">
            <div><dt>ID</dt><dd>{selectedUser.id}</dd></div>
            <div><dt>Rol</dt><dd>{selectedUser.role === 'ADMIN' ? 'Administrador' : 'Usuario'}</dd></div>
            <div><dt>Fecha de registro</dt><dd>{dateLabel(selectedUser.creationDate)}</dd></div>
            <div><dt>Última actualización</dt><dd>{dateLabel(selectedUser.updateDate ?? '')}</dd></div>
          </dl>
          {selectedUser.role === 'USER' && (selectedUser.status === 'ACTIVO' || selectedUser.status === 'SUSPENDIDO') && (
            <div className="admin-status-form">
              <label>
                <span>Motivo del cambio <small>(obligatorio, máximo 500 caracteres)</small></span>
                <textarea value={reason} maxLength={500} rows={3} onChange={(event) => setReason(event.target.value)} placeholder="Describe brevemente el motivo de la acción" />
              </label>
              <div className="admin-status-actions">
                <small>{reason.trim().length}/500</small>
                {selectedUser.status === 'ACTIVO' ? (
                  <button type="button" className="secondary-button admin-danger-button" disabled={!reason.trim() || changingStatus} onClick={() => void changeStatus('SUSPENDIDO')}>Suspender usuario</button>
                ) : (
                  <button type="button" className="primary-button admin-submit" disabled={!reason.trim() || changingStatus} onClick={() => void changeStatus('ACTIVO')}>Reactivar usuario</button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  )
}

function CategoriesSection() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<AdminCategory['type']>('GASTOS')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editingName, setEditingName] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadCategories = () => {
    setLoading(true)
    setError('')
    getAdminCategories()
      .then(setCategories)
      .catch((requestError: unknown) => setError(errorText(requestError)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    getAdminCategories()
      .then((result) => {
        if (!cancelled) setCategories(result)
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorText(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const createCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()
    if (!normalizedName || normalizedName.length > 255) return
    setCreating(true)
    setError('')
    try {
      await createAdminCategory({ name: normalizedName, type })
      setName('')
      loadCategories()
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setCreating(false)
    }
  }

  const saveRename = async (id: string) => {
    const normalizedName = editingName.trim()
    if (!normalizedName || normalizedName.length > 255) return
    setBusyId(id)
    setError('')
    try {
      await renameAdminCategory(id, normalizedName)
      setEditingId('')
      loadCategories()
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setBusyId('')
    }
  }

  const toggleCategory = async (category: AdminCategory) => {
    const nextActive = !category.active
    const confirmation = nextActive
      ? `¿Reactivar la categoría global "${category.name}"?`
      : `¿Desactivar la categoría global "${category.name}"? Los usuarios podrían dejar de verla para nuevos registros.`
    if (!window.confirm(confirmation)) return
    setBusyId(category.id)
    setError('')
    try {
      await updateAdminCategoryStatus(category.id, nextActive)
      loadCategories()
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setBusyId('')
    }
  }

  const sortedCategories = [...categories].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'es'))

  return (
    <section className="admin-view">
      <AdminHeader title="Categorías globales" description="Administra las categorías compartidas por las cuentas de usuario. Los cambios se registran en auditoría." />
      <section className="panel-card admin-section-card">
        <h3>Crear categoría</h3>
        <form className="admin-category-create" onSubmit={(event) => void createCategory(event)}>
          <label><span>Nombre</span><input value={name} maxLength={255} onChange={(event) => setName(event.target.value)} placeholder="Ej. Alimentación" required /></label>
          <label><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value as AdminCategory['type'])}>{categoryTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <button className="primary-button admin-submit" type="submit" disabled={!name.trim() || creating}>{creating ? 'Creando…' : 'Crear categoría'}</button>
        </form>
        {error && <AdminError>{error}</AdminError>}
      </section>
      <section className="panel-card admin-section-card">
        <div className="admin-card-heading"><div><h3>Catálogo global</h3><p>{categories.length} categorías</p></div><button className="secondary-button admin-small-button" type="button" onClick={loadCategories} disabled={loading}><RefreshCw size={15} aria-hidden="true" /> Actualizar</button></div>
        {loading && <p className="admin-loading" role="status">Cargando categorías…</p>}
        {!loading && sortedCategories.length === 0 && <EmptyState>Aún no hay categorías globales.</EmptyState>}
        <div className="admin-category-list">
          {sortedCategories.map((category) => (
            <article className="admin-category-row" key={category.id}>
              <div className="admin-category-main">
                {editingId === category.id ? (
                  <div className="admin-inline-edit">
                    <input aria-label="Nuevo nombre de categoría" value={editingName} maxLength={255} onChange={(event) => setEditingName(event.target.value)} />
                    <button className="secondary-button admin-small-button" type="button" disabled={!editingName.trim() || busyId === category.id} onClick={() => void saveRename(category.id)}>Guardar</button>
                    <button className="admin-text-button" type="button" onClick={() => setEditingId('')}>Cancelar</button>
                  </div>
                ) : (
                  <><strong>{category.name}</strong><small>{category.type} · {category.active ? 'Activa' : 'Inactiva'}</small></>
                )}
              </div>
              {editingId !== category.id && (
                <div className="admin-category-actions">
                  <button className="admin-text-button" type="button" disabled={busyId === category.id} onClick={() => { setEditingId(category.id); setEditingName(category.name) }}>Renombrar</button>
                  <button className={`secondary-button admin-small-button ${category.active ? 'admin-danger-button' : ''}`} type="button" disabled={busyId === category.id} onClick={() => void toggleCategory(category)}>{category.active ? 'Desactivar' : 'Activar'}</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function AuditSection() {
  const [actorDraft, setActorDraft] = useState('')
  const [actorId, setActorId] = useState('')
  const [action, setAction] = useState<AdminAuditAction | ''>('')
  const [page, setPage] = useState(0)
  const [entries, setEntries] = useState<AdminPage<AdminAuditEntry> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actorError, setActorError] = useState('')

  useEffect(() => {
    let cancelled = false
    getAdminAudit({ actorId, action, page, size: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) setEntries(result)
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorText(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [actorId, action, page])

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedActor = actorDraft.trim()
    if (normalizedActor && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedActor)) {
      setActorError('Ingresa un UUID válido o deja vacío el filtro de actor.')
      return
    }
    setActorError('')
    setLoading(true)
    setError('')
    setPage(0)
    setActorId(normalizedActor)
  }

  const changeAuditAction = (nextAction: AdminAuditAction | '') => {
    setLoading(true)
    setError('')
    setPage(0)
    setAction(nextAction)
  }

  const changeAuditPage = (nextPage: number) => {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  return (
    <section className="admin-view">
      <AdminHeader title="Auditoría administrativa" description="Consulta las acciones administrativas registradas por el backend." />
      <section className="panel-card admin-section-card">
        <form className="admin-filter-form admin-audit-filters" onSubmit={submitFilters}>
          <label className="admin-search-field"><span>ID del actor</span><input value={actorDraft} onChange={(event) => setActorDraft(event.target.value)} placeholder="UUID del administrador (opcional)" /></label>
          <label><span>Acción</span><select value={action} onChange={(event) => changeAuditAction(event.target.value as AdminAuditAction | '')}><option value="">Todas las acciones</option>{auditActions.map((value) => <option key={value} value={value}>{actionLabel(value)}</option>)}</select></label>
          <button type="submit" className="secondary-button"><Search size={16} aria-hidden="true" /> Aplicar filtros</button>
        </form>
        {actorError && <AdminError>{actorError}</AdminError>}
        {error && <AdminError>{error}</AdminError>}
        {loading && <p className="admin-loading" role="status">Cargando registros de auditoría…</p>}
        {!loading && entries?.content.length === 0 && <EmptyState>No hay acciones administrativas para los filtros seleccionados.</EmptyState>}
        {entries && entries.content.length > 0 && (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table admin-audit-table">
                <thead><tr><th>Fecha</th><th>Acción</th><th>Actor</th><th>Recurso</th><th>Detalle</th></tr></thead>
                <tbody>
                  {entries.content.map((entry) => (
                    <tr key={entry.id}>
                      <td>{timestampLabel(entry.occurredAt)}</td>
                      <td>{actionLabel(entry.action)}</td>
                      <td className="admin-uuid">{entry.actorId}</td>
                      <td className="admin-uuid">{entry.targetId}</td>
                      <td>{entry.detail || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={entries.page} totalPages={entries.totalPages} totalElements={entries.totalElements} onChange={changeAuditPage} />
          </>
        )}
      </section>
    </section>
  )
}

function Pagination({ page, totalPages, totalElements, onChange }: {
  page: number
  totalPages: number
  totalElements: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return <p className="admin-result-count">{totalElements.toLocaleString('es-PE')} resultados</p>
  return (
    <div className="admin-pagination">
      <span>{totalElements.toLocaleString('es-PE')} resultados · Página {page + 1} de {totalPages}</span>
      <div>
        <button type="button" className="secondary-button admin-small-button" aria-label="Página anterior" disabled={page <= 0} onClick={() => onChange(page - 1)}><ChevronLeft size={17} aria-hidden="true" /> Anterior</button>
        <button type="button" className="secondary-button admin-small-button" aria-label="Página siguiente" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Siguiente <ChevronRight size={17} aria-hidden="true" /></button>
      </div>
    </div>
  )
}
