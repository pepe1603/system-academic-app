export interface AcademicSemester {
  id: string
  name: string
  year: number
  period: number
  startDate?: string
  endDate?: string
  classesStartDate?: string
  classesEndDate?: string
  enrollmentDeadline?: string
  dropDeadline?: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED'
  isCurrent: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateAcademicSemesterData {
  name: string
  year: number
  period: number
  startDate?: string
  endDate?: string
  classesStartDate?: string
  classesEndDate?: string
  enrollmentDeadline?: string
  dropDeadline?: string
  status: string
  isCurrent: boolean
}

interface UpdateAcademicSemesterData {
  name?: string
  year?: number
  period?: number
  startDate?: string
  endDate?: string
  classesStartDate?: string
  classesEndDate?: string
  enrollmentDeadline?: string
  dropDeadline?: string
  status?: string
  isCurrent?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useAcademicSemesters = () => {
  const semesters = ref<AcademicSemester[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchSemesters = async (page: number = 0, size: number = 10): Promise<AcademicSemester[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicSemester[]>>('/api/cpanel/academic-semesters', {
        query: { page, size }
      })

      if (response.success && response.data) {
        semesters.value = response.data.map(normalizeSemester)
        return semesters.value
      }
      error.value = response.message || 'Error al cargar semestres académicos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar semestres académicos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedSemesters = async (): Promise<AcademicSemester[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicSemester[]>>('/api/cpanel/academic-semesters/deleted')

      if (response.success && response.data) {
        semesters.value = response.data.map(normalizeSemester)
        return semesters.value
      }
      error.value = response.message || 'Error al cargar semestres eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar semestres eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getSemester = async (id: string): Promise<AcademicSemester | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicSemester>>(`/api/cpanel/academic-semesters/${id}`)

      if (response.success && response.data) {
        return normalizeSemester(response.data)
      }
      error.value = response.message || 'Semestre no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener semestre'
      return null
    } finally {
      loading.value = false
    }
  }

  const createSemester = async (data: CreateAcademicSemesterData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicSemester>>('/api/cpanel/academic-semesters', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchSemesters(currentPage.value, 10)
        return { success: true, message: response.message || 'Semestre académico creado' }
      }
      error.value = response.message || 'Error al crear semestre'
      return { success: false, message: response.message || 'Error al crear semestre' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear semestre'
      return { success: false, message: e.data?.message || 'Error al crear semestre' }
    } finally {
      loading.value = false
    }
  }

  const updateSemester = async (id: string, data: UpdateAcademicSemesterData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicSemester>>(`/api/cpanel/academic-semesters/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchSemesters(currentPage.value, 10)
        return { success: true, message: response.message || 'Semestre actualizado' }
      }
      error.value = response.message || 'Error al actualizar semestre'
      return { success: false, message: response.message || 'Error al actualizar semestre' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar semestre'
      return { success: false, message: e.data?.message || 'Error al actualizar semestre' }
    } finally {
      loading.value = false
    }
  }

  const deleteSemester = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/academic-semesters/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchSemesters(currentPage.value, 10)
        return { success: true, message: response.message || 'Semestre eliminado' }
      }
      error.value = response.message || 'Error al eliminar semestre'
      return { success: false, message: response.message || 'Error al eliminar semestre' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar semestre'
      return { success: false, message: e.data?.message || 'Error al eliminar semestre' }
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

  const normalizeSemester = (data: any): AcademicSemester => {
    return {
      id: data.id,
      name: data.name,
      year: data.year,
      period: data.period,
      startDate: data.startDate ? formatDateToString(data.startDate) : undefined,
      endDate: data.endDate ? formatDateToString(data.endDate) : undefined,
      classesStartDate: data.classesStartDate ? formatDateToString(data.classesStartDate) : undefined,
      classesEndDate: data.classesEndDate ? formatDateToString(data.classesEndDate) : undefined,
      enrollmentDeadline: data.enrollmentDeadline ? formatDateToString(data.enrollmentDeadline) : undefined,
      dropDeadline: data.dropDeadline ? formatDateToString(data.dropDeadline) : undefined,
      status: data.status,
      isCurrent: data.isCurrent,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined
    }
  }

  return {
    semesters,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchSemesters,
    fetchDeletedSemesters,
    getSemester,
    createSemester,
    updateSemester,
    deleteSemester
  }
}
