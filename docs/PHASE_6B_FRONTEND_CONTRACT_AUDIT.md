# Phase 6B - Frontend Contract Audit

## Resumen Ejecutivo

| Categoría | Count |
|-----------|-------|
| Total Composables | 41 |
| Total Pages | 47 |
| Endpoints Consumidos | ~90+ |
| Métodos HTTP | GET, POST, PUT, DELETE |
| Sin manejo explícito de status codes | ~100% |

---

## 1. Inventario de Endpoints

### Auth APIs

| Endpoint | Método | Payload | Respuesta | Auth | Archivo |
|----------|--------|---------|-----------|------|---------|
| `/api/login` | POST | `{username, password}` | `ApiResponse<LoginDataSuccess \| LoginDataTwoFactor>` | No | useAuth.ts |
| `/api/verify-2fa` | POST | `{tempToken, code}` | `ApiResponse<LoginDataSuccess>` | No | useAuth.ts |
| `/api/refresh` | POST | `{refreshToken}` | `ApiResponse<TokenPair>` | No | useAuth.ts |
| `/api/logout` | POST | - | - | Bearer | useAuth.ts |
| `/api/auth/register` | POST | `{email, ...}` | `ApiResponse<User>` | No | useRegister.ts |
| `/api/registration/init` | POST | `{email}` | `ApiResponse<{verificationToken}>` | No | useRegistration.ts |
| `/api/registration/verify` | POST | `{token, code}` | `ApiResponse<RegistrationResult>` | No | useRegistration.ts |

### Cpanel APIs

| Endpoint | Método | Respuesta | Auth | Notas |
|----------|--------|-----------|------|-------|
| `/api/cpanel/users` | GET, POST | `ApiResponse<UsersPage>` | No | Paginación |
| `/api/cpanel/users/deleted` | GET | `ApiResponse<UsersPage>` | No | |
| `/api/cpanel/users/{id}` | GET, PUT, DELETE | `ApiResponse<User>` | No | |
| `/api/cpanel/users/{id}/sessions` | DELETE | `ApiResponse<void>` | No | |
| `/api/cpanel/users/{id}/unlock` | PUT | `ApiResponse<void>` | No | |
| `/api/cpanel/users/{id}/lock` | PUT | `ApiResponse<void>` | No | |
| `/api/cpanel/users/{id}/ban` | PUT | `ApiResponse<void>` | No | |
| `/api/cpanel/users/roles/permissions` | GET | `ApiResponse<string[]>` | No | |
| `/api/cpanel/students` | GET, POST | `ApiResponse<Student[]>` | No | Sin paginación |
| `/api/cpanel/students/deleted` | GET | `ApiResponse<Student[]>` | No | |
| `/api/cpanel/students/{id}` | GET, PUT, DELETE | `ApiResponse<Student>` | No | |
| `/api/cpanel/courses` | GET, POST | `ApiResponse<Course[]>` | No | Sin paginación |
| `/api/cpanel/courses/deleted` | GET | `ApiResponse<Course[]>` | No | |
| `/api/cpanel/courses/{id}` | GET, PUT, DELETE | `ApiResponse<Course>` | No | |
| `/api/cpanel/generations` | GET, POST | `ApiResponse<Generation[]>` | No | |
| `/api/cpanel/generations/deleted` | GET | `ApiResponse<Generation[]>` | No | |
| `/api/cpanel/generations/{id}` | GET, PUT, DELETE | `ApiResponse<Generation>` | No | |
| `/api/cpanel/teachers` | GET, POST | `ApiResponse<Teacher[]>` | No | |
| `/api/cpanel/teachers/deleted` | GET | `ApiResponse<Teacher[]>` | No | |
| `/api/cpanel/teachers/{id}` | GET, PUT, DELETE | `ApiResponse<Teacher>` | No | |
| `/api/cpanel/enrollments` | GET, POST | `ApiResponse<Enrollment[]>` | No | |
| `/api/cpanel/enrollments/deleted` | GET | `ApiResponse<Enrollment[]>` | No | |
| `/api/cpanel/enrollments/{id}` | GET, PUT, DELETE | `ApiResponse<Enrollment>` | No | |
| `/api/cpanel/grades` | GET, POST | `ApiResponse<Grade[]>` | No | |
| `/api/cpanel/grades/by-enrollment/{id}` | GET | `ApiResponse<Grade[]>` | No | |
| `/api/cpanel/attendances` | GET, POST | `ApiResponse<Attendance[]>` | No | |
| `/api/cpanel/attendances/by-enrollment/{id}` | GET | `ApiResponse<Attendance[]>` | No | |
| `/api/cpanel/conduct` | GET, POST | `ApiResponse<Conduct[]>` | No | |
| `/api/cpanel/conduct/by-enrollment/{id}` | GET | `ApiResponse<Conduct[]>` | No | |
| `/api/cpanel/conduct/by-semester/{id}` | GET | `ApiResponse<Conduct[]>` | No | |
| `/api/cpanel/conduct/incidents` | POST | `ApiResponse<Incident>` | No | |
| `/api/cpanel/conduct/incidents/{id}` | PUT, DELETE | `ApiResponse<Incident>` | No | |
| `/api/cpanel/report-cards` | GET, POST | `ApiResponse<ReportCard[]>` | No | |
| `/api/cpanel/report-cards/by-student/{id}` | GET | `ApiResponse<ReportCard[]>` | No | |
| `/api/cpanel/kardex` | GET, POST | `ApiResponse<KardexRecord[]>` | No | |
| `/api/cpanel/kardex/by-student/{id}` | GET | `ApiResponse<KardexRecord[]>` | No | |
| `/api/cpanel/certificates` | GET, POST | `ApiResponse<Certificate[]>` | No | |
| `/api/cpanel/guardians` | GET, POST | `ApiResponse<Guardian[]>` | No | |
| `/api/cpanel/retake-exams` | GET, POST | `ApiResponse<RetakeExam[]>` | No | |
| `/api/cpanel/extraordinary-exams` | GET, POST | `ApiResponse<ExtraordinaryExam[]>` | No | |
| `/api/cpanel/academic-periods` | GET, POST | `ApiResponse<AcademicPeriod[]>` | No | |
| `/api/cpanel/academic-semesters` | GET, POST | `ApiResponse<AcademicSemester[]>` | No | |
| `/api/cpanel/academic-groups` | GET, POST | `ApiResponse<AcademicGroup[]>` | No | |
| `/api/cpanel/study-plans` | GET, POST | `ApiResponse<StudyPlan[]>` | No | |
| `/api/cpanel/evaluation-types` | GET, POST | `ApiResponse<EvaluationType[]>` | No | |
| `/api/cpanel/evaluation-types/by-course/{id}` | GET | `ApiResponse<EvaluationType[]>` | No | |
| `/api/cpanel/system-configuration` | GET, POST | `ApiResponse<SystemConfiguration[]>` | No | |
| `/api/cpanel/system-configuration/key/{key}` | GET | `ApiResponse<SystemConfiguration>` | No | |
| `/api/cpanel/educational-resources` | GET, POST | `ApiResponse<EducationalResource[]>` | No | |
| `/api/cpanel/access-audit` | GET | `ApiResponse<AccessAudit[]>` | No | |
| `/api/cpanel/student-documents` | GET, POST | `ApiResponse<StudentDocument[]>` | No | |

