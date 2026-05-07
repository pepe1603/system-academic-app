<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const route = useRoute()
const { user, logout } = useAuth()

const isCollapsed = ref(false)
const portalOpen = ref(false)

const handleLogout = async () => {
  await logout()
  await navigateTo('/auth')
}

const navigation = [
  { title: 'Dashboard', to: '/cpanel', icon: 'i-lucide-layout-dashboard' },
  {
    title: 'Portal',
    to: '/cpanel/portal',
    icon: 'i-lucide-globe',
    children: [
      { title: 'Noticias', to: '/cpanel/portal/noticias', icon: 'i-lucide-newspaper' },
      { title: 'Eventos', to: '/cpanel/portal/eventos', icon: 'i-lucide-calendar' },
      { title: 'Anuncios', to: '/cpanel/portal/anuncios', icon: 'i-lucide-megaphone' },
      { title: 'Mensajes', to: '/cpanel/portal/mensajes', icon: 'i-lucide-mail' },
      { title: 'Institución', to: '/cpanel/portal/institucion', icon: 'i-lucide-building-2' }
    ]
  },
  { title: 'Usuarios', to: '/cpanel/users', icon: 'i-lucide-users' },
  { title: 'Estudiantes', to: '/cpanel/students', icon: 'i-lucide-user-round' },
  { title: 'Docentes', to: '/cpanel/teachers', icon: 'i-lucide-graduation-cap' },
  { title: 'Generaciones', to: '/cpanel/generations', icon: 'i-lucide-calendar-days' },
  { title: 'Semestres', to: '/cpanel/academic-semesters', icon: 'i-lucide-calendar-range' },
  { title: 'Cursos', to: '/cpanel/courses', icon: 'i-lucide-book-open' },
  { title: 'Grupos', to: '/cpanel/academic-groups', icon: 'i-lucide-users' },
  { title: 'Evaluaciones', to: '/cpanel/evaluation-types', icon: 'i-lucide-clipboard-list' },
  { title: 'Planes de Estudio', to: '/cpanel/study-plans', icon: 'i-lucide-book' },
  { title: 'Configuración', to: '/cpanel/settings', icon: 'i-lucide-settings' }
]

// ✅ Items del dropdown de usuario con type: 'label' para el encabezado
const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.value?.username || 'Usuario',
      // El email como descripción debajo del username
      icon: 'i-lucide-circle-user',
      type: 'label' // No es clickeable, solo informativo
    }
  ],
  [
    {
      label: 'Mi Perfil',
      icon: 'i-lucide-user',
      to: '/cpanel/profile'
    },
    {
      label: 'Configuración',
      icon: 'i-lucide-settings',
      to: '/cpanel/settings'
    }
  ],
  [
    {
      label: 'Cerrar Sesión',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: handleLogout
    }
  ]
])

