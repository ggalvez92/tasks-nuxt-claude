/**
 * Logout Endpoint Proxy
 * Cierra sesión actual y limpia las cookies
 */

import type { MessageResponse } from "~/shared/types/auth";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    // Leer access token de las cookies
    const accessToken = await requireAccessToken(event);

    // Hacer request al backend real
    const data = await $fetch<MessageResponse>(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Limpiar cookies
    deleteCookie(event, "accessToken");
    deleteCookie(event, "refreshToken");

    return data;
  } catch (error: any) {
    // Limpiar cookies incluso si falla
    deleteCookie(event, "accessToken");
    deleteCookie(event, "refreshToken");

    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || "Logout failed",
    });
  }
});
