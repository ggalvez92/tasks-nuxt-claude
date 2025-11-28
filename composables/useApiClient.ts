/**
 * API Client Composable
 * Wrapper para todas las llamadas al backend de autenticación
 * Usa cookies httpOnly para almacenamiento seguro de tokens
 */

import type {
  User,
  AuthResponse,
  RefreshResponse,
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  MessageResponse,
  LogoutDeviceRequest,
  SessionPlatform,
} from '~/shared/types/auth';

export const useApiClient = () => {
  const config = useRuntimeConfig();

  // Helper para manejar errores de forma consistente
  const handleError = (error: any): never => {
    if (error.data) {
      throw new Error(error.data.message || 'An error occurred');
    }
    throw new Error(error.message || 'An unexpected error occurred');
  };

  /**
   * AUTH ENDPOINTS
   */

  const register = async (email: string, password: string): Promise<User> => {
    try {
      const data = await $fetch<User>('/api/backend/auth/register', {
        method: 'POST',
        body: { email, password } as RegisterRequest,
      });
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  const login = async (
    email: string,
    password: string,
    platform: SessionPlatform = SessionPlatform.WEB,
    deviceLabel?: string
  ): Promise<AuthResponse> => {
    try {
      const data = await $fetch<AuthResponse>('/api/backend/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
          platform,
          deviceLabel,
        } as LoginRequest,
        // Las cookies se configurarán automáticamente por el servidor
        credentials: 'include',
      });
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  const refresh = async (): Promise<RefreshResponse> => {
    try {
      const data = await $fetch<RefreshResponse>('/api/backend/auth/refresh', {
        method: 'POST',
        // Las cookies se envían automáticamente
        credentials: 'include',
      });
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  const logout = async (): Promise<MessageResponse> => {
    try {
      const data = await $fetch<MessageResponse>('/api/backend/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  const logoutDevice = async (jti: string): Promise<MessageResponse> => {
    try {
      const data = await $fetch<MessageResponse>(
        '/api/backend/auth/logout-device',
        {
          method: 'POST',
          body: { jti } as LogoutDeviceRequest,
          credentials: 'include',
        }
      );
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  const revokeAll = async (): Promise<MessageResponse> => {
    try {
      const data = await $fetch<MessageResponse>('/api/backend/auth/revoke', {
        method: 'POST',
        credentials: 'include',
      });
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  /**
   * USER ENDPOINTS
   */

  const getMe = async (): Promise<User> => {
    try {
      const data = await $fetch<User>('/api/backend/users/me', {
        method: 'GET',
        credentials: 'include',
      });
      return data;
    } catch (error: any) {
      return handleError(error);
    }
  };

  /**
   * UTILITY METHODS
   */

  const handleApiError = async (error: any): Promise<boolean> => {
    // Si es error 401, intentar refrescar tokens
    if (error.message?.includes('401') || error.statusCode === 401) {
      try {
        await refresh();
        return true; // Token refrescado exitosamente
      } catch (refreshError) {
        // Si falla el refresh, el usuario debe hacer login nuevamente
        return false;
      }
    }
    return false;
  };

  return {
    // Auth methods
    register,
    login,
    refresh,
    logout,
    logoutDevice,
    revokeAll,

    // User methods
    getMe,

    // Utility methods
    handleApiError,
  };
};
