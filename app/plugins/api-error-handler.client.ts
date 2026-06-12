interface ApiError {
  statusCode?: number
  message?: string
  data?: { message?: string }
}

const isServerError = (error: unknown): boolean => {
  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
    return true
  }

  const apiError = error as ApiError

  if (apiError.statusCode) {
    return apiError.statusCode >= 500 || apiError.statusCode === 0
  }

  const message = apiError.message?.toLowerCase() || ''
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('networkerror') ||
    message.includes('timeout') ||
    message.includes('econnrefused')
  )
}

const getErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError

  if (apiError.data?.message) {
    return apiError.data.message
  }

  if (apiError.message) {
    if (apiError.statusCode === 401) {
      navigateTo('/auth/login')
      return 'Sesión expirada. Por favor inicia sesión nuevamente.'
    }
    if (apiError.statusCode === 403) {
      return 'No tienes permisos para realizar esta acción.'
    }
    if (apiError.statusCode === 404) {
      return 'El recurso solicitado no fue encontrado.'
    }
    if (apiError.statusCode === 422) {
      return 'Los datos proporcionados no son válidos.'
    }
    if (apiError.statusCode === 429) {
      return 'Demasiadas solicitudes. Espera un momento.'
    }
    if (apiError.statusCode && apiError.statusCode >= 500) {
      return 'Error del servidor. Intenta más tarde.'
    }

    return apiError.message
  }

  if (isServerError(error)) {
    return 'No se puede conectar con el servidor. Verifica tu conexión.'
  }

  return 'Ocurrió un error inesperado.'
}

export default defineNuxtPlugin((nuxtApp) => {
  const { checkHealth, status: serverStatus } = useServerStatus()

  nuxtApp.hook('app:created', async () => {
    await checkHealth()
  })

  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('[nitro]')) {
      return
    }

    const error = args[0]
    if (isServerError(error) && serverStatus.value.isOnline) {
      checkHealth()
    }

    originalConsoleError.apply(console, args)
  }
})

export { isServerError, getErrorMessage }
