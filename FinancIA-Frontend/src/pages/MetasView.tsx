import { useEffect, useState } from 'react'
import { CalendarDays, ChevronRight, Laptop, LifeBuoy, Plane, Target, type LucideIcon } from 'lucide-react'
import { getFinancialObjectives, type FinancialObjective } from '../api'
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

  useEffect(() => {
    let cancelled = false

    getFinancialObjectives()
      .then((response) => {
        if (!cancelled) setGoals(response.content)
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const activeGoals = goals.filter((goal) => !['COMPLETADA', 'CANCELADA', 'PAUSADA'].includes(goal.status))
  const retry = () => {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const colorClasses = ['purple', 'green', 'blue']

  return (
    <>
      <header className="page-header">
        <h2>Metas</h2>
        <p>Organiza tus objetivos financieros y sigue su progreso.</p>
      </header>

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
                      <button type="button" onClick={() => onOpenDetails(
                        goal.name,
                        `${goal.description || 'Sin descripción.'} Estado: ${statusLabels[goal.status]}. Llevas ${formatCurrency(goal.currentAmount)} de ${formatCurrency(goal.targetAmount)}. Fecha objetivo: ${formatDate(goal.targetDate)}.`,
                      )}>
                        Ver detalle
                        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
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
