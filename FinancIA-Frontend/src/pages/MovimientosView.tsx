import { useState } from 'react'
import { transactions } from '../data'
import type { TransactionType } from '../types'

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
        <h2>Mis Movimientos</h2>
        <p>Revisa y gestiona todos tus ingresos y gastos aquí.</p>
      </header>

      <section className="filters-bar">
        <div className="filter-row">
          <button type="button" className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todo</button>
          <button type="button" className={`filter-chip ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>↗ Solo lo que gané</button>
          <button type="button" className={`filter-chip ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')}>↘ Solo lo que gasté</button>
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
        {filteredTransactions.map((item) => (
          <article key={item.id} className="transaction-row">
            <div className="transaction-main">
              <div className={`transaction-icon ${item.type}`}>
                {item.type === 'expense' ? '🍽️' : '💵'}
              </div>
              <div>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </div>
            </div>
            <div className={`amount ${item.type}`}>{item.amount}</div>
          </article>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="empty-state">No hay movimientos que coincidan con este filtro.</div>
        )}

        <h3 className="group-label">Ayer</h3>
        <article className="transaction-row">
          <div className="transaction-main">
            <div className="transaction-icon expense">🚇</div>
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

function FilterMenu({ icon, label, value, options, isOpen, onToggle, onSelect, account = false }: FilterMenuProps) {
  return (
    <div className={`select-control ${account ? 'account-control' : ''}`}>
      <span className="select-icon">{icon}</span>
      <span className="select-label">{label}</span>
      <button className="select-trigger" type="button" onClick={onToggle} aria-expanded={isOpen}>
        {value}
      </button>
      <span className="select-chevron">⌄</span>
      {isOpen && (
        <div className="select-menu">
          {options.map((option) => (
            <button key={option} type="button" className={value === option ? 'selected' : ''} onClick={() => onSelect(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
