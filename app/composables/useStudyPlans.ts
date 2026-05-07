export interface StudyPlan {
  id: string
  code: string
  name: string
  version?: string
  description?: string
  titleDegree?: string
  totalCredits?: number
  durationSemesters?: number
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateStudyPlanData {
  code: string
  name: string
  version?: string
  description?: string
  titleDegree?: string
  totalCredits?: number
  durationSemesters?: number
}

interface UpdateStudyPlanData {
  code?: string
  name?: string
  version?: string
  description?: string
  titleDegree?: string
  totalCredits?: number
  durationSemesters?: number
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useStudyPlans = () => {
  const plans = ref<StudyPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchPlans = async (page: number = 0, size: number = 10): Promise<StudyPlan[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<StudyPlan[]>>('/api/cpanel/study-plans', {
        query: { page, size }
      })
      
      if (response.success && response.data) {
        plans.value = response.data.map(normalizeStudyPlan)
        return plans.value
      }
      error.value = response.message || 'Error al cargar planes de estudio'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar planes de estudio'
      return []
    } finally {
      loading.value = false
    }
  }

  const getPlan = async (id: string): Promise<StudyPlan | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<StudyPlan>>(`/api/cpanel/study-plans/${id}`)
      
      if (response.success && response.data) {
        return normalizeStudyPlan(response.data)
      }
      error.value = response.message || 'Plan de estudio no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener plan de estudio'
      return null
    } finally {
      loading.value = false
    }
  }

  const createPlan = async (data: CreateStudyPlanData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<StudyPlan>>('/api/cpanel/study-plans', {
        method: 'POST',
        body: data
      })
      
      if (response.success) {
        await fetchPlans(currentPage.value, 10)
        return { success: true, message: response.message || 'Plan de estudio creado' }
      }
      error.value = response.message || 'Error al crear plan de estudio'
      return { success: false, message: response.message || 'Error al crear plan de estudio' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear plan de estudio'
      return { success: false, message: e.data?.message || 'Error al crear plan de estudio' }
    } finally {
      loading.value = false
    }
  }

  const updatePlan = async (id: string, data: UpdateStudyPlanData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<StudyPlan>>(`/api/cpanel/study-plans/${id}`, {
        method: 'PUT',
        body: data
      })
      
      if (response.success) {
        await fetchPlans(currentPage.value, 10)
        return { success: true, message: response.message || 'Plan de estudio actualizado' }
      }
      error.value = response.message || 'Error al actualizar plan de estudio'
      return { success: false, message: response.message || 'Error al actualizar plan de estudio' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar plan de estudio'
      return { success: false, message: e.data?.message || 'Error al actualizar plan de estudio' }
    } finally {
      loading.value = false
    }
  }

  const deletePlan = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/study-plans/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        await fetchPlans(currentPage.value, 10)
        return { success: true, message: response.message || 'Plan de estudio eliminado' }
      }
      error.value = response.message || 'Error al eliminar plan de estudio'
      return { success: false, message: response.message || 'Error al eliminar plan de estudio' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar plan de estudio'
      return { success: false, message: e.data?.message || 'Error al eliminar plan de estudio' }
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedPlans = async (page: number = 0, size: number = 10): Promise<StudyPlan[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<StudyPlan[]>>('/api/cpanel/study-plans/deleted', {
        query: { page, size }
      })
      
      if (response.success && response.data) {
        plans.value = response.data.map(normalizeStudyPlan)
        return plans.value
      }
      error.value = response.message || 'Error al cargar planes eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar planes eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const normalizeStudyPlan = (data: any): StudyPlan => {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      version: data.version,
      description: data.description,
      titleDegree: data.titleDegree,
      totalCredits: data.totalCredits,
      durationSemesters: data.durationSemesters,
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
    plans,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchPlans,
    fetchDeletedPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
  }
}