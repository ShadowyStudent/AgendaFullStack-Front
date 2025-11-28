<template>
  <div class="container py-4">
    <h2>Crear contacto</h2>
    <div class="card p-3">
      <ContactForm @created="onCreated" @cancel="onCancel" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ContactForm from '../components/ContactForm.vue'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  if (!auth.token) router.push('/login')
})

function onCreated() {
  router.push('/agenda')
}

function onCancel() {
  router.push('/agenda')
}
</script>