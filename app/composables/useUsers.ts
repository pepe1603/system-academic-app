interface User {
  id: string
  username: string
  email: string
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
  email: string
  curp?: string
  roles?: string[]
}

interface UpdateUserData {
  isActive?: boolean
  roles?: string[]
  mustChangePassword?: boolean
}

interface ApiResponse<T> {
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

    try {
      const response = await $fetch<ApiResponse<UsersPage>>('/api/cpanel/users', {
        params: { page, size }
      })

      if (response.success && response.data) {
        users.value = response.data.content || []
        totalElements.value = response.data.totalElements || 0
        totalPages.value = response.data.totalPages || 0
        currentPage.value = response.data.number || 0
      }
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

  const createUser = async (data: CreateUserData): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<User>>('/api/cpanel/users', {
        method: 'POST',
        body: data
      })

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al crear usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, data: UpdateUserData): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<User>>(`/api/cpanel/users/${id}`, {
        method: 'PUT',
        body: data
      })

      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(`/api/cpanel/users/${id}`, {
        method: 'DELETE'
      })
      return response.success
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al eliminar usuario'
      return false
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