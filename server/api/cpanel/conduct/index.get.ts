export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] GET /api/conduct')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const page = query.page || 0
  const size = query.size || 10

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/conduct`, {
      headers: { Authorization: authHeader },
      query: { page, size }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener registros de conducta'
    })
  }
})
