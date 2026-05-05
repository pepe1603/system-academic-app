<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const { profile, loading: profileLoading, fetchMyProfile, updateMyProfile } = useProfile()

const isCollapsed = ref(false)
const isDropdownOpen = ref(false)
const showProfileModal = ref(false)
const profileForm = ref({
  firstName: '',
  lastName: '',
  curp: '',
  rfc: '',
  phone: '',
  secondaryPhone: '',
  birthDate: '',
  gender: '',
  institutionalEmail: '',
  secondaryEmail: '',
  address: '',
  city: '',
  state: '',
  postalCode: ''
})
const savingProfile = ref(false)

const handleLogout = async () => {
  isDropdownOpen.value = false
  await logout()
  await navigateTo('/auth')
}

const openProfileModal = async () => {
  isDropdownOpen.value = false
  const data = await fetchMyProfile()
  if (data) {
    profileForm.value = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      curp: data.curp || '',
      rfc: data.rfc || '',
      phone: data.phone || '',
      secondaryPhone: data.secondaryPhone || '',
      birthDate: data.birthDate || '',
      gender: data.gender || '',
      institutionalEmail: data.institutionalEmail || '',
      secondaryEmail: data.secondaryEmail || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      postalCode: data.postalCode || ''
    }
    showProfileModal.value = true
  } else {
    showProfileModal.value = true
    profileForm.value = {
      firstName: '',
      lastName: '',
      curp: '',
      rfc: '',
      phone: '',
      secondaryPhone: '',
      birthDate: '',
      gender: '',
      institutionalEmail: '',
      secondaryEmail: '',
      address: '',
      city: '',
      state: '',
      postalCode: ''
    }
  }
}

const saveProfile = async () => {
  savingProfile.value = true
  const success = await updateMyProfile(profileForm.value)
  savingProfile.value = false
  if (success) {
    showProfileModal.value = false
    const toast = useToast()
    toast.add({ title: 'Perfil actualizado', color: 'success' })
  }
}

