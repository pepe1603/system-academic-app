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
  profilePictureUrl?: string
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
      console.log('[useProfile] Response:', JSON.stringify(response, null, 2))
      if (response.success && response.data) {
        const normalized = normalizeProfileData(response.data)
        console.log('[useProfile] Normalized data:', JSON.stringify(normalized, null, 2))
        profile.value = normalized
      }
      return profile.value
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      console.error('[useProfile] Error:', e)
      error.value = e.data?.message || 'Error al cargar perfil'
      return null
    } finally {
      loading.value = false
    }
  }

  const normalizeProfileData = (data: any): EnrichedProfile => {
    return {
      ...data,
      birthDate: data.birthDate ? formatDateToString(data.birthDate) : undefined,
      createdAt: data.createdAt ? formatDateToString(data.createdAt) : undefined,
      studentInfo: data.studentInfo ? {
        ...data.studentInfo,
        enrollmentDate: data.studentInfo.enrollmentDate ? formatDateToString(data.studentInfo.enrollmentDate) : undefined
      } : undefined
    }
  }

  const formatDateToString = (date: any): string => {
    if (!date) return ''
    if (typeof date === 'string') return (date.split('T')[0]) || ''
    if (typeof date === 'object' && date.date) {
      return (date.date.split(' ')[0]) || ''
    }
    if (typeof date === 'object' && date.year) {
      return `${date.year}-${String(date.monthValue || date.month || '').padStart(2, '0')}-${String(date.dayOfMonth || date.day || '').padStart(2, '0')}`
    }
    return ''
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
        profile.value = normalizeProfileData(response.data)
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