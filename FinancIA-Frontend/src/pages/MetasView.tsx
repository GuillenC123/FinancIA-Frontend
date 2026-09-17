import { goals } from '../data'

type MetasViewProps = {
  onOpenDetails: (title: string, content: string) => void
  onNotify: (message: string) => void
}

export function MetasView({ onOpenDetails, onNotify }: MetasViewProps) {
  return (
    <>
      <header className="page-header">
        <h2>Metas</h2>
        <p>Organiza tus objetivos financieros y sigue tu progreso mes a mes.</p>
      </header>

      <section className="meta-summary">
        <div className="summary-box highlight">
          <span>Total ahorrado</span>
          <strong>S/ 5,200</strong>
          <small>+ S/ 480 este mes</small>
        </div>
        <div className="summary-box">
          <span>Meta activa</span>
          <strong>3</strong>
          <small>Objetivos en curso</small>
        </div>
        <div className="summary-box">
          <span>Progreso global</span>
          <strong>53%</strong>
          <small>Meta combinada</small>
        </div>
      </section>

      <section className="meta-grid">
        {goals.map((goal) => (
          <article key={goal.title} className="meta-card">
            <div className="meta-head">
              <div className={`meta-badge ${goal.color}`} />
              <div>
                <h3>{goal.title}</h3>
                <span>{goal.deadline}</span>
              </div>
            </div>

            <div className="meta-values">
              <strong>{goal.saved}</strong>
              <span>de {goal.amount}</span>
            </div>

            <div className="meta-progress">
              <span style={{ width: `${goal.progress}%` }} />
            </div>

            <div className="meta-footer">
              <small>{goal.progress}% completado</small>
              <button type="button" onClick={() => onOpenDetails(
                goal.title,
                `Has alcanzado ${goal.progress}% de tu objetivo. Continúa con aportes mensuales para completar esta meta antes del ${goal.deadline}.`,
              )}>
                Ver detalle
              </button>
            </div>
          </article>
        ))}
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
