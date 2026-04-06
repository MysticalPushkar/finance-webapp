import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import { setToken } from '../lib/auth'

type LoginResponse = { token: string }

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = useMemo(() => {
    const from = (location.state as { from?: string } | null)?.from
    return from ?? '/dashboard'
  }, [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
      setToken(res.data.token)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-inner">
        <h1 className="h1">Login</h1>
        <p className="muted" style={{ marginBottom: 14 }}>
          Use your email/password. Backend expects token in <code>Authorization</code> header.
        </p>

        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <form onSubmit={onSubmit} className="grid" style={{ maxWidth: 420 }}>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
            <Link className="link" to="/register">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

