# Sistema de Autenticación Integrado

Este proyecto utiliza un sistema de autenticación personalizado que integra el backend de autenticación (puerto 5000) con Nuxt.js usando cookies httpOnly para máxima seguridad.

## Arquitectura

### Stack Tecnológico
- **Frontend**: Nuxt 3 + Vue 3
- **Auth Framework**: @sidebase/nuxt-auth (next-auth v4)
- **Backend**: API REST en http://localhost:5000
- **Almacenamiento de Tokens**: Cookies httpOnly
- **State Management**: Pinia (opcional para datos adicionales)

### Flujo de Autenticación

```
Usuario → Página Login → useAuthService
                            ↓
                  API Client (useApiClient)
                            ↓
          Server Proxy (/server/api/backend/)
                            ↓
          Backend Real (http://localhost:5000)
                            ↓
                  Cookies httpOnly configuradas
                            ↓
                  Sesión de @sidebase/nuxt-auth
                            ↓
                  Usuario autenticado
```

## Estructura de Archivos

```
├── shared/types/auth.ts              # Tipos TypeScript
├── composables/
│   ├── useApiClient.ts               # Cliente API wrapper
│   └── useAuthService.ts             # Composable de autenticación
├── server/api/backend/
│   ├── auth/
│   │   ├── register.post.ts          # Proxy: Registro
│   │   ├── login.post.ts             # Proxy: Login
│   │   ├── refresh.post.ts           # Proxy: Refresh tokens
│   │   ├── logout.post.ts            # Proxy: Logout
│   │   ├── logout-device.post.ts     # Proxy: Logout dispositivo
│   │   └── revoke.post.ts            # Proxy: Revocar sesiones
│   └── users/
│       └── me.get.ts                 # Proxy: Obtener usuario
├── pages/login.vue                    # Página de login/registro
└── plugins/auth-refresh.client.ts     # Auto-refresh de tokens
```

## Variables de Entorno

Asegúrate de configurar estas variables en tu archivo `.env`:

```env
# Nuxt Auth
AUTH_ORIGIN=http://localhost:3000
AUTH_SECRET=pon-aqui-un-secreto-largo

# Backend API
NUXT_PUBLIC_BACKEND_API_URL=http://localhost:5000
```

## Uso del Sistema de Autenticación

### 1. En Componentes y Páginas

```vue
<script setup lang="ts">
const {
  // Estado
  isAuthenticated,
  isLoading,
  user,

  // Métodos
  login,
  register,
  logout,
  refreshSession,
  fetchUser,
} = useAuthService();

// Login
const handleLogin = async () => {
  try {
    await login('user@example.com', 'password123', 'Chrome on Windows');
    navigateTo('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Registro
const handleRegister = async () => {
  try {
    await register('user@example.com', 'password123');
    // El composable hace login automático después del registro
    navigateTo('/dashboard');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Logout
const handleLogout = async () => {
  await logout();
  navigateTo('/login');
};

// Obtener info del usuario
const getUserInfo = async () => {
  try {
    const userData = await fetchUser();
    console.log('User data:', userData);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
};
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isAuthenticated">
    <p>Welcome, {{ user?.email }}!</p>
    <button @click="handleLogout">Logout</button>
  </div>
  <div v-else>
    <p>Please login</p>
  </div>
</template>
```

### 2. Middleware de Protección de Rutas

Puedes usar el middleware de @sidebase/nuxt-auth para proteger páginas:

```vue
<script setup lang="ts">
// Proteger esta página - redirige a /login si no está autenticado
definePageMeta({
  middleware: 'auth'
});
</script>
```

### 3. Llamadas API Autenticadas

Los tokens se envían automáticamente en las cookies httpOnly, por lo que no necesitas configurar headers manualmente:

```typescript
// En cualquier parte de tu app
const apiClient = useApiClient();

// Obtener usuario actual
const user = await apiClient.getMe();

// Cerrar otra sesión
await apiClient.logoutDevice('session-jti-here');

// Revocar todas las sesiones
await apiClient.revokeAll();
```

