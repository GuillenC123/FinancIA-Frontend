export type ViewId = 'inicio' | 'movimientos' | 'metas' | 'asistente'

export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: number
  name: string
  detail: string
  amount: string
  type: TransactionType
}

export type Goal = {
  title: string
  amount: string
  saved: string
  progress: number
  deadline: string
  color: 'purple' | 'green' | 'blue'
}

export type ModalState =
  | { type: 'consultation' }
  | { type: 'details'; title: string; content: string }
  | { type: 'twofactor' }
  | null

export type DetailModalProps = {
  title: string
  content: string
  onClose: () => void
}
