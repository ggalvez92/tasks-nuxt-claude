# 📋 PROMPTS PARA BACKEND - NestJS
## Prompts 4-9 para completar la implementación

---

## 🟡 **PROMPT 4: Gestión de Perfil de Usuario**

```
Necesito implementar endpoints para gestión del perfil de usuario en NestJS.

**Contexto:**
- Ya tengo módulo de Users con entidad User
- Tengo autenticación JWT funcionando
- El User tiene campos: id, email, password (hashed), name?, createdAt, updatedAt

**Implementa en el módulo Users:**

1. **Nuevos métodos en UsersService:**
   - `getProfile(userId: string)`: Obtener perfil del usuario (sin password)
   - `updateProfile(userId: string, updateProfileDto: UpdateProfileDto)`: Actualizar nombre/email
   - `changePassword(userId: string, changePasswordDto: ChangePasswordDto)`: Cambiar contraseña
   - `deleteAccount(userId: string, password: string)`: Eliminar cuenta (verificando password)

2. **Endpoints en UsersController o nuevo ProfileController:**
   - GET /users/profile o /profile - Obtener perfil del usuario autenticado
   - PATCH /users/profile o /profile - Actualizar perfil
   - PUT /users/password o /profile/password - Cambiar contraseña
   - DELETE /users/account o /profile - Eliminar cuenta

3. **DTOs:**

   **UpdateProfileDto:**
   - name?: string (max 100 chars)
   - email?: string (valid email)

   **ChangePasswordDto:**
   - currentPassword: string (required)
   - newPassword: string (required, min 8 chars, debe incluir mayúscula, minúscula, número)
   - confirmPassword: string (required, debe coincidir con newPassword)

   **DeleteAccountDto:**
   - password: string (required para confirmar)

   **ProfileResponseDto:**
   - id, email, name, createdAt, updatedAt (sin password)

4. **Validaciones:**
   - Al actualizar email, verificar que no esté en uso por otro usuario
   - Al cambiar password, verificar que currentPassword sea correcto
   - Validar que newPassword cumpla requisitos de seguridad
   - Verificar que confirmPassword coincida con newPassword
   - Al eliminar cuenta, verificar password antes de eliminar

5. **Seguridad:**
   - Hash del nuevo password con bcrypt
   - Nunca retornar el password en las respuestas
   - Al eliminar cuenta, hacer soft delete o hard delete (tú decides)
   - Si es soft delete, invalidar todos los refresh tokens del usuario
   - Usar @UseGuards(JwtAuthGuard) en todos los endpoints
   - Usar @CurrentUser() decorator para obtener el userId

6. **Manejo de errores:**
   - BadRequestException si el email ya existe
   - UnauthorizedException si currentPassword es incorrecta
   - BadRequestException si passwords no coinciden
   - Mensajes descriptivos para el usuario

Implementa todo siguiendo las mejores prácticas de NestJS y seguridad.
```

---

## 🟡 **PROMPT 5: Sistema de Sesiones y Dispositivos**

