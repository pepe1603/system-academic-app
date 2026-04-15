<script setup lang="ts">
useSeoMeta({
  title: 'Noticias - Portal Público',
  description: 'Todas las noticias de la Escuela Normal Emiliano Zapata'
})

definePageMeta({
  layout: 'portal'
})

const { getNews } = usePortal()
const { data } = await useAsyncData('news', () => getNews(false))
const news = computed(() => data.value || [])
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Noticias</h1>
    
    <div v-if="news.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="item in news" :key="item.id" class="hover:shadow-lg transition-shadow">
        <template #header>
          <h2 class="font-semibold text-xl line-clamp-2">{{ item.title }}</h2>
        </template>
        <p class="text-muted-foreground line-clamp-4">{{ item.content }}</p>
        <template #footer>
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted-foreground">
              {{ new Date(item.createdAt).toLocaleDateString('es-MX') }}
            </span>
            <UButton variant="ghost" size="sm" :to="`/portal/noticias/${item.id}`">
              Leer más
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
    
    <div v-else class="text-center py-12">
      <UIcon name="i-lucide-newspaper" class="w-16 h-16 text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No hay noticias disponibles</p>
    </div>
  </div>
</template>