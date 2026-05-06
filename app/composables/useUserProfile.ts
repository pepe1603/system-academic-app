import type { EnrichedProfile } from './useProfile'

interface UpdateProfileData {
  firstName: string
  lastName: string
  curp?: string
  rfc?: string
  phone?: string
  secondaryPhone?: string
  birthDate?: string
  gender?: string
  employeeNumber?: string
  enrollmentNumber?: string
  institutionalEmail?: string
  secondaryEmail?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export const useUserProfile = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUserProfile = async (userId: string): Promise<EnrichedProfile | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EnrichedProfile>>(`/api/cpanel/users/${userId}/profile`)
      return response.success && response.data ? response.data : null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar perfil de usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (userId: string, data: UpdateProfileData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EnrichedProfile>>(`/api/cpanel/users/${userId}/profile`, {
        method: 'PUT',
        body: data
      })
      if (response.success) {
        return true
      }
      error.value = response.message
      return false
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar perfil de usuario'
      return false
    } finally {
      loading.value = false
    }
  }

  const searchProfileByCurp = async (curp: string): Promise<EnrichedProfile | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EnrichedProfile>>('/api/profile/search', {
        query: { curp }
      })
      return response.success && response.data ? response.data : null
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al buscar perfil por CURP'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
    searchProfileByCurp
  }
}