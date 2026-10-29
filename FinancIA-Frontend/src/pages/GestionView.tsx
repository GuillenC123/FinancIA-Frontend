import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  changeAccountStatus,
  changeBudgetStatus,
  createAccount,
  createBudget,
  createGlobalCategory,
  createSubscription,
  createTransfer,
  createUserCategory,
  deleteTransfer,
  deleteUserCategory,
  getAccounts,
  getAccount,
  getBudgets,
  getBudget,
  getBudgetConsumption,
  getCategory,
  getGlobalCategories,
  getSubscriptions,
  getSubscription,
  getTransfer,
  getTransfers,
  getTransfersByAccount,
  getUserCategories,
  toggleSubscription,
  updateBudget,
  updateUserCategory,
  updateTransfer,
  type Account,
  type Budget,
  type BudgetConsumption,
  type FinancialCategory,
  type Subscription,
  type Transfer,
} from '../api'
import { formatCurrency, formatDate } from '../format'

type Section = 'cuentas' | 'presupuestos' | 'categorias' | 'suscripciones'

const sections: Array<{ id: Section; label: string }> = [
  { id: 'cuentas', label: 'Cuentas y transferencias' },
  { id: 'presupuestos', label: 'Presupuestos' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'suscripciones', label: 'Suscripciones' },
]

export function GestionView({ isAdmin, onOpenDetails }: {
  isAdmin: boolean
  onOpenDetails: (title: string, content: string) => void
}) {
  const [section, setSection] = useState<Section>('cuentas')

  return (
    <>
      <header className="page-header">
        <h2>Gestión financiera</h2>
        <p>Administra tus cuentas, presupuestos, categorías y pagos recurrentes.</p>
      </header>
      <div className="filter-row" aria-label="Secciones de gestión">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`filter-chip ${section === item.id ? 'active' : ''}`}
            aria-pressed={section === item.id}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {section === 'cuentas' && <AccountsPanel onOpenDetails={onOpenDetails} />}
      {section === 'presupuestos' && <BudgetsPanel onOpenDetails={onOpenDetails} />}
      {section === 'categorias' && <CategoriesPanel isAdmin={isAdmin} />}
      {section === 'suscripciones' && <SubscriptionsPanel onOpenDetails={onOpenDetails} />}
    </>
  )
}

