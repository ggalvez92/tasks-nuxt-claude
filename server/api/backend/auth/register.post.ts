/**
 * Register Endpoint Proxy
 * Endpoint del servidor que hace proxy al backend real para registro de usuarios
 */

import type { RegisterRequest, User } from '~/shared/types/auth';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendApiUrl || 'http://localhost:5000';

  try {
    const body = await readBody<RegisterRequest>(event);

    // Validación básica
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

    // Hacer request al backend real
    const data = await $fetch<User>(`${backendUrl}/auth/register`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
      },
    });

    return data;
  } catch (error: any) {
    // Propagar errores del backend
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      message: error.data?.message || error.message || 'Registration failed',
    });
  }
});
