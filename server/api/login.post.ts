export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log('[PROXY] ════════════════════════════════════════════')
  console.log('[PROXY] 🔐 POST /api/login')
  console.log('[PROXY] 📥 Body recibido:', body)
  console.log('[PROXY] 🌐 API Base URL:', config.public.apiBaseUrl)

  if (!config.public.apiBaseUrl) {
    console.error('[PROXY] ❌ API Base URL no está configurada')
    throw createError({
      statusCode: 500,
      message: 'Configuración del servidor incorrecta'
    })
  }

  try {
    console.log('[PROXY] ⏳ Enviando petición al backend...')
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/login`, {
      method: 'POST',
      body
    })
    console.log('[PROXY] ✅ Respuesta del backend:', response)
    console.log('[PROXY] ════════════════════════════════════════════')
    return response
  } catch (error: unknown) {
    console.error('[PROXY] ❌ Error del backend:', JSON.stringify(error, null, 2))

    const err = error as {
      statusCode?: number
      message?: string
      data?: { message?: string, code?: string }
    }

    throw createError({
      statusCode: err.statusCode || 401,
      message: err.data?.message || err.message || 'Credenciales inválidas'
    })
  }
})
