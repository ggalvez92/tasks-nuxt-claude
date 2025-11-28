/**
 * Create Task Endpoint Proxy
 * Crea una nueva tarea para el usuario autenticado
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || 'http://localhost:5000';

  try {
    // Obtener y validar el access token
    const accessToken = await requireAccessToken(event);

    // Leer el body del request
    const body = await readBody(event);

    // Validación básica
    if (!body.title) {
      throw createError({
        statusCode: 400,
        message: 'Title is required',
      });
    }

    // Hacer request al backend real
    const data = await $fetch(`${backendUrl}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    return data;
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || 'Failed to create task',
    });
  }
});
