<!-- components/WhoAmICard.vue -->
<script setup lang="ts">
// Suspende aquí hasta que termine el fetch (esto activa el fallback de <Suspense>)
const whoami = await $fetch("/api/whoami");

// Si prefieres integrar con nuxt composables (y seguir usando Suspense), también sirve:
// const { data: whoami } = await useFetch('/api/whoami', { server: false })
</script>

<template>
  <pre class="rounded bg-gray-100 p-3 overflow-auto">{{ whoami }}</pre>
</template>
