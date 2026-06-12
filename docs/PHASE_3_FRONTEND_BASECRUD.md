# Phase 3 - Frontend: useBaseCRUD

## Objetivo
Extraer lógica común de composables en un base genérico reutilizable.

---

## Archivos Creados

### `app/types/api.ts`
```typescript
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export type ApiResult<T> = ApiResponse<T>
```

### `app/composables/useBaseCRUD.ts`
Composable genérico para CRUD estándar.

---

## Firma del Composable

```typescript
useBaseCRUD<T, C, U>(options: UseBaseCRUDOptions<T, C, U>): UseBaseCRUDReturn<T, C, U>
```

### Tipos Genéricos
| Tipo | Descripción |
|------|-------------|
| `T` | Entity/Model (ej: `User`, `Course`) |
| `C` | Create DTO (ej: `CreateUserData`) |
| `U` | Update DTO (ej: `UpdateUserData`) |

### Options
```typescript
interface UseBaseCRUDOptions<T, C, U> {
  endpoint: string                    // ej: '/api/cpanel/users'
  transformResponse?: (data: T) => T // normalización opcional
}
```

### Estado Retornado
```typescript
{
  items: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  totalElements: Ref<number>
  currentPage: Ref<number>
  totalPages: Ref<number>
}
```

### Métodos CRUD
| Método | Firma | Descripción |
|--------|-------|-------------|
| `fetchAll` | `(page?, size?) => Promise<T[]>` | Lista con paginación |
| `fetchDeleted` | `() => Promise<T[]>` | Lista eliminados |
| `getById` | `(id) => Promise<T \| null>` | Obtener por ID |
| `create` | `(data: C) => Promise<ApiResult<T>>` | Crear nuevo |
| `update` | `(id, data: U) => Promise<ApiResult<T>>` | Actualizar |
| `delete` | `(id) => Promise<ApiResult<void>>` | Eliminar |

---

## Uso Básico

```typescript
// Ejemplo: useCourses
const {
  items: courses,
  loading,
  error,
  fetchAll,
  getById,
  create,
  update,
  delete: deleteCourse
} = useBaseCRUD<Course, CreateCourseData, UpdateCourseData>({
  endpoint: '/api/cpanel/courses'
})
```

---

## Compatibilidad

- **ApiResponse<T>**: Sí
- **ApiResult<T>**: Sí (alias de ApiResponse)
- **Pages existentes**: Sin breaking changes
- **Backend**: No requiere cambios

---

## Estado de Typecheck

```
✔ useBaseCRUD.ts - SIN errores
✔ useStudents.ts - SIN errores (usando ApiResponse centralizado)
✔ useUsers.ts   - SIN errores (usando ApiResponse centralizado)
✔ useAuth.ts    - SIN errores (usando ApiResponse centralizado)
✔ useCourses.ts - SIN errores (usando ApiResponse centralizado)
```

---

## Siguiente Paso Sugerido

Migrar `useCourses.ts` a `useBaseCRUD` como piloto, manteniendo los métodos específicos del entity.

---

## Notas

- El `as any` en body de POST/PUT es necesario por limitaciones de TypeScript con generics en `$fetch`. Aceptable en este contexto de proxy hacia API.
- `transformResponse` permite normalización de fechas u otros campos antes de almacenar en estado.
- El método `delete` fue nombrado `deleteItem` internamente para evitar conflicto con keyword `delete`.