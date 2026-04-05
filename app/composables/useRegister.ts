interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  type: 'STUDENT' | 'TEACHER'
  curp?: string
  enrollmentNumber?: string
  rfc?: string
  employeeNumber?: string
}

interface RegisterResponse {
  success: boolean
  message: string
  data: unknown
}

export const useRegister = () => {
  const loading = useState<boolean>('registerLoading', () => false)
  const error = useState<string | null>('registerError', () => null)

  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    loading.value = true
    error.value = null
    console.log('[REGISTER] 📝 Iniciando registro para:', data.username, '- Tipo:', data.type)

    try {
      console.log('[REGISTER] 📤 Enviando datos al servidor...')
      const response = await $fetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: data
      })

      console.log('[REGISTER] 📥 Respuesta del servidor:', response)
      console.log('[REGISTER] ✅ Success:', response.success)
      console.log('[REGISTER] 📝 Message:', response.message)
      return response
    } catch (err: unknown) {
      console.error('[REGISTER] ❌ Error en registro:', err)
      const errorObj = err as { data?: { message?: string } }
      error.value = errorObj.data?.message || 'Error al registrar usuario'
      throw err
    } finally {
      loading.value = false
      console.log('[REGISTER] 🔄 Loading terminado')
    }
  }

  return {
    loading,
    error,
    register
  }
}
