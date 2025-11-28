/**
 * Get Categories Endpoint Proxy
 * Obtiene todas las categorías del usuario autenticado
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    // Obtener y validar el access token
    const accessToken = await requireAccessToken(event);

    // Hacer request al backend real
    const data = await $fetch(`${backendUrl}/categories`, {
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
    console.error("❌ [SERVER] Unexpected categories data format:", data);
    return [];
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message:
        error.data?.message || error.message || "Failed to fetch categories",
    });
  }
});
