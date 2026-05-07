export interface EvaluationType {
  id: string
  code: string
  name?: string
  weight?: number
  isActive: boolean
  createdAt?: string
  courseId: string
  courseCode: string
  courseName: string
}

interface CreateEvaluationTypeData {
  courseId: string
  code: string
  name?: string
  weight?: number
}

interface UpdateEvaluationTypeData {
  courseId?: string
  code?: string
  name?: string
  weight?: number
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useEvaluationTypes = () => {
  const types = ref<EvaluationType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchTypes = async (page: number = 0, size: number = 10): Promise<EvaluationType[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EvaluationType[]>>('/api/cpanel/evaluation-types', {
        query: { page, size }
      })

      if (response.success && response.data) {
        types.value = response.data
        return types.value
      }
      error.value = response.message || 'Error al cargar tipos de evaluación'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar tipos de evaluación'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchInactiveTypes = async (): Promise<EvaluationType[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EvaluationType[]>>('/api/cpanel/evaluation-types/inactive')

      if (response.success && response.data) {
        types.value = response.data
        return types.value
      }
      error.value = response.message || 'Error al cargar tipos inactivos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar tipos inactivos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchTypesByCourse = async (courseId: string): Promise<EvaluationType[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EvaluationType[]>>(`/api/cpanel/evaluation-types/by-course/${courseId}`)

      if (response.success && response.data) {
        types.value = response.data
        return types.value
      }
      error.value = response.message || 'Error al cargar tipos del curso'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar tipos del curso'
      return []
    } finally {
      loading.value = false
    }
  }

  const getType = async (id: string): Promise<EvaluationType | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EvaluationType>>(`/api/cpanel/evaluation-types/${id}`)

      if (response.success && response.data) {
        return response.data
      }
      error.value = response.message || 'Tipo de evaluación no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener tipo de evaluación'
      return null
    } finally {
      loading.value = false
    }
  }

  const createType = async (data: CreateEvaluationTypeData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EvaluationType>>('/api/cpanel/evaluation-types', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchTypes(currentPage.value, 10)
        return { success: true, message: response.message || 'Tipo de evaluación creado' }
      }
      error.value = response.message || 'Error al crear tipo de evaluación'
      return { success: false, message: response.message || 'Error al crear tipo de evaluación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear tipo de evaluación'
      return { success: false, message: e.data?.message || 'Error al crear tipo de evaluación' }
    } finally {
      loading.value = false
    }
  }

  const updateType = async (id: string, data: UpdateEvaluationTypeData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EvaluationType>>(`/api/cpanel/evaluation-types/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchTypes(currentPage.value, 10)
        return { success: true, message: response.message || 'Tipo de evaluación actualizado' }
      }
      error.value = response.message || 'Error al actualizar tipo de evaluación'
      return { success: false, message: response.message || 'Error al actualizar tipo de evaluación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar tipo de evaluación'
      return { success: false, message: e.data?.message || 'Error al actualizar tipo de evaluación' }
    } finally {
      loading.value = false
    }
  }

  const deleteType = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/evaluation-types/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchTypes(currentPage.value, 10)
        return { success: true, message: response.message || 'Tipo de evaluación eliminado' }
      }
      error.value = response.message || 'Error al eliminar tipo de evaluación'
      return { success: false, message: response.message || 'Error al eliminar tipo de evaluación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar tipo de evaluación'
      return { success: false, message: e.data?.message || 'Error al eliminar tipo de evaluación' }
    } finally {
      loading.value = false
    }
  }

  return {
    types,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchTypes,
    fetchInactiveTypes,
    fetchTypesByCourse,
    getType,
    createType,
    updateType,
    deleteType
  }
}
