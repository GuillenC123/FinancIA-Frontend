export type ViewId = 'inicio' | 'movimientos' | 'metas' | 'asistente'

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
