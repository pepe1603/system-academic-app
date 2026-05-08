export interface Enrollment {
  id: string
  status: 'ENROLLED' | 'APPROVED' | 'FAILED' | 'WITHDRAWN'
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  courseId: string
  courseCode: string
  courseName: string
  academicPeriodId: string
  academicPeriodName: string
  groupId?: string
  groupName?: string
}

interface CreateEnrollmentData {
  studentId: string
  courseId: string
  academicPeriodId: string
  groupId?: string
  status?: string
}

interface UpdateEnrollmentData {
  studentId?: string
  courseId?: string
  academicPeriodId?: string
  groupId?: string
  status?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useEnrollments = () => {
  const enrollments = ref<Enrollment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchEnrollments = async (page: number = 0, size: number = 10): Promise<Enrollment[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Enrollment[]>>('/api/cpanel/enrollments', {
        query: { page, size }
      })

      console.log('[useEnrollments] fetchEnrollments raw response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        enrollments.value = response.data.map(normalizeEnrollment)
        return enrollments.value
      }
      error.value = response.message || 'Error al cargar inscripciones'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar inscripciones'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedEnrollments = async (): Promise<Enrollment[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Enrollment[]>>('/api/cpanel/enrollments/deleted')

      if (response.success && response.data) {
        enrollments.value = response.data.map(normalizeEnrollment)
        return enrollments.value
      }
      error.value = response.message || 'Error al cargar inscripciones eliminadas'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar inscripciones eliminadas'
      return []
    } finally {
      loading.value = false
    }
  }

  const getEnrollment = async (id: string): Promise<Enrollment | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Enrollment>>(`/api/cpanel/enrollments/${id}`)

      if (response.success && response.data) {
        return normalizeEnrollment(response.data)
      }
      error.value = response.message || 'Inscripción no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener inscripción'
      return null
    } finally {
      loading.value = false
    }
  }

  const createEnrollment = async (data: CreateEnrollmentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Enrollment>>('/api/cpanel/enrollments', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchEnrollments(currentPage.value, 10)
        return { success: true, message: response.message || 'Inscripción creada' }
      }
      error.value = response.message || 'Error al crear inscripción'
      return { success: false, message: response.message || 'Error al crear inscripción' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear inscripción'
      return { success: false, message: e.data?.message || 'Error al crear inscripción' }
    } finally {
      loading.value = false
    }
  }

  const updateEnrollment = async (id: string, data: UpdateEnrollmentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Enrollment>>(`/api/cpanel/enrollments/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchEnrollments(currentPage.value, 10)
        return { success: true, message: response.message || 'Inscripción actualizada' }
      }
      error.value = response.message || 'Error al actualizar inscripción'
      return { success: false, message: response.message || 'Error al actualizar inscripción' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar inscripción'
      return { success: false, message: e.data?.message || 'Error al actualizar inscripción' }
    } finally {
      loading.value = false
    }
  }

  const deleteEnrollment = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/enrollments/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchEnrollments(currentPage.value, 10)
        return { success: true, message: response.message || 'Inscripción eliminada' }
      }
      error.value = response.message || 'Error al eliminar inscripción'
      return { success: false, message: response.message || 'Error al eliminar inscripción' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar inscripción'
      return { success: false, message: e.data?.message || 'Error al eliminar inscripción' }
    } finally {
      loading.value = false
    }
  }

  const normalizeEnrollment = (data: any): Enrollment => {
    return {
      id: data.id,
      status: data.status,
      isActive: data.isActive,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
      studentId: data.studentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      courseId: data.courseId,
      courseCode: data.courseCode,
      courseName: data.courseName,
      academicPeriodId: data.academicPeriodId,
      academicPeriodName: data.academicPeriodName,
      groupId: data.groupId,
      groupName: data.groupName
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
    enrollments,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchEnrollments,
    fetchDeletedEnrollments,
    getEnrollment,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
  }
}