```
Necesito implementar un sistema de gestión de sesiones y dispositivos conectados en NestJS.

**Contexto:**
- Ya tengo autenticación con JWT (access token y refresh token)
- Los refresh tokens se guardan en una tabla RefreshToken o similar
- Cada refresh token tiene: id, token (hash), userId, deviceLabel, expiresAt, createdAt

**Implementa lo siguiente:**

1. **Mejoras en la entidad RefreshToken** (si no existen):
   - deviceLabel: string (ej: "Chrome on Windows", "Safari on iPhone")
   - ipAddress?: string (IP desde donde se creó)
   - userAgent?: string (User agent completo)
   - lastUsedAt: timestamp (actualizar cada vez que se usa para refresh)

2. **Nuevos métodos en AuthService o crear SessionsService:**
   - `getActiveSessions(userId: string)`: Listar todas las sesiones activas del usuario
   - `revokeSession(userId: string, sessionId: string)`: Revocar una sesión específica
   - `revokeAllSessions(userId: string, exceptCurrent?: string)`: Revokar todas excepto la actual
   - `revokeDeviceSessions(userId: string, deviceLabel: string)`: Revocar sesiones de un dispositivo

3. **Endpoints:**
   - GET /auth/sessions - Listar sesiones activas
   - DELETE /auth/sessions/:sessionId - Cerrar sesión específica
   - DELETE /auth/sessions - Cerrar todas las sesiones excepto la actual
   - DELETE /auth/sessions/device/:deviceLabel - Cerrar sesiones de un dispositivo

4. **DTOs:**

   **SessionResponseDto:**
   - id: string
   - deviceLabel: string
   - ipAddress?: string
   - createdAt: Date
   - lastUsedAt: Date
   - isCurrent: boolean (true si es la sesión actual del request)

   **ActiveSessionsResponseDto:**
   - sessions: SessionResponseDto[]
   - total: number

5. **Funcionalidad:**
   - Al listar sesiones, marcar cuál es la sesión actual (comparar con el refresh token del request)
   - Al revocar sesión, eliminar el refresh token de la DB
   - Al hacer refresh token, actualizar el campo `lastUsedAt`
   - Ordenar sesiones por lastUsedAt descendente
   - Incluir información útil para que el usuario identifique sus dispositivos

6. **Seguridad:**
   - Verificar que el usuario solo pueda ver/revocar sus propias sesiones
   - Al revocar todas las sesiones, permitir opción de mantener la actual
   - Limpiar sesiones expiradas automáticamente (crear un cron job)

7. **Mejora en Login:**
   - Al hacer login, capturar el deviceLabel del body (si lo envían)
   - Si no lo envían, generarlo automáticamente del user-agent
   - Capturar la IP del request
   - Guardar user-agent completo

8. **CRON para limpieza:**
   - Crear un servicio scheduled task que corra cada día
   - Eliminar todos los refresh tokens expirados
   - Usar @nestjs/schedule

Por favor implementa todo el sistema de sesiones con buenas prácticas.
```

---

## 🟡 **PROMPT 6: Recuperación de Contraseña (Forgot Password)**

```
Necesito implementar el flujo completo de recuperación de contraseña en NestJS.

**Implementa lo siguiente:**

1. **Entidad PasswordResetToken:**
   - id: UUID
   - token: string (hash del token, no guardar en plain text)
   - userId: UUID (foreign key)
   - expiresAt: timestamp (válido por 1 hora)
   - used: boolean (default false, marcar como usado después de resetear)
   - createdAt: timestamp

2. **Módulo PasswordReset o agregar al módulo Auth:**

   **Servicio con métodos:**
   - `requestPasswordReset(email: string)`: Crear token y enviar email
   - `validateResetToken(token: string)`: Validar que el token existe, no expiró, y no fue usado
   - `resetPassword(token: string, newPassword: string)`: Resetear password y marcar token como usado
   - `cleanExpiredTokens()`: Cron job para limpiar tokens expirados

3. **Endpoints:**
   - POST /auth/forgot-password - Solicitar reset (recibe email)
   - POST /auth/reset-password - Resetear password (recibe token y newPassword)
   - GET /auth/reset-password/validate/:token - Validar si un token es válido (opcional, para UX del frontend)

4. **DTOs:**

   **ForgotPasswordDto:**
   - email: string (required, valid email)

   **ResetPasswordDto:**
   - token: string (required)
   - newPassword: string (required, min 8 chars, validaciones fuertes)
   - confirmPassword: string (required, debe coincidir)

   **ValidateTokenResponseDto:**
   - valid: boolean
   - message?: string

5. **Lógica de forgot-password:**
   - Verificar que el email existe en la DB
   - Si NO existe, retornar éxito de todas formas (security best practice - no revelar si el email existe)
   - Generar token aleatorio seguro (usar crypto.randomBytes)
   - Guardar hash del token en la DB (usar bcrypt)
   - Crear registro en PasswordResetToken con expiresAt = now + 1 hora
   - **IMPORTANTE:** Si ya existe un token activo para ese usuario, invalidarlo/eliminarlo
   - Enviar email con el link de reset (por ahora solo loguear el token en consola si no tienes email configurado)
   - Retornar siempre éxito (no revelar si el email existe o no)

6. **Lógica de reset-password:**
   - Buscar el token en la DB (comparar hash)
   - Verificar que no expiró (expiresAt > now)
   - Verificar que no fue usado (used = false)
   - Si todo OK, actualizar el password del usuario (hash con bcrypt)
   - Marcar el token como usado (used = true)
   - Invalidar TODOS los refresh tokens del usuario (cerrar todas las sesiones)
   - Opcionalmente: enviar email de confirmación de cambio de password
   - Retornar éxito

7. **Validaciones:**
   - Token debe existir y ser válido
   - Password debe cumplir requisitos (min 8 chars, incluir mayúscula, minúscula, número)
   - confirmPassword debe coincidir con newPassword
   - Token no debe estar expirado
   - Token no debe haber sido usado

8. **Seguridad:**
   - Usar tokens aleatorios criptográficamente seguros
   - Guardar solo el hash del token, nunca en plain text
   - Expiración de 1 hora
   - Permitir solo un uso del token
   - Rate limiting en el endpoint de forgot-password (max 3 requests por hora por IP)
   - Al resetear, invalidar todas las sesiones activas

9. **Email (por ahora mockear):**
   - Crear un EmailService con método `sendPasswordResetEmail(email, resetLink)`
   - Por ahora solo loguear en consola: `console.log('Reset link:', resetLink)`
   - El resetLink debe ser: `${FRONTEND_URL}/reset-password?token=${token}`
   - En el futuro se podrá integrar con SendGrid, AWS SES, etc.

10. **CRON para limpieza:**
   - Scheduled task que corra cada hora
   - Eliminar tokens expirados o usados más viejos de 24 horas

Por favor implementa todo el flujo con seguridad y mejores prácticas.
```

