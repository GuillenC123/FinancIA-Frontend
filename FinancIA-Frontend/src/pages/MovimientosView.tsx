import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Bus,
  Camera,
  CalendarDays,
  Check,
  ChevronDown,
  FileUp,
  PiggyBank,
  Plus,
  SearchX,
  Trash2,
  Utensils,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  analyzeVoucher,
  createMovement,
  deleteMovement,
  getAccounts,
  getGlobalCategories,
  getMovement,
  getMovements,
  getUserCategories,
  uploadMovementReceipt,
  type Account,
  type FinancialCategory,
  type Movement,
  type VoucherAnalysis,
} from '../api'
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

export function MovimientosView({ onOpenDetails }: {
  onOpenDetails: (title: string, content: string) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [account, setAccount] = useState('all')
  const [month, setMonth] = useState(currentMonthKey)
  const [openMenu, setOpenMenu] = useState<'month' | 'account' | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [mutationError, setMutationError] = useState('')
  const [busyMovement, setBusyMovement] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [voucher, setVoucher] = useState<VoucherAnalysis | null>(null)
  const [analyzingVoucher, setAnalyzingVoucher] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [movementAmount, setMovementAmount] = useState('')
  const [movementDescription, setMovementDescription] = useState('')

  useEffect(() => {
    let cancelled = false

    getMovements()
      .then((response) => {
        if (!cancelled) {
          setMovements(response.content)
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
          const activeAccounts = accountData.filter((item) => item.active)
          setAvailableAccounts(activeAccounts)
          setSelectedAccountId(activeAccounts[0]?.id ?? '')
          setCategories([...globalCategories, ...userCategories])
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setMutationError(errorMessage(requestError))
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
  const selectedAccountLabel = accountOptions.find((option) => option.value === account)?.label ?? 'Todas las cuentas'
  const retry = () => {
    setLoading(true)
    setError('')
    setMutationError('')
    setReloadCount((count) => count + 1)
  }

  const createNewMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const category = categories.find((item) => item.id === selectedCategory)
    if (!category) {
      setMutationError('Selecciona una categoría válida.')
      return
    }
    setBusyMovement(true)
    setMutationError('')
    try {
      const createdMovement = await createMovement({
        accountId: String(values.get('accountId')),
        category: { categoryId: category.id, name: category.name, type: category.type },
        type: category.type === 'INGRESOS' ? 'INGRESO' : category.type === 'AHORRO' ? 'AHORRO' : 'EGRESO',
        amount: Number(movementAmount),
        description: movementDescription,
      })
      if (receiptFile) {
        try {
          await uploadMovementReceipt(createdMovement.id, receiptFile)
        } catch (uploadError) {
          setMutationError(`El movimiento se guardó, pero no se pudo adjuntar el comprobante: ${errorMessage(uploadError)}`)
          form.reset()
          setReceiptFile(null)
          setVoucher(null)
          setMovementAmount('')
          setMovementDescription('')
          setShowCreateForm(false)
          setReloadCount((count) => count + 1)
          return
        }
      }
      form.reset()
      setReceiptFile(null)
      setVoucher(null)
      setMovementAmount('')
      setMovementDescription('')
      setShowCreateForm(false)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setMutationError(errorMessage(requestError))
    } finally {
      setBusyMovement(false)
    }
  }

  const analyzeReceipt = async () => {
    if (!receiptFile) return
    setAnalyzingVoucher(true)
    setMutationError('')
    try {
      const analysis = await analyzeVoucher(receiptFile)
      setVoucher(analysis)
      if (typeof analysis.totalAmount === 'number') setMovementAmount(String(analysis.totalAmount))
      if (analysis.description || analysis.companyName) {
        setMovementDescription(analysis.description || analysis.companyName || '')
      }
      const suggestion = analysis.category?.find((item) => categories.some((category) => category.id === item.id))
      if (suggestion) setSelectedCategory(suggestion.id)
      const accountSuggestion = analysis.accounts?.find((item) => availableAccounts.some((account) => account.id === item.id))
      if (accountSuggestion) setSelectedAccountId(accountSuggestion.id)
    } catch (requestError) {
      setMutationError(errorMessage(requestError))
    } finally {
      setAnalyzingVoucher(false)
    }
  }

  const removeMovement = async (movement: Movement) => {
    if (!window.confirm(`¿Eliminar el movimiento «${movement.description || movement.category.name}»?`)) return
    setMutationError('')
    try {
      await deleteMovement(movement.movementId)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setMutationError(errorMessage(requestError))
    }
  }

  const uploadReceipt = async (movement: Movement, file: File) => {
    setMutationError('')
    try {
      await uploadMovementReceipt(movement.movementId, file)
      setReloadCount((count) => count + 1)
    } catch (requestError) {
      setMutationError(errorMessage(requestError))
    }
  }

  const showMovementDetails = async (movementId: string) => {
    setMutationError('')
    try {
      const movement = await getMovement(movementId)
      onOpenDetails(
        'Detalle del movimiento',
        [
          `Categoría: ${movement.category.name}`,
          `Tipo: ${movement.category.type}`,
          `Cuenta: ${movement.account.name}`,
          `Monto: ${formatCurrency(movement.amount)}`,
          `Fecha: ${formatDate(movement.dateIssue)}`,
          `Descripción: ${movement.description || 'Sin descripción.'}`,
          `Comprobante: ${movement.receiptUrl ? 'Adjunto' : 'Sin comprobante'}`,
        ].join('\n'),
      )
    } catch (requestError) {
      setMutationError(errorMessage(requestError))
    }
  }

  const toggleCreateForm = () => {
    if (showCreateForm) {
      setReceiptFile(null)
      setVoucher(null)
      setMovementAmount('')
      setMovementDescription('')
      setMutationError('')
    }
    setShowCreateForm(!showCreateForm)
  }

  return (
    <>
      <header className="page-header">
        <h2>Mis movimientos</h2>
        <p>Revisa tus ingresos, gastos y ahorros registrados.</p>
        <button className="modal-primary" type="button" onClick={toggleCreateForm}>
          <Plus size={16} aria-hidden="true" />{showCreateForm ? 'Cancelar' : 'Nuevo movimiento'}
        </button>
      </header>

      {showCreateForm && (
        <section className="panel-card management-panel">
          <h3>Registrar movimiento</h3>
          {mutationError && <div className="auth-feedback error" role="alert">{mutationError}</div>}
          {availableAccounts.length === 0 || categories.length === 0 ? (
            <p className="empty-state">Para registrar un movimiento necesitas una cuenta activa y una categoría. Puedes administrarlas en Gestión.</p>
          ) : (
            <form className="management-form" onSubmit={createNewMovement}>
              <label>Cuenta<select name="accountId" value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)} required>{availableAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Categoría<select name="categoryId" value={selectedCategory || categories[0]?.id || ''} onChange={(event) => setSelectedCategory(event.target.value)} required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.type}</option>)}</select></label>
              <label>Monto<input name="amount" type="number" min="0.01" step="0.01" value={movementAmount} onChange={(event) => setMovementAmount(event.target.value)} required /></label>
              <label>Descripción<input name="description" value={movementDescription} onChange={(event) => setMovementDescription(event.target.value)} /></label>
              <div>
                <span className="receipt-label">Comprobante</span>
                <ReceiptPicker file={receiptFile} onFile={(file) => {
                  setReceiptFile(file)
                  setVoucher(null)
                }} />
              </div>
              <button className="secondary-button" type="button" onClick={() => void analyzeReceipt()} disabled={!receiptFile || analyzingVoucher}>
                {analyzingVoucher ? 'Analizando…' : 'Analizar comprobante'}
              </button>
              <button className="modal-primary" type="submit" disabled={busyMovement}>{busyMovement ? 'Guardando…' : 'Guardar movimiento'}</button>
            </form>
          )}
          {voucher && (
            <div className="voucher-summary" role="status">
              <strong>Datos detectados; revísalos antes de guardar.</strong>
              {voucher.companyName && <span>Comercio: {voucher.companyName}</span>}
              {voucher.ruc && <span>RUC: {voucher.ruc}</span>}
              {voucher.dateIssued && <span>Fecha del comprobante: {formatDate(voucher.dateIssued)}</span>}
              {voucher.paymentMethod && <span>Medio de pago: {voucher.paymentMethod}</span>}
              {voucher.expenseCategory && <span>Categoría detectada: {voucher.expenseCategory}</span>}
            </div>
          )}
        </section>
      )}

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
            displayValue={selectedAccountLabel}
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
        {mutationError && !showCreateForm && <div className="auth-feedback error" role="alert">{mutationError}</div>}
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
              <div className="movement-actions">
                <button className="secondary-button" type="button" onClick={() => void showMovementDetails(movement.movementId)}>Detalle</button>
                {movement.receiptUrl && <a className="secondary-button" href={movement.receiptUrl} target="_blank" rel="noreferrer">Ver comprobante</a>}
                <ReceiptPicker onFile={(file) => {
                  if (file) void uploadReceipt(movement, file)
                }} />
                <button className="secondary-button" type="button" onClick={() => void removeMovement(movement)} aria-label="Eliminar movimiento">
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
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

function ReceiptPicker({ file, onFile }: {
  file?: File | null
  onFile: (file: File | null) => void
}) {
  const id = useId()
  const fileInputId = `receipt-file-${id}`
  const cameraInputId = `receipt-camera-${id}`
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    onFile(input.files?.[0] ?? null)
    input.value = ''
  }

  return (
    <div className="receipt-picker">
      <input className="visually-hidden-file" id={fileInputId} type="file" accept="image/*,.pdf" onChange={handleChange} />
      <label className="secondary-button receipt-option" htmlFor={fileInputId}>
        <FileUp size={15} aria-hidden="true" />
        Subir archivo
      </label>
      <input className="visually-hidden-file" id={cameraInputId} type="file" accept="image/*" capture="environment" onChange={handleChange} />
      <label className="secondary-button receipt-option" htmlFor={cameraInputId}>
        <Camera size={15} aria-hidden="true" />
        Tomar foto
      </label>
      {file && (
        <span className="receipt-selected">
          {file.name}
          <button type="button" onClick={() => onFile(null)} aria-label="Quitar comprobante seleccionado">
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      )}
    </div>
  )
}
