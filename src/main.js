import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/style.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const auth = useAuthStore()
if (typeof auth.restoreFromSession === 'function') auth.restoreFromSession()
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    try { auth.clearSession() } catch (e) {}
    try { router.push({ name: 'login' }) } catch (e) {}
  })
}

router.isReady().then(() => app.mount('#app'))