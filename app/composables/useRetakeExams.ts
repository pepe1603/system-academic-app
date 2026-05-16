export interface RetakeExam {
  id: string
  previousAverage?: number
  status: string
  isDeleted: boolean
  createdAt?: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  courseId: string
  courseCode: string
  courseName: string
  academicSemesterId: string
  academicSemesterName?: string
  originSemesterId?: string
  originSemesterName?: string
}

interface CreateRetakeExamData {
  studentId: string
  courseId: string
  academicSemesterId: string
  originSemesterId?: string
  previousAverage?: number
}

interface UpdateRetakeExamData {
  originSemesterId?: string
  previousAverage?: number
  status?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useRetakeExams = () => {
  const exams = ref<RetakeExam[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchExams = async (page: number = 0, size: number = 10): Promise<RetakeExam[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<RetakeExam[]>>('/api/cpanel/retake-exams', {
        query: { page, size }
      })

      if (response.success && response.data) {
        exams.value = response.data.map(normalizeExam)
        return exams.value
      }
      error.value = response.message || 'Error al cargar retake exams'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar retake exams'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedExams = async (): Promise<RetakeExam[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<RetakeExam[]>>('/api/cpanel/retake-exams/deleted')

      if (response.success && response.data) {
        exams.value = response.data.map(normalizeExam)
        return exams.value
      }
      error.value = response.message || 'Error al cargar retake exams eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar retake exams eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getExam = async (id: string): Promise<RetakeExam | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<RetakeExam>>(`/api/cpanel/retake-exams/${id}`)

      if (response.success && response.data) {
        return normalizeExam(response.data)
      }
      error.value = response.message || 'Retake exam no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener retake exam'
      return null
    } finally {
      loading.value = false
    }
  }

  const createExam = async (data: CreateRetakeExamData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<RetakeExam>>('/api/cpanel/retake-exams', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchExams(currentPage.value, 10)
        return { success: true, message: response.message || 'Retake exam creado' }
      }
      error.value = response.message || 'Error al crear retake exam'
      return { success: false, message: response.message || 'Error al crear retake exam' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear retake exam'
      return { success: false, message: e.data?.message || 'Error al crear retake exam' }
    } finally {
      loading.value = false
    }
  }

  const updateExam = async (id: string, data: UpdateRetakeExamData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<RetakeExam>>(`/api/cpanel/retake-exams/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchExams(currentPage.value, 10)
        return { success: true, message: response.message || 'Retake exam actualizado' }
      }
      error.value = response.message || 'Error al actualizar retake exam'
      return { success: false, message: response.message || 'Error al actualizar retake exam' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar retake exam'
      return { success: false, message: e.data?.message || 'Error al actualizar retake exam' }
    } finally {
      loading.value = false
    }
  }

  const deleteExam = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/retake-exams/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchExams(currentPage.value, 10)
        return { success: true, message: response.message || 'Retake exam eliminado' }
      }
      error.value = response.message || 'Error al eliminar retake exam'
      return { success: false, message: response.message || 'Error al eliminar retake exam' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar retake exam'
      return { success: false, message: e.data?.message || 'Error al eliminar retake exam' }
    } finally {
      loading.value = false
    }
  }

  const normalizeExam = (data: any): RetakeExam => {
    return {
      id: data.id,
      previousAverage: data.previousAverage,
      status: data.status,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
      studentId: data.studentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      courseId: data.courseId,
      courseCode: data.courseCode,
      courseName: data.courseName,
      academicSemesterId: data.academicSemesterId,
      academicSemesterName: data.academicSemesterName,
      originSemesterId: data.originSemesterId,
      originSemesterName: data.originSemesterName
    }
  }

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
    exams,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchExams,
    fetchDeletedExams,
    getExam,
    createExam,
    updateExam,
    deleteExam
  }
}
