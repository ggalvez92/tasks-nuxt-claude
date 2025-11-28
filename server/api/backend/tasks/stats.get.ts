/**
 * Get Task Stats Endpoint Proxy
 * Obtiene estadísticas de tareas del usuario autenticado
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    // Obtener el access token de las cookies
    const accessToken = await requireAccessToken(event);

    // Obtener query params (startDate, endDate)
    const query = getQuery(event);

    // Construir URL con query params
    const queryString = new URLSearchParams(query as any).toString();
    const url = `${backendUrl}/tasks/stats${
      queryString ? `?${queryString}` : ""
    }`;

    // Hacer request al backend real
    const data = await $fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data;
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message:
        error.data?.message || error.message || "Failed to fetch task stats",
    });
  }
});
