/**
 * Auto-Refresh Plugin
 * Refresca automáticamente los tokens antes de que expiren
 * Solo se ejecuta en el cliente
 */

export default defineNuxtPlugin(() => {
  const { status, refreshSession } = useAuthService();
  let refreshInterval: NodeJS.Timeout | null = null;

  // Access token expira en 15 minutos
  // Refrescar cada 14 minutos para mantener la sesión activa
  const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutos en milisegundos

  const startAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(async () => {
      // Solo refrescar si el usuario está autenticado
      if (status.value === 'authenticated') {
        try {
          await refreshSession();
          console.log('[Auth] Tokens refreshed automatically');
        } catch (error) {
          console.error('[Auth] Auto-refresh failed:', error);
          // El error ya se maneja en refreshSession (hace logout si falla)
        }
      }
    }, REFRESH_INTERVAL);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  // Iniciar auto-refresh cuando el usuario está autenticado
  watch(
    () => status.value,
    (newStatus) => {
      if (newStatus === 'authenticated') {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
    },
    { immediate: true }
  );

  // Limpiar el intervalo cuando el plugin se destruya
  onBeforeUnmount(() => {
    stopAutoRefresh();
  });
});
