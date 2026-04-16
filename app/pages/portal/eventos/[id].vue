<script setup lang="ts">
const route = useRoute()
const { getEventById } = usePortalContent()

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
  <div class="container mx-auto px-6 py-12">
    <UButton variant="ghost" size="lg" to="/portal/eventos" class="mb-6">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
      Volver a eventos
    </UButton>

    <article v-if="event" class="max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <UBadge color="primary" size="xl">
          {{ new Date(event.eventDate).toLocaleDateString('es-MX', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </UBadge>
      </div>

      <h1 class="text-5xl font-bold mb-8">{{ event.title }}</h1>

      <div class="flex items-center gap-6 text-muted-foreground text-lg mb-10">
        <span>
          <UIcon name="i-lucide-map-pin" class="w-5 h-5 inline mr-2" />
          {{ event.location }}
        </span>
      </div>

      <div class="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <p>{{ event.description }}</p>
      </div>
    </article>
  </div>
</template>