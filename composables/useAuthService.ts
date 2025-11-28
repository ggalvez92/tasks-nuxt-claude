/**
 * useAuthService Composable
 * Wrapper sobre nuxt-auth que integra el sistema de cookies httpOnly
 * y proporciona métodos adicionales para registro y manejo de sesiones
 */

import { SessionPlatform } from '~/shared/types/auth';
import type { User } from '~/shared/types/auth';

export const useAuthService = () => {
  // Usar el useAuth original de @sidebase/nuxt-auth
  const { signIn, signOut, status, data: session } = useAuth();
  const apiClient = useApiClient();

  const isLoading = computed(() => status.value === 'loading');
  const isAuthenticated = computed(() => status.value === 'authenticated');
  const user = computed(() => (session.value as any)?.user as User | null);

  /**
   * Registro de nuevo usuario
   */
  const register = async (email: string, password: string): Promise<User> => {
    try {
      const user = await apiClient.register(email, password);
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  /**
   * Login de usuario
   */
  const login = async (
    email: string,
    password: string,
    deviceLabel?: string
  ): Promise<void> => {
    try {
      // Primero llamar al endpoint proxy que configura las cookies httpOnly
      await apiClient.login(email, password, SessionPlatform.WEB, deviceLabel);

      // Luego hacer sign in con nuxt-auth para manejar la sesión del cliente
      await signIn('credentials', {
        email,
        password,
        platform: SessionPlatform.WEB,
        deviceLabel,
        redirect: false,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  /**
   * Logout de usuario
   */
  const logout = async (): Promise<void> => {
    try {
      // Primero llamar al endpoint proxy para cerrar sesión en el backend
      await apiClient.logout();
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      // Siempre hacer sign out en nuxt-auth
      await signOut({ redirect: false });
    }
  };

  /**
   * Refresh manual de tokens
   */
  const refreshSession = async (): Promise<void> => {
    try {
      await apiClient.refresh();
    } catch (error: any) {
      console.error('Refresh error:', error);
      // Si falla el refresh, hacer logout
      await logout();
      throw new Error('Session expired. Please login again.');
    }
  };

  /**
   * Obtener información actualizada del usuario
   */
  const fetchUser = async (): Promise<User> => {
    try {
      const userData = await apiClient.getMe();
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  };

  /**
   * Logout de otro dispositivo
   */
  const logoutDevice = async (jti: string): Promise<void> => {
    try {
      await apiClient.logoutDevice(jti);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout device');
    }
  };

  /**
   * Revocar todas las sesiones
   */
  const revokeAllSessions = async (): Promise<void> => {
    try {
      await apiClient.revokeAll();
    } catch (error: any) {
      console.error('Revoke all error:', error);
    } finally {
      // Siempre hacer sign out en nuxt-auth
      await signOut({ redirect: false });
    }
  };

  /**
   * Manejo de errores de API
   */
  const handleApiError = async (error: any): Promise<boolean> => {
    const refreshed = await apiClient.handleApiError(error);

    if (!refreshed) {
      // Si no se pudo refrescar, hacer logout
      await logout();
    }

    return refreshed;
  };

  return {
    // Estado
    isLoading,
    isAuthenticated,
    user,
    session,
    status,

    // Métodos de autenticación
    register,
    login,
    logout,

    // Métodos de sesión
    refreshSession,
    fetchUser,
    logoutDevice,
    revokeAllSessions,

    // Utilidades
    handleApiError,
  };
};
