<template>
  <div class="container py-4">
    <h2>Iniciar sesión</h2>
    <div class="card p-3">
      <input v-model="username" class="form-control mb-2" placeholder="Usuario" autocomplete="username" />

      <div class="position-relative mb-2">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="Contraseña"
          autocomplete="current-password"
        />
        <button
          type="button"
          class="btn btn-icon toggle-password"
          @click="togglePassword"
          :aria-pressed="String(showPassword)"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          title="Mostrar / ocultar contraseña"
        >
          <span v-if="showPassword" aria-hidden="true">🙈</span>
          <span v-else aria-hidden="true">👁️</span>
        </button>
      </div>

      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="remember" v-model="remember" />
        <label class="form-check-label" for="remember">Recordarme</label>
      </div>

      <div class="d-flex gap-2">
        <button @click="doLogin" :disabled="loading" class="btn btn-primary">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Entrar
        </button>
        <router-link to="/registro" class="btn btn-outline-secondary">Registrar</router-link>
      </div>

      <div class="mt-2" :class="{'text-success': success, 'text-danger': error}">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const message = ref('')
const success = ref(false)
const error = ref(false)
const loading = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function doLogin() {
  message.value = ''
  success.value = false
  error.value = false

  if (!username.value || !password.value) {
    message.value = 'Usuario y contraseña son obligatorios'
    error.value = true
    return
  }

  loading.value = true
  try {
    const payload = { nombre_de_usuario: username.value.trim(), password: password.value }
    const r = await auth.login(payload, remember.value)
    if (r && r.success) {
      message.value = 'Login correcto. Redirigiendo...'
      success.value = true
      setTimeout(() => router.push('/agenda'), 600)
    } else {
      message.value = r?.message || 'Credenciales inválidas'
      error.value = true
    }
  } catch (e) {
    message.value = e?.message || 'Error de conexión'
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>