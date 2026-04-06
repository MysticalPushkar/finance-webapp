import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'finance.token'

export type UserRole = 'viewer' | 'analyst' | 'admin'

type TokenPayload = {
  id?: string
  role?: UserRole
  iat?: number
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return Boolean(getToken())
}

export function getRoleFromToken(token: string | null): UserRole | null {
  if (!token) return null
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    return decoded.role ?? null
  } catch {
    return null
  }
}

