/**
 * Auth Middleware
 * Protege rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { status, data, getSession } = useAuth()

  // Si el estado está cargando, esperar a que se resuelva
  if (status.value === 'loading') {
    await getSession()
  }

  // Si no hay sesión activa después de intentar obtenerla, redirigir a login
  if (status.value === 'unauthenticated') {
    console.log('[Auth Middleware] User is unauthenticated, redirecting to /login')
    return navigateTo('/login')
  }

  // Si está autenticado, permitir acceso
  console.log('[Auth Middleware] User is authenticated, allowing access')
  return
})
