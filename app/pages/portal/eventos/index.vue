<script setup lang="ts">
useSeoMeta({
  title: 'Eventos - Portal Público',
  description: 'Todos los eventos de la Escuela Normal Emiliano Zapata'
})

definePageMeta({
  layout: 'portal'
})

const { getUpcomingEvents, getPastEvents } = usePortalContent()
const { data: upcomingEvents } = await useAsyncData('events-upcoming', () => getUpcomingEvents(50))
const { data: pastEvents } = await useAsyncData('events-past', () => getPastEvents(20))

const selectedEvent = ref<any>(null)
const showPastEvents = ref(false)

const openEventModal = (event: any) => {
  selectedEvent.value = event
}

const closeEventModal = () => {
  selectedEvent.value = null
}

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
    
    <div v-if="upcomingEvents?.length" class="space-y-6">
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <UIcon name="i-lucide-calendar-check" class="w-6 h-6 text-primary" />
        Próximos Eventos
      </h2>
      <article 
        v-for="event in upcomingEvents" 
        :key="event.id"
        class="group cursor-pointer"
      >
        <UCard class="hover:shadow-xl transition-all duration-300 overflow-hidden" @click="openEventModal(event)">
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
                <UButton variant="outline" class="shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  Ver detalles <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </article>
    </div>
    
    <div v-if="!upcomingEvents?.length" class="text-center py-12 mb-12">
      <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <p class="text-muted-foreground text-lg">No hay eventos próximos</p>
    </div>

    <div v-if="pastEvents?.length" class="mt-16 border-t pt-12">
      <button 
        @click="showPastEvents = !showPastEvents"
        class="flex items-center justify-between w-full text-2xl font-bold hover:text-primary transition-colors py-4"
      >
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-history" class="w-6 h-6" />
          Eventos Pasados
          <UBadge variant="soft" class="ml-2">{{ pastEvents.length }}</UBadge>
        </span>
        <UIcon :name="showPastEvents ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-6 h-6 transition-transform" />
      </button>
      
      <div v-if="showPastEvents" class="mt-8 space-y-4">
        <UCard v-for="event in pastEvents" :key="event.id" class="opacity-70 hover:opacity-100 transition-opacity">
          <div class="flex flex-col lg:flex-row">
            <div class="lg:w-32 p-4 bg-muted flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-muted-foreground">
                {{ new Date(event.eventDate).getDate() }}
              </span>
              <span class="text-sm text-muted-foreground uppercase">
                {{ new Date(event.eventDate).toLocaleDateString('es-MX', { month: 'short' }) }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ new Date(event.eventDate).getFullYear() }}
              </span>
            </div>
            
            <div class="flex-1 p-4">
              <h3 class="font-bold mb-2">{{ event.title }}</h3>
              <p class="text-sm text-muted-foreground line-clamp-2">{{ event.description }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                  {{ formatDate(event.eventDate) }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                  {{ event.location }}
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="selectedEvent" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="closeEventModal">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeEventModal" />
      <div class="relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <button @click="closeEventModal" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center">
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
        
        <div class="bg-primary/10 p-8 text-center">
          <span class="text-5xl font-bold text-primary">
            {{ new Date(selectedEvent.eventDate).getDate() }}
          </span>
          <div class="text-xl text-muted-foreground uppercase">
            {{ new Date(selectedEvent.eventDate).toLocaleDateString('es-MX', { month: 'long' }) }}
          </div>
        </div>
        
        <div class="p-8">
          <h2 class="text-3xl font-bold mb-4">{{ selectedEvent.title }}</h2>
          
          <div class="flex flex-wrap gap-6 text-muted-foreground mb-6">
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-5 h-5" />
              {{ formatDate(selectedEvent.eventDate) }}
            </span>
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
              {{ selectedEvent.location }}
            </span>
          </div>
          
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-lg leading-relaxed whitespace-pre-wrap">{{ selectedEvent.description }}</p>
          </div>
          
          <div class="mt-8 pt-6 border-t flex justify-end">
            <UButton variant="outline" @click="closeEventModal">
              Cerrar
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>