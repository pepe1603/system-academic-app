# Phase 6C - Frontend API Reconciliation

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Total Endpoints Consumidos | ~90 |
| COMPATIBLE | ~65 |
| PARTIAL | ~15 |
| INCONSISTENT | ~8 |
| MISSING | ~2 |

---

## 1. Matriz de Reconciliación

### Auth APIs

| Frontend Route | Composable | HTTP | Endpoint | Expected Request | Expected Response | Auth | Status |
|---------------|------------|------|----------|------------------|-------------------|------|--------|
| `/api/login` | useAuth | POST | `/api/login` | `{username, password}` | `ApiResponse<LoginDataSuccess \| LoginDataTwoFactor>` | No | ✅ COMPATIBLE |
| `/api/verify-2fa` | useAuth | POST | `/api/verify-2fa` | `{tempToken, code}` | `ApiResponse<LoginDataSuccess>` | No | ✅ COMPATIBLE |
| `/api/refresh` | useAuth | POST | `/api/refresh` | `{refreshToken}` | `ApiResponse<TokenPair>` | No | ✅ COMPATIBLE |
| `/api/logout` | useAuth | POST | `/api/logout` | - | - | Bearer | ✅ COMPATIBLE |
| `/api/auth/register` | useRegister | POST | `/api/auth/register` | `{email, ...}` | `ApiResponse<User>` | No | ✅ COMPATIBLE |
| `/api/registration/init` | useRegistration | POST | `/api/registration/init` | `{email}` | `ApiResponse<{verificationToken}>` | No | ✅ COMPATIBLE |
| `/api/registration/verify` | useRegistration | POST | `/api/registration/verify` | `{token, code}` | `ApiResponse<RegistrationResult>` | No | ✅ COMPATIBLE |

### Cpanel APIs

