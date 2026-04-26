export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  const page = query.page || 0
  const size = query.size || 10

  console.log('[PROXY] 📅 GET /api/portal/events')

  if (!config.public.apiBaseUrl) {
    return {
      success: false,
      message: 'Configuración del servidor incorrecta',
      data: []
    }
  }

  try {
    const endpoint = query.paged === 'true' || query.paged === '1'
      ? `${config.public.apiBaseUrl}/portal/events/paged?page=${page}&size=${size}`
      : `${config.public.apiBaseUrl}/portal/events`

    const response = await $fetch(endpoint, {
      method: 'GET',
      headers: authHeader ? { Authorization: authHeader } : {}
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Error al obtener eventos'
    })
  }
})