### Portal APIs

| Endpoint | Método | Payload | Respuesta | Auth | Notas |
|----------|--------|---------|-----------|------|-------|
| `/api/portal/news` | GET, POST | `{title, content, ...}` | `ApiResponse<News[] \| NewsPage>` | Bearer | Paged query param |
| `/api/portal/news/{id}` | GET | - | `ApiResponse<News>` | No | |
| `/api/portal/events` | GET | - | `ApiResponse<Event[] \| EventPage>` | No | Paged query param |
| `/api/portal/events/{id}` | GET | - | `ApiResponse<Event>` | No | |
| `/api/portal/ads` | GET | - | `ApiResponse<Ad[]>` | No | |
| `/api/portal/ads/{position}` | GET | - | `ApiResponse<Ad[]>` | No | Position param |
| `/api/portal/institution` | PUT | `{name, address, ...}` | `ApiResponse<Institution>` | Bearer | |
| `/api/portal/contact` | GET, POST | `{fullName, email, ...}` | `ApiResponse<ContactMessage>` | No | |
| `/api/portal/contact/unread` | GET | - | `ApiResponse<ContactMessage[]>` | Bearer | |
| `/api/portal/contact/{id}/read` | PUT | - | `ApiResponse<void>` | Bearer | |
| `/api/portal/contact/{id}/respond` | POST | `{message}` | `ApiResponse<void>` | Bearer | |
| `/api/health` | GET | - | `{status: 'UP'}` | No | |
| `/api/monitor` | GET | - | `{status, services}` | Bearer | |

---

## 2. Patrones de Respuesta

### ApiResponse<T> (Estándar)
```typescript
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}
```

### PaginatedData<T> / UsersPage
```typescript
interface PaginatedData<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
```

### Inconsistencias Detectadas

| Composable | Tipo de Respuesta | Notes |
|------------|-------------------|-------|
| `useUsers` | `ApiResponse<UsersPage>` | Paginated |
| `useCourses` | `ApiResponse<Course[]>` | Flat array |
| `useStudents` | `ApiResponse<Student[]>` | Flat array |
| `usePortalContent.getNews` | `News[] \| NewsPage` | Union type |

---

## 3. Manejo de Errores - Análisis

### Situación Actual

