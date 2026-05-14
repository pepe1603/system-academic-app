export interface Certificate {
  id: string
  certificateType: string
  officialFolio?: string
  internalFolio?: string
  series?: string
  finalAverage?: number
  totalCredits?: number
  totalSubjects?: number
  issueDate?: string
  deliveryDate?: string
  status: string
  recordNumber?: string
  recordBook?: string
  recordPage?: string
  observations?: string
  isDeleted: boolean
  createdAt?: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  generationId?: string
  generationName?: string
  directorSigner?: string
  directorName?: string
  secretarySigner?: string
  secretaryName?: string
}

interface CreateCertificateData {
  studentId: string
  generationId?: string
  certificateType: string
  officialFolio?: string
  internalFolio?: string
  series?: string
  finalAverage?: number
  totalCredits?: number
  totalSubjects?: number
  issueDate?: string
  directorSigner?: string
  secretarySigner?: string
  recordNumber?: string
  recordBook?: string
  recordPage?: string
  observations?: string
}

interface UpdateCertificateData {
  certificateType?: string
  officialFolio?: string
  internalFolio?: string
  series?: string
  finalAverage?: number
  totalCredits?: number
  totalSubjects?: number
  issueDate?: string
  deliveryDate?: string
  status?: string
  directorSigner?: string
  secretarySigner?: string
  recordNumber?: string
  recordBook?: string
  recordPage?: string
  observations?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useCertificates = () => {
  const certificates = ref<Certificate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchCertificates = async (page: number = 0, size: number = 10): Promise<Certificate[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Certificate[]>>('/api/cpanel/certificates', {
        query: { page, size }
      })

      if (response.success && response.data) {
        certificates.value = response.data.map(normalizeCertificate)
        return certificates.value
      }
      error.value = response.message || 'Error al cargar certificados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar certificados'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedCertificates = async (): Promise<Certificate[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Certificate[]>>('/api/cpanel/certificates/deleted')

      if (response.success && response.data) {
        certificates.value = response.data.map(normalizeCertificate)
        return certificates.value
      }
      error.value = response.message || 'Error al cargar certificados eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar certificados eliminados'
      return []
    } finally {
      loading.value = false
    }
  }

  const getCertificate = async (id: string): Promise<Certificate | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Certificate>>(`/api/cpanel/certificates/${id}`)

      if (response.success && response.data) {
        return normalizeCertificate(response.data)
      }
      error.value = response.message || 'Certificado no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener certificado'
      return null
    } finally {
      loading.value = false
    }
  }

  const createCertificate = async (data: CreateCertificateData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Certificate>>('/api/cpanel/certificates', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchCertificates(currentPage.value, 10)
        return { success: true, message: response.message || 'Certificado creado' }
      }
      error.value = response.message || 'Error al crear certificado'
      return { success: false, message: response.message || 'Error al crear certificado' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear certificado'
      return { success: false, message: e.data?.message || 'Error al crear certificado' }
    } finally {
      loading.value = false
    }
  }

  const updateCertificate = async (id: string, data: UpdateCertificateData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Certificate>>(`/api/cpanel/certificates/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchCertificates(currentPage.value, 10)
        return { success: true, message: response.message || 'Certificado actualizado' }
      }
      error.value = response.message || 'Error al actualizar certificado'
      return { success: false, message: response.message || 'Error al actualizar certificado' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar certificado'
      return { success: false, message: e.data?.message || 'Error al actualizar certificado' }
    } finally {
      loading.value = false
    }
  }

  const deleteCertificate = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/certificates/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchCertificates(currentPage.value, 10)
        return { success: true, message: response.message || 'Certificado eliminado' }
      }
      error.value = response.message || 'Error al eliminar certificado'
      return { success: false, message: response.message || 'Error al eliminar certificado' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar certificado'
      return { success: false, message: e.data?.message || 'Error al eliminar certificado' }
    } finally {
      loading.value = false
    }
  }

  const normalizeCertificate = (data: any): Certificate => {
    return {
      id: data.id,
      certificateType: data.certificateType,
      officialFolio: data.officialFolio,
      internalFolio: data.internalFolio,
      series: data.series,
      finalAverage: data.finalAverage,
      totalCredits: data.totalCredits,
      totalSubjects: data.totalSubjects,
      issueDate: data.issueDate ? formatDateToString(data.issueDate) : undefined,
      deliveryDate: data.deliveryDate ? formatDateToString(data.deliveryDate) : undefined,
      status: data.status,
      recordNumber: data.recordNumber,
      recordBook: data.recordBook,
      recordPage: data.recordPage,
      observations: data.observations,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
      studentId: data.studentId,
      studentName: data.studentName,
      enrollmentNumber: data.enrollmentNumber,
      generationId: data.generationId,
      generationName: data.generationName,
      directorSigner: data.directorSigner,
      directorName: data.directorName,
      secretarySigner: data.secretarySigner,
      secretaryName: data.secretaryName
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
    certificates,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchCertificates,
    fetchDeletedCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate
  }
}
