<script setup lang="ts">
const route = useRoute()
const { getNewsById } = usePortalContent()

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
  <div class="container mx-auto px-6 py-12">
    <UButton variant="ghost" size="lg" to="/portal/noticias" class="mb-6">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
      Volver a noticias
    </UButton>

    <article v-if="news" class="max-w-4xl mx-auto">
      <h1 class="text-5xl font-bold mb-6">{{ news.title }}</h1>
      
      <div class="flex items-center gap-5 text-muted-foreground text-lg mb-10">
        <span>
          <UIcon name="i-lucide-calendar" class="w-5 h-5 inline mr-2" />
          {{ new Date(news.createdAt).toLocaleDateString('es-MX', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </span>
      </div>

      <img
        v-if="news.imageUrl"
        :src="news.imageUrl"
        :alt="news.title"
        class="w-full h-80 object-cover rounded-xl mb-10"
      />

      <div class="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <p>{{ news.content }}</p>
      </div>
    </article>
  </div>
</template>