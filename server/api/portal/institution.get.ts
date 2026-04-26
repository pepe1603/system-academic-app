export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  console.log('[PROXY] 🏛️ GET /api/portal/institution')

  if (!config.public.apiBaseUrl) {
    return {
      success: false,
      message: 'Configuración del servidor incorrecta',
      data: null
    }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/institution`, {
      method: 'GET'
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Error al obtener información institucional'
    })
  }
})