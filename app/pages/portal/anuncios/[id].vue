<script setup lang="ts">
definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { getAdById } = usePortalContent()

const { data: ad } = await useAsyncData(`ad-${route.params.id}`, () => 
  getAdById(route.params.id as string)
)

if (!ad.value) {
  throw createError({ statusCode: 404, message: 'Anuncio no encontrado' })
}

useSeoMeta({
  title: `${ad.value.title} - Portal Público`,
  description: ad.value.description?.slice(0, 160)
})
</script>

<template>
  <div class="container mx-auto px-6 py-12">
    <UButton variant="ghost" size="lg" to="/" class="mb-6">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
      Volver al inicio
    </UButton>

    <article v-if="ad" class="max-w-4xl mx-auto">
      <div v-if="ad.imageUrl" class="mb-8 rounded-2xl overflow-hidden">
        <img :src="ad.imageUrl" :alt="ad.title" class="w-full h-[300px] md:h-[400px] object-cover" />
      </div>

      <h1 class="text-4xl md:text-5xl font-bold mb-6">{{ ad.title }}</h1>

      <div class="prose dark:prose-invert max-w-none text-lg leading-relaxed mb-10">
        <p>{{ ad.description }}</p>
      </div>

      <div v-if="ad.linkUrl" class="flex gap-4">
        <span class="text-sm text-muted-foreground">Enlace: {{ ad.linkUrl }}</span>
      </div>
    </article>
  </div>
</template>