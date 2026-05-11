export interface KardexRecord {
  id: string
  finalGrade?: number
  letterGrade?: string
  status: 'ENROLLED' | 'APPROVED' | 'FAILED' | 'EXTRAORDINARY' | 'DROPPED' | 'VALIDATED' | 'EQUIVALENCE'
  attemptNumber: number
  enrollmentDate?: string
  approvalDate?: string
  officialFolio?: string
  isOfficialized: boolean
  observations?: string
  isDeleted: boolean
  createdAt?: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  courseId: string
  courseCode: string
  courseName: string
  courseCredits?: number
  academicSemesterId: string
  academicSemesterName: string
  enrollmentId?: string
}

interface CreateKardexData {
  studentId: string
  courseId: string
  academicSemesterId: string
  enrollmentId?: string
  status?: string
  finalGrade?: number
  attemptNumber?: number
  observations?: string
}

interface UpdateKardexData {
  status?: string
  finalGrade?: number
  letterGrade?: string
  attemptNumber?: number
  approvalDate?: string
  isOfficialized?: boolean
  officialFolio?: string
  observations?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useKardex = () => {
  const records = ref<KardexRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchKardex = async (page: number = 0, size: number = 10): Promise<KardexRecord[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<KardexRecord[]>>('/api/cpanel/kardex', {
        query: { page, size }
      })

      console.log('[useKardex] fetchKardex raw response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        records.value = response.data.map(normalizeKardex)
        return records.value
      }
      error.value = response.message || 'Error al cargar kardex'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar kardex'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchKardexByStudent = async (studentId: string): Promise<KardexRecord[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<KardexRecord[]>>(`/api/cpanel/kardex/by-student/${studentId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeKardex)
      }
      error.value = response.message || 'Error al cargar kardex del estudiante'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar kardex del estudiante'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedKardex = async (): Promise<KardexRecord[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<KardexRecord[]>>('/api/cpanel/kardex/deleted')

      if (response.success && response.data) {
        records.value = response.data.map(normalizeKardex)
        return records.value
      }
      error.value = response.message || 'Error al cargar kardex eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar kardex eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getKardex = async (id: string): Promise<KardexRecord | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<KardexRecord>>(`/api/cpanel/kardex/${id}`)

      if (response.success && response.data) {
        return normalizeKardex(response.data)
      }
      error.value = response.message || 'Registro kardex no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener registro kardex'
      return null
    } finally {
      loading.value = false
    }
  }

  const createKardex = async (data: CreateKardexData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<KardexRecord>>('/api/cpanel/kardex', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchKardex(currentPage.value, 10)
        return { success: true, message: response.message || 'Registro kardex creado' }
      }
      error.value = response.message || 'Error al crear registro kardex'
      return { success: false, message: response.message || 'Error al crear registro kardex' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear registro kardex'
      return { success: false, message: e.data?.message || 'Error al crear registro kardex' }
    } finally {
      loading.value = false
    }
  }

  const updateKardex = async (id: string, data: UpdateKardexData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<KardexRecord>>(`/api/cpanel/kardex/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchKardex(currentPage.value, 10)
        return { success: true, message: response.message || 'Registro kardex actualizado' }
      }
      error.value = response.message || 'Error al actualizar registro kardex'
      return { success: false, message: response.message || 'Error al actualizar registro kardex' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar registro kardex'
      return { success: false, message: e.data?.message || 'Error al actualizar registro kardex' }
    } finally {
      loading.value = false
    }
  }

  const deleteKardex = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/kardex/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchKardex(currentPage.value, 10)
        return { success: true, message: response.message || 'Registro kardex eliminado' }
      }
      error.value = response.message || 'Error al eliminar registro kardex'
      return { success: false, message: response.message || 'Error al eliminar registro kardex' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar registro kardex'
      return { success: false, message: e.data?.message || 'Error al eliminar registro kardex' }
    } finally {
      loading.value = false
    }
  }

  const normalizeKardex = (data: any): KardexRecord => {
    return {
      id: data.id,
      finalGrade: data.finalGrade,
      letterGrade: data.letterGrade,
      status: data.status,
      attemptNumber: data.attemptNumber ?? 1,
      enrollmentDate: data.enrollmentDate ? formatDateToString(data.enrollmentDate) : undefined,
      approvalDate: data.approvalDate ? formatDateToString(data.approvalDate) : undefined,
      officialFolio: data.officialFolio,
      isOfficialized: data.isOfficialized ?? false,
      observations: data.observations,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
      studentId: data.studentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      courseId: data.courseId,
      courseCode: data.courseCode,
      courseName: data.courseName,
      courseCredits: data.courseCredits,
      academicSemesterId: data.academicSemesterId,
      academicSemesterName: data.academicSemesterName,
      enrollmentId: data.enrollmentId
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
    records,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchKardex,
    fetchKardexByStudent,
    fetchDeletedKardex,
    getKardex,
    createKardex,
    updateKardex,
    deleteKardex
  }
}
