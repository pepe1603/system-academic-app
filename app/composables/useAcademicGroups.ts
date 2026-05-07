export interface AcademicGroup {
  id: string
  name: string
  capacity: number
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
  academicSemesterId: string
  academicSemesterName: string
  courseId: string
  courseCode: string
  courseName: string
  teacherId?: string
  teacherFullName?: string
}

interface CreateAcademicGroupData {
  name: string
  academicSemesterId: string
  courseId: string
  teacherId?: string
  capacity?: number
}

interface UpdateAcademicGroupData {
  name?: string
  academicSemesterId?: string
  courseId?: string
  teacherId?: string
  capacity?: number
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useAcademicGroups = () => {
  const groups = ref<AcademicGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchGroups = async (page: number = 0, size: number = 10): Promise<AcademicGroup[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicGroup[]>>('/api/cpanel/academic-groups', {
        query: { page, size }
      })

      if (response.success && response.data) {
        groups.value = response.data
        return groups.value
      }
      error.value = response.message || 'Error al cargar grupos académicos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar grupos académicos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedGroups = async (): Promise<AcademicGroup[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicGroup[]>>('/api/cpanel/academic-groups/deleted')

      if (response.success && response.data) {
        groups.value = response.data
        return groups.value
      }
      error.value = response.message || 'Error al cargar grupos eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar grupos eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getGroup = async (id: string): Promise<AcademicGroup | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicGroup>>(`/api/cpanel/academic-groups/${id}`)

      if (response.success && response.data) {
        return response.data
      }
      error.value = response.message || 'Grupo no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener grupo'
      return null
    } finally {
      loading.value = false
    }
  }

  const createGroup = async (data: CreateAcademicGroupData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicGroup>>('/api/cpanel/academic-groups', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchGroups(currentPage.value, 10)
        return { success: true, message: response.message || 'Grupo académico creado' }
      }
      error.value = response.message || 'Error al crear grupo'
      return { success: false, message: response.message || 'Error al crear grupo' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear grupo'
      return { success: false, message: e.data?.message || 'Error al crear grupo' }
    } finally {
      loading.value = false
    }
  }

  const updateGroup = async (id: string, data: UpdateAcademicGroupData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AcademicGroup>>(`/api/cpanel/academic-groups/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchGroups(currentPage.value, 10)
        return { success: true, message: response.message || 'Grupo actualizado' }
      }
      error.value = response.message || 'Error al actualizar grupo'
      return { success: false, message: response.message || 'Error al actualizar grupo' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar grupo'
      return { success: false, message: e.data?.message || 'Error al actualizar grupo' }
    } finally {
      loading.value = false
    }
  }

  const deleteGroup = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/academic-groups/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchGroups(currentPage.value, 10)
        return { success: true, message: response.message || 'Grupo eliminado' }
      }
      error.value = response.message || 'Error al eliminar grupo'
      return { success: false, message: response.message || 'Error al eliminar grupo' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar grupo'
      return { success: false, message: e.data?.message || 'Error al eliminar grupo' }
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchGroups,
    fetchDeletedGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup
  }
}
