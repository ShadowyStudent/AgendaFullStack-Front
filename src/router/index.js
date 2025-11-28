import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Agenda = () => import('../views/Agenda.vue')
const Create = () => import('../views/Create.vue')
const Edit = () => import('../views/Edit.vue')
const Read = () => import('../views/Read.vue')
const Profile = () => import('../views/Profile.vue')

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/registro', name: 'register', component: Register, meta: { guestOnly: true } },
  { path: '/agenda', name: 'agenda', component: Agenda, meta: { requiresAuth: true } },
  { path: '/agenda/crear', name: 'agenda-create', component: Create, meta: { requiresAuth: true } },
  { path: '/agenda/leer/:id', name: 'agenda-read', component: Read, meta: { requiresAuth: true }, props: route => ({ id: Number(route.params.id) }) },
  { path: '/agenda/actualizar/:id', name: 'agenda-update', component: Edit, meta: { requiresAuth: true }, props: route => ({ id: Number(route.params.id), readOnly: false }) },
  { path: '/agenda/:id', name: 'agenda-edit', component: Edit, meta: { requiresAuth: true }, props: true },
  { path: '/perfil', name: 'profile', component: Profile, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (typeof auth.restoreFromSession === 'function') auth.restoreFromSession()
  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth)
  const guestOnly = to.matched.some(r => r.meta?.guestOnly)
  const logged = Boolean(auth.token)
  if (requiresAuth && !logged) return next({ name: 'login' })
  if (guestOnly && logged) return next({ name: 'agenda' })
  next()
})

export default router