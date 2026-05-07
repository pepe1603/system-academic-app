export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 🗑️ DELETE /api/study-plans/:id')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const id = getRouterParam(event, 'id')

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/study-plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al eliminar plan de estudio'
    })
  }
})