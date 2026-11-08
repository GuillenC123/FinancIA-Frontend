export function formatCurrency(amount: number, currency = 'PEN') {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)

  if (Number.isNaN(date.getTime())) return '—'
  if (dateOnly && (
    date.getFullYear() !== Number(dateOnly[1])
    || date.getMonth() !== Number(dateOnly[2]) - 1
    || date.getDate() !== Number(dateOnly[3])
  )) return '—'

  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
