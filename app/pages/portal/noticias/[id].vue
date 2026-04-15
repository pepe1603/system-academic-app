<script setup lang="ts">
const route = useRoute()
const { getNewsById } = usePortal()

const { data: news } = await useAsyncData(`news-${route.params.id}`, () => 
  getNewsById(route.params.id as string)
)

if (!news.value) {
  throw createError({ statusCode: 404, message: 'Noticia no encontrada' })
}

useSeoMeta({
  title: `${news.value.title} - Portal Público`,
  description: news.value.content.slice(0, 160)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <UButton variant="ghost" to="/portal/noticias" class="mb-4">
      <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" />
      Volver a noticias
    </UButton>

    <article v-if="news">
      <h1 class="text-4xl font-bold mb-4">{{ news.title }}</h1>
      
      <div class="flex items-center gap-4 text-muted-foreground mb-6">
        <span>
          <UIcon name="i-lucide-calendar" class="w-4 h-4 inline mr-1" />
          {{ new Date(news.createdAt).toLocaleDateString('es-MX', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </span>
      </div>

      <img
        v-if="news.imageUrl"
        :src="news.imageUrl"
        :alt="news.title"
        class="w-full h-64 object-cover rounded-lg mb-6"
      />

      <div class="prose dark:prose-invert max-w-none">
        <p>{{ news.content }}</p>
      </div>
    </article>
  </div>
</template>