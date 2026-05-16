export interface SystemConfiguration {
  id: string
  configKey: string
  configValue: string
  description?: string
  dataType: string
  module?: string
  isActive: boolean
  isDeleted: boolean
}

interface CreateSystemConfigurationData {
  configKey: string
  configValue: string
  description?: string
  dataType?: string
  module?: string
}

interface UpdateSystemConfigurationData {
  configValue?: string
  description?: string
  dataType?: string
  module?: string
  isActive?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export const useSystemConfiguration = () => {
  const configs = ref<SystemConfiguration[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchConfigs = async (page: number = 0, size: number = 10): Promise<SystemConfiguration[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<SystemConfiguration[]>>('/api/cpanel/system-configuration', {
        query: { page, size }
      })

      if (response.success && response.data) {
        configs.value = response.data.map(normalize)
        return configs.value
      }
      error.value = response.message || 'Error al cargar configuraciones'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar configuraciones'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedConfigs = async (page: number = 0, size: number = 10): Promise<SystemConfiguration[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<SystemConfiguration[]>>('/api/cpanel/system-configuration/deleted', {
        query: { page, size }
      })

      if (response.success && response.data) {
        configs.value = response.data.map(normalize)
        return configs.value
      }
      error.value = response.message || 'Error al cargar configuraciones eliminadas'
      return []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar configuraciones eliminadas'
      return []
    } finally {
      loading.value = false
    }
  }

  const getConfig = async (id: string): Promise<SystemConfiguration | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<SystemConfiguration>>(`/api/cpanel/system-configuration/${id}`)

      if (response.success && response.data) {
        return normalize(response.data)
      }
      error.value = response.message || 'Configuración no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener configuración'
      return null
    } finally {
      loading.value = false
    }
  }

  const getConfigByKey = async (key: string): Promise<SystemConfiguration | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<SystemConfiguration>>(`/api/cpanel/system-configuration/key/${key}`)

      if (response.success && response.data) {
        return normalize(response.data)
      }
      error.value = response.message || 'Configuración no encontrada'
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener configuración por clave'
      return null
    } finally {
      loading.value = false
    }
  }

  const createConfig = async (data: CreateSystemConfigurationData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<SystemConfiguration>>('/api/cpanel/system-configuration', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetchConfigs(currentPage.value, 10)
        return { success: true, message: response.message || 'Configuración creada' }
      }
      error.value = response.message || 'Error al crear configuración'
      return { success: false, message: response.message || 'Error al crear configuración' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear configuración'
      return { success: false, message: e.data?.message || 'Error al crear configuración' }
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (id: string, data: UpdateSystemConfigurationData): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<SystemConfiguration>>(`/api/cpanel/system-configuration/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success) {
        await fetchConfigs(currentPage.value, 10)
        return { success: true, message: response.message || 'Configuración actualizada' }
      }
      error.value = response.message || 'Error al actualizar configuración'
      return { success: false, message: response.message || 'Error al actualizar configuración' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar configuración'
      return { success: false, message: e.data?.message || 'Error al actualizar configuración' }
    } finally {
      loading.value = false
    }
  }

  const deleteConfig = async (id: string): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/system-configuration/${id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchConfigs(currentPage.value, 10)
        return { success: true, message: response.message || 'Configuración eliminada' }
      }
      error.value = response.message || 'Error al eliminar configuración'
      return { success: false, message: response.message || 'Error al eliminar configuración' }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar configuración'
      return { success: false, message: e.data?.message || 'Error al eliminar configuración' }
    } finally {
      loading.value = false
    }
  }

  const normalize = (data: any): SystemConfiguration => ({
    id: data.id,
    configKey: data.configKey,
    configValue: data.configValue,
    description: data.description,
    dataType: data.dataType,
    module: data.module,
    isActive: data.isActive ?? true,
    isDeleted: data.isDeleted ?? false
  })

  return {
    configs,
    loading,
    error,
    totalElements,
    currentPage,
    totalPages,
    fetchConfigs,
    fetchDeletedConfigs,
    getConfig,
    getConfigByKey,
    createConfig,
    updateConfig,
    deleteConfig
  }
}
