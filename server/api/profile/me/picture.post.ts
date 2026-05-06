export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, 'auth_token')
  const authHeader = cookie ? `Bearer ${cookie}` : null

  console.log('[PROXY] 📷 POST /api/profile/me/picture')

  if (!authHeader) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'No se recibió ningún archivo' })
    }

    const filePart = formData.find(part => part.name === 'file')
    
    if (!filePart) {
      throw createError({ statusCode: 400, message: 'El campo file es requerido' })
    }

    const response = await $fetch(`${config.public.apiBaseUrl}/profile/me/picture`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: formData
    })
    
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, data?: { message?: string } }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Error al subir foto de perfil'
    })
  }
})