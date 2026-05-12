export interface Teacher {
  id: string
  userId?: string
  employeeNumber?: string
  rfc?: string
  curp?: string
  firstName: string
  lastName: string
  institutionalEmail?: string
  secondaryEmail?: string
  phone?: string
  secondaryPhone?: string
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
  updatedAt?: string
}

interface CreateTeacherData {
  firstName: string
  lastName: string
  employeeNumber?: string
  rfc?: string
  curp?: string
  institutionalEmail?: string
  secondaryEmail?: string
  phone?: string
  secondaryPhone?: string
}

interface UpdateTeacherData {
  firstName?: string
  lastName?: string
  employeeNumber?: string
  rfc?: string
  curp?: string
  institutionalEmail?: string
  secondaryEmail?: string
  phone?: string
  secondaryPhone?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useTeachers = () => {
  const records = ref<Teacher[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchRecords = async (page: number = 0, size: number = 10): Promise<Teacher[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Teacher[]>>('/api/cpanel/teachers', {
        query: { page, size }
      })

      if (response.success && response.data) {
        records.value = response.data.map(normalizeTeacher)
        return records.value
      }
      error.value = response.message || 'Error al cargar docentes'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar docentes'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedRecords = async (): Promise<Teacher[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Teacher[]>>('/api/cpanel/teachers/deleted')

      if (response.success && response.data) {
        records.value = response.data.map(normalizeTeacher)
        return records.value
      }
      error.value = response.message || 'Error al cargar docentes eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar docentes eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getRecord = async (id: string): Promise<Teacher | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Teacher>>(`/api/cpanel/teachers/${id}`)

      if (response.success && response.data) {
        return normalizeTeacher(response.data)
      }
      error.value = response.message || 'Docente no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener docente'
      return null
    } finally {
      loading.value = false
    }
  }

  const createRecord = async (data: CreateTeacherData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Teacher>>('/api/cpanel/teachers', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchRecords(currentPage.value, 10)
        return { success: true, message: response.message || 'Docente creado' }
      }
      error.value = response.message || 'Error al crear docente'
      return { success: false, message: response.message || 'Error al crear docente' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear docente'
      return { success: false, message: e.data?.message || 'Error al crear docente' }
    } finally {
      loading.value = false
    }
  }

  const updateRecord = async (id: string, data: UpdateTeacherData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Teacher>>(`/api/cpanel/teachers/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchRecords(currentPage.value, 10)
        return { success: true, message: response.message || 'Docente actualizado' }
      }
      error.value = response.message || 'Error al actualizar docente'
      return { success: false, message: response.message || 'Error al actualizar docente' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar docente'
      return { success: false, message: e.data?.message || 'Error al actualizar docente' }
    } finally {
      loading.value = false
    }
  }

  const deleteRecord = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/teachers/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchRecords(currentPage.value, 10)
        return { success: true, message: response.message || 'Docente eliminado' }
      }
      error.value = response.message || 'Error al eliminar docente'
      return { success: false, message: response.message || 'Error al eliminar docente' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar docente'
      return { success: false, message: e.data?.message || 'Error al eliminar docente' }
    } finally {
      loading.value = false
    }
  }

  const normalizeTeacher = (data: any): Teacher => ({
    id: data.id,
    userId: data.userId,
    employeeNumber: data.employeeNumber,
    rfc: data.rfc,
    curp: data.curp,
    firstName: data.firstName,
    lastName: data.lastName,
    institutionalEmail: data.institutionalEmail,
    secondaryEmail: data.secondaryEmail,
    phone: data.phone,
    secondaryPhone: data.secondaryPhone,
    isActive: data.isActive ?? true,
    isDeleted: data.isDeleted ?? false,
    createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? formatDateToString(data.updatedAt) : undefined
  })

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
    fetchRecords,
    fetchDeletedRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord
  }
}
