<template>
  <div class="container py-4">
    <div class="card card--max-width text-center">
      <h1 class="mb-3">Bienvenido a la Agenda</h1>
      <p class="mb-4 text-muted">Inicia sesión o regístrate para gestionar tus contactos de forma rápida y segura.</p>
      <div class="d-flex justify-content-center gap-2">
        <router-link to="/login" class="btn btn-primary btn-lg">Iniciar sesión</router-link>
        <router-link to="/registro" class="btn btn-outline-secondary btn-lg">Registrarse</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>