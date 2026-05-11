export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] GET /api/conduct/by-semester/:semesterId')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const semesterId = getRouterParam(event, 'semesterId')

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/conduct/by-semester/${semesterId}`, {
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener registros de conducta por semestre'
    })
  }
})
