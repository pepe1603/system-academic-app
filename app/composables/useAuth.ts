import type { ApiResponse } from '~/types/api'

interface LoginDataSuccess {
  userId: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  accessToken: string
  refreshToken: string
  expiresIn: number
  requiresTwoFactor?: false
  tempToken?: null
}

interface LoginDataTwoFactor {
  requiresTwoFactor: true
  tempToken: string
  message: string
}

interface LoginResponse {
  success: boolean
  message: string
  data: LoginDataSuccess | LoginDataTwoFactor | null
}

interface LoginCredentials {
  username: string
  password: string
}

export const useAuth = () => {
  const user = useState<User | null>('authUser', () => null)
  const accessToken = useState<string | null>('accessToken', () => null)
  const refreshToken = useState<string | null>('refreshToken', () => null)
  const tempToken = useState<string | null>('tempToken', () => null)
  const requiresTwoFactor = useState<boolean>('requiresTwoFactor', () => false)
  const loading = useState<boolean>('authLoading', () => false)

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    loading.value = true
    console.log('[AUTH] 🔐 Intentando login para:', credentials.username)

    try {
      const response = await $fetch<ApiResponse<LoginDataSuccess | LoginDataTwoFactor>>('/api/login', {
        method: 'POST',
        body: credentials
      })

      console.log('[AUTH] 📥 Respuesta del servidor:', response)

      if (response.data && 'requiresTwoFactor' in response.data && response.data.requiresTwoFactor) {
        console.log('[AUTH] 🔒 2FA requerido, tempToken:', response.data.tempToken)
        requiresTwoFactor.value = true
        tempToken.value = (response.data as LoginDataTwoFactor).tempToken
      } else if (response.data && 'accessToken' in response.data) {
        const data = response.data as LoginDataSuccess
        console.log('[AUTH] 🎫 Token recibido, usuario:', data.username)
        accessToken.value = data.accessToken
        refreshToken.value = data.refreshToken
        user.value = {
          id: data.userId,
          username: data.username,
          email: data.email,
          roles: data.roles,
          permissions: data.permissions
        }
        requiresTwoFactor.value = false
        tempToken.value = null

        const cookie = useCookie('auth_token')
        cookie.value = data.accessToken
        console.log('[AUTH] 💾 Token guardado en cookie')

        const { startMonitoring } = useServerStatus()
        startMonitoring()
      }

      return response as LoginResponse
    } catch (error: unknown) {
      console.error('[AUTH] ❌ Error en login:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const verifyTwoFactor = async (code: string, backupCode?: string) => {
    loading.value = true
    console.log('[AUTH] 🔐 Verificando código 2FA')

    try {
      const response = await $fetch<LoginResponse>('/api/verify-2fa', {
        method: 'POST',
        body: {
          tempToken: tempToken.value,
          code,
          backupCode
        }
      })

      console.log('[AUTH] 📥 Respuesta verify-2fa:', response)

      if (response.data && 'accessToken' in response.data) {
        const data = response.data as LoginDataSuccess
        accessToken.value = data.accessToken
        refreshToken.value = data.refreshToken
        user.value = {
          id: data.userId,
          username: data.username,
          email: data.email,
          roles: data.roles,
          permissions: data.permissions
        }
        requiresTwoFactor.value = false
        tempToken.value = null

        const cookie = useCookie('auth_token')
        cookie.value = data.accessToken
        console.log('[AUTH] ✅ 2FA verificado, usuario:', data.username)
      }

      return response
    } catch (error: unknown) {
      console.error('[AUTH] ❌ Error en verify-2fa:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      console.log('[AUTH] ⚠️ No hay refreshToken disponible')
      return false
    }

    console.log('[AUTH] 🔄 Renovando accessToken...')
    try {
      const response = await $fetch<{ success: boolean, data: string }>('/api/refresh', {
        method: 'POST',
        body: { refreshToken: refreshToken.value }
      })

      if (response.success && response.data) {
        accessToken.value = response.data
        const cookie = useCookie('auth_token')
        cookie.value = response.data
        console.log('[AUTH] ✅ Token renovado exitosamente')
        return true
      }
      console.log('[AUTH] ⚠️ Refreshresponse no exitosa:', response)
      return false
    } catch (error) {
      console.error('[AUTH] ❌ Error al renovar token:', error)
      await logout()
      return false
    }
  }

  const logout = async () => {
    console.log('[AUTH] 🚪 Ejecutando logout...')
    if (accessToken.value) {
      try {
        console.log('[AUTH] 📤 Enviando logout al servidor')
        await $fetch('/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          }
        })
        console.log('[AUTH] ✅ Logout enviado al servidor')
      } catch (error) {
        console.error('[AUTH] ❌ Error en logout:', error)
      }
    }

    user.value = null
    accessToken.value = null
    refreshToken.value = null
    tempToken.value = null
    requiresTwoFactor.value = false

    const cookie = useCookie('auth_token')
    cookie.value = null

    const { stopMonitoring, destroy } = useServerStatus()
    stopMonitoring()
    destroy()

    console.log('[AUTH] ✅ Estado de auth limpiado')
  }

  const isAuthenticated = computed(() => !!accessToken.value)

  const hasRole = (role: string) => {
    return user.value?.roles?.includes(role) || false
  }

  const hasPermission = (permission: string) => {
    return user.value?.permissions?.includes(permission) || false
  }

  return {
    user,
    accessToken,
    refreshToken,
    tempToken,
    requiresTwoFactor,
    loading,
    isAuthenticated,
    login,
    verifyTwoFactor,
    refreshAuthToken,
    logout,
    hasRole,
    hasPermission
  }
}

interface User {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
}
