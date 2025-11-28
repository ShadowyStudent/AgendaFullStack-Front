<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link class="navbar-brand" to="/">HOME</router-link>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <template v-if="!logged">
              <li class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/registro">Registrar</router-link>
              </li>
            </template>

            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/agenda">Agenda</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/agenda/crear">Crear</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/perfil">Perfil</router-link>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" @click.prevent="logout">Cerrar sesión</a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <main class="py-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()
const logged = computed(() => !!auth.token)

function logout() {
  auth.clearSession()
  router.push('/login')
}
</script>