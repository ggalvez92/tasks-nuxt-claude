/**
 * Refresh Token Endpoint Proxy
 * Lee el refresh token de las cookies httpOnly y obtiene nuevos tokens
 */

import type { RefreshResponse } from '~/shared/types/auth';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || 'http://localhost:5000';

  try {
    // Leer refresh token de las cookies
    const refreshToken = getCookie(event, 'refreshToken');

    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        message: 'No refresh token found',
      });
    }

    // Hacer request al backend real
    const data = await $fetch<RefreshResponse>(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      body: {
        refreshToken,
      },
    });

    // Actualizar cookies con los nuevos tokens
    setCookie(event, 'accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutos
      path: '/',
    });

    setCookie(event, 'refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return {
      message: 'Tokens refreshed successfully',
    };
  } catch (error: any) {
    // Limpiar cookies si el refresh falla
    deleteCookie(event, 'accessToken');
    deleteCookie(event, 'refreshToken');

    throw createError({
      statusCode: error.statusCode || error.response?.status || 401,
      message: error.data?.message || error.message || 'Token refresh failed',
    });
  }
});
