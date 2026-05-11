export interface ReportCardDetail {
  id: string
  reportCardId: string
  kardexId?: string
  courseId: string
  subjectName: string
  subjectCode: string
  credits: number
  grade?: number
  gradeLetter?: string
  subjectStatus?: string
  attendancePercentage?: number
  totalAttendances?: number
  classesAttended?: number
  observations?: string
}

export interface ReportCard {
  id: string
  reportCardType: string
  generationMode: string
  overallAverage?: number
  averageLetter?: string
  attendanceAverage?: number
  totalCreditsEnrolled?: number
  totalCreditsApproved?: number
  totalSubjects?: number
  totalSubjectsApproved?: number
  status: string
  issueDate?: string
  deliveryDate?: string
  folio?: string
  series?: string
  observations?: string
  isSigned: boolean
  isDeleted: boolean
  createdAt?: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  academicSemesterId: string
  academicSemesterName: string
  generationId?: string
  generationName?: string
  details: ReportCardDetail[]
}

interface CreateReportCardDetailData {
  courseId: string
  kardexId?: string
  subjectName: string
  subjectCode: string
  credits: number
  grade?: number
  gradeLetter?: string
  subjectStatus?: string
  attendancePercentage?: number
  totalAttendances?: number
  classesAttended?: number
  observations?: string
}

interface CreateReportCardData {
  studentId: string
  academicSemesterId: string
  generationId?: string
  reportCardType?: string
  generationMode?: string
  folio?: string
  series?: string
  observations?: string
  details: CreateReportCardDetailData[]
}

interface UpdateReportCardData {
  reportCardType?: string
  generationMode?: string
  overallAverage?: number
  averageLetter?: string
  attendanceAverage?: number
  totalCreditsEnrolled?: number
  totalCreditsApproved?: number
  totalSubjects?: number
  totalSubjectsApproved?: number
  status?: string
  deliveryDate?: string
  folio?: string
  series?: string
  observations?: string
  isSigned?: boolean
  signedAt?: string
  signedSealUrl?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useReportCards = () => {
  const reportCards = ref<ReportCard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchReportCards = async (page: number = 0, size: number = 10): Promise<ReportCard[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ReportCard[]>>('/api/cpanel/report-cards', {
        query: { page, size }
      })

      console.log('[useReportCards] fetchReportCards raw response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        reportCards.value = response.data.map(normalizeReportCard)
        return reportCards.value
      }
      error.value = response.message || 'Error al cargar boletas'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar boletas'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchReportCardsByStudent = async (studentId: string): Promise<ReportCard[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ReportCard[]>>(`/api/cpanel/report-cards/by-student/${studentId}`)

      if (response.success && response.data) {
        return response.data.map(normalizeReportCard)
      }
      error.value = response.message || 'Error al cargar boletas del estudiante'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar boletas del estudiante'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedReportCards = async (): Promise<ReportCard[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ReportCard[]>>('/api/cpanel/report-cards/deleted')

      if (response.success && response.data) {
        reportCards.value = response.data.map(normalizeReportCard)
        return reportCards.value
      }
      error.value = response.message || 'Error al cargar boletas eliminadas'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar boletas eliminadas'
      return []
    } finally {
      loading.value = false
    }
  }

  const getReportCard = async (id: string): Promise<ReportCard | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ReportCard>>(`/api/cpanel/report-cards/${id}`)

      if (response.success && response.data) {
        return normalizeReportCard(response.data)
      }
      error.value = response.message || 'Boleta no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener boleta'
      return null
    } finally {
      loading.value = false
    }
  }

  const createReportCard = async (data: CreateReportCardData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ReportCard>>('/api/cpanel/report-cards', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchReportCards(currentPage.value, 10)
        return { success: true, message: response.message || 'Boleta creada' }
      }
      error.value = response.message || 'Error al crear boleta'
      return { success: false, message: response.message || 'Error al crear boleta' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear boleta'
      return { success: false, message: e.data?.message || 'Error al crear boleta' }
    } finally {
      loading.value = false
    }
  }

  const updateReportCard = async (id: string, data: UpdateReportCardData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<ReportCard>>(`/api/cpanel/report-cards/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchReportCards(currentPage.value, 10)
        return { success: true, message: response.message || 'Boleta actualizada' }
      }
      error.value = response.message || 'Error al actualizar boleta'
      return { success: false, message: response.message || 'Error al actualizar boleta' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar boleta'
      return { success: false, message: e.data?.message || 'Error al actualizar boleta' }
    } finally {
      loading.value = false
    }
  }

  const deleteReportCard = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/report-cards/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchReportCards(currentPage.value, 10)
        return { success: true, message: response.message || 'Boleta eliminada' }
      }
      error.value = response.message || 'Error al eliminar boleta'
      return { success: false, message: response.message || 'Error al eliminar boleta' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar boleta'
      return { success: false, message: e.data?.message || 'Error al eliminar boleta' }
    } finally {
      loading.value = false
    }
  }

  const normalizeDetail = (data: any): ReportCardDetail => ({
    id: data.id,
    reportCardId: data.reportCardId,
    kardexId: data.kardexId,
    courseId: data.courseId,
    subjectName: data.subjectName,
    subjectCode: data.subjectCode,
    credits: data.credits,
    grade: data.grade,
    gradeLetter: data.gradeLetter,
    subjectStatus: data.subjectStatus,
    attendancePercentage: data.attendancePercentage,
    totalAttendances: data.totalAttendances,
    classesAttended: data.classesAttended,
    observations: data.observations
  })

  const normalizeReportCard = (data: any): ReportCard => {
    return {
      id: data.id,
      reportCardType: data.reportCardType,
      generationMode: data.generationMode,
      overallAverage: data.overallAverage,
      averageLetter: data.averageLetter,
      attendanceAverage: data.attendanceAverage,
      totalCreditsEnrolled: data.totalCreditsEnrolled,
      totalCreditsApproved: data.totalCreditsApproved,
      totalSubjects: data.totalSubjects,
      totalSubjectsApproved: data.totalSubjectsApproved,
      status: data.status,
      issueDate: data.issueDate ? formatDateToString(data.issueDate) : undefined,
      deliveryDate: data.deliveryDate ? formatDateToString(data.deliveryDate) : undefined,
      folio: data.folio,
      series: data.series,
      observations: data.observations,
      isSigned: data.isSigned ?? false,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
      studentId: data.studentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      academicSemesterId: data.academicSemesterId,
      academicSemesterName: data.academicSemesterName,
      generationId: data.generationId,
      generationName: data.generationName,
      details: (data.details || []).map(normalizeDetail)
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
    reportCards,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchReportCards,
    fetchReportCardsByStudent,
    fetchDeletedReportCards,
    getReportCard,
    createReportCard,
    updateReportCard,
    deleteReportCard
  }
}
