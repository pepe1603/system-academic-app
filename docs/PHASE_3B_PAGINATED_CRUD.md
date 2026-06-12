# Phase 3B - Frontend: usePaginatedCRUD

## Objetivo
Crear composable genérico para APIs con paginación Spring Boot (`Page<T>`).

---

## Análisis de Patrones

### Composables Analizados

| Composable | Usa `content[]` | totalElements | totalPages | Observación |
|------------|-----------------|---------------|------------|-------------|
| `useUsers.ts` | ✅ YES | ✅ YES | ✅ YES | Solo que usa patrón correcto |
| `useStudents.ts` | ❌ NO | ⚠️ Declared | ⚠️ Declared | `ApiResponse<Student[]>` (flat array) |
| `useGenerations.ts` | ❌ NO | ⚠️ Declared | ⚠️ Declared | `ApiResponse<Generation[]>` (flat array) |
| `useTeachers.ts` | ❌ NO | ⚠️ Declared | ⚠️ Declared | `ApiResponse<Teacher[]>` (flat array) |
| `useEnrollments.ts` | ❌ NO | ⚠️ Declared | ⚠️ Declared | `ApiResponse<Enrollment[]>` (flat array) |

### Hallazgo

**Solo `useUsers.ts`** usa el patrón real de paginación Spring Boot:
```typescript
// users.get.ts → backend returns Page<User>
response.data.content    // User[]
response.data.totalElements
response.data.totalPages
response.data.number     // current page
```

**Los demás composables** declaran refs de paginación pero nunca los populan porque reciben arrays planos.

---

## Archivo Creado

### `app/types/api.ts` (extensión)
```typescript
export interface PaginatedData<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
```

### `app/composables/usePaginatedCRUD.ts`

Composable idéntico a `useBaseCRUD` pero con:
- `fetchAll(page, size)` → usa `params` en lugar de `query`
- Response type: `ApiResponse<PaginatedData<T>>`
- Popula `totalElements`, `totalPages`, `currentPage`

```typescript
// Firma
usePaginatedCRUD<T, C, U>(options: UsePaginatedCRUDOptions<T, C, U>): UsePaginatedCRUDReturn<T, C, U>
```

---

## Diferencia Técnica

| Aspecto | `useBaseCRUD` | `usePaginatedCRUD` |
|---------|---------------|-------------------|
| HTTP params | `query: { page, size }` | `params: { page, size }` |
| Response | `ApiResponse<T[]>` | `ApiResponse<PaginatedData<T>>` |
| Paginación | No | Sí (ref values populated) |
| Uso típico | Arrays directos | Spring Boot `Page<T>` |

---

## Estado de Typecheck

```
✔ usePaginatedCRUD.ts - SIN errores
✔ 30 errores pre-existentes (no relacionados)
```

---

## Compatibilidad

- **ApiResponse<T>**: ✅
- **ApiResult<T>**: ✅
- **useBaseCRUD patterns**: ✅ API idéntica

---

## Siguiente Paso Sugerido

1. Migrar `useUsers.ts` a `usePaginatedCRUD` (reemplazaría el `baseCRUD` actual)
2. `useStudents.ts`, `useGenerations.ts`, etc. pueden continuar con `useBaseCRUD` plano
3. O unificar con una opción `isPaginated: boolean` en `useBaseCRUD`

---

## Recomendación

Considerar unificar `useBaseCRUD` y `usePaginatedCRUD` en un solo composable con parámetro `paginationMode: 'flat' | 'paginated'`.

Esto evitaría duplicación y mantendría una sola API.