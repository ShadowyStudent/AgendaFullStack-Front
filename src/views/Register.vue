<template>
  <div class="container py-4">
    <h2>Registrar</h2>
    <div class="card p-3">
      <input
        v-model="username"
        class="form-control mb-2"
        placeholder="Usuario"
        autocomplete="username"
      />

      <div class="position-relative mb-2">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="Contraseña"
          autocomplete="new-password"
          @input="validatePasswords"
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

      <div class="position-relative mb-2">
        <input
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="Confirmar contraseña"
          autocomplete="new-password"
          @input="validatePasswords"
        />
        <button
          type="button"
          class="btn btn-icon toggle-password"
          @click="toggleConfirmPassword"
          :aria-pressed="String(showConfirmPassword)"
          :aria-label="showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'"
          title="Mostrar / ocultar confirmación"
        >
          <span v-if="showConfirmPassword" aria-hidden="true">🙈</span>
          <span v-else aria-hidden="true">👁️</span>
        </button>
      </div>

      <div class="mb-2">
        <small class="text-muted">La contraseña debe tener al menos 8 caracteres</small>
      </div>

      <div class="mb-2">
        <div v-if="passwordsMatch && passwordStrong" class="text-success">Las contraseñas coinciden</div>
        <div v-else-if="confirmPassword.length > 0" class="text-danger">Las contraseñas no coinciden o son muy cortas</div>
      </div>

      <div class="d-flex gap-2">
        <button
          @click="doRegister"
          :disabled="loading || !canSubmit"
          class="btn btn-success"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Crear cuenta
        </button>
        <router-link to="/login" class="btn btn-outline-secondary">Volver a login</router-link>
      </div>

      <div class="mt-2" :class="{'text-success': success, 'text-danger': error}">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const message = ref('')
const success = ref(false)
const error = ref(false)
const loading = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}
function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value
}

const passwordsMatch = computed(() => password.value === confirmPassword.value)
const passwordStrong = computed(() => password.value.length >= 8)
const canSubmit = computed(() => username.value.trim() && passwordsMatch.value && passwordStrong.value)

function validatePasswords() {
  return passwordsMatch.value && passwordStrong.value
}

async function doRegister() {
  message.value = ''
  success.value = false
  error.value = false

  if (!canSubmit.value) {
    message.value = 'Completa todos los campos y asegúrate de que las contraseñas coincidan y tengan al menos 8 caracteres'
    error.value = true
    return
  }

  loading.value = true
  try {
    const payload = {
      nombre_de_usuario: username.value.trim(),
      password: password.value
    }

    const r = await auth.register(payload)

    if (r && r.success) {
      message.value = 'Usuario creado. Redirigiendo a login...'
      success.value = true
      setTimeout(() => router.push('/login'), 900)
    } else {
      message.value = (r && r.message) ? r.message : 'Error al crear usuario'
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