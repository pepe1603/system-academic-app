export interface Semester {
  id: string
  studyPlanId?: string
  studyPlanName?: string
  semesterNumber: number
  name: string
  isActive: boolean
  isDeleted: boolean
}

interface CreateSemesterData {
  studyPlanId?: string
  semesterNumber: number
  name: string
}

interface UpdateSemesterData {
  studyPlanId?: string
  semesterNumber?: number
  name?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useSemestersModule = () => {
  const semestersList = ref<Semester[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchSemesters = async (page: number = 0, size: number = 10): Promise<Semester[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Semester[]>>('/api/cpanel/semesters', {
        query: { page, size }
      })

      if (response.success && response.data) {
        semestersList.value = response.data
        return semestersList.value
      }
      error.value = response.message || 'Error al cargar semestres'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar semestres'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedSemesters = async (): Promise<Semester[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Semester[]>>('/api/cpanel/semesters/deleted')

      if (response.success && response.data) {
        semestersList.value = response.data
        return semestersList.value
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

  const getSemester = async (id: string): Promise<Semester | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Semester>>(`/api/cpanel/semesters/${id}`)

      if (response.success && response.data) {
        return response.data
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

  const createSemester = async (data: CreateSemesterData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Semester>>('/api/cpanel/semesters', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchSemesters(currentPage.value, 10)
        return { success: true, message: response.message || 'Semestre creado' }
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

  const updateSemester = async (id: string, data: UpdateSemesterData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Semester>>(`/api/cpanel/semesters/${id}`, {
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
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/semesters/${id}`, {
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

  return {
    semestersList,
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
