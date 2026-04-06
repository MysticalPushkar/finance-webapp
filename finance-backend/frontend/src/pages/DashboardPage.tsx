import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'
import type { DashboardSummary } from '../types'

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await api.get<DashboardSummary>('/api/dashboard')
      setData(res.data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row">
        <div>
          <h1 className="h1" style={{ marginBottom: 4 }}>
            Dashboard
          </h1>
          <div className="muted">Your finance summary from `/api/dashboard`</div>
        </div>
        <button className="btn" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="panel">
        <div className="panel-inner">
          <div className="grid grid-3">
            <div className="stat">
              <div className="stat-label">Total income</div>
              <div className="stat-value">{data ? data.totalIncome : '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total expense</div>
              <div className="stat-value">{data ? data.totalExpense : '—'}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Balance</div>
              <div className="stat-value">{data ? data.balance : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

