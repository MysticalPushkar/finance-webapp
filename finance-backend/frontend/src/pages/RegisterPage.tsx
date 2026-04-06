import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import type { UserRole } from '../lib/auth'

type RegisterPayload = {
  name: string
  email: string
  password: string
  role: UserRole
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      setSuccess('Registered. Now login.')
      setTimeout(() => navigate('/login'), 700)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-inner">
        <h1 className="h1">Register</h1>
        <p className="muted" style={{ marginBottom: 14 }}>
          Choose a role. Only <b>admin</b> can create/update/delete transactions.
        </p>

        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}
        {success ? (
          <div
            className="error"
            style={{
              marginBottom: 12,
              borderColor: 'rgba(34,197,94,0.35)',
              background: 'rgba(34,197,94,0.10)',
              color: '#bbf7d0',
            }}
          >
            {success}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid" style={{ maxWidth: 520 }}>
          <div className="field">
            <div className="label">Name</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="field">
            <div className="label">Email</div>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="field">
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div className="field">
            <div className="label">Role</div>
            <select
              className="select"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="viewer">viewer</option>
              <option value="analyst">analyst</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
            <Link className="link" to="/login">
              I already have an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

