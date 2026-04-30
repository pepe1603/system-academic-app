export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 📝 DELETE /api/users/' + id)

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de usuario requerido' })
  }

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al eliminar usuario'
    })
  }
})