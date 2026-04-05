<script setup lang="ts">
const route = useRoute()

const isCollapsed = ref(false)

const navigation = computed(() => {
  return [
    {
      title: 'Dashboard',
      to: '/cpanel',
      icon: 'i-lucide-layout-dashboard'
    },
    {
      title: 'Usuarios',
      to: '/cpanel/users',
      icon: 'i-lucide-users',
      permission: 'users.read'
    },
    {
      title: 'Estudiantes',
      to: '/cpanel/students',
      icon: 'i-lucide-user-round',
      permission: 'students.read'
    },
    {
      title: 'Docentes',
      to: '/cpanel/teachers',
      icon: 'i-lucide-graduation-cap',
      permission: 'teachers.read'
    },
    {
      title: 'Configuración',
      to: '/cpanel/settings',
      icon: 'i-lucide-settings',
      permission: 'settings.read'
    }
  ]
})

const breadcrumbs = computed(() => {
  const crumbs = [{ label: 'Panel de Control', to: '/cpanel', icon: 'i-lucide-home' }]
  
  const currentPath = route.path.replace('/cpanel/', '')
  if (currentPath && currentPath !== '') {
    const currentNav = navigation.value.find(n => n.to === route.path)
    if (currentNav) {
      crumbs.push({ label: currentNav.title, to: route.path, icon: currentNav.icon })
    }
  }
  
  return crumbs
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <UBreadcrumb :items="breadcrumbs" />
      </template>

      <template #right>
        <UColorModeButton />
        <UDropdown :items="[{ label: 'Perfil', icon: 'i-lucide-user' }, { label: 'Cerrar Sesión', icon: 'i-lucide-log-out' }]">
          <UButton icon="i-lucide-user" color="neutral" variant="ghost">
            Admin
          </UButton>
        </UDropdown>
      </template>
    </UHeader>

    <div class="flex min-h-[calc(100vh-64px)]">
      <aside class="w-64 border-r border-default bg-default shrink-0" :class="{ 'w-16': isCollapsed }">
        <UVerticalNavigation :items="navigation" class="p-4" />
      </aside>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </UApp>
</template>
