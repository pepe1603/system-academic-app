<script setup lang="ts">
useSeoMeta({
  title: 'Portal - Panel de Administración'
})

definePageMeta({
  layout: 'c-panel'
})

const { hasPermission } = useAuth()

const sections = [
  {
    title: 'Noticias',
    description: 'Gestionar noticias del portal',
    icon: 'i-lucide-newspaper',
    to: '/cpanel/portal/noticias',
    permission: 'NEWS_MANAGE'
  },
  {
    title: 'Eventos',
    description: 'Gestionar eventos del portal',
    icon: 'i-lucide-calendar',
    to: '/cpanel/portal/eventos',
    permission: 'EVENT_MANAGE'
  },
  {
    title: 'Anuncios',
    description: 'Gestionar anuncios y banners',
    icon: 'i-lucide-megaphone',
    to: '/cpanel/portal/anuncios',
    permission: 'ADS_MANAGE'
  },
  {
    title: 'Mensajes',
    description: 'Ver mensajes de contacto',
    icon: 'i-lucide-mail',
    to: '/cpanel/portal/mensajes',
    permission: 'CONTACT_VIEW'
  },
  {
    title: 'Institución',
    description: 'Editar información institucional',
    icon: 'i-lucide-building-2',
    to: '/cpanel/portal/institucion',
    permission: 'PORTAL_CONFIG'
  }
]

const filteredSections = computed(() => 
  sections.filter(s => !s.permission || hasPermission(s.permission))
)
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-3">Portal Público</h1>
    <p class="text-muted-foreground mb-10">Gestiona el contenido del portal público</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        v-for="section in filteredSections"
        :key="section.to"
        :to="section.to"
        class="block p-8 border rounded-lg hover:border-primary hover:shadow-lg transition-all"
      >
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UIcon :name="section.icon" class="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-xl">{{ section.title }}</h3>
            <p class="text-muted-foreground mt-1">{{ section.description }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>