<script setup lang="ts">
useSeoMeta({
  title: 'Escuela Normal Emiliano Zapata - Portal Público',
  description: 'Portal público de la Escuela Normal Emiliano Zapata'
})

definePageMeta({
  layout: 'portal'
})

const { getNews, getEvents } = usePortal()

const { data: newsData } = await useAsyncData('news', () => getNews(false))
const { data: eventsData } = await useAsyncData('events', () => getEvents(false))

const news = computed(() => newsData.value?.slice(0, 6) || [])
const events = computed(() => eventsData.value?.slice(0, 4) || [])
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <section class="mb-12">
      <h2 class="text-3xl font-bold mb-6">Últimas Noticias</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="item in news" :key="item.id" class="hover:shadow-lg transition-shadow">
          <template #header>
            <h3 class="font-semibold text-lg line-clamp-2">{{ item.title }}</h3>
          </template>
          <p class="text-muted-foreground line-clamp-3">{{ item.content }}</p>
          <template #footer>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">
                {{ new Date(item.createdAt).toLocaleDateString('es-MX') }}
              </span>
              <UButton variant="ghost" size="sm" :to="`/portal/noticias/${item.id}`">
                Leer más <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
      <div class="text-center mt-6">
        <UButton variant="outline" to="/portal/noticias">
          Ver todas las noticias <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
        </UButton>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-3xl font-bold mb-6">Próximos Eventos</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard v-for="event in events" :key="event.id" class="hover:shadow-lg transition-shadow">
          <template #header>
            <div class="flex items-start justify-between">
              <h3 class="font-semibold text-lg">{{ event.title }}</h3>
              <UBadge color="primary">{{ event.eventDate }}</UBadge>
            </div>
          </template>
          <p class="text-muted-foreground line-clamp-2">{{ event.description }}</p>
          <template #footer>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
              {{ event.location }}
            </div>
          </template>
        </UCard>
      </div>
      <div class="text-center mt-6">
        <UButton variant="outline" to="/portal/eventos">
          Ver todos los eventos <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
        </UButton>
      </div>
    </section>

    <section class="text-center py-12 bg-muted/30 rounded-lg">
      <h2 class="text-2xl font-bold mb-4">¿Necesitas información?</h2>
      <p class="text-muted-foreground mb-6">Contáctanos para resolver cualquier duda</p>
      <UButton size="lg" to="/portal/contacto">
        <UIcon name="i-lucide-mail" class="w-5 h-5 mr-2" />
        Contactar
      </UButton>
    </section>
  </div>
</template>