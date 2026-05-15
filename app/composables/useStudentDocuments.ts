export interface StudentDocument {
  id: string
  studentId: string
  studentName: string
  enrollmentNumber: string
  documentType: string
  originalName: string
  fileName: string
  filePath: string
  fileSizeBytes?: number
  mimeType?: string
  documentNumber?: string
  issueDate?: string
  expirationDate?: string
  isVerified: boolean
  isActive: boolean
  isDeleted: boolean
  createdAt?: string
}

interface CreateStudentDocumentData {
  studentId: string
  documentType: string
  originalName: string
  fileName: string
  filePath: string
  fileSizeBytes?: number
  mimeType?: string
  documentNumber?: string
  issueDate?: string
  expirationDate?: string
  observations?: string
}

interface UpdateStudentDocumentData {
  originalName?: string
  fileName?: string
  filePath?: string
  fileSizeBytes?: number
  mimeType?: string
  documentNumber?: string
  issueDate?: string
  expirationDate?: string
  isVerified?: boolean
  observations?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useStudentDocuments = () => {
  const documents = ref<StudentDocument[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDocuments = async (page: number = 0, size: number = 10): Promise<StudentDocument[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<StudentDocument[]>>('/api/cpanel/student-documents', { query: { page, size } })
      if (response.success && response.data) {
        documents.value = response.data.map(normalize)
        return documents.value
      }
      error.value = response.message || 'Error al cargar documentos'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar documentos'
      return []
    } finally { loading.value = false }
  }

  const fetchDeletedDocuments = async (): Promise<StudentDocument[]> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<StudentDocument[]>>('/api/cpanel/student-documents/deleted')
      if (response.success && response.data) {
        documents.value = response.data.map(normalize)
        return documents.value
      }
      error.value = response.message || 'Error al cargar documentos eliminados'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar documentos eliminados'
      return []
    } finally { loading.value = false }
  }

  const getDocument = async (id: string): Promise<StudentDocument | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<StudentDocument>>(`/api/cpanel/student-documents/${id}`)
      if (response.success && response.data) return normalize(response.data)
      error.value = response.message || 'Documento no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener documento'
      return null
    } finally { loading.value = false }
  }

  const createDocument = async (data: CreateStudentDocumentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<StudentDocument>>('/api/cpanel/student-documents', { method: 'POST', body: data })
      if (response.success) return { success: true, message: response.message || 'Documento creado' }
      error.value = response.message || 'Error al crear documento'
      return { success: false, message: response.message || 'Error al crear documento' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear documento'
      return { success: false, message: e.data?.message || 'Error al crear documento' }
    } finally { loading.value = false }
  }

  const updateDocument = async (id: string, data: UpdateStudentDocumentData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<StudentDocument>>(`/api/cpanel/student-documents/${id}`, { method: 'PUT', body: data })
      if (response.success) return { success: true, message: response.message || 'Documento actualizado' }
      error.value = response.message || 'Error al actualizar documento'
      return { success: false, message: response.message || 'Error al actualizar documento' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar documento'
      return { success: false, message: e.data?.message || 'Error al actualizar documento' }
    } finally { loading.value = false }
  }

  const deleteDocument = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/student-documents/${id}`, { method: 'DELETE' })
      if (response.success) return { success: true, message: response.message || 'Documento eliminado' }
      error.value = response.message || 'Error al eliminar documento'
      return { success: false, message: response.message || 'Error al eliminar documento' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar documento'
      return { success: false, message: e.data?.message || 'Error al eliminar documento' }
    } finally { loading.value = false }
  }

  const normalize = (data: any): StudentDocument => ({
    id: data.id, studentId: data.studentId, studentName: data.studentName,
    enrollmentNumber: data.enrollmentNumber, documentType: data.documentType,
    originalName: data.originalName, fileName: data.fileName, filePath: data.filePath,
    fileSizeBytes: data.fileSizeBytes, mimeType: data.mimeType,
    documentNumber: data.documentNumber,
    issueDate: data.issueDate ? fmtDate(data.issueDate) : undefined,
    expirationDate: data.expirationDate ? fmtDate(data.expirationDate) : undefined,
    isVerified: data.isVerified ?? false, isActive: data.isActive ?? true,
    isDeleted: data.isDeleted ?? false,
    createdAt: data.createdAt ? fmtDate(data.createdAt) : undefined
  })

  const fmtDate = (d: any): string => {
    if (!d) return ''
    if (typeof d === 'string') return d.split('T')[0] ?? ''
    if (d && d.year) return `${d.year}-${String(d.monthValue||d.month||'').padStart(2,'0')}-${String(d.dayOfMonth||d.day||'').padStart(2,'0')}`
    return ''
  }

  return { documents, loading, error, fetchDocuments, fetchDeletedDocuments, getDocument, createDocument, updateDocument, deleteDocument }
}
