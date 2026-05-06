export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 🔍 GET /api/profile/search')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const query = getQuery(event)
  const curp = query.curp as string

  if (!curp) {
    throw createError({ statusCode: 400, message: 'El parámetro curp es requerido' })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/profile/search`, {
      headers: { Authorization: authHeader },
      query: { curp }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al buscar perfil por CURP'
    })
  }
})