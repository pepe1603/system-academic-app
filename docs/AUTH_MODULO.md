# Guía del Módulo de Autenticación

## Descripción General

Este módulo proporciona la funcionalidad de autenticación para el Sistema Académico, integrando el frontend Nuxt 3 con el backend de autenticación a través de Nitro como gateway/proxy.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Nuxt 3)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Pages      │  │ Composables │  │  Nitro Server API  │  │
│  │  - login    │  │  - useAuth  │  │  /api/auth/*        │  │
│  │  - register │  │  - useReg.. │  │                    │  │
│  │  - reset-pw │  │             │  │  Gateway -> Backend │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend API (Java Spring)                │
│                    http://localhost:8080/api/auth            │
└─────────────────────────────────────────────────────────────┘
```

## Configuración de Variables de Entorno

### Desarrollo (.env.development)
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Producción (.env.production)
```env
NUXT_PUBLIC_API_BASE_URL=https://api.tu-dominio.com/api
```

## Rutas del API (Nitro Proxy)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/recovery` | Solicitar recuperación de contraseña |
| POST | `/api/auth/reset-password` | Restablecer contraseña |
| POST | `/api/auth/verify-2fa` | Verificar código 2FA |
| POST | `/api/auth/refresh` | Renovar token |

## Flujos de Usuario

### 1. Login Simple (sin 2FA)
1. Usuario ingresa credenciales
2. Frontend envía POST `/api/auth/login`
3. Backend retorna tokens (accessToken, refreshToken)
4. Frontend guarda en cookies y redirige a `/cpanel`

### 2. Login con 2FA
1. Usuario ingresa credenciales
2. Backend retorna `requiresTwoFactor: true` + `tempToken`
3. Frontend muestra formulario de código 2FA
4. Usuario ingresa código OTP
5. Frontend envía POST `/api/auth/verify-2fa`
6. Backend retorna tokens finales
7. Frontend redirige a `/cpanel`

### 3. Registro de Usuario
1. Usuario llena formulario (estudiante/profesor)
2. Frontend valida datos localmente
3. Envía POST `/api/auth/register`
4. Backend procesa y retorna éxito
5. Frontend muestra mensaje y redirige a login

### 4. Recuperación de Contraseña
1. Usuario ingresa email en `/auth/reset-password`
2. Frontend envía POST `/api/auth/recovery`
3. Backend envía email con token
4. Usuario hace clic en enlace del email
5. Redirige a página de reset con token en URL
6. Usuario ingresa nueva contraseña
7. Frontend envía POST `/api/auth/reset-password`

## Componentes

### Composables

#### useAuth
```typescript
const {
  user,
  accessToken,
  refreshToken,
  tempToken,
  requiresTwoFactor,
  loading,
  isAuthenticated,
  login,
  verifyTwoFactor,
  refreshAuthToken,
  logout,
  hasRole,
  hasPermission
} = useAuth()
```

#### useRegister
```typescript
const { loading, error, register } = useRegister()
```

### Páginas

| Ruta | Layout | Descripción |
|------|--------|-------------|
| `/auth/login` | auth | Login con soporte 2FA |
| `/auth/register` | auth | Registro estudiante/profesor |
| `/auth/reset-password` | auth | Solicitar recuperación |
| `/cpanel` | cPanel | Dashboard después de login |

## Manejo de Errores

El frontend maneja los siguientes códigos de error del backend:

| Código | Descripción | Acción |
|--------|-------------|--------|
| 400 | Validación fallida | Mostrar mensaje de error |
| 401 | Credenciales inválidas | Mostrar mensaje en login |
| 403 | Acceso denegado | Redirigir a login |
| 429 | Rate limit | Mostrar mensaje y esperar |

## Seguridad

1. **Tokens**: Se almacenan en cookiesHttpOnly
2. **HTTPS**: Obligatorio en producción
3. **CORS**: Configurado en Nitro
4. **Rate Limiting**: Manejado por el backend

## Notas de Desarrollo

- Los archivos `.env` están en `.gitignore`
- El API base se configura en `nuxt.config.ts`
- Nitro actúa como proxy para evitar exponer el backend directamente
- Los composables manejan el estado global de autenticación
