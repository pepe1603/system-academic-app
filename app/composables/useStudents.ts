export interface Student {
  id: string
  userId?: string
  enrollmentNumber: string
  curp: string
  firstName: string
  lastName: string
  institutionalEmail?: string
  phone?: string
  birthDate?: string
  gender?: string
  enrollmentDate?: string
  generationId: string
  generationName: string
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateStudentData {
  curp: string
  enrollmentNumber: string
  firstName: string
  lastName: string
  generationId: string
  userId?: string
  institutionalEmail?: string
  phone?: string
  birthDate?: string
  gender?: string
  enrollmentDate?: string
}

interface UpdateStudentData {
  curp?: string
  enrollmentNumber?: string
  firstName?: string
  lastName?: string
  generationId?: string
  userId?: string
  institutionalEmail?: string
  phone?: string
  birthDate?: string
  gender?: string
  enrollmentDate?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useStudents = () => {
  const students = ref<Student[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchStudents = async (page: number = 0, size: number = 10): Promise<Student[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Student[]>>('/api/cpanel/students', {
        query: { page, size }
      })

      console.log('[useStudents] fetchStudents raw response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        students.value = response.data.map(normalizeStudent)
        return students.value
      }
      error.value = response.message || 'Error al cargar estudiantes'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar estudiantes'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedStudents = async (): Promise<Student[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Student[]>>('/api/cpanel/students/deleted')

      if (response.success && response.data) {
        students.value = response.data.map(normalizeStudent)
        return students.value
      }
      error.value = response.message || 'Error al cargar estudiantes eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar estudiantes eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getStudent = async (id: string): Promise<Student | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Student>>(`/api/cpanel/students/${id}`)

      if (response.success && response.data) {
        return normalizeStudent(response.data)
      }
      error.value = response.message || 'Estudiante no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener estudiante'
      return null
    } finally {
      loading.value = false
    }
  }

  const createStudent = async (data: CreateStudentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Student>>('/api/cpanel/students', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchStudents(currentPage.value, 10)
        return { success: true, message: response.message || 'Estudiante creado' }
      }
      error.value = response.message || 'Error al crear estudiante'
      return { success: false, message: response.message || 'Error al crear estudiante' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear estudiante'
      return { success: false, message: e.data?.message || 'Error al crear estudiante' }
    } finally {
      loading.value = false
    }
  }

  const updateStudent = async (id: string, data: UpdateStudentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Student>>(`/api/cpanel/students/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchStudents(currentPage.value, 10)
        return { success: true, message: response.message || 'Estudiante actualizado' }
      }
      error.value = response.message || 'Error al actualizar estudiante'
      return { success: false, message: response.message || 'Error al actualizar estudiante' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar estudiante'
      return { success: false, message: e.data?.message || 'Error al actualizar estudiante' }
    } finally {
      loading.value = false
    }
  }

  const deleteStudent = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/students/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchStudents(currentPage.value, 10)
        return { success: true, message: response.message || 'Estudiante eliminado' }
      }
      error.value = response.message || 'Error al eliminar estudiante'
      return { success: false, message: response.message || 'Error al eliminar estudiante' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar estudiante'
      return { success: false, message: e.data?.message || 'Error al eliminar estudiante' }
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

  const normalizeStudent = (data: any): Student => {
    return {
      id: data.id,
      userId: data.userId,
      enrollmentNumber: data.enrollmentNumber,
      curp: data.curp,
      firstName: data.firstName,
      lastName: data.lastName,
      institutionalEmail: data.institutionalEmail,
      phone: data.phone,
      birthDate: data.birthDate ? formatDateToString(data.birthDate) : undefined,
      gender: data.gender,
      enrollmentDate: data.enrollmentDate ? formatDateToString(data.enrollmentDate) : undefined,
      generationId: data.generationId,
      generationName: data.generationName,
      isActive: data.isActive,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined
    }
  }

  return {
    students,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchStudents,
    fetchDeletedStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
  }
}
