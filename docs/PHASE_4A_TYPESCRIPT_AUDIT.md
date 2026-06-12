# Phase 4A - Frontend: TypeScript Audit

## Resumen Ejecutivo

| Categoría | Archivos | Errores | Severidad Promedio |
|----------|----------|---------|-------------------|
| composables | 2 | 3 | Media |
| layouts | 2 | 2 | Baja-Media |
| pages | 8 | 25 | Media-Alta |

**Total: 30 errores TypeScript**

---

## Detalle por Categoría

### composables (3 errores)

| Archivo | Línea | Error | Severidad | Dificultad | Riesgo |
|---------|-------|-------|-----------|------------|--------|
| `useFormModal.ts` | 26 | `onClose` no existe, usar `close` | Media | Baja | Bajo |
| `usePortalContentAdmin.ts` | 292 | Tipo `"PUT"` no asignable | Media | Baja | Bajo |
| `usePortalContentAdmin.ts` | 311 | Tipo `"DELETE"` no asignable | Media | Baja | Bajo |

### layouts (2 errores)

| Archivo | Línea | Error | Severidad | Dificultad | Riesgo |
|---------|-------|-------|-----------|------------|--------|
| `default.vue` | 26 | `center` no existe en `HeaderSlots` | Media | Baja | Bajo |
| `portal.vue` | 49 | `NodeJS.Timeout` no existe | Baja | Muy Baja | Bajo |

### pages (25 errores)

#### auth (2 errores)
| Archivo | Línea | Error | Severidad | Dificultad | Riesgo |
|---------|-------|-------|-----------|------------|--------|
| `login.vue` | 241 | `el` tiene tipo `any` implícito | Alta | Baja | Medio |
| `reset-password.vue` | 253 | `el` tiene tipo `any` implícito | Alta | Baja | Medio |

#### cpanel (15 errores)
| Archivo | Línea | Error | Severidad | Dificultad | Riesgo |
|---------|-------|-------|-----------|------------|--------|
| `access-audit.vue` | 98 | `roles` no existe en `Ref<User | null>` | Media | Media | Medio |
| `extraordinary-exams.vue` | 439 | Color `"dark"` inválido | Baja | Muy Baja | Bajo |
| `extraordinary-exams.vue` | 594 | Color `"dark"` inválido | Baja | Muy Baja | Bajo |
| `portal/anuncios.vue` | 64 | `string \| null` no asignable a `string \| undefined` | Media | Media | Medio |
| `portal/anuncios.vue` | 66 | `string \| null` no asignable a `string \| undefined` | Media | Media | Medio |
| `portal/mensajes.vue` | 108 | Color `"gray"` inválido | Baja | Muy Baja | Bajo |
| `student-documents.vue` | 52 | `observations` no existe en tipo | Media | Media | Medio |
| `student-documents.vue` | 63 | `observations` no existe en tipo | Media | Media | Medio |
| `student-documents.vue` | 87 | `observations` no existe en tipo | Media | Media | Medio |
| `student-documents.vue` | 342 | `observations` no existe en tipo | Media | Media | Medio |
| `student-documents.vue` | 343 | `observations` no existe en tipo | Media | Media | Medio |

#### portal (8 errores)
| Archivo | Línea | Error | Severidad | Dificultad | Riesgo |
|---------|-------|-------|-----------|------------|--------|
| `index.vue` | 17 | `slice` no existe en `NewsPage \| News[]` | Alta | Alta | Alto |
| `index.vue` | 51 | Color `"white"` inválido | Baja | Muy Baja | Bajo |
| `portal/noticias/index.vue` | 33 | `length` no existe en tipo | Alta | Alta | Alto |
| `portal/noticias/index.vue` | 36-45 | Propiedades `id`, `imageUrl`, `title` | Alta | Alta | Alto |
| `portal/noticias/index.vue` | 53 | Color `"white"` inválido | Baja | Muy Baja | Bajo |
| `portal/noticias/index.vue` | 54,60,63,67 | Propiedades no existen en tipo | Alta | Alta | Alto |

---

## Clasificación por Severidad

### 🔴 Alta (8 errores)
- `implicit any` en login y reset-password (2)
- NewsPage/News[] type confusion (6)

### 🟡 Media (17 errores)
- onClose → close (1)
- PUT/DELETE type issues (2)
- center property (1)
- roles property access (1)
- null vs undefined type mismatches (5)
- observations property missing (5)

### 🟢 Baja (5 errores)
- Color variants inválidos ("dark", "gray", "white") (5)

---

## Análisis de Causa Raíz

### 1. Errores de Tipado de UI (`@nuxt/ui`)
```
"dark", "gray", "white" no son colores válidos en @nuxt/ui v4
```
**Solución**: Reemplazar con valores válidos (`neutral`, `primary`, etc.)

### 2. Tipo `NewsPage | News[]` Confusión
```
Backend retorna Page<News> pero frontend no distingue el tipo
```
**Solución**: Type guard o discriminación correcta del tipo

### 3. `observations` Missing Property
```
El tipo StudentDocument no incluye observations
```
**Solución**: Agregar propiedad al tipo o corregir query

### 4. `onClose` vs `close` (Nuxt UI Overlay)
```
API de OverlayInstance cambió en versión reciente
```
**Solución**: Cambiar `onClose` por `close`

### 5. `roles` Access on Ref<User | null>
```
Acceso directo a ref sin .value
```
**Solución**: `user?.roles` en lugar de `user.roles`

---

## Estimación de Effort

| Prioridad | Errores | Esfuerzo Estimado |
|-----------|---------|-------------------|
| Quick Wins | 5 (colores) | 5 min |
| Baja | 5 (onClose, layouts) | 10 min |
| Media | 15 | 30-45 min |
| Alta | 5 (type guards) | 45-60 min |

---

## Recomendación de Prioridad

1. **Fase 4B**: Corregir errores de colores (quick wins)
2. **Fase 4C**: Corregir composables y layouts (bajo riesgo)
3. **Fase 4D**: Corregir pages con type confusion (mayor esfuerzo)