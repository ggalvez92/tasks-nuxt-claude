/**
 * Update Task Status Endpoint Proxy
 * Actualiza solo el estado de una tarea
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
        message: "Task ID is required",
      });
    }

    // Leer el body del request
    const body = await readBody(event);

    if (!body.status) {
      throw createError({
        statusCode: 400,
        message: "Status is required",
      });
    }

    // Hacer request al backend real
    const data = await $fetch(`${backendUrl}/tasks/${id}/status`, {
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
        error.data?.message || error.message || "Failed to update task status",
    });
  }
});
