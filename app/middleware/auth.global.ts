export default defineNuxtRouteMiddleware((to) => {
  const authCookie = useCookie('auth_token')

  const isAuthPage = to.path.startsWith('/auth')
  const isProtectedPage = to.path.startsWith('/cpanel')

  if (isProtectedPage && !authCookie.value) {
    return navigateTo('/auth/login')
  }

  if (isAuthPage && authCookie.value) {
    return navigateTo('/cpanel')
  }
})
