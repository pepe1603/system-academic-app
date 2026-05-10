export interface Attendance {
  id: string
  attendanceDate: string
  status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'LATE'
  classTime?: string
  subjectCode?: string
  observations?: string
  justificationDate?: string
  recordedAt?: string
  isDeleted: boolean
  enrollmentId: string
  studentName: string
  enrollmentNumber: string
  courseId: string
  courseCode: string
  courseName: string
}

interface CreateAttendanceData {
  enrollmentId: string
  attendanceDate: string
  status?: string
  classTime?: string
  subjectCode?: string
  observations?: string
}

interface UpdateAttendanceData {
  status?: string
  classTime?: string
  subjectCode?: string
  observations?: string
  justifiedBy?: string
  justificationDate?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useAttendances = () => {
  const attendances = ref<Attendance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchAttendances = async (page: number = 0, size: number = 10): Promise<Attendance[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Attendance[]>>('/api/cpanel/attendances', {
        query: { page, size }
      })

      console.log('[useAttendances] fetchAttendances raw response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        attendances.value = response.data.map(normalizeAttendance)
        return attendances.value
      }
      error.value = response.message || 'Error al cargar asistencias'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar asistencias'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchAttendancesByEnrollment = async (enrollmentId: string): Promise<Attendance[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Attendance[]>>(`/api/cpanel/attendances/by-enrollment/${enrollmentId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeAttendance)
      }
      error.value = response.message || 'Error al cargar asistencias por inscripción'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar asistencias por inscripción'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedAttendances = async (): Promise<Attendance[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Attendance[]>>('/api/cpanel/attendances/deleted')

      if (response.success && response.data) {
        attendances.value = response.data.map(normalizeAttendance)
        return attendances.value
      }
      error.value = response.message || 'Error al cargar asistencias eliminadas'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar asistencias eliminadas'
      return []
    } finally {
      loading.value = false
    }
  }

  const getAttendance = async (id: string): Promise<Attendance | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Attendance>>(`/api/cpanel/attendances/${id}`)

      if (response.success && response.data) {
        return normalizeAttendance(response.data)
      }
      error.value = response.message || 'Asistencia no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener asistencia'
      return null
    } finally {
      loading.value = false
    }
  }

  const createAttendance = async (data: CreateAttendanceData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Attendance>>('/api/cpanel/attendances', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchAttendances(currentPage.value, 10)
        return { success: true, message: response.message || 'Asistencia registrada' }
      }
      error.value = response.message || 'Error al registrar asistencia'
      return { success: false, message: response.message || 'Error al registrar asistencia' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al registrar asistencia'
      return { success: false, message: e.data?.message || 'Error al registrar asistencia' }
    } finally {
      loading.value = false
    }
  }

  const updateAttendance = async (id: string, data: UpdateAttendanceData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Attendance>>(`/api/cpanel/attendances/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchAttendances(currentPage.value, 10)
        return { success: true, message: response.message || 'Asistencia actualizada' }
      }
      error.value = response.message || 'Error al actualizar asistencia'
      return { success: false, message: response.message || 'Error al actualizar asistencia' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar asistencia'
      return { success: false, message: e.data?.message || 'Error al actualizar asistencia' }
    } finally {
      loading.value = false
    }
  }

  const deleteAttendance = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/attendances/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchAttendances(currentPage.value, 10)
        return { success: true, message: response.message || 'Asistencia eliminada' }
      }
      error.value = response.message || 'Error al eliminar asistencia'
      return { success: false, message: response.message || 'Error al eliminar asistencia' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar asistencia'
      return { success: false, message: e.data?.message || 'Error al eliminar asistencia' }
    } finally {
      loading.value = false
    }
  }

  const normalizeAttendance = (data: any): Attendance => {
    return {
      id: data.id,
      attendanceDate: data.attendanceDate ? formatDateToString(data.attendanceDate) : '',
      status: data.status,
      classTime: data.classTime,
      subjectCode: data.subjectCode,
      observations: data.observations,
      justificationDate: data.justificationDate ? formatDateToString(data.justificationDate) : undefined,
      recordedAt: data.recordedAt ? formatDateToString(data.recordedAt) : undefined,
      isDeleted: data.isDeleted,
      enrollmentId: data.enrollmentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      courseId: data.courseId,
      courseCode: data.courseCode,
      courseName: data.courseName
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
    attendances,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchAttendances,
    fetchAttendancesByEnrollment,
    fetchDeletedAttendances,
    getAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
  }
}
