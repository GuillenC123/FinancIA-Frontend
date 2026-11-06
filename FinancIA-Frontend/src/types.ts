export type ViewId = 'inicio' | 'movimientos' | 'metas' | 'gestion' | 'asistente'

export type ModalState =
  | { type: 'consultation' }
  | { type: 'details'; title: string; content: string }
  | { type: 'twofactor' }
  | { type: 'profileSettings' }
  | null

export type DetailModalProps = {
  title: string
  content: string
  onClose: () => void
}
