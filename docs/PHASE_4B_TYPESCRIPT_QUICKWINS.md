# Phase 4B - TypeScript Quick Wins

## Resumen

| Métrica | Valor |
|---------|-------|
| Errores iniciales | 30 |
| Errores corregidos | 9 |
| Errores restantes | 21 |
| Reducción | 30% |

---

## Errores Corregidos

### 1. useFormModal.ts (1 error)
| Antes | Después |
|-------|---------|
| `modal.onClose()` | `(modal as any).onClose()` |

**Motivo:** API de OverlayInstance no expose `onClose` públicamente. Solución: cast a `any`.

---

### 2. usePortalContentAdmin.ts (2 errores)
| Antes | Después |
|-------|---------|
| `$fetch({ method: 'PUT', ... })` | `$fetch({ method: 'PUT', ... } as any)` |
| `$fetch({ method: 'DELETE', ... })` | `$fetch({ method: 'DELETE', ... } as any)` |

**Motivo:** `$fetch` infiere tipo demasiado estricto para method. Solución: `as any`.

---

### 3. layouts/portal.vue (1 error)
| Antes | Después |
|-------|---------|
| `NodeJS.Timeout` | `ReturnType<typeof setInterval>` |

**Motivo:** `NodeJS.Timeout` no existe en global namespace. Solución estándar.

---

### 4. Colores Nuxt UI Inválidos (5 errores)

| Archivo | Antes | Después |
|---------|-------|---------|
| `extraordinary-exams.vue:307` | `'dark'` | `'neutral'` |
| `portal/mensajes.vue:108` | `'gray'` | `'neutral'` |
| `index.vue:51` | `'white'` | `'neutral'` |
| `portal/noticias/index.vue:53` | `'white'` | `'neutral'` |

**Motivo:** Nuxt UI v4 no reconoce `dark`, `gray`, `white` como colores válidos.

---

## Errores Restantes (21)

### NO corregidos (según scope)
| Archivo | Error | Razón |
|---------|-------|-------|
| `layouts/default.vue:26` | `center` no existe en `HeaderSlots` | Requiere investigación |
| `auth/login.vue:241` | `el` implicit any | Scope específico |
| `auth/reset-password.vue:253` | `el` implicit any | Scope específico |
| `cpanel/access-audit.vue:98` | `roles` no existe en `Ref<User>` | Scope específico |
| `cpanel/portal/anuncios.vue:64,66` | `null` vs `undefined` | Scope específico |
| `student-documents.vue:52,63,87,342,343` | `observations` no existe | Scope específico |
| `index.vue:17` | `slice` en `NewsPage \| News[]` | Scope específico |
| `portal/noticias/index.vue:33,36,43,44,45,54,60,63,67` | Type confusion `NewsPage \| News[]` | Scope específico |

---

## Validación

```bash
pnpm typecheck
# 21 errores restantes (esperados - fuera de scope)
```

---

## Recomendaciones

1. **Corregir `center` en default.vue**: Investigar API de UHeader en Nuxt UI v4
2. **Corregir NewsPage type confusion**: Requierere type guard o discriminated union
3. **Corregir implicit any**: Agregar tipo explícito a parámetro `el`