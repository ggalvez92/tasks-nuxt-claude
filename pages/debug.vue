<!-- pages/debug.vue -->
<template>
  <div class="space-y-6 p-4">
    <h2 class="font-bold text-lg">WhoAmI (useLazyAsyncData)</h2>

    <ClientOnly>
      <template #fallback>
        <!-- Loader mientras se monta en cliente -->
        <div class="flex items-center gap-2">
          <span
            class="inline-block h-4 w-4 rounded-full animate-pulse bg-gray-400"
          />
          <span>Preparando vista…</span>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="pending" class="flex items-center gap-2">
        <span
          class="inline-block h-4 w-4 rounded-full animate-spin bg-gray-400"
        />
        <span>Consultando /api/whoami (10s delay)…</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-red-600">
        Ocurrió un error: {{ error?.message || error }}
        <button class="ml-3 underline" @click="() => refresh()">
          Reintentar
        </button>
      </div>

      <!-- Data -->
      <pre v-else class="rounded bg-gray-100 p-3 overflow-auto">{{ data }}</pre>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { data, pending, error, refresh } = await useLazyAsyncData(
  "whoami", // clave de caché/dedupe
  () => $fetch("/api/whoami"), // tu fetch
  {
    server: false, // ❗ no ejecutar en SSR
    // default: null,                         // opcional: valor inicial
    // transform: (d) => d.external,          // opcional: mapear data
    // getCachedData: (key) => null,          // opcional: control caché
  }
);
</script>
