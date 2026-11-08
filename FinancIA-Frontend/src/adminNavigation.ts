import type { ViewId } from './types'

export const adminNavigationItems: Array<{ id: ViewId; label: string }> = [
  { id: 'admin-dashboard', label: 'Resumen' },
  { id: 'admin-users', label: 'Usuarios' },
  { id: 'admin-categories', label: 'Categorías globales' },
  { id: 'admin-audit', label: 'Auditoría' },
]
