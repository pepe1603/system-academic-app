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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })
}
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-6xl">
    <div class="text-center mb-12 md:mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Eventos</h1>
      <p class="text-muted-foreground text-lg md:text-xl">No te pierdas ninguna actividad</p>
    </div>
    
    <div v-if="events.length" class="space-y-6">
      <article 
        v-for="event in events" 
        :key="event.id"
        class="group"
      >
        <UCard class="hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div class="flex flex-col lg:flex-row">
            <div class="lg:w-40 p-6 bg-primary/10 flex flex-col items-center justify-center">
              <span class="text-4xl font-bold text-primary">
                {{ new Date(event.eventDate).getDate() }}
              </span>
              <span class="text-lg text-muted-foreground uppercase">
                {{ new Date(event.eventDate).toLocaleDateString('es-MX', { month: 'short' }) }}
              </span>
              <span class="text-sm text-muted-foreground">
                {{ new Date(event.eventDate).getFullYear() }}
              </span>
            </div>
            
            <div class="flex-1 p-6">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {{ event.title }}
                  </h2>
                  <p class="text-muted-foreground mb-4 line-clamp-2">{{ event.description }}</p>
                  <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                      {{ formatDate(event.eventDate) }}
                    </span>
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                      {{ event.location }}
                    </span>
                  </div>
                </div>
                <UButton variant="outline" :to="`/portal/eventos/${event.id}`" class="shrink-0">
                  Ver detalles <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </article>
    </div>
    
    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-calendar" class="w-16 h-16 text-muted-foreground mb-4" />
      <p class="text-muted-foreground text-lg">No hay eventos programados</p>
    </div>
  </div>
</template>