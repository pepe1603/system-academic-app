export interface EnrichedProfile {
  id: string
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
  profilePictureUrl?: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  roles: string[]
  studentInfo?: {
    studentId: string
    enrollmentNumber: string
    enrollmentDate: string
    generationId: string
    isActive: boolean
  }
  teacherInfo?: {
    teacherId: string
    employeeNumber: string
    rfc: string
    isActive: boolean
  }
}

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

export const useProfile = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const profile = ref<EnrichedProfile | null>(null)

  const fetchMyProfile = async (): Promise<EnrichedProfile | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EnrichedProfile>>('/api/profile/me')
      if (response.success && response.data) {
        profile.value = response.data
      }
      return profile.value
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al cargar perfil'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateMyProfile = async (data: UpdateProfileData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<EnrichedProfile>>('/api/profile/me', {
        method: 'PUT',
        body: data
      })
      if (response.success && response.data) {
        profile.value = response.data
        return true
      }
      error.value = response.message
      return false
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al actualizar perfil'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    profile,
    fetchMyProfile,
    updateMyProfile
  }
}