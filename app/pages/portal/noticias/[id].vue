<script setup lang="ts">
definePageMeta({
  layout: 'portal'
})

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
  description: news.value.content?.slice(0, 160)
})
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-4xl">
    <UButton variant="ghost" size="lg" to="/portal/noticias" class="mb-6">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
      Volver a noticias
    </UButton>

    <article v-if="news">
      <header class="mb-8">
        <UBadge color="primary" class="mb-4">
          {{ new Date(news.createdAt).toLocaleDateString('es-MX', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </UBadge>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ news.title }}</h1>
      </header>
      
      <div v-if="news.imageUrl" class="mb-10 rounded-2xl overflow-hidden">
        <img
          :src="news.imageUrl"
          :alt="news.title"
          class="w-full h-[300px] md:h-[450px] object-cover"
        />
      </div>

      <div class="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <p class="whitespace-pre-wrap">{{ news.content }}</p>
      </div>

      <div class="mt-12 pt-8 border-t">
        <UButton variant="outline" size="lg" to="/portal/noticias">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Ver más noticias
        </UButton>
      </div>
    </article>
  </div>
</template>