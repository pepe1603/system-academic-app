export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 📝 PUT /api/generations/:id')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const id = getRouterParam(event, 'id')

  try {
    const body = await readBody(event)
    const response = await $fetch(`${config.public.apiBaseUrl}/generations/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al actualizar generación'
    })
  }
})