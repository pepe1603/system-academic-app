export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const authHeader = headers.authorization

  console.log(`[PROXY] 📬 POST /api/portal/contact/${id}/respond`)

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  if (!config.public.apiBaseUrl) {
    return { success: false, message: 'Configuración incorrecta', data: null }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/contact/${id}/respond`, {
      method: 'POST',
      headers: { 
        Authorization: authHeader,
        'Content-Type': 'text/plain'
      },
      body
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'Error al responder mensaje' })
  }
})