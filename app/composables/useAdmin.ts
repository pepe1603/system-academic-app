interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

interface MigrationResult {
  studentsMigrated: number
  teachersMigrated: number
}

export const useAdmin = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const migrateProfiles = async (): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<MigrationResult>>('/api/admin/migrate-profiles', {
        method: 'POST'
      })
      return { success: response.success, message: response.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      error.value = e.data?.message || 'Error al ejecutar migración'
      return { success: false, message: e.data?.message || 'Error al ejecutar migración' }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    migrateProfiles
  }
}