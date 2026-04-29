interface RegistrationInitData {
  curp: string
  email: string
}

interface RegistrationVerifyData {
  curp: string
  otp: string
}

interface RegistrationResponse {
  success: boolean
  message: string
  data?: {
    id?: string
    curp?: string
    email?: string
    status?: string
    studentName?: string
    teacherName?: string
  }
}

export const useRegistration = () => {
  const loading = useState<boolean>('registrationLoading', () => false)
  const error = useState<string | null>('registrationError', () => null)
  const step = useState<number>('registrationStep', () => 1)
  const registrationData = useState<RegistrationResponse['data'] | null>('registrationData', () => null)

  const initRegistration = async (data: RegistrationInitData): Promise<RegistrationResponse> => {
    loading.value = true
    error.value = null
    console.log('[REGISTRATION] 📝 Iniciando registro para CURP:', data.curp, '- Email:', data.email)

    try {
      const response = await $fetch<RegistrationResponse>('/api/registration/init', {
        method: 'POST',
        body: data
      })

      console.log('[REGISTRATION] 📥 Respuesta:', response)
      
      if (response.success) {
        step.value = 2
        registrationData.value = response.data || null
      }
      
      return response
    } catch (err: unknown) {
      console.error('[REGISTRATION] ❌ Error:', err)
      const errorObj = err as { data?: { message?: string } }
      error.value = errorObj.data?.message || 'Error al iniciar registro'
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyRegistration = async (data: RegistrationVerifyData): Promise<RegistrationResponse> => {
    loading.value = true
    error.value = null
    console.log('[REGISTRATION] 📝 Verificando registro para CURP:', data.curp)

    try {
      const response = await $fetch<RegistrationResponse>('/api/registration/verify', {
        method: 'POST',
        body: data
      })

      console.log('[REGISTRATION] 📥 Respuesta:', response)
      console.log('[REGISTRATION] ✅ Success:', response.success)
      
      return response
    } catch (err: unknown) {
      console.error('[REGISTRATION] ❌ Error:', err)
      const errorObj = err as { data?: { message?: string } }
      error.value = errorObj.data?.message || 'Error al verificar registro'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    step.value = 1
    registrationData.value = null
    error.value = null
  }

  return {
    loading,
    error,
    step,
    registrationData,
    initRegistration,
    verifyRegistration,
    reset
  }
}