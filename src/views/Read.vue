<template>
  <div class="read-contact container py-4">
    <div class="card mx-auto card--max-width">
      <div class="row g-0">
        <div class="col-md-5 d-flex align-items-center justify-content-center p-3">
          <img :src="fotoSrc" alt="foto" class="read-contact__img img-fluid" />
        </div>
        <div class="col-md-7">
          <div class="card-body">
            <h3 class="card-title mb-1">{{ contacto.nombre }} {{ contacto.apellido }}</h3>
            <p class="text-muted mb-3">Creado: <strong>{{ contacto.fecha_creacion || '—' }}</strong></p>

            <div class="mb-2"><strong>Teléfono</strong><div>{{ contacto.telefono || '—' }}</div></div>
            <div class="mb-2"><strong>Email</strong><div>{{ contacto.email || '—' }}</div></div>
            <div class="mb-2"><strong>Dirección</strong><div>{{ contacto.direccion || '—' }}</div></div>
            <div class="mb-2"><strong>Notas</strong><div class="small text-break">{{ contacto.notas || '—' }}</div></div>

            <div class="mt-4 d-flex gap-2">
              <button class="btn btn-primary" @click="onUpdate" :disabled="loading">Actualizar</button>
              <button class="btn btn-danger" @click="onDelete" :disabled="loading">Eliminar</button>
              <button class="btn btn-secondary ms-auto" @click="onBack">Volver</button>
            </div>

            <div class="mt-3">
              <div v-if="msg" class="text-success">{{ msg }}</div>
              <div v-if="err" class="text-danger">{{ err }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../plugins/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const contacto = ref({})
const loading = ref(false)
const err = ref('')
const msg = ref('')

const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const DEFAULT_AVATAR = `${BASE}/uploads/default-avatar.png`

function buildPhotoUrl(value, folder = 'contactos') {
  if (!value) return DEFAULT_AVATAR
  if (/^https?:\/\//i.test(value)) return value
  const name = encodeURIComponent(String(value).replace(/^.*[\\/]/, ''))
  return `${BASE}/uploads/${folder}/${name}`
}

const fotoSrc = computed(() => {
  if (!contacto.value || !contacto.value.foto) return DEFAULT_AVATAR
  return buildPhotoUrl(contacto.value.foto, 'contactos')
})

async function fetchContact() {
  if (!id) return
  loading.value = true
  err.value = ''
  try {
    const res = await api.get('/contactos/index.php', { params: { id, _ts: Date.now() } })
    if (res && res.success) {
      if (res.data && res.data.id) {
        contacto.value = res.data
      } else if (res.data && Array.isArray(res.data.contacts)) {
        const found = res.data.contacts.find(c => String(c.id) === String(id))
        contacto.value = found || res.data.contacts[0] || {}
      } else if (res.data && res.data.contact) {
        contacto.value = res.data.contact
      } else {
        contacto.value = {}
      }
    } else {
      err.value = res?.message || 'No se encontró el contacto'
    }
  } catch (e) {
    err.value = e?.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}

function onUpdate() {
  router.push({ name: 'agenda-update', params: { id: Number(id) } })
}

async function onDelete() {
  if (!confirm('¿Eliminar este contacto?')) return
  loading.value = true
  err.value = ''
  try {
    const res = await api.post('/contactos/eliminar.php', { id })
    if (res && res.success) {
      msg.value = 'Contacto eliminado'
      setTimeout(() => router.push({ name: 'Agenda' }), 700)
    } else {
      err.value = res?.message || 'Error al eliminar'
    }
  } catch (e) {
    err.value = e?.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}

function onBack() {
  router.back()
}

onMounted(fetchContact)
</script>