### 4. Manejo de Errores y Auto-Refresh

El sistema incluye auto-refresh automático de tokens cada 14 minutos. Si necesitas manejar errores manualmente:

```typescript
const { handleApiError } = useAuthService();

try {
  // Tu llamada API
  const data = await $fetch('/api/some-endpoint');
} catch (error) {
  // Intentar refrescar tokens si es error 401
  const refreshed = await handleApiError(error);

  if (refreshed) {
    // Reintentar la llamada
    const data = await $fetch('/api/some-endpoint');
  } else {
    // El usuario fue deslogueado, redirigir
    navigateTo('/login');
  }
}
```

## Funcionalidades Avanzadas

### Logout de Dispositivo Específico

```typescript
const { logoutDevice } = useAuthService();

// Cerrar sesión de otro dispositivo
await logoutDevice('session-jti-uuid');
```

### Revocar Todas las Sesiones

```typescript
const { revokeAllSessions } = useAuthService();

// Cerrar todas las sesiones en todos los dispositivos
await revokeAllSessions();
```

### Refresh Manual de Tokens

```typescript
const { refreshSession } = useAuthService();

// Refrescar tokens manualmente
try {
  await refreshSession();
} catch (error) {
  // Token expirado, usuario deslogueado
  navigateTo('/login');
}
```

## Seguridad

### Cookies httpOnly
- Los tokens se almacenan en cookies httpOnly, inaccesibles desde JavaScript
- Protege contra ataques XSS
- Las cookies se envían automáticamente en cada request

### CSRF Protection
- Las cookies usan `sameSite: 'lax'` por defecto
- En producción, asegúrate de configurar `secure: true`

### Token Rotation
- El backend implementa rotación de refresh tokens
- Cada refresh invalida el token anterior
- Previene reutilización de tokens robados

## Solución de Problemas

### Error: "No access token found"
- Asegúrate de que el usuario ha hecho login
- Verifica que las cookies se están configurando correctamente
- Revisa la configuración de CORS en el backend

### Error: "Token refresh failed"
- El refresh token puede haber expirado (7 días por defecto)
- El usuario necesita hacer login nuevamente
- Verifica que el backend esté corriendo en el puerto correcto

### La sesión no persiste después de reload
- Verifica que las cookies se están guardando correctamente
- Revisa la configuración de `sameSite` y `secure` en las cookies
- Asegúrate de que el dominio coincide

### Auto-refresh no funciona
- Verifica que el plugin `auth-refresh.client.ts` está cargado
- Revisa la consola del navegador para errores
- El auto-refresh solo funciona cuando el usuario está autenticado

## Endpoints del Backend

El sistema hace proxy a estos endpoints del backend:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/auth/register` | POST | Registrar nuevo usuario |
| `/auth/login` | POST | Iniciar sesión |
| `/auth/refresh` | POST | Refrescar tokens |
| `/auth/logout` | POST | Cerrar sesión actual |
| `/auth/logout-device` | POST | Cerrar sesión de otro dispositivo |
| `/auth/revoke` | POST | Revocar todas las sesiones |
| `/users/me` | GET | Obtener usuario actual |

## Próximos Pasos

1. **Implementar recuperación de contraseña**: Agregar endpoints para reset de password
2. **Sesiones activas**: Crear UI para ver y gestionar sesiones activas
3. **OAuth providers**: Agregar Google, GitHub, etc. usando nuxt-auth
4. **2FA**: Implementar autenticación de dos factores
5. **Rate limiting**: Agregar protección contra brute force

## Referencias

- [Documentación de @sidebase/nuxt-auth](https://sidebase.io/nuxt-auth)
- [Next Auth v4 Docs](https://next-auth.js.org/v4)
- [Nuxt 3 Docs](https://nuxt.com)
