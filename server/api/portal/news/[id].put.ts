export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  console.log(`[PROXY] 📰 PUT /api/portal/news/${id}`)

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'No autorizado'
    })
  }

  if (!config.public.apiBaseUrl) {
    return {
      success: false,
      message: 'Configuración del servidor incorrecta',
      data: null
    }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/news/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader
      },
      body
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Error al actualizar noticia'
    })
  }
})