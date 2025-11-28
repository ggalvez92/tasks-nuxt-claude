/**
 * Update Category Endpoint Proxy
 * Actualiza una categoría existente
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

    // Leer el body del request
    const body = await readBody(event);

    // Hacer request al backend real
    const data = await $fetch(`${backendUrl}/categories/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body,
    });

    return data;
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message:
        error.data?.message || error.message || "Failed to update category",
    });
  }
});