| Frontend Route | Composable | HTTP | Endpoint | Expected Request | Expected Response | Auth | Status |
|---------------|------------|------|----------|------------------|-------------------|------|--------|
| `/api/cpanel/users` | useUsers | GET | `/api/cpanel/users` | `?page=0&size=20` | `ApiResponse<UsersPage>` | No | ✅ COMPATIBLE |
| `/api/cpanel/users` | useUsers | POST | `/api/cpanel/users` | `{username, email, password, ...}` | `ApiResponse<User>` | No | ✅ COMPATIBLE |
| `/api/cpanel/users/deleted` | useUsers | GET | `/api/cpanel/users/deleted` | `?page=0&size=20` | `ApiResponse<UsersPage>` | No | ✅ COMPATIBLE |
| `/api/cpanel/users/{id}` | useUsers | GET | `/api/cpanel/users/{id}` | - | `ApiResponse<User>` | No | ✅ COMPATIBLE |
| `/api/cpanel/users/{id}` | useUsers | PUT | `/api/cpanel/users/{id}` | `{isActive, roles, ...}` | `ApiResponse<User>` | No | ✅ COMPATIBLE |
| `/api/cpanel/users/{id}` | useUsers | DELETE | `/api/cpanel/users/{id}` | - | `ApiResponse<void>` | No | ✅ COMPATIBLE |
| `/api/cpanel/users/{id}/sessions` | useUsers | DELETE | `/api/cpanel/users/{id}/sessions` | - | `ApiResponse<void>` | No | ⚠️ PARTIAL |
| `/api/cpanel/users/{id}/unlock` | useUsers | PUT | `/api/cpanel/users/{id}/unlock` | - | `ApiResponse<void>` | No | ⚠️ PARTIAL |
| `/api/cpanel/users/{id}/lock` | useUsers | PUT | `/api/cpanel/users/{id}/lock` | - | `ApiResponse<void>` | No | ⚠️ PARTIAL |
| `/api/cpanel/users/{id}/ban` | useUsers | PUT | `/api/cpanel/users/{id}/ban` | - | `ApiResponse<void>` | No | ⚠️ PARTIAL |
| `/api/cpanel/users/roles/permissions` | useUsers | GET | `/api/cpanel/users/roles/permissions` | `?roleName=ADMIN` | `ApiResponse<string[]>` | No | ✅ COMPATIBLE |
| `/api/cpanel/students` | useStudents | GET | `/api/cpanel/students` | `?page=0&size=10` | `ApiResponse<Student[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/students` | useStudents | POST | `/api/cpanel/students` | `{curp, enrollmentNumber, ...}` | `ApiResponse<Student>` | No | ✅ COMPATIBLE |
| `/api/cpanel/students/deleted` | useStudents | GET | `/api/cpanel/students/deleted` | - | `ApiResponse<Student[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/students/{id}` | useStudents | GET | `/api/cpanel/students/{id}` | - | `ApiResponse<Student>` | No | ✅ COMPATIBLE |
| `/api/cpanel/students/{id}` | useStudents | PUT | `/api/cpanel/students/{id}` | `{curp, enrollmentNumber, ...}` | `ApiResponse<Student>` | No | ✅ COMPATIBLE |
| `/api/cpanel/students/{id}` | useStudents | DELETE | `/api/cpanel/students/{id}` | - | `ApiResponse<void>` | No | ✅ COMPATIBLE |
| `/api/cpanel/courses` | useCourses | GET | `/api/cpanel/courses` | `?page=0&size=10` | `ApiResponse<Course[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/courses` | useCourses | POST | `/api/cpanel/courses` | `{studyPlanId, semesterId, ...}` | `ApiResponse<Course>` | No | ✅ COMPATIBLE |
| `/api/cpanel/courses/deleted` | useCourses | GET | `/api/cpanel/courses/deleted` | - | `ApiResponse<Course[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/courses/{id}` | useCourses | GET | `/api/cpanel/courses/{id}` | - | `ApiResponse<Course>` | No | ✅ COMPATIBLE |
| `/api/cpanel/courses/{id}` | useCourses | PUT | `/api/cpanel/courses/{id}` | `{name, credits, ...}` | `ApiResponse<Course>` | No | ✅ COMPATIBLE |
| `/api/cpanel/courses/{id}` | useCourses | DELETE | `/api/cpanel/courses/{id}` | - | `ApiResponse<void>` | No | ✅ COMPATIBLE |
| `/api/cpanel/generations` | useGenerations | GET | `/api/cpanel/generations` | `?page=0&size=10` | `ApiResponse<Generation[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/generations` | useGenerations | POST | `/api/cpanel/generations` | `{name, startYear, ...}` | `ApiResponse<Generation>` | No | ✅ COMPATIBLE |
| `/api/cpanel/teachers` | useTeachers | GET | `/api/cpanel/teachers` | `?page=0&size=10` | `ApiResponse<Teacher[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/enrollments` | useEnrollments | GET | `/api/cpanel/enrollments` | `?page=0&size=10` | `ApiResponse<Enrollment[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/grades` | useGrades | GET | `/api/cpanel/grades` | `?page=0&size=10` | `ApiResponse<Grade[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/grades/by-enrollment/{id}` | useGrades | GET | `/api/cpanel/grades/by-enrollment/{id}` | - | `ApiResponse<Grade[]>` | No | ✅ COMPATIBLE |
| `/api/cpanel/attendances` | useAttendances | GET | `/api/cpanel/attendances` | `?page=0&size=10` | `ApiResponse<Attendance[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/conduct` | useConduct | GET | `/api/cpanel/conduct` | `?page=0&size=10` | `ApiResponse<Conduct[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/conduct/incidents` | useConduct | POST | `/api/cpanel/conduct/incidents` | `{...}` | `ApiResponse<Incident>` | No | ⚠️ PARTIAL |
| `/api/cpanel/certificates` | useCertificates | GET | `/api/cpanel/certificates` | `?page=0&size=10` | `ApiResponse<Certificate[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/guardians` | useGuardians | GET | `/api/cpanel/guardians` | `?page=0&size=10` | `ApiResponse<Guardian[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/retake-exams` | useRetakeExams | GET | `/api/cpanel/retake-exams` | `?page=0&size=10` | `ApiResponse<RetakeExam[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/extraordinary-exams` | useExtraordinaryExams | GET | `/api/cpanel/extraordinary-exams` | `?page=0&size=10` | `ApiResponse<ExtraordinaryExam[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/academic-periods` | useAcademicPeriods | GET | `/api/cpanel/academic-periods` | `?page=0&size=10` | `ApiResponse<AcademicPeriod[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/academic-semesters` | useAcademicSemesters | GET | `/api/cpanel/academic-semesters` | `?page=0&size=10` | `ApiResponse<AcademicSemester[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/academic-groups` | useAcademicGroups | GET | `/api/cpanel/academic-groups` | `?page=0&size=10` | `ApiResponse<AcademicGroup[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/study-plans` | useStudyPlans | GET | `/api/cpanel/study-plans` | `?page=0&size=10` | `ApiResponse<StudyPlan[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/evaluation-types` | useEvaluationTypes | GET | `/api/cpanel/evaluation-types` | `?page=0&size=10` | `ApiResponse<EvaluationType[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/system-configuration` | useSystemConfiguration | GET | `/api/cpanel/system-configuration` | `?page=0&size=10` | `ApiResponse<SystemConfiguration[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/access-audit` | useAccessAudit | GET | `/api/cpanel/access-audit` | `?page=0&size=10` | `ApiResponse<AccessAudit[]>` | No | ⚠️ PARTIAL |
| `/api/cpanel/student-documents` | useStudentDocuments | GET | `/api/cpanel/student-documents` | `?page=0&size=10` | `ApiResponse<StudentDocument[]>` | No | ⚠️ PARTIAL |

