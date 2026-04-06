import axios from 'axios'
import { API_BASE_URL } from './config'
import { getToken } from './auth'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    // Backend expects raw token in `Authorization` (no "Bearer " prefix)
    config.headers = config.headers ?? {}
    config.headers.Authorization = token
  }
  return config
})

export type ApiErrorShape = {
  msg?: string
}

export function getApiErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const msg = (err.response?.data as ApiErrorShape | undefined)?.msg
  return msg ?? err.message ?? 'Request failed'
}

