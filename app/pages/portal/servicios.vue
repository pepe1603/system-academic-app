<script setup lang="ts">
useSeoMeta({
  title: 'Servicios - Escuela Normal Emiliano Zapata',
  description: 'Accede a nuestros servicios: Portal del Alumno, Portal Administrativo, Buzón Escolar y más'
})

definePageMeta({
  layout: 'portal'
})

const { isAuthenticated } = useAuth()

const servicios = [
  {
    title: 'Portal del Alumno',
    description: 'Accede a tus calificaciones, horarios, inscripciones y más',
    icon: 'i-lucide-graduation-cap',
    to: '/auth/login',
    color: 'primary'
  },
  {
    title: 'Portal del Profesor',
    description: 'Gestión de grupos, evaluaciones, reportes y más',
    icon: 'i-lucide-chalkboard-teacher',
    to: '/auth/login',
    color: 'violet'
  },
  {
    title: 'Buzón Escolar',
    description: 'Envía mensajes y consulta comunicaciones escolares',
    icon: 'i-lucide-inbox',
    to: '/portal/contacto',
    color: 'amber'
  },
  {
    title: 'Noticias',
    description: 'Consulta las últimas noticias y anuncios',
    icon: 'i-lucide-newspaper',
    to: '/portal/noticias',
    color: 'purple'
  },
  {
    title: 'Eventos',
    description: 'Próximos eventos y actividades',
    icon: 'i-lucide-calendar',
    to: '/portal/eventos',
    color: 'blue'
  },
  {
    title: 'Panel de Control Admin',
    description: 'Administración del sistema académico',
    icon: 'i-lucide-settings',
    to: '/cpanel',
    color: 'orange',
    auth: true
  }
]

const filteredServicios = computed(() => {
  return servicios.filter(s => {
    if (!s.auth) return true
    return isAuthenticated.value
  })
})
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-6xl">
    <div class="text-center mb-12 md:mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Servicios</h1>
      <p class="text-muted-foreground text-lg md:text-xl">Accede a nuestros servicios y plataformas</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <NuxtLink
        v-for="servicio in filteredServicios"
        :key="servicio.to"
        :to="servicio.to"
        class="block p-6 md:p-8 border rounded-2xl hover:border-primary hover:shadow-2xl transition-all duration-500 group"
      >
        <div class="flex flex-col items-center text-center">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
            :class="{
              'bg-primary/10': servicio.color === 'primary',
              'bg-violet-500/10': servicio.color === 'violet',
              'bg-amber-500/10': servicio.color === 'amber',
              'bg-purple-500/10': servicio.color === 'purple',
              'bg-blue-500/10': servicio.color === 'blue',
              'bg-orange-500/10': servicio.color === 'orange'
            }"
          >
            <UIcon
              :name="servicio.icon"
              class="w-8 h-8"
              :class="{
                'text-primary': servicio.color === 'primary',
                'text-violet-500': servicio.color === 'violet',
                'text-amber-500': servicio.color === 'amber',
                'text-purple-500': servicio.color === 'purple',
                'text-blue-500': servicio.color === 'blue',
                'text-orange-500': servicio.color === 'orange'
              }"
            />
          </div>
          <h3 class="font-bold text-xl mb-2 group-hover:text-primary transition-colors duration-300">
            {{ servicio.title }}
          </h3>
          <p class="text-muted-foreground text-sm">
            {{ servicio.description }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div v-if="!isAuthenticated" class="mt-16 p-8 md:p-12 bg-muted/30 rounded-2xl text-center">
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