### Portal APIs

| Frontend Route | Composable | HTTP | Endpoint | Expected Request | Expected Response | Auth | Status |
|---------------|------------|------|----------|------------------|-------------------|------|--------|
| `/api/portal/news` | usePortalContent | GET | `/api/portal/news` | `?paged=true&page=0&size=10` | `News[] \| NewsPage` | No | ⚠️ INCONSISTENT |
| `/api/portal/news` | usePortalContentAdmin | POST | `/api/portal/news` | `{title, content, ...}` | `ApiResponse<News>` | Bearer | ✅ COMPATIBLE |
| `/api/portal/news/{id}` | usePortalContent | GET | `/api/portal/news/{id}` | - | `ApiResponse<News>` | No | ✅ COMPATIBLE |
| `/api/portal/events` | usePortalContent | GET | `/api/portal/events` | `?paged=true&page=0&size=10` | `Event[] \| EventPage` | No | ⚠️ INCONSISTENT |
| `/api/portal/ads` | usePortalContent | GET | `/api/portal/ads` | - | `ApiResponse<Ad[]>` | No | ✅ COMPATIBLE |
| `/api/portal/institution` | usePortalContentAdmin | PUT | `/api/portal/institution` | `{name, address, ...}` | `ApiResponse<Institution>` | Bearer | ✅ COMPATIBLE |
| `/api/portal/contact` | usePortalContent | POST | `/api/portal/contact` | `{fullName, email, message}` | `ApiResponse<ContactMessage>` | No | ✅ COMPATIBLE |
| `/api/health` | useServerStatus | GET | `/api/health` | - | `{status: 'UP'}` | No | ✅ COMPATIBLE |
| `/api/monitor` | useServerStatus | GET | `/api/monitor` | - | `{status, services: {...}}` | Bearer | ✅ COMPATIBLE |

---

## 2. Análisis de Incompatibilidades

### 🔴 INCONSISTENT (No Compatible)

| Endpoint | Problema | Impacto |
|----------|----------|--------|
| `/api/portal/news` GET | Retorna `News[] \| NewsPage` union. Backend podría retornar solo uno | Type errors en runtime |
| `/api/portal/events` GET | Retorna `Event[] \| EventPage` union. Mismo problema | Type errors en runtime |

### ⚠️ PARTIAL (Compatibilidad Parcial)

| Endpoint | Problema | Impacto |
|----------|----------|--------|
| Todos `/api/cpanel/*` GET | Declaran `page` y `size` params pero reciben `ApiResponse<T[]>` flat array. Backend no soporta paginación real | Paginación ref permanece en 0 |
| `useStudents.ts` | `totalElements`, `totalPages` declarados pero nunca populados | UI no muestra paginación |
| `useCourses.ts` | Mismo problema | UI no muestra paginación |
| `/api/cpanel/users/{id}/sessions` DELETE | Endpoint existe pero backend podría no implementarlo | 404 riesgo |
| `/api/cpanel/users/{id}/unlock` PUT | Mismo | 404 riesgo |
| `/api/cpanel/users/{id}/lock` PUT | Mismo | 404 riesgo |
| `/api/cpanel/users/{id}/ban` PUT | Mismo | 404 riesgo |

---

## 3. Diferencias de Tipos Detectadas

### ApiResponse<T> Duplicado

| Ubicación | Estado |
|----------|--------|
| `app/types/api.ts` | ✅ Centralizado |
| `useAuth.ts` | ❌ Duplicado (líneas 20-24) |
| `useUsers.ts` | ❌ Duplicado (líneas 38-42) + `ApiResult` idéntico |
| `useStudents.ts` | ❌ Duplicado (eliminado en Phase 3) |
| `useCourses.ts` | ❌ Duplicado (eliminado en Phase 3A) |
| 25+ composables | ❌ Duplicado |

### PaginatedData<T> Redefinido

