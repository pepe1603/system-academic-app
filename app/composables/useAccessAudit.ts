export interface AccessAudit {
  id: string
  userId: string
  userEmail: string
  action: string
  module: string
  ipAddress: string
  success: boolean
  metadata?: string
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useAccessAudit = () => {
  const logs = ref<AccessAudit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchLogs = async (params: {
    page?: number
    size?: number
    userId?: string
    module?: string
    action?: string
    success?: boolean
  } = {}): Promise<AccessAudit[]> => {
    loading.value = true
    error.value = null

    try {
      const query: Record<string, any> = {
        page: params.page ?? 0,
        size: params.size ?? 10
      }
      if (params.userId) query.userId = params.userId
      if (params.module) query.module = params.module
      if (params.action) query.action = params.action
      if (params.success !== undefined) query.success = params.success

      const response = await $fetch<ApiResponse<AccessAudit[]>>('/api/cpanel/access-audit', { query })

      if (response.success && response.data) {
        logs.value = response.data.map(normalize)
        return logs.value
      }
      error.value = response.message || 'Error al cargar registros de auditoría'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar registros de auditoría'
      return []
    } finally {
      loading.value = false
    }
  }

  const getLog = async (id: string): Promise<AccessAudit | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<AccessAudit>>(`/api/cpanel/access-audit/${id}`)

      if (response.success && response.data) {
        return normalize(response.data)
      }
      error.value = response.message || 'Registro de auditoría no encontrado'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener registro de auditoría'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteLog = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/access-audit/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchLogs({ page: currentPage.value, size: 10 })
        return { success: true, message: response.message || 'Registro de auditoría eliminado' }
      }
      error.value = response.message || 'Error al eliminar registro de auditoría'
      return { success: false, message: response.message || 'Error al eliminar registro de auditoría' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar registro de auditoría'
      return { success: false, message: e.data?.message || 'Error al eliminar registro de auditoría' }
    } finally {
      loading.value = false
    }
  }

  const normalize = (data: any): AccessAudit => ({
    id: data.id,
    userId: data.userId,
    userEmail: data.userEmail,
    action: data.action,
    module: data.module,
    ipAddress: data.ipAddress,
    success: data.success ?? false,
    metadata: data.metadata,
    createdAt: data.createdAt ? formatDateToString(data.createdAt) : ''
  })

  const formatDateToString = (date: any): string => {
    if (!date) return ''
    if (typeof date === 'string') return date
    if (typeof date === 'object' && date.date) return date.date
    if (typeof date === 'object' && date.year) {
      return `${date.year}-${String(date.monthValue || date.month || '').padStart(2, '0')}-${String(date.dayOfMonth || date.day || '').padStart(2, '0')}T${String(date.hour || '00').padStart(2, '0')}:${String(date.minute || '00').padStart(2, '0')}:${String(date.second || '00').padStart(2, '0')}`
    }
    return ''
  }

  return {
    logs,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchLogs,
    getLog,
    deleteLog
  }
}
