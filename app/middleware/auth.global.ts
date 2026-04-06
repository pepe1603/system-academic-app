export default defineNuxtRouteMiddleware((to) => {
  const { accessToken, isAuthenticated } = useAuth()

  const isAuthPage = to.path.startsWith('/auth')
  const isPublicPage = ['/auth/login', '/auth/register', '/auth/reset-password'].some(p => to.path.startsWith(p))

  if (!isAuthenticated.value && !isAuthPage) {
    return navigateTo('/auth/login')
  }

  if (isAuthenticated.value && isPublicPage) {
    return navigateTo('/cpanel')
  }
})
