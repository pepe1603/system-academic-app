export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log('[PROXY] 📝 POST /api/users')

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users`, {
      method: 'POST',
      body
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al crear usuario'
    })
  }
})