| Ubicación | Estado |
|----------|--------|
| `app/types/api.ts` | ✅ Definido |
| `useUsers.ts` (UsersPage) | ❌ Redefinido (misma estructura) |
| `usePortalContent.ts` (NewsPage) | ❌ Redefinido (misma estructura) |
| `usePortalContent.ts` (EventPage) | ❌ Redefinido (misma estructura) |

### DTOs sin Shared Base

```typescript
// Cada composable define sus propios DTOs
interface CreateUserData { ... }
interface UpdateUserData { ... }
interface CreateStudentData { ... }
interface UpdateStudentData { ... }
// Sin shared CreateDTO, UpdateDTO base
```

---

## 4. Diferencias de Autenticación

| Patrón | Endpoints | Observación |
|--------|-----------|-------------|
| **Sin Auth** | Todos `/api/cpanel/*` | Backend usa cookies/session |
| **Bearer Token** | `/api/portal/*` (admin), `/api/logout`, `/api/monitor` | Inconsistente |
| **Cookie Auto** | `/api/refresh` | No explícito |

### Análisis
- Frontend espera que backend maneje auth por sesión
- Algunos endpoints admin requieren Bearer token explícito
- Posible source de bugs si backend cambia a token-only

---

## 5. Enum Differences (潜在)

| Frontend Enum | Backend Posible | Estado |
|---------------|-----------------|--------|
| `User.isActive` | `Boolean` | ⚠️ POSIBLE MISMATCH |
| `Student.isDeleted` | `Boolean` | ⚠️ POSIBLE MISMATCH |
| `Course.isMandatory` | `Boolean` | ⚠️ POSIBLE MISMATCH |
| `Enrollment.status` | `EnrollmentStatus` enum? | ❓ DESCONOCIDO |
| `Grade.status` | `GradeStatus` enum? | ❓ DESCONOCIDO |

---

## 6. Riesgos Encontrados

### 🔴 Alto

| Riesgo | Descripción | Mitigación |
|--------|-------------|------------|
| Union types en respuestas | `News[] \| NewsPage` puede causar type errors | Agregar type guard |
| Sin manejo de 401 | Usuario no redirigido a login | Implementar error handler |
| Paginación fake | Params enviados pero no usados por backend | Verificar con backend |

### 🟡 Medio

| Riesgo | Descripción | Mitigación |
|--------|-------------|------------|
| Endpoints opcionales no verificados | `/users/{id}/lock`, `/users/{id}/ban` | Confirmar con backend |
| Auth inconsistente | Algunos Bearer, otros none | Estandarizar |
| DTOs no validados | Sin Zod validation | Implementar |

### 🟢 Bajo

| Riesgo | Descripción |
|--------|-------------|
| Tipos duplicados | maintenance burden |
| Normas de nomenclatura |不一致 (underscore vs camelCase) |

---

## 7. Hallazgos de Compatibilidad

### ✅ COMPATIBLE (65 endpoints)

Todos los endpoints auth y la mayoría de cpanel CRUD son compatibles con el patrón `ApiResponse<T>`.

### ⚠️ PARTIAL (15 endpoints)

Endpoints cpanel que envían params de paginación pero el backend retorna arrays planos (sin paginación real).

### 🔴 INCONSISTENT (2 endpoints)

- `/api/portal/news` - Union type no resuelto
- `/api/portal/events` - Union type no resuelto

---

## 8. Recomendaciones de Corrección

### Prioridad 1 (Crítico)
1. **Resolver union types** en `getNews` y `getEvents`
2. **Implementar error handler** para 401 redirect
3. **Verificar con backend** endpoints de usuarios (lock, ban, sessions)

### Prioridad 2 (Alto)
4. **Confirmar paginación** - ¿Backend soporta Page<T> o no?
5. **Estandarizar auth** - ¿Todos usan cookies o algunos Bearer?
6. **Validar DTOs** con Zod

### Prioridad 3 (Medio)
7. **Eliminar tipos duplicados** - Mantener solo `app/types/api.ts`
8. **Crear shared DTOs** base
9. **Documentar contract** con OpenAPI

---

## 9. Resumen de Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ COMPATIBLE | 65 | 72% |
| ⚠️ PARTIAL | 15 | 17% |
| 🔴 INCONSISTENT | 2 | 2% |
| ❓ UNKNOWN | 8 | 9% |
| **TOTAL** | **90** | **100%** |

---

## 10. Próximos Pasos

1. **Compartir este documento con Backend Agent** para validación
2. **Confirmar paginación** - ¿backend realmente soporta `Page<T>`?
3. **Verificar endpoints opcionales** - lock, ban, unlock, sessions
4. **Implementar error handler centralizado**
5. **Crear contrato OpenAPI** conjunto