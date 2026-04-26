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

const selectedNews = ref<any>(null)

const openNewsModal = (item: any) => {
  selectedNews.value = item
}

const closeNewsModal = () => {
  selectedNews.value = null
}
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
        @click="openNewsModal(item)"
      >
        <div class="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col bg-card border hover:border-primary/50">
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
            <h2 class="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {{ item.title }}
            </h2>
            <p class="text-muted-foreground line-clamp-3 mb-4 flex-1">
              {{ item.content }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                {{ new Date(item.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </span>
              <UButton variant="ghost" size="sm" class="group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                Leer más <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
              </UButton>
            </div>
          </div>
        </div>
      </article>
    </div>
    
    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-newspaper" class="w-16 h-16 text-muted-foreground mb-4" />
      <p class="text-muted-foreground text-lg">No hay noticias disponibles</p>
    </div>
  </div>

  <!-- News Modal -->
  <Teleport to="body">
    <div v-if="selectedNews" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="closeNewsModal">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeNewsModal" />
      <div class="relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <button @click="closeNewsModal" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center">
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
        
        <div v-if="selectedNews.imageUrl" class="h-64 overflow-hidden rounded-t-2xl">
          <img :src="selectedNews.imageUrl" :alt="selectedNews.title" class="w-full h-full object-cover" />
        </div>
        
        <div class="p-8">
          <UBadge color="primary" class="mb-4">
            <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
            {{ new Date(selectedNews.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </UBadge>
          
          <h2 class="text-3xl font-bold mb-4">{{ selectedNews.title }}</h2>
          
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-lg leading-relaxed whitespace-pre-wrap">{{ selectedNews.content }}</p>
          </div>
          
          <div class="mt-8 pt-6 border-t flex justify-end">
            <UButton variant="outline" @click="closeNewsModal">
              Cerrar
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>