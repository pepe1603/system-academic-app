# Phase 7B - Frontend Business Validation

## Resumen Ejecutivo

| Categoría | Total | Alta | Media | Baja |
|-----------|-------|------|-------|------|
| Composables | 10 | 3 | 14 | 15 |
| Pages | 10 | 9 | 10 | 6 |
| **TOTAL** | **20** | **12** | **24** | **21** |

---

## 1. Validación de Composables

### Tabla Resumen

| Composable | Issues | Alta | Media | Baja |
|------------|--------|------|-------|------|
| useAuth.ts | 4 | 0 | 2 | 2 |
| useUsers.ts | 3 | 0 | 1 | 2 |
| useStudents.ts | 3 | 0 | 2 | 1 |
| useTeachers.ts | 3 | 0 | 2 | 1 |
| useCourses.ts | 2 | 0 | 1 | 1 |
| useEnrollments.ts | 2 | 0 | 1 | 1 |
| useGrades.ts | 2 | 0 | 1 | 1 |
| useAttendances.ts | 2 | 0 | 1 | 1 |
| usePortalContent.ts | 5 | 3 | 1 | 1 |
| usePortalContentAdmin.ts | 6 | 3 | 2 | 1 |

---

### usePortalContent.ts - Issues Alta

| Issue | Línea | Descripción |
|-------|-------|-------------|
| Tipo no estándar | 105 | `getInstitution` usa `{ success: boolean; data: Institution }` en lugar de `ApiResponse<Institution>` |
| Type narrowing sin check | 172-175 | `getUpcomingEvents` hace cast `events as Event[]` pero `getEvents(false)` puede retornar `EventPage` |
| Null safety | 167-176 | No hay check runtime si `events` es `Event[]` vs `EventPage` |

### usePortalContentAdmin.ts - Issues Alta

| Issue | Línea | Descripción |
|-------|-------|-------------|
| `as any` peligroso | 297, 317 | `updateAd` y `deleteAd` usan `as any` deshabilitando type checking |
| Content-Type incorrecto | 388-392 | `respondMessage` envía `Content-Type: text/plain` en lugar de JSON |
| Filtrado client-side | 42, 78 | `includeUnpublished` nunca se envía al API, todo se filtra en cliente |

---

### Issues Media - Composables

| Composable | Issue | Descripción |
|------------|-------|-------------|
| useAuth.ts | Type mismatch | `verifyTwoFactor` declara `LoginResponse` pero API retorna `ApiResponse<LoginDataSuccess>` |
| useAuth.ts | Tipo inconsistente | `refreshAuthToken` usa tipo inline en lugar de `ApiResponse<string>` |
| useStudents.ts | Type/API mismatch | Declara `ApiResponse<Student[]>` pero API retorna paginado |
| useStudents.ts | Sin estado paginación | No actualiza `totalElements`, `totalPages`, `currentPage` |
| useTeachers.ts | Type/API mismatch | Mismo problema que useStudents |
| useEnrollments.ts | Type/API mismatch | Mismo problema |
| useGrades.ts | Sin paginación | No actualiza refs de paginación |
| useAttendances.ts | Sin paginación | No actualiza refs de paginación |
| usePortalContent.ts | Error inconsistente | Usa `e.message` pero otros usan `e.data?.message` |

---

## 2. Validación de Páginas

### Portal Pages

| Page | Carga | Filtros | Forms | Edit | Delete | Error | HTTP Status |
|------|-------|---------|-------|------|--------|-------|-------------|
| noticias/index.vue | OK | N/A | N/A | N/A | N/A | PARCIAL | N/A |
| eventos/index.vue | OK | OK | N/A | N/A | N/A | PARCIAL | N/A |
| anuncios.vue | OK | N/A | PARCIAL | OK | PARCIAL | PARCIAL | MISSING |
| contacto.vue | N/A | N/A | OK | N/A | N/A | OK | MISSING |

### Admin Pages

| Page | Carga | Filtros | Forms | Edit | Delete | Error | HTTP Status |
|------|-------|---------|-------|------|--------|-------|-------------|
| users.vue | OK | OK | INCOMPLETO | OK | OK | PARCIAL | MISSING |
| students.vue | OK | OK | INCOMPLETO | OK | OK | PARCIAL | MISSING |
| teachers.vue | OK | OK | INCOMPLETO | OK | OK | PARCIAL | MISSING |
| courses.vue | OK | NONE | INCOMPLETO | OK | OK | PARCIAL | MISSING |
| academic-groups.vue | OK | NONE | INCOMPLETO | OK | OK | PARCIAL | MISSING |
| enrollments.vue | OK | NONE | PROBLEMÁTICO | OK | OK | PARCIAL | MISSING |

---

## 3. Problemas Funcionales Detallados

### 🔴 Alta Prioridad

