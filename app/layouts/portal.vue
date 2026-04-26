<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { getAllAds } = usePortalContent()

const { data: adsList } = await useAsyncData('portal-ads', () => getAllAds())

const ads = computed(() => adsList.value?.filter(a => a.isPublished) || [])

const currentIndex = ref(0)
let interval: NodeJS.Timeout | null = null

const nextSlide = () => {
  if (ads.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % ads.value.length
  }
}

const prevSlide = () => {
  if (ads.value.length > 0) {
    currentIndex.value = currentIndex.value === 0 ? ads.value.length - 1 : currentIndex.value - 1
  }
}

const goToSlide = (index: number) => {
  currentIndex.value = index
}

onMounted(() => {
  if (ads.value.length > 1) {
    interval = setInterval(nextSlide, 5000)
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div>
    <!-- Navbar -->
    <nav class="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-graduation-cap" class="w-7 h-7 text-primary" />
            <span class="hidden sm:inline">ENEZ</span>
          </NuxtLink>
          
          <div class="hidden md:flex items-center gap-1">
            <UButton to="/" variant="ghost" size="sm">Inicio</UButton>
            <UButton to="/portal/nosotros" variant="ghost" size="sm">Nosotros</UButton>
            <UButton to="/portal/noticias" variant="ghost" size="sm">Noticias</UButton>
            <UButton to="/portal/eventos" variant="ghost" size="sm">Eventos</UButton>
            <UButton to="/portal/servicios" variant="ghost" size="sm">Servicios</UButton>
            <UButton to="/portal/contacto" variant="ghost" size="sm">Contacto</UButton>
          </div>
          
          <UButton to="/cpanel" variant="outline" size="sm">
            <UIcon name="i-lucide-settings" class="w-4 h-4" />
          </UButton>
        </div>
      </div>
    </nav>

    <!-- Carousel Banner -->
    <section v-if="ads.length > 0" class="relative h-[40vh] md:h-[50vh] lg:h-[55vh] overflow-hidden">
      <transition-group name="fade" tag="div">
        <div
          v-for="(ad, index) in ads"
          :key="ad.id"
          v-show="currentIndex === index"
          class="absolute inset-0"
        >
          <div class="absolute inset-0">
            <img
              v-if="ad.imageUrl"
              :src="ad.imageUrl"
              :alt="ad.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>
          <div class="relative z-10 container mx-auto px-6 max-w-6xl h-full flex items-center">
            <div class="text-white max-w-3xl">
              <h1 class="text-3xl md:text-5xl font-bold mb-3">
                {{ ad.title }}
              </h1>
              <p class="text-lg md:text-xl opacity-90 mb-4 line-clamp-2">
                {{ ad.description }}
              </p>
              <UButton v-if="ad.linkUrl" size="lg" :to="ad.linkUrl">
                Ver más <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
              </UButton>
            </div>
          </div>
        </div>
      </transition-group>

      <div v-if="ads.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <button
          v-for="(ad, index) in ads"
          :key="ad.id"
          @click="goToSlide(index)"
          class="w-2 h-2 rounded-full transition-all"
          :class="currentIndex === index ? 'bg-white w-6' : 'bg-white/50'"
        />
      </div>
    </section>

    <!-- Fallback -->
    <section v-if="ads.length === 0" class="h-[30vh] bg-gradient-to-br from-primary to-primary/80 flex items-center">
      <div class="container mx-auto px-6 max-w-6xl text-white text-center">
        <h1 class="text-3xl md:text-4xl font-bold">Portal Educativo</h1>
      </div>
    </section>

    <slot />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>