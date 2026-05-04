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
  const loading = useState<boolean>('usersLoading', () => false)
  const error = useState<string | null>('usersError', () => null)
  const users = useState<User[]>('usersList', () => [])
  const totalElements = useState<number>('usersTotal', () => 0)
  const currentPage = useState<number>('usersPage', () => 0)
  const totalPages = useState<number>('usersTotalPages', () => 0)

  const fetchUsers = async (page = 0, size = 20) => {
    loading.value = true
    error.value = null

    console.log('[useUsers] fetchUsers called:', { page, size })

    try {
      console.log('[useUsers] Making API call to /api/cpanel/users with params:', { page, size })
      const response = await $fetch<ApiResponse<UsersPage>>('/api/cpanel/users', {
        params: { page, size }
      })

      console.log('[useUsers] API response:', JSON.stringify(response, null, 2))

      if (response.success && response.data) {
        console.log('[useUsers] Before update - users.value:', users.value.length)
        users.value = response.data.content || []
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.number || 0
        console.log('[useUsers] After update - users.value:', users.value.length)
        console.log('[useUsers] Data loaded:', { 
          usersCount: users.value.length, 
          totalElements: totalElements.value,
          currentPage: currentPage.value,
          totalPages: totalPages.value
        })
      } else {
        console.log('[useUsers] Response not successful or no data:', response)
      }
      error.value = response.message || null
    } catch (err: unknown) {
      console.error('[useUsers] Error:', err)
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar usuarios'
    } finally {
      loading.value = false
      console.log('[useUsers] fetchUsers completed')
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
    deleteUser
  }
}