const navigation = [
  {
    title: 'Dashboard',
    to: '/cpanel',
    icon: 'i-lucide-layout-dashboard'
  },
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

const portalOpen = ref(false)

const notifications = ref([
  { id: 1, title: 'Nuevo mensaje', description: 'Tienes un nuevo mensaje de contacto', time: '5 min', read: false, icon: 'i-lucide-mail' },
  { id: 2, title: 'Alumno matriculado', description: 'Nuevo estudiante matriculado', time: '1 hora', read: true, icon: 'i-lucide-user-plus' },
  { id: 3, title: 'Evento próximo', description: 'Evento "Graduación 2024" mañana', time: '2 horas', read: false, icon: 'i-lucide-calendar' }
])

const showNotifications = ref(false)
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

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
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            @click="showNotifications = !showNotifications"
          >
            <template #icon>
              <div class="relative">
                <UIcon name="i-lucide-bell" class="w-5 h-5" />
                <span
                  v-if="unreadCount > 0"
                  class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {{ unreadCount }}
                </span>
              </div>
            </template>
          </UButton>

          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-background border border-default rounded-lg shadow-lg z-50"
          >
            <div class="p-3 border-b border-default">
              <h3 class="font-semibold">Notificaciones</h3>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div
                v-for="notif in notifications"
                :key="notif.id"
                class="p-3 border-b border-default hover:bg-muted/50 cursor-pointer"
                :class="{ 'bg-primary/5': !notif.read }"
              >
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UIcon :name="notif.icon" class="w-4 h-4 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium">{{ notif.title }}</p>
                    <p class="text-xs text-muted-foreground line-clamp-1">{{ notif.description }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ notif.time }}</p>
                  </div>
                  <div v-if="!notif.read" class="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                </div>
              </div>
            </div>
            <div class="p-3 border-t border-default">
              <UButton variant="ghost" block size="sm">
                Ver todas las notificaciones
              </UButton>
            </div>
          </div>
        </div>

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
              @click="openProfileModal"
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
          <template v-for="item in navigation" :key="item.to">
            <div v-if="item.children" class="mb-1">
              <button
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="portalOpen = !portalOpen"
              >
                <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
                <span v-if="!isCollapsed" class="text-sm font-medium flex-1 text-left">{{ item.title }}</span>
                <UIcon v-if="!isCollapsed" :name="portalOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4" />
              </button>
              <div v-if="portalOpen && !isCollapsed" class="ml-6 mt-1 space-y-1">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="[
                    isActive(child.to)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground'
                  ]"
                >
                  <UIcon :name="child.icon" class="w-4 h-4" />
                  {{ child.title }}
                </NuxtLink>
              </div>
            </div>
            <div v-else class="mb-1">
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
          </template>
        </nav>
      </aside>

      <main class="flex-1 p-6 min-h-[calc(100vh-64px)]">
        <slot />
      </main>
    </div>

    <div
      v-if="isDropdownOpen || showNotifications"
      class="fixed inset-0 z-40"
      @click="isDropdownOpen = false; showNotifications = false"
    />

    <ClientOnly>
      <UModal v-model:open="showProfileModal" title="Mi Perfil" class="max-w-2xl">
        <div class="p-4 space-y-6">
          <div class="flex items-center gap-4">
            <UAvatar
              :src="profile?.profilePictureUrl ? `http://localhost:8080${profile.profilePictureUrl}` : `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.firstName || user?.username || 'U'}`"
              size="2xl"
            />
            <div>
              <h3 class="text-xl font-bold">{{ profileForm.firstName || user?.username }}</h3>
              <p class="text-muted-foreground text-sm">{{ profileForm.institutionalEmail || user?.email }}</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <UBadge v-for="role in user?.roles" :key="role" :color="role === 'ADMIN' ? 'error' : role === 'TEACHER' ? 'info' : role === 'STUDENT' ? 'success' : 'neutral'" variant="soft" size="sm">
                  {{ role }}
                </UBadge>
              </div>
            </div>
          </div>

          <USeparator />

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Nombre" name="firstName">
              <UInput v-model="profileForm.firstName" placeholder="Nombre" />
            </UFormField>
            <UFormField label="Apellidos" name="lastName">
              <UInput v-model="profileForm.lastName" placeholder="Apellidos" />
            </UFormField>
            <UFormField label="CURP" name="curp">
              <UInput v-model="profileForm.curp" placeholder="CURP" />
            </UFormField>
            <UFormField label="RFC" name="rfc">
              <UInput v-model="profileForm.rfc" placeholder="RFC" />
            </UFormField>
            <UFormField label="Teléfono" name="phone">
              <UInput v-model="profileForm.phone" placeholder="Teléfono" />
            </UFormField>
            <UFormField label="Teléfono secundario" name="secondaryPhone">
              <UInput v-model="profileForm.secondaryPhone" placeholder="Teléfono secundario" />
            </UFormField>
            <UFormField label="Fecha de nacimiento" name="birthDate">
              <UInput v-model="profileForm.birthDate" type="date" />
            </UFormField>
            <UFormField label="Género" name="gender">
              <USelect
                v-model="profileForm.gender"
                :items="[
                  { label: 'Masculino', value: 'M' },
                  { label: 'Femenino', value: 'F' },
                  { label: 'Otro', value: 'O' }
                ]"
                placeholder="Seleccionar"
              />
            </UFormField>
          </div>

          <USeparator />

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Email institucional" name="institutionalEmail">
              <UInput v-model="profileForm.institutionalEmail" type="email" placeholder="Email institucional" />
            </UFormField>
            <UFormField label="Email secundario" name="secondaryEmail">
              <UInput v-model="profileForm.secondaryEmail" type="email" placeholder="Email secundario" />
            </UFormField>
          </div>

          <USeparator />

          <UFormField label="Dirección" name="address">
            <UInput v-model="profileForm.address" placeholder="Dirección" />
          </UFormField>
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Ciudad" name="city">
              <UInput v-model="profileForm.city" placeholder="Ciudad" />
            </UFormField>
            <UFormField label="Estado" name="state">
              <UInput v-model="profileForm.state" placeholder="Estado" />
            </UFormField>
            <UFormField label="Código postal" name="postalCode">
              <UInput v-model="profileForm.postalCode" placeholder="CP" />
            </UFormField>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="showProfileModal = false">Cancelar</UButton>
            <UButton @click="saveProfile" :loading="savingProfile" icon="i-lucide-save">Guardar</UButton>
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </UApp>
</template>
