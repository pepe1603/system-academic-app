export interface User {
  id: string
  username: string
  email: string
  curp?: string
  isActive: boolean
  isVerified: boolean
  mustChangePassword: boolean
  roles: string[]
  createdAt: string
}

interface UsersPage {
  content: User[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

interface CreateUserData {
  username: string
  email: string
  password: string
  curp?: string
  roles?: string[]
}

interface UpdateUserData {
  isActive?: boolean
  roles?: string[]
  mustChangePassword?: boolean
  curp?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

interface ApiResult<T> {
  success: boolean
  message: string
  data?: T
}

export const useUsers = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const users = ref<User[]>([])
  const totalElements = ref(0)
  const currentPage = ref(0)
  const totalPages = ref(0)

  const fetchUsers = async (page = 0, size = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<UsersPage>>('/api/cpanel/users', {
        params: { page, size }
      })

      if (response.success && response.data) {
        users.value = [...(response.data.content || [])]
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.number || 0
      }
      error.value = response.message || null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  const getUser = async (id: string): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<User>>(`/api/cpanel/users/${id}`)
      return response.success && response.data ? response.data : null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data: CreateUserData): Promise<ApiResult<User>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<User>>('/api/cpanel/users', {
        method: 'POST',
        body: data
      })

      if (response.success && response.data) {
        return { success: true, message: response.message, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al crear usuario'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, data: UpdateUserData): Promise<ApiResult<User>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<User>>(`/api/cpanel/users/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success && response.data) {
        return { success: true, message: response.message, data: response.data }
      }
      return { success: false, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al actualizar usuario'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}`, {
        method: 'DELETE'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al eliminar usuario'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const revokeSessions = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}/sessions`, {
        method: 'DELETE'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al revocar sesiones'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const unlockUser = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}/unlock`, {
        method: 'PUT'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al desbloquear usuario'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const lockUser = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}/lock`, {
        method: 'PUT'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al bloquear usuario'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const banUser = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}/ban`, {
        method: 'PUT'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const msg = e.data?.message || 'Error al banear usuario'
      error.value = msg
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const fetchDeletedUsers = async (page = 0, size = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<UsersPage>>('/api/cpanel/users/deleted', {
        params: { page, size }
      })

      if (response.success && response.data) {
        users.value = [...(response.data.content || [])]
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.number || 0
      }
      error.value = response.message || null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar usuarios eliminados'
    } finally {
      loading.value = false
    }
  }

  const fetchPermissionsByRole = async (roleName: string): Promise<string[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<string[]>>('/api/cpanel/users/roles/permissions', {
        params: { roleName }
      })
      loading.value = false
      return response.success && response.data ? response.data : []
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al obtener permisos'
      loading.value = false
      return []
    }
  }

  return {
    loading,
    error,
    users,
    totalElements,
    currentPage,
    totalPages,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    revokeSessions,
    unlockUser,
    lockUser,
    banUser,
    fetchDeletedUsers,
    fetchPermissionsByRole
  }
}
