import type { Institution, ContactMessage, News, Event, Ad } from './usePortalContent'

interface NewsInput {
  title: string
  content: string
  imageUrl?: string
  isPublished: boolean
}

interface EventInput {
  title: string
  description: string
  eventDate: string
  location: string
  isPublished: boolean
}

interface AdInput {
  title: string
  description: string
  imageUrl?: string
  linkUrl?: string
  position: 'BANNER' | 'SIDEBAR' | 'FOOTER'
  displayOrder: number
  isPublished: boolean
  startDate?: string
  endDate?: string
}

export const usePortalContentAdmin = () => {
  const { accessToken } = useAuth()
  const loading = useState<boolean>('portalAdminLoading', () => false)
  const error = useState<string | null>('portalAdminError', () => null)

  const getAuthHeaders = () => {
    if (!accessToken.value) {
      throw new Error('No hay sesión activa')
    }
    return { Authorization: `Bearer ${accessToken.value}` }
  }

  const getAllNews = async (includeUnpublished = true): Promise<News[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: News[] }>('/api/portal/news', {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener noticias'
      return []
    } finally {
      loading.value = false
    }
  }

  const getNewsById = async (id: string): Promise<News | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: News }>(`/api/portal/news/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || null
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener noticia'
      return null
    } finally {
      loading.value = false
    }
  }

  const getAllEvents = async (includeUnpublished = true): Promise<Event[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: Event[] }>('/api/portal/events', {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener eventos'
      return []
    } finally {
      loading.value = false
    }
  }

  const getEventById = async (id: string): Promise<Event | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: Event }>(`/api/portal/events/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || null
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener evento'
      return null
    } finally {
      loading.value = false
    }
  }

  const getAllAds = async (): Promise<Ad[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: Ad[] }>('/api/portal/ads', {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener anuncios'
      return []
    } finally {
      loading.value = false
    }
  }

  const getAdById = async (id: string): Promise<Ad | null> => {
    loading.value = true
    error.value = null
    try {
      const authHeaders = getAuthHeaders()
      console.log('[DEBUG] getAdById called with id:', id, 'headers:', authHeaders)
      
      const response = await $fetch<{ success: boolean; data: Ad }>(`/api/portal/ads/${id}`, {
        method: 'GET',
        headers: { ...authHeaders, 'Content-Type': 'application/json' }
      })
      console.log('[DEBUG] getAdById response:', response)
      return response.data || null
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener anuncio'
      console.error('[DEBUG] getAdById error:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateInstitution = async (data: Partial<Institution>): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/portal/institution', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: data
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al actualizar información institucional'
      return false
    } finally {
      loading.value = false
    }
  }

  const createNews = async (data: NewsInput): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: { id: string } }>('/api/portal/news', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data
      })
      return response.data?.id || null
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al crear noticia'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateNews = async (id: string, data: Partial<NewsInput>): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/news/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: data
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al actualizar noticia'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteNews = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/news/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al eliminar noticia'
      return false
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (data: EventInput): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: { id: string } }>('/api/portal/events', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data
      })
      return response.data?.id || null
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al crear evento'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: string, data: Partial<EventInput>): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: data
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al actualizar evento'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al eliminar evento'
      return false
    } finally {
      loading.value = false
    }
  }

  const createAd = async (data: AdInput): Promise<string | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: { id: string } }>('/api/portal/ads', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data
      })
      return response.data?.id || null
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al crear anuncio'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateAd = async (id: string, data: Partial<AdInput>): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/ads/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: data
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al actualizar anuncio'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteAd = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/ads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al eliminar anuncio'
      return false
    } finally {
      loading.value = false
    }
  }

  const getAllMessages = async (): Promise<ContactMessage[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: ContactMessage[] }>('/api/portal/contact', {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener mensajes'
      return []
    } finally {
      loading.value = false
    }
  }

  const getUnreadMessages = async (): Promise<ContactMessage[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: ContactMessage[] }>('/api/portal/contact/unread', {
        method: 'GET',
        headers: getAuthHeaders()
      })
      return response.data || []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener mensajes'
      return []
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/contact/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al marcar mensaje'
      return false
    } finally {
      loading.value = false
    }
  }

  const respondMessage = async (id: string, response: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/portal/contact/${id}/respond`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'text/plain'
        },
        body: response
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al responder mensaje'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    getAllNews,
    getNewsById,
    updateInstitution,
    createNews,
    updateNews,
    deleteNews,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getAllAds,
    getAdById,
    createAd,
    updateAd,
    deleteAd,
    getAllMessages,
    getUnreadMessages,
    markAsRead,
    respondMessage
  }
}