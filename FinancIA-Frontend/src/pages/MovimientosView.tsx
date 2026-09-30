import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  SearchX,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { transactions } from '../data'
import type { TransactionType } from '../types'

const categoryIcons: Record<string, LucideIcon> = {
  Comida: Utensils,
  Transporte: Bus,
  Sueldo: Banknote,
}

const iconForTransaction = (name: string, type: TransactionType) =>
  categoryIcons[name] ?? (type === 'income' ? ArrowDownLeft : ArrowUpRight)

type Filter = 'all' | TransactionType

type MovimientosViewProps = {
  onNotify: (message: string) => void
}

const accountOptions = [
  ['all', 'Todas las Cuentas'],
  ['banco', 'Banco'],
  ['billetera', 'Billetera'],
  ['yape', 'Yape'],
] as const

export function MovimientosView({ onNotify }: MovimientosViewProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [account, setAccount] = useState('all')
  const [month, setMonth] = useState('Mayo')
  const [openMenu, setOpenMenu] = useState<'month' | 'account' | null>(null)

  const filteredTransactions = transactions.filter((item) => {
    const matchesType = filter === 'all' || item.type === filter
    const matchesAccount = account === 'all' || item.detail.toLowerCase().includes(account)
    return matchesType && matchesAccount
  })

  return (
    <>
      <header className="page-header">
        <h2>Mis movimientos</h2>
        <p>Revisa y gestiona todos tus ingresos y gastos aquí.</p>
      </header>

      <section className="filters-bar">
        <div className="filter-row">
          <button type="button" className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>Todo</button>
          <button type="button" className={`filter-chip ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')} aria-pressed={filter === 'income'}><ArrowDownLeft size={16} strokeWidth={2} aria-hidden="true" />Solo lo que gané</button>
          <button type="button" className={`filter-chip ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')} aria-pressed={filter === 'expense'}><ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />Solo lo que gasté</button>
        </div>

        <div className="select-row">
          <FilterMenu
            icon="▣"
            label="Periodo"
            value={month}
            isOpen={openMenu === 'month'}
            options={['Mayo', 'Abril', 'Marzo']}
            onToggle={() => setOpenMenu(openMenu === 'month' ? null : 'month')}
            onSelect={(value) => {
              setMonth(value)
              setOpenMenu(null)
              onNotify('El periodo seleccionado se aplicará al conectar la API.')
            }}
          />
          <FilterMenu
            icon="▤"
            label="Cuenta"
            value={accountOptions.find(([value]) => value === account)?.[1] ?? 'Todas las Cuentas'}
            isOpen={openMenu === 'account'}
            options={accountOptions.map(([, label]) => label)}
            account
            onToggle={() => setOpenMenu(openMenu === 'account' ? null : 'account')}
            onSelect={(value) => {
              const selected = accountOptions.find(([, label]) => label === value)?.[0] ?? 'all'
              setAccount(selected)
              setOpenMenu(null)
            }}
          />
        </div>
      </section>

      <section className="transactions-block">
        <h3>Hoy</h3>
        {filteredTransactions.map((item) => {
          const Icon = iconForTransaction(item.name, item.type)
          return (
            <article key={item.id} className="transaction-row">
              <div className="transaction-main">
                <div className={`transaction-icon ${item.type}`} aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </div>
              </div>
              <div className={`amount ${item.type}`}>{item.amount}</div>
            </article>
          )
        })}

        {filteredTransactions.length === 0 && (
          <div className="empty-state"><SearchX size={18} strokeWidth={1.75} aria-hidden="true" />No hay movimientos que coincidan con este filtro.</div>
        )}

        <h3 className="group-label">Ayer</h3>
        <article className="transaction-row">
          <div className="transaction-main">
            <div className="transaction-icon expense" aria-hidden="true"><Bus size={18} strokeWidth={1.75} /></div>
            <div>
              <strong>Transporte</strong>
              <small>Salida de: Yape</small>
            </div>
          </div>
          <div className="amount expense">- S/ 12.00</div>
        </article>
      </section>
    </>
  )
}

type FilterMenuProps = {
  icon: string
  label: string
  value: string
  options: readonly string[]
  isOpen: boolean
  account?: boolean
  onToggle: () => void
  onSelect: (value: string) => void
}

function FilterMenu({ label, value, options, isOpen, onToggle, onSelect, account = false }: FilterMenuProps) {
  const Icon = account ? Wallet : CalendarDays
  return (
    <div className={`select-control ${account ? 'account-control' : ''}`}>
      <span className="select-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <span className="select-label">{label}</span>
      <button className="select-trigger" type="button" onClick={onToggle} aria-expanded={isOpen} aria-label={`${label}: ${value}`}>
        {value}
      </button>
      <span className="select-chevron" aria-hidden="true"><ChevronDown size={16} strokeWidth={2} /></span>
      {isOpen && (
        <div className="select-menu">
          {options.map((option) => (
            <button key={option} type="button" className={value === option ? 'selected' : ''} onClick={() => onSelect(option)}>
              {option}
              {value === option && <Check size={16} strokeWidth={2} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
