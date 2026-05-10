export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 📋 GET /api/attendances/by-enrollment/:enrollmentId')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const enrollmentId = getRouterParam(event, 'enrollmentId')

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/attendances/by-enrollment/${enrollmentId}`, {
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener asistencias por inscripción'
    })
  }
})
