<script setup lang="ts">
useSeoMeta({
  title: 'Servicios - Escuela Normal Emiliano Zapata',
  description: 'Accede a nuestros servicios: Portal del Alumno, Portal Administrativo, Buzón Escolar y más'
})

definePageMeta({
  layout: 'portal'
})

const { isAuthenticated, hasRole } = useAuth()

const servicios = [
  {
    title: 'Portal del Alumno',
    description: 'Accede a tus calificaciones, horarios, inscripciones y más',
    icon: 'i-lucide-user-round',
    to: '/cpanel',
    color: 'primary',
    auth: false
  },
  {
    title: 'Panel de Control Admin',
    description: 'Administración del sistema académico',
    icon: 'i-lucide-settings',
    to: '/cpanel',
    color: 'green',
    auth: true,
    roles: ['ADMIN']
  },
  {
    title: 'Buzón Escolar',
    description: 'Envía mensajes y consulta comunicaciones escolares',
    icon: 'i-lucide-inbox',
    to: '/portal/contacto',
    color: 'amber',
    auth: false
  },
  {
    title: 'Noticias',
    description: 'Consulta las últimas noticias y anuncios',
    icon: 'i-lucide-newspaper',
    to: '/portal/noticias',
    color: 'purple',
    auth: false
  },
  {
    title: 'Eventos',
    description: 'Próximos eventos y actividades',
    icon: 'i-lucide-calendar',
    to: '/portal/eventos',
    color: 'blue',
    auth: false
  },
  {
    title: 'Portal Público',
    description: 'Vista pública del sitio institucional',
    icon: 'i-lucide-building-2',
    to: '/portal',
    color: 'orange',
    auth: false
  }
]

const filteredServicios = computed(() => {
  return servicios.filter(s => {
    if (!s.auth) return true
    if (!isAuthenticated.value) return false
    if (s.roles && s.roles.length > 0) {
      return s.roles.some(role => hasRole(role))
    }
    return true
  })
})
</script>

<template>
  <div class="container mx-auto px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-6">Servicios</h1>
    <p class="text-muted-foreground text-center mb-16 text-lg">
      Accede a nuestros servicios y plataformas
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        v-for="servicio in filteredServicios"
        :key="servicio.to"
        :to="servicio.to"
        class="block p-8 border rounded-lg hover:border-primary hover:shadow-lg transition-all group"
      >
        <div class="flex items-start gap-5">
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            :class="{
              'bg-primary/10': servicio.color === 'primary',
              'bg-green-500/10': servicio.color === 'green',
              'bg-amber-500/10': servicio.color === 'amber',
              'bg-purple-500/10': servicio.color === 'purple',
              'bg-blue-500/10': servicio.color === 'blue',
              'bg-orange-500/10': servicio.color === 'orange'
            }"
          >
            <UIcon
              :name="servicio.icon"
              class="w-7 h-7"
              :class="{
                'text-primary': servicio.color === 'primary',
                'text-green-500': servicio.color === 'green',
                'text-amber-500': servicio.color === 'amber',
                'text-purple-500': servicio.color === 'purple',
                'text-blue-500': servicio.color === 'blue',
                'text-orange-500': servicio.color === 'orange'
              }"
            />
          </div>
          <div>
            <h3 class="font-semibold text-xl group-hover:text-primary transition-colors">
              {{ servicio.title }}
            </h3>
            <p class="text-muted-foreground mt-2 text-base">
              {{ servicio.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="!isAuthenticated" class="mt-16 p-8 bg-muted/30 rounded-lg text-center">
      <UIcon name="i-lucide-log-in" class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="font-semibold text-xl mb-3">¿Necesitas acceder al portal del alumno?</h3>
      <p class="text-muted-foreground mb-6">
        Inicia sesión con tus credenciales para acceder
      </p>
      <UButton to="/cpanel" size="lg">
        Ir al Panel de Control
      </UButton>
    </div>
  </div>
</template>