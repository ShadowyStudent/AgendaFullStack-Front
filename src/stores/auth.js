import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../plugins/api'

function safeParseJSON(key, useLocal = false) {
  try {
    const raw = useLocal ? localStorage.getItem(key) : sessionStorage.getItem(key)
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const tokenSession = sessionStorage.getItem('agenda_token')
  const tokenLocal = localStorage.getItem('agenda_token')
  const token = ref(tokenSession || tokenLocal || '')

  const user = ref(
    tokenSession
      ? safeParseJSON('agenda_user', false)
      : safeParseJSON('agenda_user', true)
  )

  function setSession(newToken, newUser, remember = false) {
    token.value = newToken || ''
    user.value = newUser || null
    if (remember) {
      if (newToken) localStorage.setItem('agenda_token', newToken)
      else localStorage.removeItem('agenda_token')
      if (newUser) localStorage.setItem('agenda_user', JSON.stringify(newUser))
      else localStorage.removeItem('agenda_user')
    } else {
      if (newToken) sessionStorage.setItem('agenda_token', newToken)
      else sessionStorage.removeItem('agenda_token')
      if (newUser) sessionStorage.setItem('agenda_user', JSON.stringify(newUser))
      else sessionStorage.removeItem('agenda_user')
    }
  }

  function clearSession() {
    token.value = ''
    user.value = null
    sessionStorage.removeItem('agenda_token')
    sessionStorage.removeItem('agenda_user')
    localStorage.removeItem('agenda_token')
    localStorage.removeItem('agenda_user')
  }

  function restoreFromSession() {
    const tSession = sessionStorage.getItem('agenda_token')
    const tLocal = localStorage.getItem('agenda_token')
    if (tSession) {
      token.value = tSession
      user.value = safeParseJSON('agenda_user', false)
      return
    }
    if (tLocal) {
      token.value = tLocal
      user.value = safeParseJSON('agenda_user', true)
      return
    }
    token.value = ''
    user.value = null
  }

  async function login(payload, remember = false) {
    try {
      const res = await api.post('/auth/login.php', payload)
      if (res && res.success && res.data?.token) {
        const newUser =
          res.data.user ?? {
            id: res.data.id,
            nombre_de_usuario: res.data.nombre_de_usuario,
          }
        setSession(res.data.token, newUser, remember)
      }
      return res
    } catch (err) {
      return { success: false, message: err?.message || 'Error en login' }
    }
  }

  async function register(payload) {
    try {
      const res = await api.post('/registrar.php', payload)
      return res
    } catch (err) {
      return { success: false, message: err?.message || 'Error en registro' }
    }
  }

  restoreFromSession()
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => clearSession())
  }

  return { token, user, setSession, clearSession, restoreFromSession, login, register }
})