<script setup lang="ts">
useSeoMeta({
  title: 'Panel de Control - Sistema Académico'
})

definePageMeta({
  layout: 'c-panel'
})

const stats = [
  { label: 'Estudiantes', value: '1,234', icon: 'i-lucide-users', color: 'primary' },
  { label: 'Docentes', value: '89', icon: 'i-lucide-graduation-cap', color: 'green' },
  { label: 'Cursos Activos', value: '45', icon: 'i-lucide-book-open', color: 'amber' },
  { label: 'Matrículas', value: '567', icon: 'i-lucide-clipboard-list', color: 'purple' }
]

const recentActivity = [
  { user: 'Juan Pérez', action: 'se matriculó en', target: 'Curso de Matemáticas', time: 'Hace 5 min' },
  { user: 'María García', action: 'actualizó', target: 'Calificaciones 2°A', time: 'Hace 15 min' },
  { user: 'Carlos López', action: 'creó', target: 'Nuevo Curso', time: 'Hace 1 hora' }
]
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg" :class="`bg-${stat.color}-500/10`">
            <UIcon :name="stat.icon" class="w-8 h-8" :class="`text-${stat.color}-500`" />
          </div>
          <div>
            <p class="text-muted-foreground text-sm">{{ stat.label }}</p>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Actividad Reciente</h2>
        </template>
        <div class="space-y-4">
          <div v-for="(activity, index) in recentActivity" :key="index" class="flex items-start gap-3">
            <UAvatar icon="i-lucide-user" size="sm" />
            <div class="flex-1">
              <p class="text-sm">
                <strong>{{ activity.user }}</strong> {{ activity.action }} <span class="text-primary-500">{{ activity.target }}</span>
              </p>
              <p class="text-xs text-muted-foreground">
                {{ activity.time }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Accesos Rápidos</h2>
        </template>
        <div class="grid grid-cols-2 gap-4">
          <UButton to="/cpanel/students" variant="soft" color="primary" icon="i-lucide-user-round" block>
            Estudiantes
          </UButton>
          <UButton to="/cpanel/teachers" variant="soft" color="info" icon="i-lucide-graduation-cap" block>
            Docentes
          </UButton>
          <UButton to="/cpanel/users" variant="soft" color="warning" icon="i-lucide-users" block>
            Usuarios
          </UButton>
          <UButton to="/cpanel/settings" variant="soft" color="neutral" icon="i-lucide-settings" block>
            Configuración
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
