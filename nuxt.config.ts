// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@sidebase/nuxt-auth", "@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],
  components: [
    {
      path: '~/shared/components',
      pathPrefix: false,
      global: true
    },
    {
      path: '~/features',
      pathPrefix: false,
      extensions: ['vue']
    },
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  runtimeConfig: {
    // Lo leemos desde .env
    authSecret: process.env.AUTH_SECRET,
    authOrigin: process.env.AUTH_ORIGIN,
    // googleClientId: process.env.GOOGLE_CLIENT_ID,
    // googleClientSecret: process.env.GOOGLE_SECRET_KEY,
    // backendBaseUrl: process.env.BACKEND_URL,
    public: {
      // URL del backend de autenticación (público, accesible desde el cliente)
      backendApiUrl: process.env.NUXT_PUBLIC_BACKEND_API_URL,
    }
  },

  auth: {
    // Usa la variable AUTH_ORIGIN del .env (nombre por defecto en docs)
    originEnvKey: process.env.AUTH_ORIGIN,
    baseURL: process.env.AUTH_ORIGIN + "/api/auth",
    // Provider Auth.js (para sesiones por JWT, OAuth, etc.)
    provider: {
      type: "authjs",
    },

    // Opcional: refresco de sesión en focus/intervalo
    sessionRefresh: {
      enableOnWindowFocus: false, // Desactivado para evitar recargas al hacer click
      enablePeriodically: false, // También desactivamos el refresh periódico
    },
    // Si quieres proteger todo por defecto: globalAppMiddleware: true
  },
});
