export function AsistenteView() {
  return (
    <>
      <header className="chat-header">
        <h2>Asistente FinancIA</h2>
        <p>Consulta tus finanzas con ayuda personalizada.</p>
      </header>
      <section className="chat-box" aria-label="Asistente financiero no disponible">
        <div className="empty-state" role="status">
          El backend actual todavía no expone un servicio de asistente financiero. Esta función estará disponible cuando exista su endpoint.
        </div>
      </section>
    </>
  )
}
