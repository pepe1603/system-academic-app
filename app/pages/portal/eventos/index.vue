<script setup lang="ts">
useSeoMeta({
  title: 'Eventos - Portal Público',
  description: 'Todos los eventos de la Escuela Normal Emiliano Zapata'
})

definePageMeta({
  layout: 'portal'
})

const { getEvents } = usePortalContent()
const { data } = await useAsyncData('events', () => getEvents(false))
const events = computed(() => data.value || [])
</script>

<template>
  <div class="container mx-auto px-6 py-12">
    <h1 class="text-4xl font-bold mb-10">Eventos</h1>
    
    <div v-if="events.length" class="space-y-6">
      <UCard v-for="event in events" :key="event.id" class="hover:shadow-lg transition-shadow p-4">
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <div class="md:w-32 text-center p-6 bg-primary/10 rounded-lg">
            <div class="text-3xl font-bold text-primary">
              {{ new Date(event.eventDate).getDate() }}
            </div>
            <div class="text-sm text-muted-foreground">
              {{ new Date(event.eventDate).toLocaleDateString('es-MX', { month: 'short' }) }}
            </div>
          </div>
          
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ event.title }}</h2>
            <p class="text-muted-foreground mt-2 line-clamp-2">{{ event.description }}</p>
            <div class="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 inline mr-1" />
                {{ event.location }}
              </span>
            </div>
          </div>
          
          <UButton variant="outline" :to="`/portal/eventos/${event.id}`">
            Ver detalles
          </UButton>
        </div>
      </UCard>
    </div>
    
    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-calendar" class="w-16 h-16 text-muted-foreground mb-4" />
      <p class="text-muted-foreground text-lg">No hay eventos programados</p>
    </div>
  </div>
</template>