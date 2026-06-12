import type { ApiResponse, ApiResult } from '~/types/api'
import { useBaseCRUD } from './useBaseCRUD'

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

export interface CreateUserData {
  username: string
  email: string
  password: string
  curp?: string
  roles?: string[]
}

export interface UpdateUserData {
  isActive?: boolean
  roles?: string[]
  mustChangePassword?: boolean
  curp?: string
}

const baseCRUD = useBaseCRUD<User, CreateUserData, UpdateUserData>({
  endpoint: '/api/cpanel/users'
})

export const useUsers = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const handleError = (err: unknown, defaultMessage: string): string => {
    const e = err as { data?: { message?: string } }
    const msg = e.data?.message || defaultMessage
    error.value = msg
    return msg
  }

  const fetchUsers = async (page = 0, size = 20) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<UsersPage>>('/api/cpanel/users', {
        params: { page, size }
      })

      if (response.success && response.data) {
        baseCRUD.items.value = [...(response.data.content || [])]
        baseCRUD.totalElements.value = response.data.totalElements || 0
        baseCRUD.totalPages.value = response.data.totalPages || 0
        baseCRUD.currentPage.value = response.data.number || 0
      }
      error.value = response.message || null
    } catch (err: unknown) {
      handleError(err, 'Error al cargar usuarios')
    } finally {
      loading.value = false
    }
  }

  const getUser = baseCRUD.getById

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
      const msg = handleError(err, 'Error al crear usuario')
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
      const msg = handleError(err, 'Error al actualizar usuario')
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = baseCRUD.delete

  const revokeSessions = async (id: string): Promise<ApiResult<void>> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}/sessions`, {
        method: 'DELETE'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const msg = handleError(err, 'Error al revocar sesiones')
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
      const msg = handleError(err, 'Error al desbloquear usuario')
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
      const msg = handleError(err, 'Error al bloquear usuario')
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
      const msg = handleError(err, 'Error al banear usuario')
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
        baseCRUD.items.value = [...(response.data.content || [])]
        baseCRUD.totalElements.value = response.data.totalElements || 0
        baseCRUD.totalPages.value = response.data.totalPages || 0
        baseCRUD.currentPage.value = response.data.number || 0
      }
      error.value = response.message || null
    } catch (err: unknown) {
      handleError(err, 'Error al cargar usuarios eliminados')
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
      const msg = handleError(err, 'Error al obtener permisos')
      loading.value = false
      return []
    }
  }

  return {
    loading,
    error,
    users: baseCRUD.items,
    totalElements: baseCRUD.totalElements,
    currentPage: baseCRUD.currentPage,
    totalPages: baseCRUD.totalPages,
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