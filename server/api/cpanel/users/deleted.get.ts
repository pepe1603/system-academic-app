export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  const page = query.page || 0
  const size = query.size || 20

  console.log('[PROXY] 📝 GET /api/users/deleted')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/deleted`, {
      params: { page, size },
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener usuarios eliminados'
    })
  }
})