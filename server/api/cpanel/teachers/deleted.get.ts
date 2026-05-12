export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const query = getQuery(event)
  const page = query.page || 0
  const size = query.size || 10

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/teachers/deleted`, {
      headers: { Authorization: authHeader },
      query: { page, size }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener docentes eliminados'
    })
  }
})
