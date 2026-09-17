import type { Goal, Transaction } from './types'

export const navigationItems = [
  { id: 'inicio' as const, label: 'Inicio', icon: '🏠' },
  { id: 'movimientos' as const, label: 'Movimientos', icon: '💳' },
  { id: 'metas' as const, label: 'Metas', icon: '🎯' },
  { id: 'asistente' as const, label: 'Asistente IA', icon: '🤖' },
]

export const summaryCards = [
  { label: 'Entró', value: 'S/ 5,200', tone: 'primary', icon: '↓' },
  { label: 'Gasté', value: 'S/ 3,100', tone: 'danger', icon: '↑' },
  { label: 'Queda para ahorrar', value: 'S/ 2,100', tone: 'success', icon: '💰' },
]

export const quickQuestions = [
  '¿En qué gasté más este mes?',
  '¿Cuánto dinero puedo guardar esta semana?',
  '¿Cómo voy con el dinero para mi Laptop?',
]

export const transactions: Transaction[] = [
  { id: 1, name: 'Comida', detail: 'Salida de: Billetera', amount: '- S/ 45.00', type: 'expense' },
  { id: 2, name: 'Sueldo', detail: 'Entró a: Banco', amount: '+ S/ 1,500.00', type: 'income' },
  { id: 3, name: 'Transporte', detail: 'Salida de: Yape', amount: '- S/ 12.00', type: 'expense' },
]

export const goals: Goal[] = [
  { title: 'Viaje a Cusco', amount: 'S/ 3,200', saved: 'S/ 1,800', progress: 56, deadline: '12 Oct 2026', color: 'purple' },
  { title: 'Emergencia', amount: 'S/ 2,500', saved: 'S/ 1,300', progress: 52, deadline: '30 Sep 2026', color: 'green' },
  { title: 'Laptop nueva', amount: 'S/ 4,200', saved: 'S/ 2,100', progress: 50, deadline: '18 Nov 2026', color: 'blue' },
]
