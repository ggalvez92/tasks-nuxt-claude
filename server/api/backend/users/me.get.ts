/**
 * Get Current User Endpoint Proxy
 * Obtiene la información del usuario autenticado
 */

import type { User } from '~/shared/types/auth';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || 'http://localhost:5000';

  try {
    // Obtener y validar el access token
    const accessToken = await requireAccessToken(event);

    // Hacer request al backend real
    const data = await $fetch<User>(`${backendUrl}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || 'Failed to fetch user',
    });
  }
});
