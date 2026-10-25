import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  PiggyBank,
  SearchX,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { getMovements, type Movement } from '../api'
import { formatCurrency, formatDate } from '../format'

const categoryIcons: Record<string, LucideIcon> = {
  comida: Utensils,
  transporte: Bus,
  sueldo: Banknote,
}

type MovementKind = 'income' | 'expense' | 'savings'
type Filter = 'all' | MovementKind
type FilterOption = { value: string; label: string }

function movementKind(categoryType: string): MovementKind {
  const normalized = categoryType.toUpperCase()
  if (normalized.includes('INGRES')) return 'income'
  if (normalized.includes('AHORRO')) return 'savings'
  return 'expense'
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function recentMonths(): FilterOption[] {
  return Array.from({ length: 6 }, (_, offset) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - offset)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(date),
    }
  })
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudieron cargar los movimientos.'
}

export function MovimientosView() {
  const [filter, setFilter] = useState<Filter>('all')
  const [account, setAccount] = useState('all')
  const [month, setMonth] = useState(currentMonthKey)
  const [openMenu, setOpenMenu] = useState<'month' | 'account' | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    getMovements()
      .then((response) => {
        if (!cancelled) setMovements(response.content)
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

  const months = recentMonths()
  const accounts = [...new Map(movements.map((movement) => [movement.account.id, movement.account.name] as const)).entries()]
  const accountOptions: FilterOption[] = [
    { value: 'all', label: 'Todas las cuentas' },
    ...accounts.map(([id, name]) => ({ value: id, label: name })),
  ]

  const filteredMovements = movements.filter((movement) => {
    const kind = movementKind(movement.category.type)
    const matchesType = filter === 'all' || kind === filter
    const matchesAccount = account === 'all' || movement.account.id === account
    return matchesType && matchesAccount && movement.dateIssue.slice(0, 7) === month
  })

  const selectedMonth = months.find((option) => option.value === month)?.label ?? month
  const selectedAccount = accountOptions.find((option) => option.value === account)?.label ?? 'Todas las cuentas'
  const retry = () => {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }

  return (
    <>
      <header className="page-header">
        <h2>Mis movimientos</h2>
        <p>Revisa tus ingresos, gastos y ahorros registrados.</p>
      </header>

      <section className="filters-bar">
        <div className="filter-row">
          <button type="button" className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>Todo</button>
          <button type="button" className={`filter-chip ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')} aria-pressed={filter === 'income'}><ArrowDownLeft size={16} strokeWidth={2} aria-hidden="true" />Ingresos</button>
          <button type="button" className={`filter-chip ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')} aria-pressed={filter === 'expense'}><ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />Gastos</button>
          <button type="button" className={`filter-chip ${filter === 'savings' ? 'active' : ''}`} onClick={() => setFilter('savings')} aria-pressed={filter === 'savings'}><PiggyBank size={16} strokeWidth={2} aria-hidden="true" />Ahorros</button>
        </div>

        <div className="select-row">
          <FilterMenu
            label="Periodo"
            value={month}
            displayValue={selectedMonth}
            isOpen={openMenu === 'month'}
            options={months}
            onToggle={() => setOpenMenu(openMenu === 'month' ? null : 'month')}
            onSelect={(value) => {
              setMonth(value)
              setOpenMenu(null)
            }}
          />
          <FilterMenu
            label="Cuenta"
            value={account}
            displayValue={selectedAccount}
            isOpen={openMenu === 'account'}
            options={accountOptions}
            account
            onToggle={() => setOpenMenu(openMenu === 'account' ? null : 'account')}
            onSelect={(value) => {
              setAccount(value)
              setOpenMenu(null)
            }}
          />
        </div>
      </section>

      <section className="transactions-block" aria-label="Movimientos registrados" aria-live="polite">
        {loading && <div className="empty-state" role="status">Cargando movimientos…</div>}
        {error && (
          <div className="auth-feedback error" role="alert">
            <span>{error}</span>
            <button className="secondary-button" type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        )}
        {!loading && !error && filteredMovements.map((movement) => {
          const kind = movementKind(movement.category.type)
          const Icon = categoryIcons[movement.category.name.toLowerCase()] ?? (
            kind === 'income' ? ArrowDownLeft : kind === 'savings' ? PiggyBank : ArrowUpRight
          )
          const sign = kind === 'income' ? '+ ' : kind === 'expense' ? '− ' : ''

          return (
            <article key={movement.movementId} className="transaction-row">
              <div className="transaction-main">
                <div className={`transaction-icon ${kind}`} aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <strong>{movement.category.name}</strong>
                  <small>
                    {movement.description || movement.account.name}
                    {' · '}{movement.account.name}
                    {' · '}{formatDate(movement.dateIssue)}
                  </small>
                </div>
              </div>
              <div className={`amount ${kind}`}>{sign}{formatCurrency(Math.abs(movement.amount))}</div>
            </article>
          )
        })}
        {!loading && !error && filteredMovements.length === 0 && (
          <div className="empty-state"><SearchX size={18} strokeWidth={1.75} aria-hidden="true" />No hay movimientos para este periodo y filtro.</div>
        )}
      </section>
    </>
  )
}

type FilterMenuProps = {
  label: string
  value: string
  displayValue: string
  options: readonly FilterOption[]
  isOpen: boolean
  account?: boolean
  onToggle: () => void
  onSelect: (value: string) => void
}

function FilterMenu({ label, value, displayValue, options, isOpen, onToggle, onSelect, account = false }: FilterMenuProps) {
  const Icon = account ? Wallet : CalendarDays
  return (
    <div className={`select-control ${account ? 'account-control' : ''}`}>
      <span className="select-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <span className="select-label">{label}</span>
      <button className="select-trigger" type="button" onClick={onToggle} aria-expanded={isOpen} aria-label={`${label}: ${displayValue}`}>
        {displayValue}
      </button>
      <span className="select-chevron" aria-hidden="true"><ChevronDown size={16} strokeWidth={2} /></span>
      {isOpen && (
        <div className="select-menu">
          {options.map((option) => (
            <button key={option.value} type="button" className={value === option.value ? 'selected' : ''} onClick={() => onSelect(option.value)}>
              {option.label}
              {value === option.value && <Check size={16} strokeWidth={2} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
