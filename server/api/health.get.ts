export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  console.log('[PROXY] 💚 GET /api/health')

  if (!config.public.apiBaseUrl) {
    return {
      status: 'DOWN',
      timestamp: new Date().toISOString()
    }
  }

  try {
    const response = await $fetch<{ status: string; timestamp: string }>(
      `${config.public.apiBaseUrl}/health`,
      {
        method: 'GET',
        timeout: 5000
      }
    )
    return response
  } catch {
    return {
      status: 'DOWN',
      timestamp: new Date().toISOString()
    }
  }
})
