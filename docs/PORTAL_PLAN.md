# Portal Público - Plan de Implementación

## Rama principal: `feature/portal-publico`

---

## Fase 1: API Proxies ✅ COMPLETADO
**Rama:** `feature/portal-publico`
**Fecha:** 2026-04-15

### Endpoints creados en `server/api/portal/`:
- [x] `institution.get.ts` - GET /institution (público)
- [x] `institution.put.ts` - PUT /institution (ADMIN)
- [x] `news.get.ts` - GET /news (público)
- [x] `news.post.ts` - POST /news (ADMIN)
- [x] `news/[id].get.ts` - GET /news/{id} (público)
- [x] `news/[id].put.ts` - PUT /news/{id} (ADMIN)
- [x] `news/[id].delete.ts` - DELETE /news/{id} (ADMIN)
- [x] `events.get.ts` - GET /events (público)
- [x] `events.post.ts` - POST /events (ADMIN)
- [x] `events/[id].get.ts` - GET /events/{id} (público)
- [x] `events/[id].put.ts` - PUT /events/{id} (ADMIN)
- [x] `events/[id].delete.ts` - DELETE /events/{id} (ADMIN)
- [x] `ads.get.ts` - GET /ads (público)
- [x] `ads/[position].get.ts` - GET /ads/{position} (público)
- [x] `ads.post.ts` - POST /ads (ADMIN)
- [x] `ads/[id].put.ts` - PUT /ads/{id} (ADMIN)
- [x] `ads/[id].delete.ts` - DELETE /ads/{id} (ADMIN)
- [x] `contact.post.ts` - POST /contact (público)
- [x] `contact.get.ts` - GET /contact (ADMIN)
- [x] `contact/[id]/read.put.ts` - PUT /contact/{id}/read (ADMIN)
- [x] `contact/[id]/respond.post.ts` - POST /contact/{id}/respond (ADMIN)

**Total: 21 endpoints creados**

---

## Fase 2: Composables ✅ COMPLETADO
**Rama:** `feature/portal-publico`
**Fecha:** 2026-04-15

### Archivos creados en `app/composables/`:
- [x] `usePortal.ts` - Métodos públicos (sin auth)
  - getInstitution()
  - getNews(), getNewsById()
  - getEvents(), getEventById()
  - getAds(), getAdsByPosition()
  - sendContactMessage()

- [x] `usePortalAdmin.ts` - Métodos ADMIN (con auth)
  - updateInstitution()
  - createNews(), updateNews(), deleteNews()
  - createEvent(), updateEvent(), deleteEvent()
  - createAd(), updateAd(), deleteAd()
  - getAllMessages(), getUnreadMessages()
  - markAsRead(), respondMessage()

---

## Fase 3: Pages Públicas ✅ COMPLETADO
**Rama:** `feature/portal-publico`
**Fecha:** 2026-04-15

### Archivos creados en `app/pages/portal/`:
- [x] `index.vue` - Home del portal
- [x] `noticias/index.vue` - Lista de noticias
- [x] `noticias/[id].vue` - Detalle de noticia
- [x] `eventos/index.vue` - Lista de eventos
- [x] `eventos/[id].vue` - Detalle de evento
- [x] `contacto.vue` - Formulario de contacto

### Layout:
- [x] `app/layouts/portal.vue` - Layout público del portal

---

## Fase 4: Panel Admin ✅ COMPLETADO
**Rama:** `feature/portal-publico`
**Fecha:** 2026-04-15

### Archivos creados en `app/pages/cpanel/portal/`:
- [x] `index.vue` - Dashboard del módulo portal
- [x] `noticias.vue` - Gestión de noticias
- [x] `eventos.vue` - Gestión de eventos
- [x] `anuncios.vue` - Gestión de anuncios
- [x] `mensajes.vue` - Bandeja de mensajes de contacto
- [x] `institucion.vue` - Editar información institucional

---

## 🎉 MÓDULO COMPLETADO

---

## Notas:
- Reutilizar autenticación existente (`useAuth.ts`)
- Reutilizar manejo de errores (`api-error-handler.client.ts`)
- Reutilizar server status monitoring (`useServerStatus.ts`)
- UI consistente con el resto de la aplicación (Nuxt UI 4)