// ✅ Items del dropdown de notificaciones usando slot personalizado
const notifications = ref([
  { id: 1, title: 'Nuevo mensaje', description: 'Tienes un nuevo mensaje de contacto', time: '5 min', read: false, icon: 'i-lucide-mail', slot: 'notif-1' },
  { id: 2, title: 'Alumno matriculado', description: 'Nuevo estudiante matriculado', time: '1 hora', read: true, icon: 'i-lucide-user-plus', slot: 'notif-2' },
  { id: 3, title: 'Evento próximo', description: 'Evento "Graduación 2024" mañana', time: '2 horas', read: false, icon: 'i-lucide-calendar', slot: 'notif-3' }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// ✅ Items del dropdown de notificaciones - cada notif con slot custom
const notificationItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Notificaciones',
      type: 'label' as const
    }
  ],
  notifications.value.map(n => ({
    label: n.title,
    icon: n.icon,
    slot: n.slot as string,
  })),
  [
    {
      label: 'Marcar todas como leídas',
      icon: 'i-lucide-check-check',
      disabled: unreadCount.value === 0,
      onSelect: markAllRead
    },
    {
      label: 'Ver todas las notificaciones',
      icon: 'i-lucide-bell',
      to: '/cpanel/notifications'
    }
  ]
])

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
    <!-- HEADER -->
    <header class="h-16 border-b border-default bg-background px-6 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-4">
        <UBreadcrumb :items="breadcrumbs" />
      </div>

      <div class="flex items-center gap-1">
        <UColorModeButton />

        <!-- ✅ Notificaciones con UDropdownMenu + UChip para el badge -->
        <UDropdownMenu
          :items="notificationItems"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          :ui="{ content: 'w-80' }"
        >
          <!-- Trigger: campana con chip de conteo -->
          <UChip
            :text="unreadCount"
            color="error"
            size="sm"
            :show="unreadCount > 0"
          >
            <UButton
              icon="i-lucide-bell"
              color="neutral"
              variant="ghost"
              aria-label="Notificaciones"
            />
          </UChip>

          <!-- Slot custom para cada notificación -->
          <template
            v-for="notif in notifications"
            :key="notif.id"
            #[notif.slot]
          >
            <div
              class="flex items-start gap-3 py-1 w-full"
              :class="{ 'opacity-50': notif.read }"
            >
              <UAvatar
                :icon="notif.icon"
                size="sm"
                color="primary"
                variant="soft"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium leading-tight">{{ notif.title }}</p>
                <p class="text-xs text-muted-foreground line-clamp-1 mt-0.5">{{ notif.description }}</p>
                <p class="text-xs text-muted-foreground/70 mt-0.5">{{ notif.time }}</p>
              </div>
              <div v-if="!notif.read" class="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
            </div>
          </template>
        </UDropdownMenu>

        <!-- ✅ Menú de usuario con UDropdownMenu + UAvatar como trigger -->
        <UDropdownMenu
          :items="userMenuItems"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
        >
          <!-- Trigger: avatar con nombre del usuario -->
          <UButton color="neutral" variant="ghost" class="gap-2">
            <UAvatar
              :src="`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`"
              size="xs"
            />
            <span class="hidden sm:block text-sm font-medium">
              {{ user?.username || 'Usuario' }}
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-3.5 text-muted-foreground" />
          </UButton>
        </UDropdownMenu>

        <!-- Colapsar sidebar -->
        <UTooltip :text="isCollapsed ? 'Expandir menú' : 'Colapsar menú'">
          <UButton
            :icon="isCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
            color="neutral"
            variant="ghost"
            @click="isCollapsed = !isCollapsed"
          />
        </UTooltip>
      </div>
    </header>

    <div class="flex">
      <!-- SIDEBAR -->
      <aside
        class="border-r border-default bg-background transition-all duration-300 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
        :class="isCollapsed ? 'w-16' : 'w-64'"
      >
        <nav class="p-2 space-y-0.5">
          <template v-for="item in navigation" :key="item.to">

            <!-- Item con hijos (Portal) -->
            <template v-if="item.children">
              <UTooltip :text="item.title" :disabled="!isCollapsed" side="right">
                <UButton
                  color="neutral"
                  variant="ghost"
                  block
                  class="justify-start"
                  @click="portalOpen = !portalOpen"
                >
                  <template #leading>
                    <UIcon :name="item.icon" class="size-5 shrink-0" />
                  </template>
                  <span v-if="!isCollapsed" class="flex-1 text-left text-sm">{{ item.title }}</span>
                  <template v-if="!isCollapsed" #trailing>
                    <UIcon
                      :name="portalOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                      class="size-4 text-muted-foreground"
                    />
                  </template>
                </UButton>
              </UTooltip>

              <div v-if="portalOpen && !isCollapsed" class="ml-4 pl-3 border-l border-default space-y-0.5 mt-0.5">
                <UButton
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  :color="isActive(child.to) ? 'primary' : 'neutral'"
                  :variant="isActive(child.to) ? 'soft' : 'ghost'"
                  block
                  class="justify-start"
                  size="sm"
                >
                  <template #leading>
                    <UIcon :name="child.icon" class="size-4 shrink-0" />
                  </template>
                  <span class="text-sm">{{ child.title }}</span>
                </UButton>
              </div>
            </template>

            <!-- Item simple -->
            <template v-else>
              <UTooltip :text="item.title" :disabled="!isCollapsed" side="right">
                <UButton
                  :to="item.to"
                  :color="isActive(item.to) ? 'primary' : 'neutral'"
                  :variant="isActive(item.to) ? 'solid' : 'ghost'"
                  block
                  class="justify-start"
                >
                  <template #leading>
                    <UIcon :name="item.icon" class="size-5 shrink-0" />
                  </template>
                  <span v-if="!isCollapsed" class="text-sm">{{ item.title }}</span>
                </UButton>
              </UTooltip>
            </template>

          </template>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 p-6 min-h-[calc(100vh-4rem)] overflow-auto">
        <slot />
      </main>
    </div>
  </UApp>
</template>