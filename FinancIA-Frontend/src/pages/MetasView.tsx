import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronRight, Laptop, LifeBuoy, Plane, Plus, Target, type LucideIcon } from 'lucide-react'
import {
  contributeToObjective,
  createObjective,
  getAccounts,
  getFinancialObjective,
  getFinancialObjectives,
  getGlobalCategories,
  getObjectiveContribution,
  getObjectiveContributions,
  getUserCategories,
  updateObjectiveStatus,
  type Account,
  type Contribution,
  type FinancialCategory,
  type FinancialObjective,
} from '../api'
import { formatCurrency, formatDate } from '../format'

type MetasViewProps = {
  onOpenDetails: (title: string, content: string) => void
}

const goalIcons: Record<string, LucideIcon> = {
  'Viaje a Cusco': Plane,
  Emergencia: LifeBuoy,
  'Laptop nueva': Laptop,
}

const statusLabels: Record<FinancialObjective['status'], string> = {
  INICIADA: 'Iniciada',
  EN_PROCESO: 'En progreso',
  PAUSADA: 'Pausada',
  REANUDADA: 'Reanudada',
  COMPLETADA: 'Completada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudieron cargar tus metas.'
}

export function MetasView({ onOpenDetails }: MetasViewProps) {
  const [goals, setGoals] = useState<FinancialObjective[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [contributingTo, setContributingTo] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [contributions, setContributions] = useState<Record<string, Contribution[]>>({})
  const [loadingContributions, setLoadingContributions] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getFinancialObjectives()
      .then((response) => {
        if (!cancelled) {
          setGoals(response.content)
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    Promise.all([getAccounts(), getGlobalCategories(), getUserCategories()])
      .then(([accountData, globalCategories, userCategories]) => {
        if (!cancelled) {
          setAccounts(accountData.filter((account) => account.active))
          setCategories([...globalCategories, ...userCategories])
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setActionError(errorMessage(requestError))
      })

    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const activeGoals = goals.filter((goal) => !['COMPLETADA', 'FINALIZADA', 'CANCELADA', 'PAUSADA'].includes(goal.status))
  const retry = () => {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  const savingsCategories = categories.filter((category) => category.type === 'AHORRO')
  const availableStates = (status: FinancialObjective['status']): FinancialObjective['status'][] => {
    if (status === 'INICIADA') return ['EN_PROCESO']
    if (status === 'EN_PROCESO') return ['PAUSADA', 'COMPLETADA', 'FINALIZADA', 'CANCELADA']
    if (status === 'PAUSADA') return ['REANUDADA']
    if (status === 'REANUDADA') return ['EN_PROCESO']
    return []
  }

  const createGoal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true)
    setActionError('')
    try {
      await createObjective({
        name: String(values.get('name')),
        description: String(values.get('description')),
        targetAmount: Number(values.get('targetAmount')),
        targetDate: String(values.get('targetDate')),
      })
      form.reset()
      setShowCreateForm(false)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setActionError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (goal: FinancialObjective, status: FinancialObjective['status']) => {
    setActionError('')
    try {
      await updateObjectiveStatus(goal.id, status)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setActionError(errorMessage(requestError))
    }
  }

  const contribute = async (goal: FinancialObjective, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true)
    setActionError('')
    try {
      await contributeToObjective(goal.id, {
        accountId: String(values.get('accountId')),
        categoryId: String(values.get('categoryId')),
        amount: Number(values.get('amount')),
        description: String(values.get('description')),
      })
      form.reset()
      setContributingTo(null)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setActionError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const loadContributions = async (goalId: string) => {
    if (contributions[goalId]) {
      setContributions((current) => {
        const next = { ...current }
        delete next[goalId]
        return next
      })
      return
    }
    setLoadingContributions(goalId)
    setActionError('')
    try {
      const response = await getObjectiveContributions(goalId)
      setContributions((current) => ({ ...current, [goalId]: response.content }))
    } catch (requestError) {
      setActionError(errorMessage(requestError))
    } finally {
      setLoadingContributions(null)
    }
  }

  const showGoalDetails = async (goalId: string) => {
    setActionError('')
    try {
      const goal = await getFinancialObjective(goalId)
      onOpenDetails(
        goal.name,
        `${goal.description || 'Sin descripción.'} Estado: ${statusLabels[goal.status]}. Llevas ${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}. Fecha objetivo: ${formatDate(goal.targetDate)}.`,
      )
    } catch (requestError) {
      setActionError(errorMessage(requestError))
    }
  }

  const showContributionDetails = async (contributionId: string) => {
    setActionError('')
    try {
      const contribution = await getObjectiveContribution(contributionId)
      onOpenDetails(
        'Detalle del aporte',
        [
          `Meta: ${contribution.objective.name}`,
          `Monto: ${formatCurrency(contribution.amount)}`,
          `Fecha: ${formatDate(contribution.date)}`,
          `Descripción: ${contribution.description || 'Aporte a la meta'}`,
        ].join('\n'),
      )
    } catch (requestError) {
      setActionError(errorMessage(requestError))
    }
  }

  const colorClasses = ['purple', 'green', 'blue']

  return (
    <>
      <header className="page-header">
        <h2>Metas</h2>
        <p>Organiza tus objetivos financieros y sigue su progreso.</p>
        <button className="modal-primary" type="button" onClick={() => setShowCreateForm((show) => !show)}>
          <Plus size={16} aria-hidden="true" />{showCreateForm ? 'Cancelar' : 'Nueva meta'}
        </button>
      </header>

      {actionError && <div className="auth-feedback error" role="alert">{actionError}</div>}
      {showCreateForm && (
        <section className="panel-card management-panel">
          <h3>Crear meta financiera</h3>
          <form className="management-form" onSubmit={createGoal}>
            <label>Nombre<input name="name" minLength={1} required /></label>
            <label>Descripción<input name="description" /></label>
            <label>Monto objetivo<input name="targetAmount" type="number" min="0.01" step="0.01" required /></label>
            <label>Fecha objetivo<input name="targetDate" type="date" required /></label>
            <button className="modal-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Crear meta'}</button>
          </form>
        </section>
      )}

      {loading && <div className="empty-state" role="status">Cargando tus metas…</div>}
      {error && (
        <div className="auth-feedback error" role="alert">
          <span>{error}</span>
          <button className="secondary-button" type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="meta-summary" aria-label="Resumen de metas">
            <div className="summary-box highlight">
              <span>Total ahorrado</span>
              <strong>{formatCurrency(totalSaved)}</strong>
              <small>Acumulado en tus metas</small>
            </div>
            <div className="summary-box">
              <span>Metas activas</span>
              <strong>{activeGoals.length}</strong>
              <small>Objetivos en curso</small>
            </div>
            <div className="summary-box">
              <span>Progreso global</span>
              <strong>{overallProgress.toFixed(0)}%</strong>
              <small>Del monto objetivo total</small>
            </div>
          </section>

          {goals.length > 0 ? (
            <section className="meta-grid" aria-label="Metas financieras">
              {goals.map((goal, index) => {
                const Icon = goalIcons[goal.name] ?? Target
                const progress = Number.isFinite(goal.percentageProgress)
                  ? goal.percentageProgress
                  : goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
                const displayedProgress = Math.max(0, progress)
                const color = colorClasses[index % colorClasses.length]

                return (
                  <article key={goal.id} className="meta-card">
                    <div className="meta-head">
                      <div className={`meta-badge ${color}`} aria-hidden="true">
                        <Icon size={18} strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3>{goal.name}</h3>
                        <span><CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" />{formatDate(goal.targetDate)}</span>
                      </div>
                    </div>

                    <div className="meta-values">
                      <strong>{formatCurrency(goal.currentAmount)}</strong>
                      <span>de {formatCurrency(goal.targetAmount)}</span>
                    </div>

                    <div
                      className="meta-progress"
                      role="progressbar"
                      aria-valuenow={Math.min(displayedProgress, 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progreso de ${goal.name}`}
                    >
                      <span style={{ width: `${Math.min(displayedProgress, 100)}%` }} />
                    </div>

                    <div className="meta-footer">
                      <small>{displayedProgress.toFixed(0)}% · {statusLabels[goal.status]}</small>
                      <button type="button" onClick={() => void showGoalDetails(goal.id)}>
                        Ver detalle
                        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="goal-actions">
                      <button className="secondary-button" type="button" onClick={() => void loadContributions(goal.id)} disabled={loadingContributions === goal.id}>
                        {loadingContributions === goal.id ? 'Cargando aportes…' : contributions[goal.id] ? 'Ocultar aportes' : 'Ver aportes'}
                      </button>
                      {availableStates(goal.status).length > 0 && (
                        <label className="goal-state-control">
                          Cambiar estado
                          <select value="" onChange={(event) => {
                            const nextState = event.target.value as FinancialObjective['status']
                            if (nextState) void changeStatus(goal, nextState)
                          }}>
                            <option value="">Seleccionar</option>
                            {availableStates(goal.status).map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}
                          </select>
                        </label>
                      )}
                      {!['COMPLETADA', 'FINALIZADA', 'CANCELADA', 'PAUSADA'].includes(goal.status) && (
                        <button className="secondary-button" type="button" onClick={() => setContributingTo(contributingTo === goal.id ? null : goal.id)}>
                          {contributingTo === goal.id ? 'Cancelar aporte' : 'Registrar aporte'}
                        </button>
                      )}
                    </div>
                    {contributions[goal.id] && (
                      <div className="goal-contributions">
                        {contributions[goal.id].length === 0
                          ? <small>Aún no hay aportes registrados.</small>
                          : contributions[goal.id].map((contribution) => (
                            <div key={contribution.id}>
                              <span>{formatDate(contribution.date)} · {contribution.description || 'Aporte a la meta'}</span>
                              <strong>{formatCurrency(contribution.amount)}</strong>
                              <button className="secondary-button" type="button" onClick={() => void showContributionDetails(contribution.id)}>Detalle</button>
                            </div>
                          ))}
                      </div>
                    )}
                    {contributingTo === goal.id && (
                      <form className="management-form" onSubmit={(event) => void contribute(goal, event)}>
                        <label>Cuenta<select name="accountId" required>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
                        <label>Categoría de ahorro<select name="categoryId" required>{savingsCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                        <label>Monto<input name="amount" type="number" min="0.01" step="0.01" required /></label>
                        <label>Descripción<input name="description" /></label>
                        {savingsCategories.length === 0 && <small>Para aportar, agrega una categoría de tipo Ahorro en Gestión.</small>}
                        <button className="modal-primary" type="submit" disabled={busy || accounts.length === 0 || savingsCategories.length === 0}>Confirmar aporte</button>
                      </form>
                    )}
                  </article>
                )
              })}
            </section>
          ) : (
            <div className="empty-state"><Target size={18} strokeWidth={1.75} aria-hidden="true" />Aún no tienes metas financieras registradas.</div>
          )}
        </>
      )}
    </>
  )
}
