export type Transaction = {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  wallet: string
}

export type Wallet = {
  id: string
  name: string
  balance: number
  currency: string
  color: string
  type: 'checking' | 'savings' | 'crypto' | 'investment'
}

export const wallets: Wallet[] = [
  { id: 'w1', name: 'Cuenta Principal', balance: 4820.50, currency: 'USD', color: '#6c63ff', type: 'checking' },
  { id: 'w2', name: 'Ahorros', balance: 12340.00, currency: 'USD', color: '#22c55e', type: 'savings' },
  { id: 'w3', name: 'Cripto', balance: 3175.80, currency: 'USD', color: '#f59e0b', type: 'crypto' },
  { id: 'w4', name: 'Inversiones', balance: 9650.20, currency: 'USD', color: '#ec4899', type: 'investment' },
]

export const transactions: Transaction[] = [
  { id: 't1', description: 'Salario Mensual', amount: 3500, type: 'income', category: 'Trabajo', date: '2026-06-30', wallet: 'w1' },
  { id: 't2', description: 'Alquiler', amount: 950, type: 'expense', category: 'Vivienda', date: '2026-06-29', wallet: 'w1' },
  { id: 't3', description: 'Supermercado', amount: 185.40, type: 'expense', category: 'Alimentación', date: '2026-06-28', wallet: 'w1' },
  { id: 't4', description: 'Netflix', amount: 15.99, type: 'expense', category: 'Entretenimiento', date: '2026-06-27', wallet: 'w1' },
  { id: 't5', description: 'Freelance diseño', amount: 850, type: 'income', category: 'Trabajo', date: '2026-06-26', wallet: 'w1' },
  { id: 't6', description: 'Restaurante', amount: 62.30, type: 'expense', category: 'Alimentación', date: '2026-06-25', wallet: 'w1' },
  { id: 't7', description: 'Gym', amount: 45, type: 'expense', category: 'Salud', date: '2026-06-24', wallet: 'w1' },
  { id: 't8', description: 'Ethereum compra', amount: 500, type: 'expense', category: 'Cripto', date: '2026-06-23', wallet: 'w3' },
  { id: 't9', description: 'Dividendos', amount: 220, type: 'income', category: 'Inversiones', date: '2026-06-22', wallet: 'w4' },
  { id: 't10', description: 'Gasolina', amount: 55.80, type: 'expense', category: 'Transporte', date: '2026-06-21', wallet: 'w1' },
  { id: 't11', description: 'Consultoría', amount: 1200, type: 'income', category: 'Trabajo', date: '2026-06-20', wallet: 'w1' },
  { id: 't12', description: 'Spotify', amount: 9.99, type: 'expense', category: 'Entretenimiento', date: '2026-06-19', wallet: 'w1' },
  { id: 't13', description: 'Farmacia', amount: 38.50, type: 'expense', category: 'Salud', date: '2026-06-18', wallet: 'w1' },
  { id: 't14', description: 'Bitcoin ganancia', amount: 320, type: 'income', category: 'Cripto', date: '2026-06-17', wallet: 'w3' },
  { id: 't15', description: 'Ropa', amount: 145, type: 'expense', category: 'Shopping', date: '2026-06-16', wallet: 'w1' },
]

export const monthlyData = [
  { month: 'Ene', ingresos: 4200, gastos: 2800 },
  { month: 'Feb', ingresos: 3800, gastos: 3100 },
  { month: 'Mar', ingresos: 5100, gastos: 2650 },
  { month: 'Abr', ingresos: 4600, gastos: 3200 },
  { month: 'May', ingresos: 5500, gastos: 2900 },
  { month: 'Jun', ingresos: 5770, gastos: 2508 },
]

export const categoryData = [
  { name: 'Vivienda', value: 950, color: '#6c63ff' },
  { name: 'Alimentación', value: 247.70, color: '#22c55e' },
  { name: 'Transporte', value: 55.80, color: '#f59e0b' },
  { name: 'Salud', value: 83.50, color: '#ec4899' },
  { name: 'Entretenimiento', value: 25.98, color: '#06b6d4' },
  { name: 'Shopping', value: 145, color: '#8b5cf6' },
  { name: 'Cripto', value: 500, color: '#f97316' },
]

export const aiInsights = [
  {
    id: 'i1',
    type: 'warning',
    title: 'Gasto en alimentación elevado',
    description: 'Este mes has gastado un 18% más en alimentación respecto al mes anterior. Considera revisar tu presupuesto de supermercado.',
    action: 'Ver transacciones',
  },
  {
    id: 'i2',
    type: 'success',
    title: 'Buen ritmo de ahorro',
    description: 'Estás ahorrando el 32% de tus ingresos mensuales, superando tu meta del 25%. ¡Sigue así!',
    action: 'Ver ahorros',
  },
  {
    id: 'i3',
    type: 'info',
    title: 'Oportunidad de inversión',
    description: 'Tienes $1,200 inactivos en tu cuenta principal. Con tu perfil de riesgo moderado, podrías generar un 7-9% anual invirtiéndolos.',
    action: 'Explorar opciones',
  },
  {
    id: 'i4',
    type: 'warning',
    title: 'Subscripciones acumuladas',
    description: 'Detectamos 4 subscripciones activas por un total de $71/mes. Algunas podrían estar duplicadas.',
    action: 'Revisar subs',
  },
]
