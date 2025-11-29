<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Mi Agenda</h2>
      <div class="d-flex gap-2">
        <input v-model="q" @input="onSearch" class="form-control search-input" placeholder="Buscar por nombre o apellido" />
        <router-link to="/agenda/crear" class="btn btn-primary">Crear contacto</router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="errorMsg" class="alert alert-danger">
      {{ errorMsg }}
    </div>

    <div v-else>
      <div v-if="contacts.length === 0" class="alert alert-info">
        No tienes contactos aún. Usa el botón Crear contacto para añadir el primero.
      </div>

      <div class="row g-3">
        <div class="col-12 col-md-6 col-lg-4" v-for="c in contacts" :key="c.id">
          <div class="card h-100">
            <div class="card-body d-flex gap-3">
              <img :src="c.fotoResolved" crossorigin="anonymous" class="rounded avatar-thumb" :alt="c.nombre" />
              <div class="flex-grow-1">
                <h5 class="card-title mb-1">{{ c.nombre }} {{ c.apellido }}</h5>
                <p class="mb-1 text-muted">{{ c.telefono }}</p>
                <div class="d-flex gap-2 mt-2">
                  <router-link :to="{ name: 'agenda-read', params: { id: c.id } }" class="btn btn-sm btn-outline-secondary">Leer</router-link>
                  <router-link :to="{ name: 'agenda-update', params: { id: c.id } }" class="btn btn-sm btn-outline-primary">Actualizar</router-link>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteContact(c.id)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <div>Mostrando {{ contacts.length }} de {{ total }}</div>
        <div class="btn-group">
          <button class="btn btn-secondary" :disabled="page <= 1" @click="prevPage">Anterior</button>
          <button class="btn btn-secondary" :disabled="page * limit >= total" @click="nextPage">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../plugins/api'

const router = useRouter()
const auth = useAuthStore()
const contacts = ref([])
const loading = ref(true)
const errorMsg = ref('')
const q = ref('')
const page = ref(1)
const limit = ref(12)
const total = ref(0)
let searchTimer = null

const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const DEFAULT_AVATAR = `${BASE}/backend/uploads/default-avatar.png`

function resolvePhoto(value, folder = 'contactos') {
  if (!value) return DEFAULT_AVATAR
  if (/^https?:\/\//i.test(value)) return value
  const name = encodeURIComponent(String(value).replace(/^.*[\\/]/, ''))
  return `${BASE}/uploads/${folder}/${name}`
}

async function fetchContacts() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams({ page: page.value, limit: limit.value })
    if (q.value.trim()) params.append('q', q.value.trim())
    const res = await api.get(`/contactos/index.php?${params.toString()}`)
    let list = []
    if (res && res.success) {
      if (res.data && Array.isArray(res.data.contacts)) {
        list = res.data.contacts
        total.value = Number(res.data.total || 0)
      } else if (Array.isArray(res.data)) {
        list = res.data
        total.value = list.length
      } else {
        list = []
        total.value = 0
      }
    } else {
      list = []
      total.value = 0
      if (res && res.message) errorMsg.value = res.message
    }
    contacts.value = list.map(item => {
      const id = item.id ?? item.contacto_id ?? null
      const rawFoto = item.foto ?? item.avatar ?? null
      const fotoResolved = rawFoto ? ( /^https?:\/\//i.test(rawFoto) ? rawFoto : resolvePhoto(rawFoto, 'contactos') ) : DEFAULT_AVATAR
      return {
        id,
        foto: rawFoto,
        fotoResolved,
        nombre: item.nombre ?? item.nombre_de_usuario ?? '',
        apellido: item.apellido ?? item.apellidos ?? '',
        telefono: item.telefono ?? item.numero ?? item.celular ?? ''
      }
    })
  } catch (e) {
    console.warn('fetchContacts error', e)
    contacts.value = []
    total.value = 0
    errorMsg.value = e?.message || 'Error al cargar contactos'
  } finally {
    loading.value = false
  }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchContacts()
  }, 350)
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    fetchContacts()
  }
}

function nextPage() {
  if (page.value * limit.value < total.value) {
    page.value++
    fetchContacts()
  }
}

async function deleteContact(id) {
  if (!confirm('Eliminar contacto?')) return
  try {
    const res = await api.post('/contactos/eliminar.php', { id })
    if (res && res.success) {
      fetchContacts()
    } else {
      alert(res?.message || 'Error al eliminar')
    }
  } catch (e) {
    console.error('deleteContact error', e)
    alert('Error al eliminar')
  }
}

function onContactCreated() {
  fetchContacts()
}

function onContactUpdated() {
  fetchContacts()
}

onMounted(() => {
  if (!auth.token) {
    router.push('/login')
    return
  }
  window.addEventListener('contact-created', onContactCreated)
  window.addEventListener('contact-updated', onContactUpdated)
  fetchContacts()
})

onBeforeUnmount(() => {
  window.removeEventListener('contact-created', onContactCreated)
  window.removeEventListener('contact-updated', onContactUpdated)
})
</script>