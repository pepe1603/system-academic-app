export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 📋 GET /api/report-cards/by-student/:studentId')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const studentId = getRouterParam(event, 'studentId')

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/report-cards/by-student/${studentId}`, {
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener boletas del estudiante'
    })
  }
})
