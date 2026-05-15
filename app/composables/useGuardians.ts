export interface Guardian {
  id: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  fullName: string
  relationship: string
  curp?: string
  primaryPhone?: string
  secondaryPhone?: string
  email?: string
  occupation?: string
  company?: string
  address?: string
  isEmergencyContact: boolean
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateGuardianData {
  studentId: string
  fullName: string
  relationship: string
  curp?: string
  primaryPhone?: string
  secondaryPhone?: string
  email?: string
  occupation?: string
  company?: string
  address?: string
  isEmergencyContact?: boolean
}

interface UpdateGuardianData {
  fullName?: string
  relationship?: string
  curp?: string
  primaryPhone?: string
  secondaryPhone?: string
  email?: string
  occupation?: string
  company?: string
  address?: string
  isEmergencyContact?: boolean
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useGuardians = () => {
  const guardians = ref<Guardian[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchGuardians = async (page: number = 0, size: number = 10): Promise<Guardian[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Guardian[]>>('/api/cpanel/guardians', {
        query: { page, size }
      })

      if (response.success && response.data) {
        guardians.value = response.data.map(normalizeGuardian)
        return guardians.value
      }
      error.value = response.message || 'Error al cargar tutores'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar tutores'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedGuardians = async (): Promise<Guardian[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Guardian[]>>('/api/cpanel/guardians/deleted')

      if (response.success && response.data) {
        guardians.value = response.data.map(normalizeGuardian)
        return guardians.value
      }
      error.value = response.message || 'Error al cargar tutores eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar tutores eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getGuardian = async (id: string): Promise<Guardian | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Guardian>>(`/api/cpanel/guardians/${id}`)

      if (response.success && response.data) {
        return normalizeGuardian(response.data)
      }
      error.value = response.message || 'Tutor no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener tutor'
      return null
    } finally {
      loading.value = false
    }
  }

  const createGuardian = async (data: CreateGuardianData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Guardian>>('/api/cpanel/guardians', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchGuardians(currentPage.value, 10)
        return { success: true, message: response.message || 'Tutor creado' }
      }
      error.value = response.message || 'Error al crear tutor'
      return { success: false, message: response.message || 'Error al crear tutor' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear tutor'
      return { success: false, message: e.data?.message || 'Error al crear tutor' }
    } finally {
      loading.value = false
    }
  }

  const updateGuardian = async (id: string, data: UpdateGuardianData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Guardian>>(`/api/cpanel/guardians/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchGuardians(currentPage.value, 10)
        return { success: true, message: response.message || 'Tutor actualizado' }
      }
      error.value = response.message || 'Error al actualizar tutor'
      return { success: false, message: response.message || 'Error al actualizar tutor' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar tutor'
      return { success: false, message: e.data?.message || 'Error al actualizar tutor' }
    } finally {
      loading.value = false
    }
  }

  const deleteGuardian = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/guardians/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchGuardians(currentPage.value, 10)
        return { success: true, message: response.message || 'Tutor eliminado' }
      }
      error.value = response.message || 'Error al eliminar tutor'
      return { success: false, message: response.message || 'Error al eliminar tutor' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar tutor'
      return { success: false, message: e.data?.message || 'Error al eliminar tutor' }
    } finally {
      loading.value = false
    }
  }

  const normalizeGuardian = (data: any): Guardian => {
    return {
      id: data.id,
      studentId: data.studentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      fullName: data.fullName,
      relationship: data.relationship,
      curp: data.curp,
      primaryPhone: data.primaryPhone,
      secondaryPhone: data.secondaryPhone,
      email: data.email,
      occupation: data.occupation,
      company: data.company,
      address: data.address,
      isEmergencyContact: data.isEmergencyContact ?? false,
      isActive: data.isActive ?? true,
      isDeleted: data.isDeleted ?? false,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined
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
    guardians,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchGuardians,
    fetchDeletedGuardians,
    getGuardian,
    createGuardian,
    updateGuardian,
    deleteGuardian
  }
}
