/**
 * Get Category by ID Endpoint Proxy
 * Obtiene una categoría específica por su ID
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    // Obtener el access token de las cookies
    const accessToken = await requireAccessToken(event);

    // Obtener el ID del path
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Category ID is required",
      });
    }

    // Hacer request al backend real
    const data = await $fetch(`${backendUrl}/categories/${id}`, {
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
        error.data?.message || error.message || "Failed to fetch category",
    });
  }
});
