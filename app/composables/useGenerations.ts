export interface Generation {
  id: string
  name: string
  entryYear: number
  graduationYear?: number
  status: 'ACTIVE' | 'GRADUATED' | 'ARCHIVED'
  startDate?: string
  endDate?: string
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateGenerationData {
  name: string
  entryYear: number
  graduationYear?: number
  status: string
  startDate: string
  endDate?: string
}

interface UpdateGenerationData {
  name?: string
  entryYear?: number
  graduationYear?: number
  status?: string
  startDate?: string
  endDate?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useGenerations = () => {
  const generations = ref<Generation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchGenerations = async (page: number = 0, size: number = 10): Promise<Generation[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Generation[]>>('/api/cpanel/generations', {
        query: { page, size }
      })
      
      if (response.success && response.data) {
        generations.value = response.data.map(normalizeGeneration)
        return generations.value
      }
      error.value = response.message || 'Error al cargar generaciones'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar generaciones'
      return []
    } finally {
      loading.value = false
    }
  }

  const getGeneration = async (id: string): Promise<Generation | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Generation>>(`/api/cpanel/generations/${id}`)
      
      if (response.success && response.data) {
        return normalizeGeneration(response.data)
      }
      error.value = response.message || 'Generación no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener generación'
      return null
    } finally {
      loading.value = false
    }
  }

  const createGeneration = async (data: CreateGenerationData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Generation>>('/api/cpanel/generations', {
        method: 'POST',
        body: data
      })
      
      if (response.success) {
        await fetchGenerations(currentPage.value, 10)
        return { success: true, message: response.message || 'Generación creada' }
      }
      error.value = response.message || 'Error al crear generación'
      return { success: false, message: response.message || 'Error al crear generación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear generación'
      return { success: false, message: e.data?.message || 'Error al crear generación' }
    } finally {
      loading.value = false
    }
  }

  const updateGeneration = async (id: string, data: UpdateGenerationData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Generation>>(`/api/cpanel/generations/${id}`, {
        method: 'PUT',
        body: data
      })
      
      if (response.success) {
        await fetchGenerations(currentPage.value, 10)
        return { success: true, message: response.message || 'Generación actualizada' }
      }
      error.value = response.message || 'Error al actualizar generación'
      return { success: false, message: response.message || 'Error al actualizar generación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar generación'
      return { success: false, message: e.data?.message || 'Error al actualizar generación' }
    } finally {
      loading.value = false
    }
  }

  const deleteGeneration = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/generations/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        await fetchGenerations(currentPage.value, 10)
        return { success: true, message: response.message || 'Generación eliminada' }
      }
      error.value = response.message || 'Error al eliminar generación'
      return { success: false, message: response.message || 'Error al eliminar generación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar generación'
      return { success: false, message: e.data?.message || 'Error al eliminar generación' }
    } finally {
      loading.value = false
    }
  }

  const normalizeGeneration = (data: any): Generation => {
    return {
      id: data.id,
      name: data.name,
      entryYear: data.entryYear,
      graduationYear: data.graduationYear,
      status: data.status,
      startDate: data.startDate ? formatDateToString(data.startDate) : undefined,
      endDate: data.endDate ? formatDateToString(data.endDate) : undefined,
      isActive: data.isActive,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined
    }
  }

  const formatDateToString = (date: any): string => {
    if (!date) return ''
    if (typeof date === 'string') return date.split('T')[0] || ''
    if (typeof date === 'object' && date.date) {
      return date.date.split(' ')[0] || ''
    }
    if (typeof date === 'object' && date.year) {
      return `${date.year}-${String(date.monthValue || date.month || '').padStart(2, '0')}-${String(date.dayOfMonth || date.day || '').padStart(2, '0')}`
    }
    return ''
  }

  return {
    generations,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchGenerations,
    getGeneration,
    createGeneration,
    updateGeneration,
    deleteGeneration
  }
}