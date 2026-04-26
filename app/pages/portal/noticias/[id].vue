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
    <UButton variant="ghost" size="lg" to="/portal/noticias" class="mb-6 hover:bg-primary/10 transition-colors">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
      Volver a noticias
    </UButton>

    <article v-if="news" class="animate-fade-in">
      <header class="mb-8">
        <UBadge color="primary" class="mb-4">
          <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
          {{ new Date(news.createdAt).toLocaleDateString('es-MX', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          }) }}
        </UBadge>
        <h1 class="text-4xl md:text-5xl font-bold mb-4 hover:text-primary transition-colors duration-300">
          {{ news.title }}
        </h1>
      </header>
      
      <div v-if="news.imageUrl" class="mb-10 rounded-2xl overflow-hidden shadow-xl">
        <img
          :src="news.imageUrl"
          :alt="news.title"
          class="w-full h-[300px] md:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      <div class="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <p class="whitespace-pre-wrap">{{ news.content }}</p>
      </div>

      <div class="mt-12 pt-8 border-t flex justify-center">
        <UButton variant="outline" size="lg" to="/portal/noticias" class="hover:bg-primary hover:text-white transition-all duration-300">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Ver más noticias
        </UButton>
      </div>
    </article>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>