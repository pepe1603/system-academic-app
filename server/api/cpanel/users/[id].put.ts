export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log('[PROXY] 📝 PUT /api/users/' + id)

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de usuario requerido' })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/${id}`, {
      method: 'PUT',
      body
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al actualizar usuario'
    })
  }
})