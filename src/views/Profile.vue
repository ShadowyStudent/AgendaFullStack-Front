<template>
  <div class="container py-4">
    <h2>Perfil</h2>
    <div class="card p-3" v-if="loaded">
      <div class="d-flex gap-3 align-items-center mb-3">
        <img v-if="profile.avatar" :src="profile.avatar" class="rounded-circle avatar-thumb" />
        <div v-else class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center avatar-thumb">No foto</div>
        <div>
          <div><strong>ID</strong> {{ profile.id }}</div>
          <div><strong>Registrado</strong> {{ profile.fecha_registro }}</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Nombre de usuario</label>
        <input v-model="form.nombre_de_usuario" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Avatar</label>
        <input type="file" @change="onFile" accept="image/*" class="form-control" />
        <div v-if="fileName" class="small text-muted mt-1">Archivo: {{ fileName }}</div>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Guardar cambios
        </button>
        <button class="btn btn-outline-secondary" @click="removeAvatar" :disabled="removing || !profile.avatar">Eliminar avatar</button>
        <button class="btn btn-outline-danger ms-auto" @click="logout">Cerrar sesión</button>
      </div>

      <hr />

      <h5>Cambiar contraseña</h5>
      <div class="mb-2">
        <input v-model="passwords.password_actual" type="password" class="form-control mb-2" placeholder="Contraseña actual" />
        <input v-model="passwords.password_nueva" type="password" class="form-control mb-2" placeholder="Nueva contraseña" />
        <input v-model="passwords.password_nueva_confirm" type="password" class="form-control" placeholder="Confirmar nueva contraseña" />
      </div>
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-warning" @click="changePassword" :disabled="changing">
          <span v-if="changing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Cambiar contraseña
        </button>
      </div>

      <div class="mt-3" :class="{'text-success': success, 'text-danger': error}">{{ message }}</div>
    </div>

    <div v-else class="text-muted">Cargando perfil...</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../plugins/api'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const DEFAULT_AVATAR = `${BASE}/uploads/default-avatar.png`

const profile = reactive({ id: null, nombre_de_usuario: '', nombre: '', email: '', avatar: null, fecha_registro: '' })
const form = reactive({ nombre_de_usuario: '' })
const passwords = reactive({ password_actual: '', password_nueva: '', password_nueva_confirm: '' })
const file = ref(null)
const fileName = ref('')
const saving = ref(false)
const changing = ref(false)
const removing = ref(false)
const message = ref('')
const success = ref(false)
const error = ref(false)
const loaded = ref(false)

async function loadProfile() {
  message.value = ''
  success.value = false
  error.value = false
  try {
    const res = await api.get('/perfil.php')
    if (res && res.success && res.data) {
      profile.id = res.data.id
      profile.nombre_de_usuario = res.data.nombre_de_usuario || ''
      profile.nombre = res.data.nombre || ''
      profile.email = res.data.email || ''
      profile.avatar = res.data.avatar || DEFAULT_AVATAR
      profile.fecha_registro = res.data.fecha_registro || ''
      form.nombre_de_usuario = profile.nombre_de_usuario
      loaded.value = true
    } else {
      auth.clearSession()
      router.push('/login')
    }
  } catch (e) {
    message.value = e?.message || 'Error al cargar perfil'
    error.value = true
  }
}

function onFile(e) {
  const f = e.target.files[0]
  if (!f) return
  file.value = f
  fileName.value = f.name
}

async function saveProfile() {
  message.value = ''
  success.value = false
  error.value = false
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('id', profile.id) // obligatorio
    if (form.nombre_de_usuario && form.nombre_de_usuario !== profile.nombre_de_usuario) {
      fd.append('nombre_de_usuario', form.nombre_de_usuario)
    }
    if (file.value) {
      fd.append('foto', file.value)
    }
    const res = await api.post('/editar.php', fd)
    if (res && res.success) {
      message.value = 'Perfil actualizado'
      success.value = true
      await loadProfile()
      file.value = null
      fileName.value = ''
      if (form.nombre_de_usuario && form.nombre_de_usuario !== auth.user?.nombre_de_usuario) {
        auth.user = { ...auth.user, nombre_de_usuario: form.nombre_de_usuario }
      }
    } else {
      message.value = res?.message || 'No se pudo actualizar'
      error.value = true
    }
  } catch (e) {
    message.value = e?.message || 'Error al actualizar'
    error.value = true
  } finally {
    saving.value = false
  }
}

async function removeAvatar() {
  removing.value = true
  message.value = ''
  success.value = false
  error.value = false
  try {
    const fd = new FormData()
    fd.append('id', profile.id)
    fd.append('remove_avatar', 'true')
    const res = await api.post('/editar.php', fd)
    if (res && res.success) {
      message.value = 'Avatar eliminado'
      success.value = true
      await loadProfile()
      if (auth.user) auth.user = { ...auth.user, avatar: null }
    } else {
      message.value = res?.message || 'No se pudo eliminar'
      error.value = true
    }
  } catch (e) {
    message.value = e?.message || 'Error al eliminar'
    error.value = true
  } finally {
    removing.value = false
  }
}

async function changePassword() {
  message.value = ''
  success.value = false
  error.value = false
  if (!passwords.password_actual || !passwords.password_nueva) {
    message.value = 'Rellena los campos de contraseña'
    error.value = true
    return
  }
  if (passwords.password_nueva !== passwords.password_nueva_confirm) {
    message.value = 'La nueva contraseña no coincide'
    error.value = true
    return
  }
  if (passwords.password_nueva.length < 6) {
    message.value = 'La contraseña debe tener al menos 6 caracteres'
    error.value = true
    return
  }
  changing.value = true
  try {
    const fd = new FormData()
    fd.append('id', profile.id)
    fd.append('password_actual', passwords.password_actual)
    fd.append('password_nueva', passwords.password_nueva)
    const res = await api.post('/editar.php', fd)
    if (res && res.success) {
      message.value = 'Contraseña cambiada'
      success.value = true
      passwords.password_actual = ''
      passwords.password_nueva = ''
      passwords.password_nueva_confirm = ''
    } else {
      message.value = res?.message || 'No se pudo cambiar contraseña'
      error.value = true
    }
  } catch (e) {
    message.value = e?.message || 'Error al cambiar contraseña'
    error.value = true
  } finally {
    changing.value = false
  }
}

function logout() {
  auth.clearSession()
  router.push('/login')
}

onMounted(loadProfile)
</script>