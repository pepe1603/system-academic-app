export interface Grade {
  id: string
  score: number
  recordedAt?: string
  isDeleted: boolean
  enrollmentId: string
  studentName: string
  enrollmentNumber: string
  evaluationTypeId: string
  evaluationCode: string
  evaluationName: string
  evaluationWeight: number
  courseId: string
  courseCode: string
  courseName: string
}

interface CreateGradeData {
  enrollmentId: string
  evaluationTypeId: string
  score: number
}

interface UpdateGradeData {
  score?: number
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useGrades = () => {
  const grades = ref<Grade[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchGrades = async (page: number = 0, size: number = 10): Promise<Grade[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Grade[]>>('/api/cpanel/grades', {
        query: { page, size }
      })

      console.log('[useGrades] fetchGrades raw response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        grades.value = response.data.map(normalizeGrade)
        return grades.value
      }
      error.value = response.message || 'Error al cargar calificaciones'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar calificaciones'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchGradesByEnrollment = async (enrollmentId: string): Promise<Grade[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Grade[]>>(`/api/cpanel/grades/by-enrollment/${enrollmentId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeGrade)
      }
      error.value = response.message || 'Error al cargar calificaciones por inscripción'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar calificaciones por inscripción'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedGrades = async (): Promise<Grade[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Grade[]>>('/api/cpanel/grades/deleted')

      if (response.success && response.data) {
        grades.value = response.data.map(normalizeGrade)
        return grades.value
      }
      error.value = response.message || 'Error al cargar calificaciones eliminadas'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar calificaciones eliminadas'
      return []
    } finally {
      loading.value = false
    }
  }

  const getGrade = async (id: string): Promise<Grade | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Grade>>(`/api/cpanel/grades/${id}`)

      if (response.success && response.data) {
        return normalizeGrade(response.data)
      }
      error.value = response.message || 'Calificación no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener calificación'
      return null
    } finally {
      loading.value = false
    }
  }

  const createGrade = async (data: CreateGradeData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Grade>>('/api/cpanel/grades', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchGrades(currentPage.value, 10)
        return { success: true, message: response.message || 'Calificación creada' }
      }
      error.value = response.message || 'Error al crear calificación'
      return { success: false, message: response.message || 'Error al crear calificación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear calificación'
      return { success: false, message: e.data?.message || 'Error al crear calificación' }
    } finally {
      loading.value = false
    }
  }

  const updateGrade = async (id: string, data: UpdateGradeData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Grade>>(`/api/cpanel/grades/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchGrades(currentPage.value, 10)
        return { success: true, message: response.message || 'Calificación actualizada' }
      }
      error.value = response.message || 'Error al actualizar calificación'
      return { success: false, message: response.message || 'Error al actualizar calificación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar calificación'
      return { success: false, message: e.data?.message || 'Error al actualizar calificación' }
    } finally {
      loading.value = false
    }
  }

  const deleteGrade = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/grades/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchGrades(currentPage.value, 10)
        return { success: true, message: response.message || 'Calificación eliminada' }
      }
      error.value = response.message || 'Error al eliminar calificación'
      return { success: false, message: response.message || 'Error al eliminar calificación' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar calificación'
      return { success: false, message: e.data?.message || 'Error al eliminar calificación' }
    } finally {
      loading.value = false
    }
  }

  const normalizeGrade = (data: any): Grade => {
    return {
      id: data.id,
      score: data.score,
      recordedAt: data.recordedAt ? formatDateToString(data.recordedAt) : undefined,
      isDeleted: data.isDeleted,
      enrollmentId: data.enrollmentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      evaluationTypeId: data.evaluationTypeId,
      evaluationCode: data.evaluationCode,
      evaluationName: data.evaluationName,
      evaluationWeight: data.evaluationWeight,
      courseId: data.courseId,
      courseCode: data.courseCode,
      courseName: data.courseName
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
    grades,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchGrades,
    fetchGradesByEnrollment,
    fetchDeletedGrades,
    getGrade,
    createGrade,
    updateGrade,
    deleteGrade
  }
}
