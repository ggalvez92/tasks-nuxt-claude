/**
 * Revoke All Sessions Endpoint Proxy
 * Cierra todas las sesiones del usuario en todos los dispositivos
 */

import type { MessageResponse } from "~/shared/types/auth";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    const accessToken = await requireAccessToken(event);

    // Hacer request al backend real
    const data = await $fetch<MessageResponse>(`${backendUrl}/auth/revoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Limpiar cookies locales
    deleteCookie(event, "accessToken");
    deleteCookie(event, "refreshToken");

    return data;
  } catch (error: any) {
    // Limpiar cookies incluso si falla
    deleteCookie(event, "accessToken");
    deleteCookie(event, "refreshToken");

    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message:
        error.data?.message || error.message || "Session revocation failed",
    });
  }
});
