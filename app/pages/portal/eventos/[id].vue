<script setup lang="ts">
const route = useRoute()
const { getEventById } = usePortal()

const { data: event } = await useAsyncData(`event-${route.params.id}`, () => 
  getEventById(route.params.id as string)
)

if (!event.value) {
  throw createError({ statusCode: 404, message: 'Evento no encontrado' })
}

useSeoMeta({
  title: `${event.value.title} - Portal Público`,
  description: event.value.description.slice(0, 160)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <UButton variant="ghost" to="/portal/eventos" class="mb-4">
      <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" />
      Volver a eventos
    </UButton>

    <article v-if="event">
      <div class="flex items-center gap-4 mb-4">
        <UBadge color="primary" size="lg">
          {{ new Date(event.eventDate).toLocaleDateString('es-MX', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </UBadge>
      </div>

      <h1 class="text-4xl font-bold mb-4">{{ event.title }}</h1>

      <div class="flex items-center gap-6 text-muted-foreground mb-6">
        <span>
          <UIcon name="i-lucide-map-pin" class="w-5 h-5 inline mr-2" />
          {{ event.location }}
        </span>
      </div>

      <div class="prose dark:prose-invert max-w-none">
        <p>{{ event.description }}</p>
      </div>
    </article>
  </div>
</template>