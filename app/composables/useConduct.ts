export interface ConductIncident {
  id: string
  enrollmentId: string
  incidentType: string
  description: string
  incidentDate: string
  severity?: string
  actionsTaken?: string
  attentionDate?: string
  isDeleted: boolean
  createdAt?: string
  studentName?: string
  enrollmentNumber?: string
}

export interface Conduct {
  id: string
  grade?: string
  observations?: string
  warnings?: number
  congratulations?: number
  isDeleted: boolean
  registrationDate?: string
  enrollmentId: string
  studentName: string
  enrollmentNumber: string
  academicSemesterId: string
  academicSemesterName: string
  courseId?: string
  courseCode?: string
  courseName?: string
  studentId?: string
}

interface CreateConductData {
  enrollmentId: string
  academicSemesterId: string
  grade?: string
  observations?: string
  warnings?: number
  congratulations?: number
}

interface UpdateConductData {
  grade?: string
  observations?: string
  warnings?: number
  congratulations?: number
}

interface CreateIncidentData {
  enrollmentId: string
  incidentType: string
  description: string
  incidentDate: string
  severity?: string
  actionsTaken?: string
  attentionDate?: string
}

interface UpdateIncidentData {
  incidentType?: string
  description?: string
  incidentDate?: string
  severity?: string
  actionsTaken?: string
  attentionDate?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useConduct = () => {
  const records = ref<Conduct[]>([])
  const incidents = ref<ConductIncident[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchRecords = async (page: number = 0, size: number = 10): Promise<Conduct[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct[]>>('/api/cpanel/conduct', {
        query: { page, size }
      })

      if (response.success && response.data) {
        records.value = response.data.map(normalizeConduct)
        return records.value
      }
      error.value = response.message || 'Error al cargar registros de conducta'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar registros de conducta'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchRecordsByEnrollment = async (enrollmentId: string): Promise<Conduct[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct[]>>(`/api/cpanel/conduct/by-enrollment/${enrollmentId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeConduct)
      }
      error.value = response.message || 'Error al cargar registros por inscripción'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar registros por inscripción'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchRecordsBySemester = async (semesterId: string): Promise<Conduct[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct[]>>(`/api/cpanel/conduct/by-semester/${semesterId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeConduct)
      }
      error.value = response.message || 'Error al cargar registros por semestre'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar registros por semestre'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedRecords = async (): Promise<Conduct[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct[]>>('/api/cpanel/conduct/deleted')

      if (response.success && response.data) {
        records.value = response.data.map(normalizeConduct)
        return records.value
      }
      error.value = response.message || 'Error al cargar registros eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar registros eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getRecord = async (id: string): Promise<Conduct | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct>>(`/api/cpanel/conduct/${id}`)

      if (response.success && response.data) {
        return normalizeConduct(response.data)
      }
      error.value = response.message || 'Registro de conducta no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener registro de conducta'
      return null
    } finally {
      loading.value = false
    }
  }

  const createRecord = async (data: CreateConductData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct>>('/api/cpanel/conduct', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchRecords(currentPage.value, 10)
        return { success: true, message: response.message || 'Registro de conducta creado' }
      }
      error.value = response.message || 'Error al crear registro de conducta'
      return { success: false, message: response.message || 'Error al crear registro de conducta' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear registro de conducta'
      return { success: false, message: e.data?.message || 'Error al crear registro de conducta' }
    } finally {
      loading.value = false
    }
  }

  const updateRecord = async (id: string, data: UpdateConductData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Conduct>>(`/api/cpanel/conduct/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchRecords(currentPage.value, 10)
        return { success: true, message: response.message || 'Registro de conducta actualizado' }
      }
      error.value = response.message || 'Error al actualizar registro de conducta'
      return { success: false, message: response.message || 'Error al actualizar registro de conducta' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar registro de conducta'
      return { success: false, message: e.data?.message || 'Error al actualizar registro de conducta' }
    } finally {
      loading.value = false
    }
  }

  const deleteRecord = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/conduct/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchRecords(currentPage.value, 10)
        return { success: true, message: response.message || 'Registro de conducta eliminado' }
      }
      error.value = response.message || 'Error al eliminar registro de conducta'
      return { success: false, message: response.message || 'Error al eliminar registro de conducta' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar registro de conducta'
      return { success: false, message: e.data?.message || 'Error al eliminar registro de conducta' }
    } finally {
      loading.value = false
    }
  }

  const fetchIncidentsByEnrollment = async (enrollmentId: string): Promise<ConductIncident[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ConductIncident[]>>(`/api/cpanel/conduct/incidents/by-enrollment/${enrollmentId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeIncident)
      }
      error.value = response.message || 'Error al cargar incidentes'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar incidentes'
      return []
    } finally {
      loading.value = false
    }
  }

  const createIncident = async (data: CreateIncidentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ConductIncident>>('/api/cpanel/conduct/incidents', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        return { success: true, message: response.message || 'Incidente registrado' }
      }
      error.value = response.message || 'Error al registrar incidente'
      return { success: false, message: response.message || 'Error al registrar incidente' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al registrar incidente'
      return { success: false, message: e.data?.message || 'Error al registrar incidente' }
    } finally {
      loading.value = false
    }
  }

  const updateIncident = async (id: string, data: UpdateIncidentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ConductIncident>>(`/api/cpanel/conduct/incidents/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        return { success: true, message: response.message || 'Incidente actualizado' }
      }
      error.value = response.message || 'Error al actualizar incidente'
      return { success: false, message: response.message || 'Error al actualizar incidente' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar incidente'
      return { success: false, message: e.data?.message || 'Error al actualizar incidente' }
    } finally {
      loading.value = false
    }
  }

  const deleteIncident = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/conduct/incidents/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        return { success: true, message: response.message || 'Incidente eliminado' }
      }
      error.value = response.message || 'Error al eliminar incidente'
      return { success: false, message: response.message || 'Error al eliminar incidente' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar incidente'
      return { success: false, message: e.data?.message || 'Error al eliminar incidente' }
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedIncidents = async (): Promise<ConductIncident[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ConductIncident[]>>('/api/cpanel/conduct/incidents/deleted')

      if (response.success && response.data) {
        return response.data.map(normalizeIncident)
      }
      error.value = response.message || 'Error al cargar incidentes eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar incidentes eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const normalizeConduct = (data: any): Conduct => ({
    id: data.id,
    grade: data.grade,
    observations: data.observations,
    warnings: data.warnings,
    congratulations: data.congratulations,
    isDeleted: data.isDeleted,
    registrationDate: data.registrationDate ? formatDateToString(data.registrationDate) : undefined,
    enrollmentId: data.enrollmentId,
    studentName: data.studentName,
    enrollmentNumber: data.enrollmentNumber,
    academicSemesterId: data.academicSemesterId,
    academicSemesterName: data.academicSemesterName,
    courseId: data.courseId,
    courseCode: data.courseCode,
    courseName: data.courseName,
    studentId: data.studentId
  })

  const normalizeIncident = (data: any): ConductIncident => ({
    id: data.id,
    enrollmentId: data.enrollmentId,
    incidentType: data.incidentType,
    description: data.description,
    incidentDate: data.incidentDate ? formatDateToString(data.incidentDate) : '',
    severity: data.severity,
    actionsTaken: data.actionsTaken,
    attentionDate: data.attentionDate ? formatDateToString(data.attentionDate) : undefined,
    isDeleted: data.isDeleted,
    createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
    studentName: data.studentName,
    enrollmentNumber: data.enrollmentNumber
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
    incidents,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchRecords,
    fetchRecordsByEnrollment,
    fetchRecordsBySemester,
    fetchDeletedRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    fetchIncidentsByEnrollment,
    createIncident,
    updateIncident,
    deleteIncident,
    fetchDeletedIncidents
  }
}
