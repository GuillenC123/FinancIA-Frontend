import { ArrowDownLeft, ArrowUpRight, PiggyBank, type LucideIcon } from 'lucide-react'
import { summaryCards } from '../data'

type DashboardViewProps = {
  onOpenDetails: (title: string, content: string) => void
}

const summaryIcons: Record<string, LucideIcon> = {
  primary: ArrowDownLeft,
  danger: ArrowUpRight,
  success: PiggyBank,
}

export function DashboardView({ onOpenDetails }: DashboardViewProps) {
  return (
    <>
      <header className="welcome-block">
        <h2>¡Hola!</h2>
        <p>Aquí tienes el resumen de tu mes.</p>
      </header>

      <section className="summary-grid" aria-label="Resumen del mes">
        {summaryCards.map((card) => {
          const Icon = summaryIcons[card.tone] ?? PiggyBank
          return (
            <article key={card.label} className={`summary-card ${card.tone}`}>
              <div className="summary-top">
                <div className="summary-icon" aria-hidden="true"><Icon size={16} strokeWidth={2} /></div>
                <span>{card.label}</span>
              </div>
              <strong>{card.value}</strong>
            </article>
          )
        })}
      </section>

      <section className="analytics-grid">
        <div className="panel-card donut-panel">
          <h3>Gastos por categoría</h3>
          <div className="donut-chart" role="img" aria-label="Gastos por categoría: Hogar 40%, Comida 35%, Otros 25%">
            <div className="donut-inner">
              <span>Total</span>
              <strong>S/ 3,100</strong>
            </div>
          </div>
          <div className="legend">
            <span><i className="dot blue" />Hogar</span>
            <span><i className="dot amber" />Comida</span>
            <span><i className="dot gray" />Otros</span>
          </div>
        </div>

        <div className="panel-card chart-panel">
          <h3>Tendencia mensual</h3>
          <div className="bars">
            {['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((month, index) => (
              <div key={month} className="bar-group">
                <div className="bar" style={{ height: `${35 + index * 15}%` }} />
                <span>{month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="insight-card">
        <div className="spark-icon" aria-hidden="true">F</div>
        <div>
          <h4>Análisis de FinancIA</h4>
          <p>
            Buen trabajo este mes: estás gastando un 15% menos en <strong>Comida</strong>{' '}
            que el mes pasado. Si mantienes este ritmo, alcanzarás tu meta de ahorro para tu viaje a Cusco.
          </p>
        </div>
        <button type="button" onClick={() => onOpenDetails(
          'Análisis de tus gastos',
          'Tu categoría Comida bajó 15% frente al mes anterior. Si mantienes este ritmo, puedes reservar S/ 300 adicionales para tu meta de Viaje a Cusco.',
        )}>
          Ver detalles
        </button>
      </section>
    </>
  )
}
