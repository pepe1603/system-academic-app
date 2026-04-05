export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const headers = getHeaders(event)

  console.log('[PROXY] 🚪 POST /api/logout')
  console.log('[PROXY] 📥 Body:', body)

  if (!config.public.apiBaseUrl) {
    throw createError({
      statusCode: 500,
      message: 'Configuración del servidor incorrecta'
    })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: headers.authorization || ''
      }
    })
    return response
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      message?: string
      data?: { message?: string }
    }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || err.message || 'Error al cerrar sesión'
    })
  }
})
