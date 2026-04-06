<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()

const isCollapsed = ref(false)
const isDropdownOpen = ref(false)

const handleLogout = async () => {
  isDropdownOpen.value = false
  await logout()
  await navigateTo('/auth/login')
}

const navigation = [
  {
    title: 'Dashboard',
    to: '/cpanel',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    title: 'Usuarios',
    to: '/cpanel/users',
    icon: 'i-lucide-users'
  },
  {
    title: 'Estudiantes',
    to: '/cpanel/students',
    icon: 'i-lucide-user-round'
  },
  {
    title: 'Docentes',
    to: '/cpanel/teachers',
    icon: 'i-lucide-graduation-cap'
  },
  {
    title: 'Configuración',
    to: '/cpanel/settings',
    icon: 'i-lucide-settings'
  }
]

const breadcrumbs = computed(() => {
  const crumbs = [{ label: 'Panel de Control', to: '/cpanel', icon: 'i-lucide-home' }]
  
  const currentNav = navigation.find(n => n.to === route.path)
  if (currentNav && route.path !== '/cpanel') {
    crumbs.push({ label: currentNav.title, to: route.path, icon: currentNav.icon })
  }
  
  return crumbs
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <UApp>
    <header class="h-16 border-b border-default bg-background px-6 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-4">
        <UBreadcrumb :items="breadcrumbs" />
      </div>

      <div class="flex items-center gap-2">
        <UColorModeButton />

        <div class="relative">
          <UButton
            icon="i-lucide-user"
            color="neutral"
            variant="ghost"
            @click="isDropdownOpen = !isDropdownOpen"
          >
            {{ user?.username || 'Usuario' }}
          </UButton>

          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-background border border-default rounded-lg shadow-lg py-1 z-50"
          >
            <button
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <UIcon name="i-lucide-user" class="w-4 h-4" />
              Perfil
            </button>
            <hr class="my-1 border-default" />
            <button
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-red-500"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <UButton
          :icon="isCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'"
          variant="ghost"
          @click="isCollapsed = !isCollapsed"
        />
      </div>
    </header>

    <div class="flex">
      <aside
        class="border-r border-default bg-default transition-all duration-300 shrink-0"
        :class="isCollapsed ? 'w-16' : 'w-64'"
      >
        <nav class="p-2">
          <div
            v-for="item in navigation"
            :key="item.to"
            class="mb-1"
          >
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              :class="[
                isActive(item.to)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
            >
              <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="!isCollapsed" class="text-sm font-medium">{{ item.title }}</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <main class="flex-1 p-6 min-h-[calc(100vh-64px)]">
        <slot />
      </main>
    </div>

    <div
      v-if="isDropdownOpen"
      class="fixed inset-0 z-40"
      @click="isDropdownOpen = false"
    />
  </UApp>
</template>
