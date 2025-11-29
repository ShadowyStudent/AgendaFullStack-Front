import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ghPages } from 'vite-plugin-gh-pages'

export default defineConfig({
  plugins: [vue(), ghPages()],
  base: '/AgendaFullStack-Front/'
})