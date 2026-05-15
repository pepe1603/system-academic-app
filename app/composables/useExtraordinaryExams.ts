export interface ExtraordinaryExam {
  id: string
  attemptNumber: number
  status: string
  scheduledDate?: string
  applicationDate?: string
  applicationTime?: string
  applicationLocation?: string
  previousGrade?: number
  grade?: number
  gradeLetter?: string
  observation?: string
  cost?: number
  paymentReceipt?: string
  paymentFolio?: string
  isDeleted: boolean
  createdAt?: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  courseId: string
  courseCode: string
  courseName: string
  academicSemesterId?: string
  academicSemesterName?: string
  examinerId?: string
  examinerName?: string
}

interface CreateExtraordinaryExamData {
  studentId: string
  courseId: string
  academicSemesterId?: string
  attemptNumber?: number
  scheduledDate?: string
  applicationTime?: string
  applicationLocation?: string
  previousGrade?: number
  examinerId?: string
  observation?: string
  cost?: number
  paymentReceipt?: string
  paymentFolio?: string
}

interface UpdateExtraordinaryExamData {
  attemptNumber?: number
  status?: string
  scheduledDate?: string
  applicationDate?: string
  applicationTime?: string
  applicationLocation?: string
  previousGrade?: number
  grade?: number
  gradeLetter?: string
  examinerId?: string
  observation?: string
  cost?: number
  paymentReceipt?: string
  paymentFolio?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useExtraordinaryExams = () => {
  const exams = ref<ExtraordinaryExam[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchExams = async (page: number = 0, size: number = 10): Promise<ExtraordinaryExam[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ExtraordinaryExam[]>>('/api/cpanel/extraordinary-exams', {
        query: { page, size }
      })

      if (response.success && response.data) {
        exams.value = response.data.map(normalizeExam)
        return exams.value
      }
      error.value = response.message || 'Error al cargar exámenes extraordinarios'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar exámenes extraordinarios'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedExams = async (): Promise<ExtraordinaryExam[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ExtraordinaryExam[]>>('/api/cpanel/extraordinary-exams/deleted')

      if (response.success && response.data) {
        exams.value = response.data.map(normalizeExam)
        return exams.value
      }
      error.value = response.message || 'Error al cargar exámenes eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar exámenes eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getExam = async (id: string): Promise<ExtraordinaryExam | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ExtraordinaryExam>>(`/api/cpanel/extraordinary-exams/${id}`)

      if (response.success && response.data) {
        return normalizeExam(response.data)
      }
      error.value = response.message || 'Examen no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener examen'
      return null
    } finally {
      loading.value = false
    }
  }

  const createExam = async (data: CreateExtraordinaryExamData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ExtraordinaryExam>>('/api/cpanel/extraordinary-exams', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchExams(currentPage.value, 10)
        return { success: true, message: response.message || 'Examen extraordinario creado' }
      }
      error.value = response.message || 'Error al crear examen extraordinario'
      return { success: false, message: response.message || 'Error al crear examen extraordinario' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear examen extraordinario'
      return { success: false, message: e.data?.message || 'Error al crear examen extraordinario' }
    } finally {
      loading.value = false
    }
  }

  const updateExam = async (id: string, data: UpdateExtraordinaryExamData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ExtraordinaryExam>>(`/api/cpanel/extraordinary-exams/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchExams(currentPage.value, 10)
        return { success: true, message: response.message || 'Examen extraordinario actualizado' }
      }
      error.value = response.message || 'Error al actualizar examen extraordinario'
      return { success: false, message: response.message || 'Error al actualizar examen extraordinario' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar examen extraordinario'
      return { success: false, message: e.data?.message || 'Error al actualizar examen extraordinario' }
    } finally {
      loading.value = false
    }
  }

  const deleteExam = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/extraordinary-exams/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchExams(currentPage.value, 10)
        return { success: true, message: response.message || 'Examen extraordinario eliminado' }
      }
      error.value = response.message || 'Error al eliminar examen extraordinario'
      return { success: false, message: response.message || 'Error al eliminar examen extraordinario' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar examen extraordinario'
      return { success: false, message: e.data?.message || 'Error al eliminar examen extraordinario' }
    } finally {
      loading.value = false
    }
  }

  const normalizeExam = (data: any): ExtraordinaryExam => {
    return {
      id: data.id,
      attemptNumber: data.attemptNumber,
      status: data.status,
      scheduledDate: data.scheduledDate ? formatDateToString(data.scheduledDate) : undefined,
      applicationDate: data.applicationDate ? formatDateToString(data.applicationDate) : undefined,
      applicationTime: data.applicationTime,
      applicationLocation: data.applicationLocation,
      previousGrade: data.previousGrade,
      grade: data.grade,
      gradeLetter: data.gradeLetter,
      observation: data.observation,
      cost: data.cost,
      paymentReceipt: data.paymentReceipt,
      paymentFolio: data.paymentFolio,
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
      examinerId: data.examinerId,
      examinerName: data.examinerName
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
