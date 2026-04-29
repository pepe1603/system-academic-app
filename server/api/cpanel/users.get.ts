export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const page = query.page || 0
  const size = query.size || 20
  const sort = query.sort || 'createdAt,desc'

  console.log('[PROXY] 📝 GET /api/users')

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users`, {
      params: { page, size, sort }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener usuarios'
    })
  }
})