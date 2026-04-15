export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  console.log(`[PROXY] 🗑️ DELETE /api/portal/ads/${id}`)

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  if (!config.public.apiBaseUrl) {
    return { success: false, message: 'Configuración incorrecta', data: null }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/ads/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'Error al eliminar anuncio' })
  }
})