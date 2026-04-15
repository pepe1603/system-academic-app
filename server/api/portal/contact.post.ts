export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  console.log('[PROXY] 📬 POST /api/portal/contact')

  if (!config.public.apiBaseUrl) {
    return { success: false, message: 'Configuración incorrecta', data: null }
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/portal/contact`, {
      method: 'POST',
      body
    })
    return response
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'Error al enviar mensaje' })
  }
})