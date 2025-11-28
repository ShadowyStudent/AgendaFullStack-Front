<template>
  <div class="col-12 col-sm-6 col-md-4 col-lg-3">
    <div class="card h-100 contact-card">
      <img :src="photoSrc" class="card-img-top contact-img" alt="Foto contacto" />
      <div class="card-body">
        <h5 class="card-title mb-1">{{ contact.nombre }} {{ contact.apellido }}</h5>
        <p class="card-text mb-1 text-muted small">{{ contact.telefono || 'Sin teléfono' }}</p>
        <div class="d-flex justify-content-end">
          <router-link :to="`/agenda/actualizar/${contact.id}`" class="btn btn-sm btn-outline-primary me-2">Actualizar</router-link>
          <button @click="onDelete" class="btn btn-sm btn-outline-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '../plugins/api'
import { useRouter } from 'vue-router'

const props = defineProps({
  contact: { type: Object, required: true }
})

const router = useRouter()

const photoSrc = computed(() => {
  return props.contact.foto && props.contact.foto.trim() !== ''
    ? props.contact.foto
    : '/placeholder-contact.png'
})

async function onDelete() {
  if (!confirm('Eliminar contacto?')) return
  try {
    await api.post('/contactos/eliminar.php', { id: props.contact.id })
    router.go(0)
  } catch (e) {
    alert(e?.message || 'Error al eliminar')
  }
}
</script>

<style scoped>
.contact-img {
  object-fit: cover;
  height: 160px;
  width: 100%;
  background: #f1f1f1;
}
.contact-card { min-height: 260px; display:flex; flex-direction:column; }
.card-body { flex: 1 1 auto; display:flex; flex-direction:column; justify-content:space-between; }
</style>