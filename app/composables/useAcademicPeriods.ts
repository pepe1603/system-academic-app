export interface AcademicPeriod {
  id: string
  name: string
  startDate?: string
  endDate?: string
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateAcademicPeriodData {
  name: string
  startDate: string
  endDate: string
}

interface UpdateAcademicPeriodData {
  name?: string
  startDate?: string
  endDate?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useAcademicPeriods = () => {
  const periods = ref<AcademicPeriod[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchPeriods = async (page: number = 0, size: number = 10): Promise<AcademicPeriod[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicPeriod[]>>('/api/cpanel/academic-periods', {
        query: { page, size }
      })

      if (response.success && response.data) {
        periods.value = response.data.map(normalizePeriod)
        return periods.value
      }
      error.value = response.message || 'Error al cargar períodos académicos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar períodos académicos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedPeriods = async (): Promise<AcademicPeriod[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicPeriod[]>>('/api/cpanel/academic-periods/deleted')

      if (response.success && response.data) {
        periods.value = response.data.map(normalizePeriod)
        return periods.value
      }
      error.value = response.message || 'Error al cargar períodos eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar períodos eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getPeriod = async (id: string): Promise<AcademicPeriod | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicPeriod>>(`/api/cpanel/academic-periods/${id}`)

      if (response.success && response.data) {
        return normalizePeriod(response.data)
      }
      error.value = response.message || 'Período no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener período'
      return null
    } finally {
      loading.value = false
    }
  }

  const createPeriod = async (data: CreateAcademicPeriodData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicPeriod>>('/api/cpanel/academic-periods', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchPeriods(currentPage.value, 10)
        return { success: true, message: response.message || 'Período académico creado' }
      }
      error.value = response.message || 'Error al crear período'
      return { success: false, message: response.message || 'Error al crear período' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear período'
      return { success: false, message: e.data?.message || 'Error al crear período' }
    } finally {
      loading.value = false
    }
  }

  const updatePeriod = async (id: string, data: UpdateAcademicPeriodData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicPeriod>>(`/api/cpanel/academic-periods/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchPeriods(currentPage.value, 10)
        return { success: true, message: response.message || 'Período actualizado' }
      }
      error.value = response.message || 'Error al actualizar período'
      return { success: false, message: response.message || 'Error al actualizar período' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar período'
      return { success: false, message: e.data?.message || 'Error al actualizar período' }
    } finally {
      loading.value = false
    }
  }

  const deletePeriod = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/academic-periods/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchPeriods(currentPage.value, 10)
        return { success: true, message: response.message || 'Período eliminado' }
      }
      error.value = response.message || 'Error al eliminar período'
      return { success: false, message: response.message || 'Error al eliminar período' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar período'
      return { success: false, message: e.data?.message || 'Error al eliminar período' }
    } finally {
      loading.value = false
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

  const normalizePeriod = (data: any): AcademicPeriod => {
    return {
      id: data.id,
      name: data.name,
      startDate: data.startDate ? formatDateToString(data.startDate) : undefined,
      endDate: data.endDate ? formatDateToString(data.endDate) : undefined,
      isActive: data.isActive,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined
    }
  }

  return {
    periods,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchPeriods,
    fetchDeletedPeriods,
    getPeriod,
    createPeriod,
    updatePeriod,
    deletePeriod
  }
}
