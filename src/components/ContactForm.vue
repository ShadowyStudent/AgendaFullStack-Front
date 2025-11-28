<template>
  <form @submit.prevent="submit" enctype="multipart/form-data" class="contact-form">
    <div class="row">
      <div class="col-md-4 mb-2">
        <input v-model="local.nombre" class="form-control" placeholder="Nombre" required maxlength="100" :disabled="readOnly" />
      </div>
      <div class="col-md-4 mb-2">
        <input v-model="local.apellido" class="form-control" placeholder="Apellido" maxlength="100" :disabled="readOnly" />
      </div>
      <div class="col-md-4 mb-2">
        <input v-model="local.telefono" class="form-control" placeholder="Teléfono" required maxlength="20" :disabled="readOnly" />
      </div>
    </div>

    <div class="row mt-2">
      <div class="col-md-6 mb-2">
        <input v-model="local.email" type="email" class="form-control" placeholder="Email" maxlength="120" :disabled="readOnly" />
      </div>
      <div class="col-md-6 mb-2">
        <input v-model="local.direccion" class="form-control" placeholder="Dirección" maxlength="255" :disabled="readOnly" />
      </div>
    </div>

    <div class="mt-2">
      <textarea v-model="local.notas" class="form-control" placeholder="Notas" :disabled="readOnly"></textarea>
    </div>

    <div class="mt-2 d-flex gap-3 align-items-center">
      <div>
        <img :src="local.fotoResolved || defaultAvatar" crossorigin="anonymous" style="width:96px;height:96px;object-fit:cover;border-radius:6px" alt="foto" />
      </div>
      <div style="flex:1">
        <label class="form-label small text-muted">Foto (opcional)</label>
        <input ref="fileInput" type="file" class="form-control" accept="image/*" @change="onFile" :disabled="readOnly" />
      </div>
    </div>

    <div class="mt-3 d-flex align-items-center">
      <button v-if="!readOnly" :disabled="loading" class="btn btn-primary">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ mode === 'edit' ? 'Guardar' : 'Crear' }}
      </button>

      <button type="button" @click="onCancel" class="btn btn-secondary ms-2">Cancelar</button>

      <div class="ms-3">
        <span class="text-success" v-if="msg">{{ msg }}</span>
        <span class="text-danger" v-if="err">{{ err }}</span>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../plugins/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  id: { type: [String, Number], default: null },
  mode: { type: String, default: 'create' },
  readOnly: { type: Boolean, default: false }
})
const emit = defineEmits(['created', 'updated', 'cancel'])

const route = useRoute()
const auth = useAuthStore()

const ENV_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const BASE = ENV_BASE || (window.location.origin + '/agendafullstack')
const defaultAvatar = `${BASE}/backend/uploads/default-avatar.png`

function buildPhotoUrl(value, folder = 'contactos') {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const name = encodeURIComponent(String(value).replace(/^.*[\\/]/, ''))
  return `${BASE}/backend/uploads/${folder}/${name}`
}

const local = ref({
  id: null,
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
  foto: null,
  fotoResolved: null
})
const fileInput = ref(null)
const fileData = ref(null)
const msg = ref('')
const err = ref('')
const loading = ref(false)

const effectiveId = computed(() => {
  if (props.id) return String(props.id)
  if (route.params.id) return String(route.params.id)
  return null
})

let controller = null

async function fetchById(id) {
  if (!id) return
  loading.value = true
  err.value = ''
  msg.value = ''
  fileData.value = null
  if (!auth.token && !localStorage.getItem('agenda_token')) {
    loading.value = false
    err.value = 'No autorizado'
    return
  }
  if (controller) {
    try { controller.abort() } catch {}
  }
  controller = new AbortController()
  try {
    const res = await api.get('/contactos/index.php', {
      params: { id, _ts: Date.now() },
      signal: controller.signal
    })
    let src = null
    if (res && res.success) {
      if (res.data && res.data.id) {
        src = res.data
      } else if (res.data && Array.isArray(res.data.contacts) && res.data.contacts.length) {
        const found = res.data.contacts.find(c => String(c.id) === String(id))
        src = found || res.data.contacts[0]
      } else if (res.data && res.data.contact) {
        src = res.data.contact
      }
    }
    if (!src) {
      err.value = res?.message || 'No se encontró el contacto'
      loading.value = false
      return
    }
    local.value = {
      id: src.id ?? null,
      nombre: src.nombre ?? '',
      apellido: src.apellido ?? '',
      telefono: src.telefono ?? '',
      email: src.email ?? '',
      direccion: src.direccion ?? '',
      notas: src.notas ?? '',
      foto: src.foto ?? null,
      fotoResolved: buildPhotoUrl(src.foto) || defaultAvatar
    }
  } catch (e) {
    if (e?.name !== 'AbortError') err.value = e?.message || 'Error de conexión'
  } finally {
    loading.value = false
    controller = null
  }
}

watch(() => props.initial, (v) => {
  if (v && Object.keys(v).length) {
    local.value = {
      id: v.id ?? null,
      nombre: v.nombre ?? '',
      apellido: v.apellido ?? '',
      telefono: v.telefono ?? '',
      email: v.email ?? '',
      direccion: v.direccion ?? '',
      notas: v.notas ?? '',
      foto: v.foto ?? null,
      fotoResolved: buildPhotoUrl(v.foto) || defaultAvatar
    }
    fileData.value = null
    if (fileInput.value && fileInput.value.value !== undefined) fileInput.value.value = ''
  }
}, { immediate: true, deep: true })

watch(effectiveId, (nid) => {
  if (nid) fetchById(nid)
}, { immediate: true })

function onCancel() {
  emit('cancel')
}

function onFile(e) {
  const f = e?.target?.files?.[0] ?? null
  fileData.value = f
  if (f) {
    try {
      const url = URL.createObjectURL(f)
      local.value.fotoResolved = url
    } catch {
      local.value.fotoResolved = defaultAvatar
    }
  }
}

async function submit() {
  msg.value = ''
  err.value = ''
  if (!local.value.nombre || !local.value.telefono) {
    err.value = 'Nombre y teléfono son obligatorios'
    return
  }
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('nombre', local.value.nombre.trim())
    fd.append('apellido', local.value.apellido.trim())
    fd.append('telefono', local.value.telefono.trim())
    fd.append('email', local.value.email.trim())
    fd.append('direccion', local.value.direccion.trim())
    fd.append('notas', local.value.notas.trim())
    if (fileData.value) fd.append('foto', fileData.value)
    if (props.mode === 'edit' && local.value.id) {
      fd.append('id', local.value.id)
      const json = await api.post('/contactos/actualizar.php', fd)
      if (json && json.success) {
        msg.value = 'Contacto actualizado'
        emit('updated', json.data ?? { id: local.value.id })
        window.dispatchEvent(new CustomEvent('contact-updated', { detail: json.data ?? { id: local.value.id } }))
      } else {
        err.value = json?.message || 'Error al actualizar contacto'
      }
    } else {
      const json = await api.post('/contactos/crear.php', fd)
      if (json && json.success) {
        msg.value = 'Contacto creado'
        if (fileInput.value && fileInput.value.value !== undefined) fileInput.value.value = ''
        fileData.value = null
        emit('created', json.data)
        window.dispatchEvent(new Event('contact-created'))
      } else {
        err.value = json?.message || 'Error al crear contacto'
      }
    }
  } catch (e) {
    err.value = e?.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>