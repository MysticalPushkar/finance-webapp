export type TransactionType = 'income' | 'expense'

export type Transaction = {
  _id: string
  userId: string
  amount: number
  type: TransactionType
  category?: string
  date: string
  note?: string
}

export type DashboardSummary = {
  totalIncome: number
  totalExpense: number
  balance: number
}

