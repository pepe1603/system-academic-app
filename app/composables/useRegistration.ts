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
  const step = useState<number>('registrationStep', () => 1)
  const registrationData = useState<RegistrationResponse['data'] | null>('registrationData', () => null)

  const initRegistration = async (data: RegistrationInitData): Promise<RegistrationResponse> => {
    loading.value = true
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
      console.error('[REGISTRATION] ❌ Error thrown:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyRegistration = async (data: RegistrationVerifyData): Promise<RegistrationResponse> => {
    loading.value = true
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
      console.error('[REGISTRATION] ❌ Error thrown:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    step.value = 1
    registrationData.value = null
  }

  return {
    loading,
    step,
    registrationData,
    initRegistration,
    verifyRegistration,
    reset
  }
}