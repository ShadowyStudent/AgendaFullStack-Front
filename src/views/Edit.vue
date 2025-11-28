<template>
  <div class="container py-4">
    <h2 v-if="!readOnly">Editar contacto</h2>
    <h2 v-else>Ver contacto</h2>

    <div class="card p-3">
      <ContactForm
        :key="currentIdKey"
        :id="currentId"
        :initial="initial"
        :mode="readOnly ? 'read' : 'edit'"
        :read-only="readOnly"
        @updated="onUpdated"
        @created="onCreated"
        @cancel="onCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ContactForm from '../components/ContactForm.vue'

const props = defineProps({
  id: { type: [String, Number], default: null },
  readOnly: { type: Boolean, default: false }
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const currentId = computed(() => String(props.id ?? route.params.id ?? ''))
const currentIdKey = computed(() => currentId.value || 'contact-form')
const initial = ref({})

onMounted(() => {
  if (!auth.token) {
    router.push({ name: 'login' })
  }
})

function onCancel() {
  router.push({ name: 'agenda' })
}

function onUpdated(data) {
  window.dispatchEvent(new Event('contact-created'))
  window.dispatchEvent(new CustomEvent('contact-updated', { detail: data }))
  if (!props.readOnly) router.push({ name: 'agenda' })
}

function onCreated(data) {
  window.dispatchEvent(new Event('contact-created'))
  if (!props.readOnly) router.push({ name: 'agenda' })
}
</script>