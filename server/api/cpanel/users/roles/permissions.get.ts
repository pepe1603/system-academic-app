export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  const roleName = query.roleName as string

  console.log('[PROXY] 📝 GET /api/users/roles/permissions?roleName=' + roleName)

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  if (!roleName) {
    throw createError({ statusCode: 400, message: 'Parámetro roleName requerido' })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/roles/permissions`, {
      params: { roleName },
      headers: { Authorization: authHeader }
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al obtener permisos del rol'
    })
  }
})