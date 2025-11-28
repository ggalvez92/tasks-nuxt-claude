/**
 * Login Endpoint Proxy
 * Endpoint del servidor que hace proxy al backend real y maneja cookies httpOnly
 */

import type { LoginRequest, AuthResponse } from '~/shared/types/auth';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || 'http://localhost:5000';

  try {
    const body = await readBody<LoginRequest>(event);

    // Validación básica
    if (!body.email || !body.password || !body.platform) {
      throw createError({
        statusCode: 400,
        message: 'Email, password, and platform are required',
      });
    }

    // Hacer request al backend real
    const data = await $fetch<AuthResponse>(`${backendUrl}/auth/login`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        platform: body.platform,
        deviceLabel: body.deviceLabel,
      },
    });

    // Configurar cookies httpOnly para los tokens
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

    // Retornar solo la información del usuario (sin tokens)
    return {
      user: data.user,
      message: 'Login successful',
    };
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || 'Login failed',
    });
  }
});
