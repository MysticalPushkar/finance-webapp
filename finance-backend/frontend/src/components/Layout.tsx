import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { clearToken, getRoleFromToken, getToken, isLoggedIn } from '../lib/auth'
import { useMemo } from 'react'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className="link"
      style={({ isActive }) =>
        isActive
          ? { borderColor: 'rgba(167, 139, 250, 0.5)', background: 'rgba(167, 139, 250, 0.08)' }
          : undefined
      }
    >
      {label}
    </NavLink>
  )
}

export function Layout() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const role = useMemo(() => getRoleFromToken(getToken()), [loggedIn])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="row" style={{ width: '100%' }}>
            <div className="row" style={{ gap: 10 }}>
              <div className="brand">Finance</div>
              {role ? <span className="badge">role: {role}</span> : null}
            </div>
            <nav className="nav">
              {loggedIn ? (
                <>
                  <NavItem to="/dashboard" label="Dashboard" />
                  <NavItem to="/transactions" label="Transactions" />
                  <button
                    className="btn"
                    onClick={() => {
                      clearToken()
                      navigate('/login')
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login" label="Login" />
                  <NavItem to="/register" label="Register" />
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

