<script setup lang="ts">
definePageMeta({
  layout: 'portal'
})

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
  description: event.value.description?.slice(0, 160)
})
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-4xl">
    <UButton variant="ghost" size="lg" to="/portal/eventos" class="mb-6">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
      Volver a eventos
    </UButton>

    <article v-if="event">
      <header class="mb-8">
        <UBadge color="primary" size="lg" class="mb-4">
          <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2" />
          {{ new Date(event.eventDate).toLocaleDateString('es-MX', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </UBadge>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ event.title }}</h1>
        <div class="flex items-center gap-2 text-muted-foreground text-lg">
          <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
          {{ event.location }}
        </div>
      </header>

      <div class="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <p class="whitespace-pre-wrap">{{ event.description }}</p>
      </div>

      <div class="mt-12 pt-8 border-t">
        <UButton variant="outline" size="lg" to="/portal/eventos">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Ver más eventos
        </UButton>
      </div>
    </article>
  </div>
</template>