---

## 🟢 **PROMPT 7: Funcionalidades Avanzadas de Tasks**

```
Necesito agregar funcionalidades avanzadas al módulo de Tasks en NestJS.

**Contexto:**
- Ya tengo el módulo de Tasks básico funcionando (CRUD, filtros, stats)
- Tengo las relaciones Task -> User y Task -> Category

**Implementa las siguientes features:**

## 1. SUBTAREAS

**Entidad Subtask:**
- id: UUID
- title: string (required, max 200)
- completed: boolean (default false)
- order: number (para ordenar subtareas)
- taskId: UUID (foreign key a Task)
- createdAt, updatedAt

**Relación:**
- Task tiene muchas Subtasks (one-to-many)
- Agregar campo `subtasks` a la entidad Task

**DTOs:**
- CreateSubtaskDto: { title, order? }
- UpdateSubtaskDto: { title?, completed?, order? }

**Endpoints:**
- POST /tasks/:taskId/subtasks - Crear subtarea
- PATCH /tasks/:taskId/subtasks/:subtaskId - Actualizar subtarea
- DELETE /tasks/:taskId/subtasks/:subtaskId - Eliminar subtarea
- PATCH /tasks/:taskId/subtasks/reorder - Reordenar (recibe array de { id, order })

**Lógica:**
- Al obtener una task, incluir sus subtasks ordenadas por `order`
- Verificar ownership del task padre antes de modificar subtasks
- Al calcular progreso del task, considerar subtasks completadas


## 2. COMENTARIOS

**Entidad Comment:**
- id: UUID
- content: string (required, text)
- taskId: UUID (foreign key)
- userId: UUID (foreign key - autor del comentario)
- createdAt, updatedAt

**DTOs:**
- CreateCommentDto: { content }
- UpdateCommentDto: { content }

**Endpoints:**
- GET /tasks/:taskId/comments - Listar comentarios del task
- POST /tasks/:taskId/comments - Crear comentario
- PATCH /tasks/:taskId/comments/:commentId - Editar comentario
- DELETE /tasks/:taskId/comments/:commentId - Eliminar comentario

**Lógica:**
- Al listar comentarios, incluir información del autor (name, email)
- Solo el autor del comentario puede editarlo/eliminarlo
- Verificar que el usuario tenga acceso al task antes de permitir comentar
- Ordenar por createdAt ascendente


## 3. ARCHIVOS ADJUNTOS

**Entidad TaskAttachment:**
- id: UUID
- filename: string
- originalName: string
- mimeType: string
- size: number (bytes)
- url: string (URL en storage)
- taskId: UUID (foreign key)
- uploadedBy: UUID (foreign key a User)
- createdAt

**DTOs:**
- UploadAttachmentDto: multipart/form-data

**Endpoints:**
- GET /tasks/:taskId/attachments - Listar archivos
- POST /tasks/:taskId/attachments - Subir archivo
- DELETE /tasks/:taskId/attachments/:attachmentId - Eliminar archivo
- GET /tasks/:taskId/attachments/:attachmentId/download - Descargar archivo

**Implementación:**
- Usar multer para manejar uploads
- Guardar archivos en `uploads/tasks/` por ahora (en producción usar S3)
- Límite de tamaño: 10MB por archivo
- Tipos permitidos: images (jpg, png, gif), documents (pdf, doc, docx, txt)
- Generar nombre único para evitar colisiones
- Al eliminar attachment, eliminar archivo del filesystem
- Verificar ownership del task


## 4. TAREAS RECURRENTES

**Agregar a entidad Task:**
- isRecurring: boolean (default false)
- recurrencePattern: JSON {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: number, // cada cuántos días/semanas/meses
    daysOfWeek?: number[], // para weekly: [0,1,2,3,4,5,6]
    dayOfMonth?: number, // para monthly
    endDate?: Date // cuándo termina la recurrencia
  }
- parentTaskId?: UUID (si fue generada por recurrencia)

**Lógica:**
- Al completar un task recurrente, generar automáticamente la siguiente instancia
- Calcular la próxima fecha según el pattern
- Crear nueva task con los mismos datos pero nueva dueDate
- Mantener referencia al task padre

**Endpoints:**
- PATCH /tasks/:id/recurrence - Configurar recurrencia
- DELETE /tasks/:id/recurrence - Eliminar recurrencia
- Al editar task recurrente, preguntar: "esta instancia" o "todas las futuras"

**Validaciones:**
- Verificar que el pattern sea válido
- endDate debe ser posterior a dueDate
- interval debe ser positivo


## 5. EXPORTAR/IMPORTAR

**Endpoints:**
- GET /tasks/export?format=json|csv - Exportar tareas
- POST /tasks/import - Importar tareas

**Lógica de export:**
- Filtrar por los mismos filtros que findAll
- Si format=json: retornar array de tasks con todas sus relaciones
- Si format=csv: convertir a CSV con columnas principales
- Incluir categorías, subtasks en el export

**Lógica de import:**
- Recibir archivo JSON o CSV
- Validar estructura
- Para JSON: validar cada task contra CreateTaskDto
- Crear tasks en batch
- Mapear categorías por nombre (si no existe, crear)
- Retornar resumen: { imported: number, errors: string[] }

**Validaciones:**
- Límite de tareas a importar: 1000 por request
- Validar formato del archivo
- Manejo de errores parciales


## EXTRAS:

**Time Tracking:**
- Endpoint: POST /tasks/:id/time/start - Iniciar timer
- Endpoint: POST /tasks/:id/time/stop - Detener timer y sumar a actualTime
- Guardar tiempo acumulado en el campo actualTime

**Soft Delete con restore:**
- Endpoint: POST /tasks/:id/restore - Restaurar task eliminada
- Listar eliminadas: GET /tasks/trash
- Eliminar permanentemente: DELETE /tasks/:id/permanent

Por favor implementa todas estas funcionalidades siguiendo las mejores prácticas de NestJS. Si alguna feature es muy compleja, divídela en pasos.
```

