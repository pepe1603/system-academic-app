export interface Institution {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website: string
  mission: string
  vision: string
  history: string
  values: string
  logoUrl: string | null
  isActive: boolean
  createdAt: string
}

export interface News {
  id: string
  title: string
  content: string
  imageUrl: string | null
  isPublished: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface NewsPage {
  content: News[]
  pageable: { pageNumber: number; pageSize: number }
  last: boolean
  totalPages: number
  totalElements: number
  first: boolean
  size: number
  number: number
  empty: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  location: string
  isPublished: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface EventPage {
  content: Event[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface Ad {
  id: string
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
  position: 'BANNER' | 'SIDEBAR' | 'FOOTER'
  displayOrder: number
  isPublished: boolean
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactMessage {
  id: string
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
  isRead: boolean
  isResponded: boolean
  response: string | null
  responseDate: string | null
  createdAt: string
}

export interface ContactForm {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
}

export const usePortalContent = () => {
  const loading = useState<boolean>('portalLoading', () => false)
  const error = useState<string | null>('portalError', () => null)

  const getInstitution = async (): Promise<Institution | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: Institution }>('/api/portal/institution')
      return response.data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener información institucional'
      return null
    } finally {
      loading.value = false
    }
  }

  const getNews = async (paged = false, page = 0, size = 10): Promise<News[] | NewsPage | null> => {
    loading.value = true
    error.value = null
    try {
      const endpoint = paged 
        ? `/api/portal/news?paged=true&page=${page}&size=${size}` 
        : '/api/portal/news'
      const response = await $fetch<{ success: boolean; data: News[] | NewsPage }>(endpoint)
      return response.data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener noticias'
      return null
    } finally {
      loading.value = false
    }
  }

  const getNewsById = async (id: string): Promise<News | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: News }>(`/api/portal/news/${id}`)
      return response.data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Noticia no encontrada'
      return null
    } finally {
      loading.value = false
    }
  }

  const getEvents = async (paged = false, page = 0, size = 10): Promise<Event[] | EventPage | null> => {
    loading.value = true
    error.value = null
    try {
      const endpoint = paged
        ? `/api/portal/events?paged=true&page=${page}&size=${size}`
        : '/api/portal/events'
      const response = await $fetch<{ success: boolean; data: Event[] | EventPage }>(endpoint)
      return response.data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener eventos'
      return null
    } finally {
      loading.value = false
    }
  }

  const getUpcomingEvents = async (limit = 3): Promise<Event[]> => {
    const events = await getEvents(false)
    if (!events) return []
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    return (events as Event[])
      .filter(e => new Date(e.eventDate) >= oneYearAgo)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, limit)
  }

  const getPastEvents = async (limit = 20): Promise<Event[]> => {
    const events = await getEvents(false)
    if (!events) return []
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    return (events as Event[])
      .filter(e => new Date(e.eventDate) < oneYearAgo)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, limit)
  }

  const getEventById = async (id: string): Promise<Event | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: Event }>(`/api/portal/events/${id}`)
      return response.data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Evento no encontrado'
      return null
    } finally {
      loading.value = false
    }
  }

  const getAds = async (): Promise<Ad[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ success: boolean; data: Ad[] }>('/api/portal/ads')
      return response.data || []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al obtener anuncios'
      return []
    } finally {
      loading.value = false
    }
  }

const getAdsByPosition = async (position: string): Promise<Ad[]> => {
  loading.value = true
  error.value = null
  try {
    const response = await $fetch<{ success: boolean; data: Ad[] }>(`/api/portal/ads/${position}`)
    return response.data || []
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e.message || 'Error al obtener anuncios'
    return []
  } finally {
    loading.value = false
  }
}

const getAllAds = async (): Promise<Ad[]> => {
  loading.value = true
  error.value = null
  try {
    const response = await $fetch<{ success: boolean; data: Ad[] }>('/api/portal/ads')
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
    const response = await $fetch<{ success: boolean; data: Ad }>(`/api/portal/ads/${id}`)
    return response.data || null
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e.message || 'Anuncio no encontrado'
    return null
  } finally {
    loading.value = false
  }
}

  const sendContactMessage = async (data: ContactForm): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/portal/contact', {
        method: 'POST',
        body: data
      })
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Error al enviar mensaje'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    getInstitution,
    getNews,
    getNewsById,
    getEvents,
    getEventById,
    getUpcomingEvents,
    getPastEvents,
    getAds,
    getAdsByPosition,
    getAllAds,
    getAdById,
    sendContactMessage
  }
}