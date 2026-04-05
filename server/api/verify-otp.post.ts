export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log('[PROXY] 🔐 POST /api/verify-otp')
  console.log('[PROXY] 📥 Body:', body)

  if (!config.public.apiBaseUrl) {
    throw createError({
      statusCode: 500,
      message: 'Configuración del servidor incorrecta'
    })
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/verify-otp`, {
      method: 'POST',
      body: {
        email: body.email,
        code: body.code,
        purpose: body.purpose || 'PASSWORD_RECOVERY'
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
      statusCode: err.statusCode || 400,
      message: err.data?.message || err.message || 'Código inválido'
    })
  }
})