---

## 🔵 **PROMPT 8: OAuth y Social Login (Opcional)**

```
Necesito implementar OAuth para login con Google y GitHub en NestJS usando Passport.

**Contexto:**
- Ya tengo autenticación local (email/password) con JWT
- Necesito permitir login con Google y GitHub
- Al hacer OAuth login, debo crear o vincular cuentas

**Implementa lo siguiente:**

1. **Actualizar entidad User:**
   - googleId?: string
   - githubId?: string
   - avatar?: string (URL de la foto de perfil)
   - provider: enum ['local', 'google', 'github'] (puede tener múltiples)

2. **Instalar dependencias:**
   - passport-google-oauth20
   - passport-github2
   - @nestjs/passport

3. **Estrategias de Passport:**
   - GoogleStrategy en auth/strategies/google.strategy.ts
   - GithubStrategy en auth/strategies/github.strategy.ts

4. **Guards:**
   - GoogleAuthGuard
   - GithubAuthGuard

5. **Endpoints:**
   - GET /auth/google - Redirige a Google OAuth
   - GET /auth/google/callback - Callback de Google
   - GET /auth/github - Redirige a GitHub OAuth
   - GET /auth/github/callback - Callback de GitHub

6. **Lógica de OAuth:**
   - Si el email ya existe y tiene googleId/githubId, hacer login
   - Si el email existe pero NO tiene googleId/githubId, vincular cuenta
   - Si el email NO existe, crear nuevo usuario con provider
   - Generar access token y refresh token
   - Redirigir al frontend con los tokens

7. **Configuración:**
   - Variables de entorno:
     * GOOGLE_CLIENT_ID
     * GOOGLE_CLIENT_SECRET
     * GOOGLE_CALLBACK_URL
     * GITHUB_CLIENT_ID
     * GITHUB_CLIENT_SECRET
     * GITHUB_CALLBACK_URL

8. **Vincular/Desvincular proveedores:**
   - POST /users/link/google - Vincular cuenta de Google
   - POST /users/link/github - Vincular cuenta de GitHub
   - DELETE /users/unlink/google - Desvincular Google
   - DELETE /users/unlink/github - Desvincular GitHub

9. **Seguridad:**
   - Verificar que no se elimine el último método de autenticación
   - Si solo tiene OAuth y no password, no permitir desvincular sin antes establecer password

Implementa OAuth con Google y GitHub usando las mejores prácticas.
```

