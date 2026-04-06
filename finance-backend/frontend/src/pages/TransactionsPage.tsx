import { useEffect, useMemo, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'
import { getRoleFromToken, getToken } from '../lib/auth'
import type { Transaction, TransactionType } from '../types'

type CreateTransactionPayload = {
  amount: number
  type: TransactionType
  category?: string
  note?: string
}

function formatDate(d: string) {
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return d
  return dt.toLocaleString()
}

export function TransactionsPage() {
  const role = useMemo(() => getRoleFromToken(getToken()), [])
  const isAdmin = role === 'admin'

  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateTransactionPayload>({
    amount: 0,
    type: 'expense',
    category: '',
    note: '',
  })

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await api.get<Transaction[]>('/api/transactions')
      setItems(res.data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function createTx(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdmin) return
    setSaving(true)
    setError(null)
    try {
      const payload: CreateTransactionPayload = {
        amount: Number(form.amount),
        type: form.type,
        category: form.category?.trim() || undefined,
        note: form.note?.trim() || undefined,
      }
      await api.post('/api/transactions', payload)
      setForm({ amount: 0, type: 'expense', category: '', note: '' })
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function deleteTx(id: string) {
    if (!isAdmin) return
    setError(null)
    try {
      await api.delete(`/api/transactions/${id}`)
      setItems((prev) => prev.filter((t) => t._id !== id))
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  async function quickEditAmount(t: Transaction) {
    if (!isAdmin) return
    const next = prompt('New amount', String(t.amount))
    if (next == null) return
    const amt = Number(next)
    if (!Number.isFinite(amt)) return
    setError(null)
    try {
      const res = await api.put<Transaction>(`/api/transactions/${t._id}`, { amount: amt })
      setItems((prev) => prev.map((x) => (x._id === t._id ? res.data : x)))
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row">
        <div>
          <h1 className="h1" style={{ marginBottom: 4 }}>
            Transactions
          </h1>
          <div className="muted">List is from `/api/transactions` (user-scoped).</div>
        </div>
        <button className="btn" onClick={() => void load()} disabled={loading}>
          {loading ? 'Loading…' : 'Reload'}
        </button>
      </div>

      {!isAdmin ? (
        <div className="panel">
          <div className="panel-inner">
            <div className="muted">
              You are <b>{role ?? 'unknown'}</b>. Only <b>admin</b> can create/update/delete.
            </div>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-inner">
            <div className="row" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>Create transaction</div>
              <span className="badge">admin</span>
            </div>
            <form onSubmit={createTx} className="grid" style={{ gridTemplateColumns: '2fr 1fr 2fr', gap: 12 }}>
              <div className="field">
                <div className="label">Amount</div>
                <input
                  className="input"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                />
              </div>
              <div className="field">
                <div className="label">Type</div>
                <select
                  className="select"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TransactionType }))}
                >
                  <option value="income">income</option>
                  <option value="expense">expense</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Category</div>
                <input
                  className="input"
                  value={form.category ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="label">Note</div>
                <input
                  className="input"
                  value={form.note ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div className="row" style={{ gridColumn: '1 / -1', justifyContent: 'flex-start' }}>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error ? <div className="error">{error}</div> : null}

      <div className="panel">
        <div className="panel-inner">
          <div className="row" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700 }}>All transactions</div>
            <span className="badge">{items.length} items</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th style={{ width: 190 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className="badge">{t.type}</span>
                    </td>
                    <td>{t.amount}</td>
                    <td>{t.category ?? '—'}</td>
                    <td className="muted">{formatDate(t.date)}</td>
                    <td>{t.note ?? '—'}</td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-start', gap: 8 }}>
                        <button className="btn" disabled={!isAdmin} onClick={() => void quickEditAmount(t)}>
                          Edit amount
                        </button>
                        <button
                          className="btn btn-danger"
                          disabled={!isAdmin}
                          onClick={() => void deleteTx(t._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted" style={{ padding: 16 }}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

