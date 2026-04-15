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

## Fase 2: Composables
**Rama:** `feature/portal-composables`

### Archivos a crear en `app/composables/`:
- [ ] `usePortal.ts` - Métodos públicos (sin auth)
  - getInstitution()
  - getNews(), getNewsPaged()
  - getEvents(), getEventsPaged()
  - getAds(), getAdsByPosition()
  - sendContactMessage()

- [ ] `usePortalAdmin.ts` - Métodos ADMIN (con auth)
  - updateInstitution()
  - createNews(), updateNews(), deleteNews()
  - createEvent(), updateEvent(), deleteEvent()
  - createAd(), updateAd(), deleteAd()
  - getAllMessages(), getUnreadMessages()
  - markAsRead(), respondMessage()

---

## Fase 3: Pages Públicas
**Rama:** `feature/portal-pages`

### Archivos a crear en `app/pages/portal/`:
- [ ] `index.vue` - Home del portal (hero, info institucional, ads, noticias destacadas, eventos)
- [ ] `noticias/index.vue` - Lista de noticias
- [ ] `noticias/[id].vue` - Detalle de noticia
- [ ] `eventos/index.vue` - Lista de eventos
- [ ] `eventos/[id].vue` - Detalle de evento
- [ ] `contacto.vue` - Formulario de contacto

### Layout:
- [ ] `app/layouts/portal.vue` - Layout público del portal

---

## Fase 4: Panel Admin
**Rama:** `feature/portal-admin`

### Archivos a crear en `app/pages/admin/portal/`:
- [ ] `index.vue` - Dashboard del módulo portal
- [ ] `noticias/index.vue` - Gestión de noticias
- [ ] `noticias/[id].vue` - Editar noticia
- [ ] `eventos/index.vue` - Gestión de eventos
- [ ] `eventos/[id].vue` - Editar evento
- [ ] `anuncios/index.vue` - Gestión de anuncios
- [ ] `anuncios/[id].vue` - Editar anuncio
- [ ] `mensajes/index.vue` - Bandeja de mensajes de contacto

---

## Notas:
- Reutilizar autenticación existente (`useAuth.ts`)
- Reutilizar manejo de errores (`api-error-handler.client.ts`)
- Reutilizar server status monitoring (`useServerStatus.ts`)
- UI consistente con el resto de la aplicación (Nuxt UI 4)