<script setup lang="ts">
useSeoMeta({
  title: 'Noticias - Portal Público',
  description: 'Todas las noticias de la Escuela Normal Emiliano Zapata'
})

definePageMeta({
  layout: 'portal'
})

const { getNews } = usePortalContent()
const { data } = await useAsyncData('news', () => getNews(false))
const news = computed(() => data.value || [])
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-6xl">
    <div class="text-center mb-12 md:mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Noticias</h1>
      <p class="text-muted-foreground text-lg md:text-xl">Mantente informado de las últimas actualizaciones</p>
    </div>
    
    <div v-if="news.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <article 
        v-for="(item, index) in news" 
        :key="item.id"
        class="group cursor-pointer"
      >
        <div class="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col bg-card border">
          <div class="relative h-48 overflow-hidden">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-newspaper" class="w-12 h-12 text-primary/50" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div class="absolute bottom-3 left-3">
              <UBadge color="white" variant="solid">
                {{ new Date(item.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) }}
              </UBadge>
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h2 class="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {{ item.title }}
            </h2>
            <p class="text-muted-foreground line-clamp-3 mb-4 flex-1">
              {{ item.content }}
            </p>
            <UButton :to="`/portal/noticias/${item.id}`" variant="ghost" size="sm" class="self-start">
              Leer más <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
          </div>
        </div>
      </article>
    </div>
    
    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-newspaper" class="w-16 h-16 text-muted-foreground mb-4" />
      <p class="text-muted-foreground text-lg">No hay noticias disponibles</p>
    </div>
  </div>
</template>