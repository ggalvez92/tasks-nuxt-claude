/**
 * Server-side authentication utilities
 */

import type { H3Event } from 'h3'

/**
 * Extrae el access token del evento del servidor.
 * Lee el token desde las cookies httpOnly.
 *
 * @param event - El evento H3
 * @returns El access token o null si no se encuentra
 */
export async function getAccessToken(event: H3Event): Promise<string | null> {
  // Obtener el access token de las cookies
  const accessToken = getCookie(event, 'accessToken');

  if (!accessToken) {
    console.warn('[Auth Utils] No access token found in cookies');
  }

  return accessToken || null;
}

/**
 * Extrae y valida el access token del evento del servidor.
 * Lanza un error 401 si no se encuentra el token.
 *
 * @param event - El evento H3
 * @returns El access token
 * @throws Error 401 si no hay token disponible
 */
export async function requireAccessToken(event: H3Event): Promise<string> {
  const accessToken = await getAccessToken(event);

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - No access token',
    });
  }

  return accessToken;
}

/**
 * Extrae el refresh token del evento del servidor.
 *
 * @param event - El evento H3
 * @returns El refresh token o null si no se encuentra
 */
export async function getRefreshToken(event: H3Event): Promise<string | null> {
  // Obtener el refresh token de las cookies
  const refreshToken = getCookie(event, 'refreshToken');

  if (!refreshToken) {
    console.warn('[Auth Utils] No refresh token found in cookies');
  }

  return refreshToken || null;
}
