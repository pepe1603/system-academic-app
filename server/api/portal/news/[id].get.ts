export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  console.log(`[PROXY] 📰 GET /api/portal/news/${id}`)

  if (!config.public.apiBaseUrl) {
    return {
      success: false,
      message: 'Configuración del servidor incorrecta',
      data: null
    }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/news/${id}`, {
      method: 'GET',
      headers: authHeader ? { Authorization: authHeader } : {}
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({
      statusCode: err.statusCode || 404,
      message: err.message || 'Noticia no encontrada'
    })
  }
})