import axios from 'axios'

const DEFAULT_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

const api = axios.create({
  baseURL: DEFAULT_BASE,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  responseType: 'json'
})

function isFormData(value) {
  if (typeof FormData === 'undefined') return false
  return value instanceof FormData
}

function getStoredToken() {
  return sessionStorage.getItem('agenda_token') || localStorage.getItem('agenda_token') || null
}

function setAuthToken(token, remember = false) {
  if (remember) {
    if (token) localStorage.setItem('agenda_token', token)
    else localStorage.removeItem('agenda_token')
  } else {
    if (token) sessionStorage.setItem('agenda_token', token)
    else sessionStorage.removeItem('agenda_token')
  }
}

function clearAuthToken() {
  sessionStorage.removeItem('agenda_token')
  localStorage.removeItem('agenda_token')
}

api.interceptors.request.use(config => {
  const token = getStoredToken()
  config.headers = config.headers || {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (isFormData(config.data)) {
    delete config.headers['Content-Type']
  }
  return config
}, err => Promise.reject(err))

api.interceptors.response.use(
  response => {
    if (response && response.data !== undefined) return response.data
    return response
  },
  err => {
    const serverPayload = err.response?.data
    if (err.response?.status === 401) {
      clearAuthToken()
      try { window.dispatchEvent(new Event('auth-logout')) } catch {}
    }
    if (serverPayload && typeof serverPayload === 'object') {
      return Promise.reject(serverPayload)
    }
    const message = err.message || 'Network Error'
    return Promise.reject({ success: false, message })
  }
)

export { api as default, setAuthToken, clearAuthToken, getStoredToken }