function AccountsPanel({ onOpenDetails }: {
  onOpenDetails: (title: string, content: string) => void
}) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [editingTransfer, setEditingTransfer] = useState<string | null>(null)
  const [sourceAccount, setSourceAccount] = useState('')
  const [destinationAccount, setDestinationAccount] = useState('')
  const [selectedTransferAccount, setSelectedTransferAccount] = useState('')

  useEffect(() => {
    let cancelled = false
    getAccounts()
      .then((accountData) => {
        if (!cancelled) {
          setAccounts(accountData)
          const activeAccounts = accountData.filter((account) => account.active)
          setSourceAccount(activeAccounts[0]?.id ?? '')
          setDestinationAccount(activeAccounts[1]?.id ?? '')
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(message(requestError, 'No se pudieron cargar tus cuentas.'))
      })
    return () => { cancelled = true }
  }, [reload])

  useEffect(() => {
    let cancelled = false
    const loadTransfers = selectedTransferAccount
      ? getTransfersByAccount(selectedTransferAccount)
      : getTransfers()
    loadTransfers
      .then((transferData) => {
        if (!cancelled) {
          setTransfers(transferData.content)
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(message(requestError, 'No se pudieron cargar las transferencias.'))
      })
    return () => { cancelled = true }
  }, [reload, selectedTransferAccount])

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true)
    setError('')
    try {
      await createAccount({
        name: String(form.get('name')),
        type: String(form.get('type')) as Account['type'],
        initialBalance: Number(form.get('initialBalance')),
      })
      formElement.reset()
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(message(requestError, 'No se pudo crear la cuenta.'))
    } finally {
      setBusy(false)
    }
  }

  const submitTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true)
    setError('')
    try {
      await createTransfer({
        idSource: String(form.get('source')),
        idTarget: String(form.get('target')),
        amount: Number(form.get('amount')),
        description: String(form.get('description')),
      })
      formElement.reset()
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(message(requestError, 'No se pudo realizar la transferencia.'))
    } finally {
      setBusy(false)
    }
  }

  const toggleAccount = async (account: Account) => {
    if (!window.confirm(`¿Desactivar la cuenta «${account.name}»?`)) return
    await mutate(() => changeAccountStatus(account.id), setError, () => setReload((value) => value + 1))
  }

  const removeTransfer = async (transfer: Transfer) => {
    if (!window.confirm(`¿Eliminar la transferencia de ${formatCurrency(transfer.amount)}?`)) return
    await mutate(() => deleteTransfer(transfer.id), setError, () => setReload((value) => value + 1))
  }

  const showAccountDetails = async (accountId: string) => {
    setError('')
    try {
      const account = await getAccount(accountId)
      onOpenDetails(
        account.name,
        `Tipo: ${account.type.replaceAll('_', ' ')}. Saldo actual: ${formatCurrency(account.currentBalance)}. Estado: ${account.active ? 'Activa' : 'Inactiva'}. Creada: ${formatDate(account.creationDate)}.`,
      )
    } catch (requestError) {
      setError(message(requestError, 'No se pudo cargar el detalle de la cuenta.'))
    }
  }

  const showTransferDetails = async (transferId: string) => {
    setError('')
    try {
      const transfer = await getTransfer(transferId)
      onOpenDetails(
        'Detalle de transferencia',
        [
          `Origen: ${transfer.accountOrigin.name}`,
          `Destino: ${transfer.accountDestination.name}`,
          `Monto: ${formatCurrency(transfer.amount)}`,
          `Fecha: ${formatDate(transfer.creationDate)}`,
          `Descripción: ${transfer.description || 'Sin descripción.'}`,
        ].join('\n'),
      )
    } catch (requestError) {
      setError(message(requestError, 'No se pudo cargar el detalle de la transferencia.'))
    }
  }

  return (
    <section className="management-layout">
      {error && <div className="auth-feedback error" role="alert">{error}</div>}
      <Panel title="Cuentas">
        <form className="management-form" onSubmit={submitAccount}>
          <label>Nombre<input name="name" minLength={3} required /></label>
          <label>Tipo<select name="type" defaultValue="EFECTIVO"><option value="EFECTIVO">Efectivo</option><option value="BANCO">Banco</option><option value="BILLETERA_DIGITAL">Billetera digital</option><option value="OTRO">Otro</option></select></label>
          <label>Saldo inicial<input name="initialBalance" type="number" min="50" step="0.01" defaultValue="50" required /></label>
          <button className="modal-primary" type="submit" disabled={busy}>Crear cuenta</button>
        </form>
        <div className="management-list">
          {accounts.length === 0 && <p className="empty-state">Aún no tienes cuentas.</p>}
          {accounts.map((account) => (
            <div className="management-row" key={account.id}>
              <div><strong>{account.name}</strong><small>{account.type.replaceAll('_', ' ')} · {account.active ? 'Activa' : 'Inactiva'}</small></div>
              <strong>{formatCurrency(account.currentBalance)}</strong>
              <button className="secondary-button" type="button" onClick={() => void showAccountDetails(account.id)}>Detalle</button>
              {account.active && <button className="secondary-button" type="button" onClick={() => toggleAccount(account)}>Desactivar</button>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Nueva transferencia">
        {accounts.filter((account) => account.active).length < 2
          ? <p className="empty-state">Necesitas al menos dos cuentas activas para transferir.</p>
          : (
            <form className="management-form" onSubmit={submitTransfer}>
              <label>Desde<select name="source" value={sourceAccount} onChange={(event) => {
                setSourceAccount(event.target.value)
                setDestinationAccount(accounts.find((account) => account.active && account.id !== event.target.value)?.id ?? '')
              }} required>{accounts.filter((account) => account.active).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
              <label>Hacia<select name="target" value={destinationAccount} onChange={(event) => setDestinationAccount(event.target.value)} required>{accounts.filter((account) => account.active && account.id !== sourceAccount).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
              <label>Monto<input name="amount" type="number" min="0.01" step="0.01" required /></label>
              <label>Descripción<input name="description" /></label>
              <button className="modal-primary" type="submit" disabled={busy}>Transferir</button>
            </form>
          )}
      </Panel>

      <Panel title="Historial de transferencias">
        <label className="management-filter">
          Cuenta
          <select value={selectedTransferAccount} onChange={(event) => setSelectedTransferAccount(event.target.value)}>
            <option value="">Todas las cuentas</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>
        {transfers.length === 0 && <p className="empty-state">Aún no hay transferencias.</p>}
        {transfers.map((transfer) => editingTransfer === transfer.id
          ? <TransferEdit key={transfer.id} transfer={transfer} onCancel={() => setEditingTransfer(null)} onSave={async (values) => {
              await mutate(() => updateTransfer(transfer.id, values), setError, () => {
                setEditingTransfer(null)
                setReload((value) => value + 1)
              })
            }} />
          : (
            <div className="management-row" key={transfer.id}>
              <div><strong>{transfer.accountOrigin.name} → {transfer.accountDestination.name}</strong><small>{formatDate(transfer.creationDate)} · {transfer.description || 'Sin descripción'}</small></div>
              <strong>{formatCurrency(transfer.amount)}</strong>
              <button className="secondary-button" type="button" onClick={() => void showTransferDetails(transfer.id)}>Detalle</button>
              <button className="secondary-button" type="button" onClick={() => setEditingTransfer(transfer.id)}>Editar</button>
              <button className="secondary-button" type="button" onClick={() => removeTransfer(transfer)}>Eliminar</button>
            </div>
          ))}
      </Panel>
    </section>
  )
}

function TransferEdit({ transfer, onCancel, onSave }: {
  transfer: Transfer
  onCancel: () => void
  onSave: (values: { newAmount: number; newDescription: string }) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  return (
    <form className="management-form" onSubmit={async (event) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      setBusy(true)
      await onSave({ newAmount: Number(form.get('amount')), newDescription: String(form.get('description')) })
      setBusy(false)
    }}>
      <label>Monto<input name="amount" type="number" min="0.01" step="0.01" defaultValue={transfer.amount} required /></label>
      <label>Descripción<input name="description" defaultValue={transfer.description} /></label>
      <button className="modal-primary" type="submit" disabled={busy}>Guardar</button>
      <button className="secondary-button" type="button" onClick={onCancel}>Cancelar</button>
    </form>
  )
}

function BudgetsPanel({ onOpenDetails }: {
  onOpenDetails: (title: string, content: string) => void
}) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [consumption, setConsumption] = useState<Record<string, BudgetConsumption>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getBudgets(), getGlobalCategories(), getUserCategories()])
      .then(([budgetData, globalCategories, userCategories]) => {
        if (!cancelled) {
          setBudgets(budgetData)
          setCategories([...globalCategories, ...userCategories])
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(message(requestError, 'No se pudieron cargar los presupuestos.'))
      })
    return () => { cancelled = true }
  }, [reload])

  const saveBudget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const categoryId = String(form.get('categoryId'))
    setBusy(true)
    setError('')
    try {
      const payload = {
        name: String(form.get('name')),
        periodStart: String(form.get('periodStart')),
        periodEnd: String(form.get('periodEnd')),
        amountLimitTotal: Number(form.get('amountLimitTotal')),
        categories: [
          ...(editingBudget?.categories.filter((item) => item.categoryId !== categoryId) ?? [])
            .map((item) => ({ categoryId: item.categoryId, amountLimit: item.amountLimit })),
          { categoryId, amountLimit: Number(form.get('categoryLimit')) },
        ],
      }
      if (editingBudget) await updateBudget(editingBudget.id, payload)
      else await createBudget(payload)
      formElement.reset()
      setEditingBudget(null)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(message(requestError, 'No se pudo crear el presupuesto.'))
    } finally {
      setBusy(false)
    }
  }

  const showConsumption = async (id: string) => {
    setError('')
    try {
      const result = await getBudgetConsumption(id)
      setConsumption((current) => ({ ...current, [id]: result }))
    } catch (requestError) {
      setError(message(requestError, 'No se pudo consultar el consumo del presupuesto.'))
    }
  }

  const showBudgetDetails = async (id: string) => {
    setError('')
    try {
      const budget = await getBudget(id)
      onOpenDetails(
        budget.name,
        [
          `Periodo: ${formatDate(budget.periodStart)} – ${formatDate(budget.periodEnd)}`,
          `Límite total: ${formatCurrency(budget.amountLimitTotal)}`,
          `Estado: ${budget.active ? 'Activo' : 'Inactivo'}`,
          `Límites por categoría: ${budget.categories.length}`,
        ].join('\n'),
      )
    } catch (requestError) {
      setError(message(requestError, 'No se pudo cargar el detalle del presupuesto.'))
    }
  }

  const toggle = async (budget: Budget) => {
    await mutate(() => changeBudgetStatus(budget.id, !budget.active), setError, () => setReload((value) => value + 1))
  }

  return (
    <section className="management-layout">
      {error && <div className="auth-feedback error" role="alert">{error}</div>}
      <Panel title={editingBudget ? 'Editar presupuesto' : 'Crear presupuesto'}>
        <form className="management-form" key={editingBudget?.id ?? 'new-budget'} onSubmit={saveBudget}>
          <label>Nombre<input name="name" maxLength={255} defaultValue={editingBudget?.name} required /></label>
          <label>Inicio del periodo<input name="periodStart" type="date" defaultValue={editingBudget?.periodStart} required /></label>
          <label>Fin del periodo<input name="periodEnd" type="date" defaultValue={editingBudget?.periodEnd} required /></label>
          <label>Límite total<input name="amountLimitTotal" type="number" min="0.01" step="0.01" defaultValue={editingBudget?.amountLimitTotal} required /></label>
          <label>Categoría limitada<select name="categoryId" defaultValue={editingBudget?.categories[0]?.categoryId} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label>Límite de categoría<input name="categoryLimit" type="number" min="0.01" step="0.01" defaultValue={editingBudget?.categories[0]?.amountLimit} required /></label>
          <button className="modal-primary" type="submit" disabled={busy || categories.length === 0}>{editingBudget ? 'Guardar cambios' : 'Crear presupuesto'}</button>
          {editingBudget && <button className="secondary-button" type="button" onClick={() => setEditingBudget(null)}>Cancelar edición</button>}
        </form>
        {categories.length === 0 && <p className="empty-state">Se necesitan categorías disponibles para definir límites.</p>}
      </Panel>
      <Panel title="Presupuestos">
        {budgets.length === 0 && <p className="empty-state">Aún no tienes presupuestos.</p>}
        {budgets.map((budget) => (
          <article className="management-card" key={budget.id}>
            <div className="management-row">
              <div><strong>{budget.name}</strong><small>{formatDate(budget.periodStart)} – {formatDate(budget.periodEnd)} · {budget.active ? 'Activo' : 'Inactivo'}</small></div>
              <strong>{formatCurrency(budget.amountLimitTotal)}</strong>
              <button className="secondary-button" type="button" onClick={() => void showBudgetDetails(budget.id)}>Detalle</button>
              <button className="secondary-button" type="button" onClick={() => showConsumption(budget.id)}>Ver consumo</button>
              <button className="secondary-button" type="button" onClick={() => toggle(budget)}>{budget.active ? 'Desactivar' : 'Activar'}</button>
              <button className="secondary-button" type="button" onClick={() => setEditingBudget(budget)}>Editar</button>
            </div>
            {consumption[budget.id] && (
              <div className="management-detail">
                <span>Gastado: {formatCurrency(consumption[budget.id].spent)}</span>
                <span>Disponible: {formatCurrency(consumption[budget.id].available)}</span>
                <span>Excedido: {formatCurrency(consumption[budget.id].exceeded)}</span>
                {consumption[budget.id].categories.map((item) => (
                  <span key={item.categoryId}>
                    {categories.find((category) => category.id === item.categoryId)?.name ?? 'Categoría'}: {formatCurrency(item.spent)} / {formatCurrency(item.amountLimit)}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </Panel>
    </section>
  )
}

function CategoriesPanel({ isAdmin }: { isAdmin: boolean }) {
  const [globalCategories, setGlobalCategories] = useState<FinancialCategory[]>([])
  const [userCategories, setUserCategories] = useState<FinancialCategory[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [editingCategory, setEditingCategory] = useState<(FinancialCategory & { parentCategoryId: string }) | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getGlobalCategories(), getUserCategories()])
      .then(([globalData, userData]) => {
        if (!cancelled) {
          setGlobalCategories(globalData)
          setUserCategories(userData)
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(message(requestError, 'No se pudieron cargar las categorías.'))
      })
    return () => { cancelled = true }
  }, [reload])

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true)
    setError('')
    try {
      const payload = {
        name: String(form.get('name')),
        type: String(form.get('type')) as FinancialCategory['type'],
        parentCategoryId: String(form.get('parentCategoryId')),
        active: true as const,
      }
      if (editingCategory) await updateUserCategory(editingCategory.id, payload)
      else await createUserCategory(payload)
      formElement.reset()
      setEditingCategory(null)
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(message(requestError, 'No se pudo crear la categoría.'))
    } finally {
      setBusy(false)
    }
  }

  const saveGlobalCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true)
    setError('')
    try {
      await createGlobalCategory({
        name: String(form.get('name')),
        type: String(form.get('type')) as FinancialCategory['type'],
      })
      formElement.reset()
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(message(requestError, 'No se pudo crear la categoría global.'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (category: FinancialCategory) => {
    if (!window.confirm(`¿Eliminar la categoría «${category.name}»?`)) return
    await mutate(() => deleteUserCategory(category.id), setError, () => setReload((value) => value + 1))
  }

  const edit = async (category: FinancialCategory) => {
    setError('')
    try {
      setEditingCategory(await getCategory(category.id))
    } catch (requestError) {
      setError(message(requestError, 'No se pudo cargar la categoría para editarla.'))
    }
  }

  return (
    <section className="management-layout">
      {error && <div className="auth-feedback error" role="alert">{error}</div>}
      {isAdmin && (
        <Panel title="Crear categoría global">
          <form className="management-form" onSubmit={saveGlobalCategory}>
            <label>Nombre (mínimo 5 caracteres)<input name="name" minLength={5} required /></label>
            <label>Tipo<select name="type" defaultValue="GASTOS"><option value="INGRESOS">Ingresos</option><option value="GASTOS">Gastos</option><option value="AHORRO">Ahorro</option></select></label>
            <button className="modal-primary" type="submit" disabled={busy}>Crear categoría global</button>
          </form>
        </Panel>
      )}
      <Panel title={editingCategory ? 'Editar categoría personal' : 'Crear categoría personal'}>
        <form className="management-form" key={editingCategory?.id ?? 'new-category'} onSubmit={saveCategory}>
          <label>Nombre (mínimo 5 caracteres)<input name="name" minLength={5} defaultValue={editingCategory?.name} required /></label>
          <label>Tipo<select name="type" defaultValue={editingCategory?.type ?? 'GASTOS'}><option value="INGRESOS">Ingresos</option><option value="GASTOS">Gastos</option><option value="AHORRO">Ahorro</option></select></label>
          <label>Categoría principal<select name="parentCategoryId" defaultValue={editingCategory?.parentCategoryId} required>{globalCategories.map((category) => <option key={category.id} value={category.id}>{category.name} · {category.type}</option>)}</select></label>
          <button className="modal-primary" type="submit" disabled={busy || globalCategories.length === 0}>{editingCategory ? 'Guardar cambios' : 'Crear categoría'}</button>
          {editingCategory && <button className="secondary-button" type="button" onClick={() => setEditingCategory(null)}>Cancelar edición</button>}
        </form>
      </Panel>
      <Panel title="Categorías disponibles">
        {[...globalCategories, ...userCategories].map((category) => (
          <div className="management-row" key={category.id}>
            <div><strong>{category.name}</strong><small>{category.type} · {userCategories.some((item) => item.id === category.id) ? 'Personal' : 'Global'}</small></div>
            {userCategories.some((item) => item.id === category.id) && (
              <div className="movement-actions">
                <button className="secondary-button" type="button" onClick={() => void edit(category)}>Editar</button>
                <button className="secondary-button" type="button" onClick={() => void remove(category)}>Eliminar</button>
              </div>
            )}
          </div>
        ))}
      </Panel>
    </section>
  )
}

function SubscriptionsPanel({ onOpenDetails }: {
  onOpenDetails: (title: string, content: string) => void
}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSubscriptions(), getAccounts(), getGlobalCategories(), getUserCategories()])
      .then(([subscriptionData, accountData, globalCategories, userCategories]) => {
        if (!cancelled) {
          setSubscriptions(subscriptionData)
          setAccounts(accountData.filter((account) => account.active))
          setCategories([...globalCategories, ...userCategories])
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(message(requestError, 'No se pudieron cargar las suscripciones.'))
      })
    return () => { cancelled = true }
  }, [reload])

  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true)
    setError('')
    try {
      await createSubscription({
        payingAccountId: String(form.get('accountId')),
        categoryId: String(form.get('categoryId')),
        name: String(form.get('name')),
        amount: Number(form.get('amount')),
        frequency: String(form.get('frequency')) as Subscription['frequency'],
        type: String(form.get('type')) as Subscription['type'],
        payDay: Number(form.get('payDay')),
      })
      formElement.reset()
      setReload((value) => value + 1)
    } catch (requestError) {
      setError(message(requestError, 'No se pudo registrar el pago recurrente.'))
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (subscription: Subscription) => {
    await mutate(() => toggleSubscription(subscription.id), setError, () => setReload((value) => value + 1))
  }

  const showSubscriptionDetails = async (id: string) => {
    setError('')
    try {
      const subscription = await getSubscription(id)
      onOpenDetails(
        subscription.name,
        `Monto: ${formatCurrency(subscription.amount)}. Tipo: ${subscription.type}. Periodicidad: ${subscription.frequency}. Próximo pago: ${formatDate(subscription.dateNextPayment)}. Estado: ${subscription.active ? 'Activa' : 'Pausada'}.`,
      )
    } catch (requestError) {
      setError(message(requestError, 'No se pudo cargar el detalle del pago recurrente.'))
    }
  }

  return (
    <section className="management-layout">
      {error && <div className="auth-feedback error" role="alert">{error}</div>}
      <Panel title="Registrar pago recurrente">
        <form className="management-form" onSubmit={add}>
          <label>Nombre<input name="name" required /></label>
          <label>Monto<input name="amount" type="number" min="0.01" step="0.01" required /></label>
          <label>Cuenta<select name="accountId" required>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
          <label>Categoría<select name="categoryId" required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label>Periodicidad<select name="frequency" defaultValue="MENSUAL"><option value="MENSUAL">Mensual</option><option value="ANUAL">Anual</option><option value="SEMANAL">Semanal</option></select></label>
          <label>Tipo<select name="type" defaultValue="EGRESO"><option value="INGRESO">Ingreso</option><option value="EGRESO">Egreso</option><option value="AHORRO">Ahorro</option></select></label>
          <label>Día de pago (1–28)<input name="payDay" type="number" min="1" max="28" defaultValue="1" required /></label>
          <button className="modal-primary" type="submit" disabled={busy || accounts.length === 0 || categories.length === 0}>Registrar</button>
        </form>
      </Panel>
      <Panel title="Pagos recurrentes">
        {subscriptions.length === 0 && <p className="empty-state">Aún no tienes suscripciones.</p>}
        {subscriptions.map((subscription) => (
          <div className="management-row" key={subscription.id}>
            <div><strong>{subscription.name}</strong><small>{subscription.frequency} · Próximo pago: {formatDate(subscription.dateNextPayment)} · {subscription.active ? 'Activa' : 'Pausada'}</small></div>
            <strong>{formatCurrency(subscription.amount)}</strong>
            <button className="secondary-button" type="button" onClick={() => void showSubscriptionDetails(subscription.id)}>Detalle</button>
            <button className="secondary-button" type="button" onClick={() => toggle(subscription)}>{subscription.active ? 'Pausar' : 'Reanudar'}</button>
          </div>
        ))}
      </Panel>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="panel-card management-panel"><h3>{title}</h3>{children}</section>
}

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

async function mutate<T>(action: () => Promise<T>, setError: (value: string) => void, onSuccess: () => void) {
  setError('')
  try {
    await action()
    onSuccess()
  } catch (requestError) {
    setError(message(requestError, 'No se pudo completar la operación.'))
  }
}
