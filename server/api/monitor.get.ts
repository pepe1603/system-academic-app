export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  console.log('[PROXY] 📊 GET /api/monitor')

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'No autorizado'
    })
  }

  if (!config.public.apiBaseUrl) {
    return {
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: 'DOWN',
        redis: 'DOWN'
      }
    }
  }

  try {
    const response = await $fetch<{
      status: string
      timestamp: string
      services: { database: string; redis: string }
    }>(`${config.public.apiBaseUrl}/monitor`, {
      method: 'GET',
      headers: {
        Authorization: authHeader
      },
      timeout: 5000
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    throw createError({
      statusCode: err.statusCode || 503,
      message: 'No se pudo obtener el estado del servidor'
    })
  }
})
