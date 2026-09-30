import { CalendarDays, ChevronRight, Laptop, LifeBuoy, Plane, Target, type LucideIcon } from 'lucide-react'
import { goals } from '../data'

type MetasViewProps = {
  onOpenDetails: (title: string, content: string) => void
  onNotify: (message: string) => void
}

const goalIcons: Record<string, LucideIcon> = {
  'Viaje a Cusco': Plane,
  Emergencia: LifeBuoy,
  'Laptop nueva': Laptop,
}

export function MetasView({ onOpenDetails, onNotify }: MetasViewProps) {
  return (
    <>
      <header className="page-header">
        <h2>Metas</h2>
        <p>Organiza tus objetivos financieros y sigue tu progreso mes a mes.</p>
      </header>

      <section className="meta-summary" aria-label="Resumen de metas">
        <div className="summary-box highlight">
          <span>Total ahorrado</span>
          <strong>S/ 5,200</strong>
          <small>+ S/ 480 este mes</small>
        </div>
        <div className="summary-box">
          <span>Metas activas</span>
          <strong>3</strong>
          <small>Objetivos en curso</small>
        </div>
        <div className="summary-box">
          <span>Progreso global</span>
          <strong>53%</strong>
          <small>De todas tus metas</small>
        </div>
      </section>

      <section className="meta-grid">
        {goals.map((goal) => {
          const Icon = goalIcons[goal.title] ?? Target
          return (
            <article key={goal.title} className="meta-card">
              <div className="meta-head">
                <div className={`meta-badge ${goal.color}`} aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <h3>{goal.title}</h3>
                  <span><CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" />{goal.deadline}</span>
                </div>
              </div>

              <div className="meta-values">
                <strong>{goal.saved}</strong>
                <span>de {goal.amount}</span>
              </div>

              <div
                className="meta-progress"
                role="progressbar"
                aria-valuenow={goal.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso de ${goal.title}`}
              >
                <span style={{ width: `${goal.progress}%` }} />
              </div>

              <div className="meta-footer">
                <small>{goal.progress}% completado</small>
                <button type="button" onClick={() => onOpenDetails(
                  goal.title,
                  `Has alcanzado ${goal.progress}% de tu objetivo. Continúa con aportes mensuales para completar esta meta antes del ${goal.deadline}.`,
                )}>
                  Ver detalle
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <section className="quick-plan">
        <div>
          <h3>Plan recomendado</h3>
          <p>Asigna S/ 300 mensuales a tu meta de viaje para lograrla 2 meses antes de la fecha prevista.</p>
        </div>
        <button type="button" onClick={() => onNotify('Puedes ajustar tu aporte mensual cuando conectemos tus cuentas reales.')}>Ajustar aporte</button>
      </section>
    </>
  )
}
