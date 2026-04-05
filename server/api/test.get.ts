export default defineEventHandler(() => {
  console.log('[TEST] API route working!')
  return {
    success: true,
    message: 'API route is working',
    timestamp: new Date().toISOString()
  }
})