**NO existe manejo explícito de status codes HTTP** en ningún composable.

### Patrón Genérico (100% de composables)
```typescript
catch (err: unknown) {
  const e = err as { data?: { message?: string } }
  error.value = e.data?.message || 'Error generic'
  return null
}
```

### Status Codes No Manejados

| Status | Escenario | Impacto |
|--------|-----------|---------|
| 401 | No autenticado | No redirige a login |
| 403 | Sin permisos | No muestra mensaje apropiado |
| 404 | Recurso no existe | Muestra "No encontrado" genérico |
| 409 | Conflicto (duplicado) | No informa al usuario |
| 422 | Validación fallida | No muestra errores de campo |

### Recomendación
Crear un error handler centralizado que:
1. Detecte status code
2. Redirija a login en 401
3. Muestre mensaje específico según código
4. Loguee errores para debugging

---

## 4. Autenticación - Análisis

### Patrones de Auth

| Tipo | Composable | Header |
|------|-----------|--------|
| Ninguno | useStudents, useCourses, useUsers, etc. | - |
| Bearer Token | usePortalContentAdmin | `Authorization: Bearer ${token}` |
| Bearer Token | useAuth (logout) | `Authorization: Bearer ${token}` |
| Bearer Token | useServerStatus (monitor) | `Authorization: Bearer ${token}` |
| Cookie | useAuth (refresh) | Cookie automática |

### Observación
La mayoría de endpoints cpanel NO usan header de autenticación. Esto sugiere que:
1. El backend usa autenticación por cookie/session
2. O hay un middleware que extrae el token del request

---

## 5. Tipos Duplicados - Inventario

### ApiResponse<T>
- Definido en: `app/types/api.ts` (centralizado)
- Redefinido en: 25+ composables (duplicado)

### PaginatedData<T>
- Definido en: `app/types/api.ts`
- Redefinido en: `useUsers.ts` (UsersPage)
- Redefinido en: `usePortalContent.ts` (NewsPage, EventPage)

### Create/Update DTOs
- Cada composable define sus propios `CreateXData`, `UpdateXData`
- No hay shared DTOs base

---

## 6. Uso de `any` - Hotspots

| Archivo | Línea | Tipo | Descripción |
|---------|-------|------|-------------|
| useStudents.ts | 206 | `formatDateToString(date: any)` | Normalización fecha |
| useStudents.ts | 218 | `normalizeStudent(data: any)` | Normalización estudiante |
| usePortalContentAdmin.ts | 48 | `selectedAd = ref<any>(null)` | Tipo any |
| portal/noticias/index.vue | 17 | `selectedNews = ref<any>(null)` | Antes de fix |

---

## 7. Server API Endpoints (Nitro)

### Inventario de Rutas Server

```
server/api/
├── login.post.ts           → POST /api/login (proxy to backend)
├── logout.post.ts          → POST /api/logout
├── refresh.post.ts         → POST /api/refresh
├── health.get.ts          → GET /api/health
├── monitor.get.ts         → GET /api/monitor
├── cpanel/
│   ├── students/
│   │   ├── index.get.ts   → GET /api/cpanel/students
│   │   ├── index.post.ts   → POST /api/cpanel/students
│   │   └── [id].get.ts    → GET /api/cpanel/students/{id}
│   ├── users/
│   │   └── ... (similar pattern)
│   └── [entity]/...
└── portal/
    ├── news.get.ts
    ├── institution.put.ts
    └── ...
```

### Observación
Server API actúa como proxy BFF. No hay lógica de negocio, solo forwarding.

---

## 8. Findings Principales

### 🔴 Crítico
1. **0 manejo de errores HTTP** - Sin respuestas diferenciadas para 401/403/404/409/422
2. **Duplicación de tipos** - ApiResponse definido 25+ veces
3. **Inconsistencia de paginación** - Algunos usan Page, otros arrays

### 🟡 Medio
4. **`any` en normalización** - formatDateToString, normalizeStudent usan any
5. **Auth inconsistente** - Algunos usan Bearer, otros no
6. **Sin validation DTOs** - No se validan payloads antes de envío

### 🟢 Bajo
7. **Endpoint naming** - Todos usan `/api/cpanel/` prefix consistent
8. **CRUD pattern** - Estandarizado en todos los composables

---

## 9. Recomendaciones

### Inmediato
1. Crear error handler centralizado en plugin `api-error-handler.client.ts`
2. Unificar `ApiResponse<T>` en `app/types/api.ts` y eliminar duplicados
3. Agregar type guard para `News[] | NewsPage` discriminated union

### Corto Plazo
4. Agregar manejo de 401 (redirect to login)
5. Crear base DTO types compartidos
6. Implementar Zod validation en composables

### Largo Plazo
7. Considerar OpenAPI contract con backend
8. Generar tipos automáticamente del spec
9. Implementar retry logic con exponential backoff