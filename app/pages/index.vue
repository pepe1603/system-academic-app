<script setup lang="ts">
useSeoMeta({
  title: 'Sistema Académico - Inicio',
  description: 'Plataforma de gestión académica integral para instituciones educativas'
})

const features = [
  {
    title: 'Gestión de Usuarios',
    description: 'Administra estudiantes, docentes y personal administrativo con roles y permisos definidos.',
    icon: 'i-lucide-users'
  },
  {
    title: 'Control Académico',
    description: 'Gestiona matrículas, horarios, calificaciones y reportes académicos.',
    icon: 'i-lucide-book-open'
  },
  {
    title: 'Seguridad Avanzada',
    description: 'Autenticación de dos factores, control de acceso y auditoría completa.',
    icon: 'i-lucide-shield-check'
  },
  {
    title: 'Interfaz Moderna',
    description: 'Diseño responsive y amigable construido con Nuxt UI y Tailwind CSS.',
    icon: 'i-lucide-layout-template'
  }
]
</script>

<template>
  <div>
    <section class="py-20 text-center">
      <h1 class="text-5xl font-bold mb-6">
        Sistema Académico <span class="text-primary-500">Integral</span>
      </h1>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        La plataforma definitiva para gestionar todos los aspectos de tu institución educativa.
        Desde estudiantes hasta calificaciones, todo en un solo lugar.
      </p>
      <div class="flex gap-4 justify-center">
        <UButton to="/auth/register" size="lg" icon="i-lucide-user-plus">
          Comenzar Ahora
        </UButton>
        <UButton to="/auth/login" size="lg" variant="outline" icon="i-lucide-log-in">
          Iniciar Sesión
        </UButton>
      </div>
    </section>

    <section class="py-16 bg-muted/50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">
          Características Principales
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <UCard v-for="feature in features" :key="feature.title" class="text-center">
            <UIcon :name="feature.icon" class="w-12 h-12 text-primary-500 mb-4" />
            <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
            <p class="text-muted-foreground">{{ feature.description }}</p>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>
