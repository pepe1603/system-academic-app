export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  console.log('[PROXY] 📢 GET /api/portal/ads')

  if (!config.public.apiBaseUrl) {
    return { success: false, message: 'Configuración incorrecta', data: [] }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/ads`, {
      method: 'GET',
      headers: authHeader ? { Authorization: authHeader } : {}
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'Error al obtener anuncios' })
  }
})