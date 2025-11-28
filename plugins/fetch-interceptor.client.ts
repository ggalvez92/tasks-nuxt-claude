/**
 * Fetch Interceptor Plugin
 * Intercepta todas las peticiones $fetch para manejar errores 401
 * y refrescar automáticamente los tokens cuando sea necesario
 */

export default defineNuxtPlugin(() => {
  const apiClient = useApiClient();
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: any = null) => {
    failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    failedQueue = [];
  };

  // Hook para interceptar errores de $fetch
  const originalFetch = globalThis.$fetch;

  globalThis.$fetch = async (request: any, options?: any) => {
    try {
      return await originalFetch(request, options);
    } catch (error: any) {
      // Verificar si es un error 401
      const is401 =
        error?.statusCode === 401 ||
        error?.response?.status === 401 ||
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('401');

      // Solo intentar refresh si:
      // 1. Es un error 401
      // 2. No es una petición al endpoint de refresh (evitar loops infinitos)
      // 3. No es una petición de login/register
      const shouldTryRefresh =
        is401 &&
        !request?.toString().includes('/api/backend/auth/refresh') &&
        !request?.toString().includes('/api/backend/auth/login') &&
        !request?.toString().includes('/api/backend/auth/register');

      if (!shouldTryRefresh) {
        throw error;
      }

      // Si ya estamos refrescando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Reintentar la petición original después del refresh
          return originalFetch(request, options);
        });
      }

      isRefreshing = true;

      try {
        // Intentar refrescar el token
        console.log('[Fetch Interceptor] Token expired, attempting refresh...');
        await apiClient.refresh();
        console.log('[Fetch Interceptor] Token refreshed successfully');

        // Procesar la cola de peticiones pendientes
        processQueue();

        // Reintentar la petición original
        return await originalFetch(request, options);
      } catch (refreshError) {
        // Si falla el refresh, procesar la cola con error
        processQueue(refreshError);

        // Redirigir al login
        console.error('[Fetch Interceptor] Token refresh failed, redirecting to login');
        navigateTo('/login');

        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
  };

  // Copiar propiedades del $fetch original
  Object.setPrototypeOf(globalThis.$fetch, originalFetch);
  Object.keys(originalFetch).forEach(key => {
    if (typeof (originalFetch as any)[key] === 'function') {
      (globalThis.$fetch as any)[key] = (originalFetch as any)[key].bind(originalFetch);
    }
  });
});
