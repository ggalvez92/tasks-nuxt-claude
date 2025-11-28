/**
 * Get Tasks Endpoint Proxy
 * Obtiene todas las tareas del usuario autenticado con filtros opcionales
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    // Obtener y validar el access token
    const accessToken = await requireAccessToken(event);

    // Obtener query params (filtros)
    const query = getQuery(event);

    // Construir URL con query params
    const queryString = new URLSearchParams(query as any).toString();
    const url = `${backendUrl}/tasks${queryString ? `?${queryString}` : ""}`;

    // Hacer request al backend real
    const data = await $fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Si el backend devuelve un objeto con una propiedad data, extraerla
    if (data && typeof data === "object" && "data" in data) {
      return data.data;
    }

    // Si el backend devuelve directamente un array, devolverlo
    if (Array.isArray(data)) {
      return data;
    }

    // Si no es ninguno de los anteriores, loguear y devolver array vacío
    console.error("❌ [SERVER] Unexpected data format:", data);
    return [];
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || "Failed to fetch tasks",
    });
  }
});