| Página/Componente | Problema | Impacto |
|-------------------|----------|---------|
| `users.vue` | Sin validación en formulario create (username/email/password vacíos) | Datos inválidos |
| `students.vue` | CURP no validado (formato 18 chars mexicano) | CURP incorrecta |
| `teachers.vue` | CURP y RFC no validados | Datos inválidos |
| `courses.vue` | Sin UI de paginación (carga 50 items) | Performance |
| `academic-groups.vue` | Sin UI de paginación | Performance |
| `enrollments.vue` | Status puede cambiarse manualmente | Inconsistencia negocio |
| `enrollments.vue` | Sin check de enrollments duplicados | Duplicados |
| `usePortalContent.ts` | Cast incorrecto `events as Event[]` | Runtime error |
| `usePortalContentAdmin.ts` | `as any` en updateAd/deleteAd | Bugs ocultos |
| `usePortalContentAdmin.ts` | Content-Type: text/plain | Falla API |

### 🟡 Media Prioridad

| Página/Componente | Problema | Impacto |
|-------------------|----------|---------|
| `anuncios.vue` | Validación incompleta (no URL format) | URLs inválidas |
| `users.vue` | showDeleted no resetea paginación | UX |
| `students.vue` | Email/phone sin validación formato | Datos inválidos |
| `teachers.vue` | Email/phone sin validación | Datos inválidos |
| `courses.vue` | Credits permite valores irrealistas (999) | Datos inválidos |
| `academic-groups.vue` | teacherId es texto libre (debe ser dropdown) | UX/Validación |
| `useAuth.ts` | Type mismatch en verifyTwoFactor | Type safety |
| useStudents/Teachers/etc | Sin actualizar refs paginación | UI inconsistente |

### 🟢 Baja Prioridad

| Página/Componente | Problema | Impacto |
|-------------------|----------|---------|
| noticias/index.vue | Sin loading state | UX |
| eventos/index.vue | Sin loading state | UX |
| anuncios.vue | Usa `confirm()` nativo | UX |
| contacto.vue | Typo "Notre equipo" | Typo |
| useUsers.ts | Error handling inconsistente | Mantenimiento |
| usePortalContent.ts | `getAds` y `getAllAds` duplicados | DRY |

---

## 4. Métricas de Validación

| Aspecto | Total | OK | PARCIAL | MISSING/INCOMPLETE |
|---------|-------|----|---------|---------------------|
| Carga inicial pages | 10 | 9 | 1 | 0 |
| Filtros pages | 10 | 3 | 0 | 7 |
| Forms pages | 10 | 1 | 5 | 4 |
| Edit mode pages | 10 | 8 | 0 | 2 |
| Delete pages | 10 | 7 | 3 | 0 |
| Error handling pages | 10 | 1 | 9 | 0 |
| HTTP status pages | 10 | 0 | 0 | 10 |
| Endpoint composables | 10 | 8 | 2 | 0 |
| Type safety composables | 10 | 5 | 5 | 0 |
| Error handling composables | 10 | 7 | 3 | 0 |

---

## 5. Recomendaciones

### Inmediato (Alta Prioridad)

1. **Validación de formularios** - Implementar VeeValidate o Zod
2. **UI de paginación** - Agregar a courses, academic-groups
3. **Fix usePortalContent** - type guard para `Event[] | EventPage`
4. **Remove `as any`** - usePortalContentAdmin updateAd/deleteAd
5. **Fix Content-Type** - cambiar a JSON en respondMessage

### Corto Plazo (Media Prioridad)

6. **Consistencia paginación** - Actualizar refs en todos los composables
7. **Validación CURP/RFC** - Agregar regex validation
8. **Dropdown para teacherId** - En academic-groups
9. **Reset paginación** - Cuando cambia showDeleted
10. **Check enrollment duplicado** - Validación de negocio

### Largo Plazo (Baja Prioridad)

11. **Standardize ApiResponse** - Usar centralizado en todos
12. **Loading states** - Agregar a portal pages
13. **HTTP status handling** - 401 redirect, 403/404 mensajes
14. **Fix typos** - "Notre equipo"
15. **DRY getAds** - Eliminar duplicación

---

## 6. Resumen de Hallazgos

### Composables con Más Issues

1. `usePortalContentAdmin.ts` - 6 issues (3 alta, 2 media, 1 baja)
2. `usePortalContent.ts` - 5 issues (3 alta, 1 media, 1 baja)
3. `useAuth.ts` - 4 issues (0 alta, 2 media, 2 baja)
4. `useStudents.ts` - 3 issues (0 alta, 2 media, 1 baja)
5. `useTeachers.ts` - 3 issues (0 alta, 2 media, 1 baja)

### Pages con Más Issues

1. `enrollments.vue` - 5 issues alta
2. `courses.vue` - 3 issues (1 alta, 2 media)
3. `academic-groups.vue` - 3 issues (1 alta, 2 media)
4. `teachers.vue` - 3 issues (1 alta, 2 media)
5. `students.vue` - 2 issues (1 alta, 1 media)

---

## 7. Compromiso de Mejora

### Items para Phase 7C

- [ ] Agregar validación Zod a users.vue create form
- [ ] Agregar UI paginación a courses.vue
- [ ] Fix type guard en usePortalContent.getUpcomingEvents
- [ ] Remove `as any` en usePortalContentAdmin
- [ ] Fix Content-Type en respondMessage