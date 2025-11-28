/**
 * Guest Middleware
 * Redirige usuarios autenticados al dashboard
 * Útil para páginas de login/register
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { status, getSession } = useAuth()

  // Si está autenticado, redirigir al dashboard
  if (status.value === 'authenticated') {
    return navigateTo('/')
  }

  // Si el estado está cargando, esperar a que se resuelva
  if (status.value === 'loading') {
    await getSession()

    if (status.value === 'authenticated') {
      return navigateTo('/')
    }
  }

  // Si no está autenticado, permitir acceso
  return
})
