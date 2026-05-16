export interface EducationalResource {
  id: string
  title: string
  resourceType: string
  resourceUrl: string
  courseId?: string
  courseName?: string
  isPublished: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateEducationalResourceData {
  title: string
  resourceType: string
  resourceUrl: string
  courseId?: string
  isPublished?: boolean
}

interface UpdateEducationalResourceData {
  title?: string
  resourceType?: string
  resourceUrl?: string
  courseId?: string
  isPublished?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useEducationalResources = () => {
  const resources = ref<EducationalResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchResources = async (page: number = 0, size: number = 10): Promise<EducationalResource[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EducationalResource[]>>('/api/cpanel/educational-resources', {
        query: { page, size }
      })

      if (response.success && response.data) {
        resources.value = response.data.map(normalize)
        return resources.value
      }
      error.value = response.message || 'Error al cargar recursos educativos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar recursos educativos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedResources = async (): Promise<EducationalResource[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EducationalResource[]>>('/api/cpanel/educational-resources/deleted')

      if (response.success && response.data) {
        resources.value = response.data.map(normalize)
        return resources.value
      }
      error.value = response.message || 'Error al cargar recursos educativos eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar recursos educativos eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getResource = async (id: string): Promise<EducationalResource | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EducationalResource>>(`/api/cpanel/educational-resources/${id}`)

      if (response.success && response.data) {
        return normalize(response.data)
      }
      error.value = response.message || 'Recurso educativo no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener recurso educativo'
      return null
    } finally {
      loading.value = false
    }
  }

  const createResource = async (data: CreateEducationalResourceData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EducationalResource>>('/api/cpanel/educational-resources', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchResources(currentPage.value, 10)
        return { success: true, message: response.message || 'Recurso educativo creado' }
      }
      error.value = response.message || 'Error al crear recurso educativo'
      return { success: false, message: response.message || 'Error al crear recurso educativo' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear recurso educativo'
      return { success: false, message: e.data?.message || 'Error al crear recurso educativo' }
    } finally {
      loading.value = false
    }
  }

  const updateResource = async (id: string, data: UpdateEducationalResourceData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EducationalResource>>(`/api/cpanel/educational-resources/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchResources(currentPage.value, 10)
        return { success: true, message: response.message || 'Recurso educativo actualizado' }
      }
      error.value = response.message || 'Error al actualizar recurso educativo'
      return { success: false, message: response.message || 'Error al actualizar recurso educativo' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar recurso educativo'
      return { success: false, message: e.data?.message || 'Error al actualizar recurso educativo' }
    } finally {
      loading.value = false
    }
  }

  const deleteResource = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/educational-resources/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchResources(currentPage.value, 10)
        return { success: true, message: response.message || 'Recurso educativo eliminado' }
      }
      error.value = response.message || 'Error al eliminar recurso educativo'
      return { success: false, message: response.message || 'Error al eliminar recurso educativo' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar recurso educativo'
      return { success: false, message: e.data?.message || 'Error al eliminar recurso educativo' }
    } finally {
      loading.value = false
    }
  }

  const normalize = (data: any): EducationalResource => ({
    id: data.id,
    title: data.title,
    resourceType: data.resourceType,
    resourceUrl: data.resourceUrl,
    courseId: data.courseId,
    courseName: data.courseName,
    isPublished: data.isPublished ?? false,
    isDeleted: data.isDeleted ?? false,
    createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined
  })

  const formatDateToString = (date: any): string => {
    if (!date) return ''
    if (typeof date === 'string') return date.split('T')[0] || ''
    if (typeof date === 'object' && date.date) return date.date.split(' ')[0] || ''
    if (typeof date === 'object' && date.year) {
      return `${date.year}-${String(date.monthValue || date.month || '').padStart(2, '0')}-${String(date.dayOfMonth || date.day || '').padStart(2, '0')}`
    }
    return ''
  }

  return {
    resources,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchResources,
    fetchDeletedResources,
    getResource,
    createResource,
    updateResource,
    deleteResource
  }
}
