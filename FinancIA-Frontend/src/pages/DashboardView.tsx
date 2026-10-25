import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, type LucideIcon } from 'lucide-react'
import { getDashboardSummary, type DashboardSummary } from '../api'
import { formatCurrency } from '../format'

type DashboardViewProps = {
  userName?: string
  onOpenDetails: (title: string, content: string) => void
}

const summaryIcons: Record<string, LucideIcon> = {
  primary: ArrowDownLeft,
  danger: ArrowUpRight,
  success: PiggyBank,
}

function getMonthStart() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  return `${today.getFullYear()}-${month}-01`
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo cargar el resumen financiero.'
}

export function DashboardView({ userName, onOpenDetails }: DashboardViewProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    getDashboardSummary(getMonthStart())
      .then((data) => {
        if (!cancelled) setSummary(data)
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

  const financialSummary = summary?.detailedFinancialSummary
  const retry = () => {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }
  const cards = financialSummary
    ? [
        { label: 'Saldo total', value: financialSummary.totalBalance, tone: 'primary' },
        { label: 'Ingresos del mes', value: financialSummary.income, tone: 'success' },
        { label: 'Gastos del mes', value: financialSummary.costs, tone: 'danger' },
      ]
    : []
  const rawExpenseVariation = summary?.comparisonPreviousPeriod.variationExpensesPercentage
  const expenseVariation = typeof rawExpenseVariation === 'number' && Number.isFinite(rawExpenseVariation)
    ? rawExpenseVariation
    : null
  const budgetConsumed = summary && Number.isFinite(summary.budget.percentageConsumed)
    ? summary.budget.percentageConsumed
    : 0
  const goalsProgress = summary && Number.isFinite(summary.goals.totalProgressPercentage)
    ? summary.goals.totalProgressPercentage
    : 0
  const expenseMessage = expenseVariation === null
    ? 'Aún no hay suficientes datos para comparar tus gastos con el periodo anterior.'
    : expenseVariation < 0
      ? `Tus gastos bajaron ${Math.abs(expenseVariation).toFixed(1)}% frente al periodo anterior.`
      : `Tus gastos subieron ${expenseVariation.toFixed(1)}% frente al periodo anterior.`

  return (
    <>
      <header className="welcome-block">
        <h2>¡Hola{userName ? `, ${userName}` : ''}!</h2>
        <p>Aquí tienes el resumen de tu mes.</p>
      </header>

      {loading && <div className="empty-state" role="status">Cargando tu resumen financiero…</div>}
      {error && (
        <div className="auth-feedback error" role="alert">
          <span>{error}</span>
          <button className="secondary-button" type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      )}

      {summary && financialSummary && (
        <>
          <section className="summary-grid" aria-label="Resumen del mes">
            {cards.map((card) => {
              const Icon = summaryIcons[card.tone]
              return (
                <article key={card.label} className={`summary-card ${card.tone}`}>
                  <div className="summary-top">
                    <div className="summary-icon" aria-hidden="true"><Icon size={16} strokeWidth={2} /></div>
                    <span>{card.label}</span>
                  </div>
                  <strong>{formatCurrency(card.value, financialSummary.currency)}</strong>
                </article>
              )
            })}
          </section>

          <section className="analytics-grid" aria-label="Presupuesto y metas">
            <div className="panel-card chart-panel">
              <h3>Presupuesto del mes</h3>
              <p>Gastado: {formatCurrency(summary.budget.amountSpent, financialSummary.currency)}</p>
              <div
                className="meta-progress"
                role="progressbar"
                aria-valuenow={Math.min(budgetConsumed, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Consumo del presupuesto mensual"
              >
                <span style={{ width: `${Math.min(Math.max(budgetConsumed, 0), 100)}%` }} />
              </div>
              <p>
                Disponible: {formatCurrency(summary.budget.availableAmount, financialSummary.currency)}
                {' '}de {formatCurrency(summary.budget.totalAmount, financialSummary.currency)}
              </p>
            </div>

            <div className="panel-card chart-panel">
              <h3>Metas de ahorro</h3>
              <p>{summary.goals.active} activas · {summary.goals.completed} completadas</p>
              <div
                className="meta-progress"
                role="progressbar"
                aria-valuenow={Math.min(goalsProgress, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progreso total de las metas"
              >
                <span style={{ width: `${Math.min(Math.max(goalsProgress, 0), 100)}%` }} />
              </div>
              <p>Progreso general: {goalsProgress.toFixed(1)}%</p>
            </div>
          </section>

          <section className="insight-card">
            <div className="spark-icon" aria-hidden="true">F</div>
            <div>
              <h4>Comparación de gastos</h4>
              <p>{expenseMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenDetails('Comparación de gastos', expenseMessage)}
            >
              Ver detalles
            </button>
          </section>
        </>
      )}
    </>
  )
}
