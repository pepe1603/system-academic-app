export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  console.log(`[PROXY] 📅 GET /api/portal/events/${id}`)

  if (!config.public.apiBaseUrl) {
    return {
      success: false,
      message: 'Configuración del servidor incorrecta',
      data: null
    }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/events/${id}`, {
      method: 'GET'
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({
      statusCode: err.statusCode || 404,
      message: err.message || 'Evento no encontrado'
    })
  }
})