const AUTH_STATE_KEY = 'auth_state'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: Record<string, unknown> | null
}

export default defineNuxtPlugin((nuxtApp) => {
  const authState = useState<AuthState>(AUTH_STATE_KEY, () => ({
    accessToken: null,
    refreshToken: null,
    user: null
  }))

  let isRefreshing = false
  let refreshSubscribers: Array<(token: string) => void> = []

  const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback)
  }

  const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token))
    refreshSubscribers = []
  }

  const getTokenExpiry = (token: string | null): number | null => {
    if (!token) return null
    try {
      const parts = (token as string).split('.')
      const part = parts[1]
      if (!part) return null
      const payload = JSON.parse(atob(part))
      return payload.exp ? payload.exp * 1000 : null
    } catch {
      return null
    }
  }

  const doRefresh = async (): Promise<boolean> => {
    if (!authState.value.refreshToken) return false

    try {
      const response = await $fetch<{ success: boolean; data: string }>('/api/refresh', {
        method: 'POST',
        body: { refreshToken: authState.value.refreshToken }
      })

      if (response.success && response.data) {
        authState.value.accessToken = response.data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  nuxtApp.hook('app:created', () => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url

      if (!url.startsWith('/api/') || !authState.value.accessToken) {
        return originalFetch(input, init)
      }

      const tokenExpiry = getTokenExpiry(authState.value.accessToken)

      if (tokenExpiry && tokenExpiry - Date.now() < 60000) {
        if (!isRefreshing) {
          isRefreshing = true
          try {
            const success = await doRefresh()
            if (success) {
              onTokenRefreshed(authState.value.accessToken!)
            } else {
              authState.value = { accessToken: null, refreshToken: null, user: null }
              navigateTo('/auth/login')
            }
          } catch {
            authState.value = { accessToken: null, refreshToken: null, user: null }
            navigateTo('/auth/login')
          } finally {
            isRefreshing = false
          }
        } else {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              const headers = new Headers(init?.headers)
              headers.set('Authorization', `Bearer ${newToken}`)
              resolve(originalFetch(input, { ...init, headers }))
            })
          })
        }
      }

      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${authState.value.accessToken}`)

      return originalFetch(input, { ...init, headers })
    }
  })
})