---

## 🔧 **PROMPT 9: Configuración y Optimización**

```
Necesito optimizar y configurar correctamente mi backend en NestJS.

**Implementa lo siguiente:**

1. **CORS:**
   - Configurar CORS en main.ts
   - Permitir origen: process.env.FRONTEND_URL
   - Permitir credentials: true
   - Métodos: GET, POST, PUT, PATCH, DELETE
   - Headers: Content-Type, Authorization

2. **Rate Limiting:**
   - Instalar @nestjs/throttler
   - Configurar rate limiting global: 100 requests por minuto
   - Rate limiting especial para auth endpoints: 5 requests por minuto para login/register/forgot-password

3. **Validation Pipe Global:**
   - Configurar ValidationPipe global en main.ts
   - whitelist: true (eliminar props no definidas en DTO)
   - forbidNonWhitelisted: true (error si envían props extras)
   - transform: true (transformar tipos automáticamente)

4. **Helmet (Seguridad):**
   - Instalar helmet
   - Configurar en main.ts para headers de seguridad

5. **Logging:**
   - Configurar logger de NestJS
   - Logger personalizado para requests (interceptor)
   - Log de errores en producción

6. **Variables de entorno:**
   - Usar @nestjs/config
   - Archivo .env con todas las variables necesarias
   - Validación de variables de entorno requeridas

7. **Swagger/OpenAPI:**
   - Configurar Swagger en /api/docs
   - Documentar todos los endpoints con @ApiOperation, @ApiResponse
   - Agregar authentication bearer token
   - Tags por módulo

8. **Database:**
   - Configurar migraciones de TypeORM
   - Scripts npm para crear/correr migraciones
   - Indexes en campos comunes (userId, status, priority, etc.)
   - Configurar pool de conexiones

9. **Global Exception Filter:**
   - Crear custom exception filter
   - Formatear errores consistentemente
   - No exponer detalles internos en producción

10. **Health Check:**
    - Endpoint GET /health
    - Verificar conexión a base de datos
    - Retornar status y version de la API

Por favor implementa todas estas configuraciones siguiendo las mejores prácticas.
```

---

## 📝 **ORDEN DE EJECUCIÓN RECOMENDADO**

1. ✅ **PROMPT 4** - Gestión de perfil (empezar por aquí)
2. ✅ **PROMPT 5** - Sesiones y dispositivos
3. ✅ **PROMPT 6** - Recuperación de contraseña
4. ⭐ **PROMPT 9** - Configuración y optimización (importante)
5. 🚀 **PROMPT 7** - Features avanzadas (dividir en partes si es necesario)
6. 🎁 **PROMPT 8** - OAuth (opcional, al final)

---

## ✅ **VARIABLES DE ENTORNO NECESARIAS**

Asegúrate de tener en tu `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu-password
DATABASE_NAME=tasks_db

# JWT
JWT_SECRET=tu-super-secreto-seguro-jwt
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu-super-secreto-refresh
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (para futuro)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
```

---

## 💡 NOTAS IMPORTANTES

1. **Ejecuta los prompts uno a la vez** - no intentes hacer todo junto
2. **Verifica que funcione** cada implementación antes de pasar a la siguiente
3. **Prueba con Postman/Thunder Client** cada endpoint
4. **Ajusta según tu estructura actual** - puede que necesites adaptar nombres de archivos/carpetas
5. **El PROMPT 7 es muy largo** - considera dividirlo en partes:
   - Parte A: Subtareas y Comentarios
   - Parte B: Archivos Adjuntos
   - Parte C: Recurrencia y Export/Import

---

🚀 **¡Comienza con el PROMPT 4 y ve avanzando secuencialmente!**
