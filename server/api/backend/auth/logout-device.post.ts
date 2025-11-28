/**
 * Logout Device Endpoint Proxy
 * Cierra sesión de otro dispositivo específico
 */

import type { LogoutDeviceRequest, MessageResponse } from "~/shared/types/auth";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || "http://localhost:5000";

  try {
    const body = await readBody<LogoutDeviceRequest>(event);
    const accessToken = await requireAccessToken(event);

    if (!body.jti) {
      throw createError({
        statusCode: 400,
        message: "JTI is required",
      });
    }

    // Hacer request al backend real
    const data = await $fetch<MessageResponse>(
      `${backendUrl}/auth/logout-device`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          jti: body.jti,
        },
      }
    );

    return data;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || "Device logout failed",
    });
  }
});
