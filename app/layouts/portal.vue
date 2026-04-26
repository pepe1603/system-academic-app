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
    <!-- Carousel Banner -->
    <section v-if="ads.length > 0" class="relative h-[50vh] md:h-[60vh] overflow-hidden">
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
          <div class="relative z-10 container mx-auto px-6 h-full flex items-center">
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

      <!-- Controls -->
      <div v-if="ads.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <button
          v-for="(ad, index) in ads"
          :key="ad.id"
          @click="goToSlide(index)"
          class="w-3 h-3 rounded-full transition-all"
          :class="currentIndex === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'"
        />
      </div>

      <button
        v-if="ads.length > 1"
        @click="prevSlide"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <UIcon name="i-lucide-chevron-left" class="w-6 h-6" />
      </button>

      <button
        v-if="ads.length > 1"
        @click="nextSlide"
        class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <UIcon name="i-lucide-chevron-right" class="w-6 h-6" />
      </button>
    </section>

    <!-- Fallback when no ads -->
    <section v-else class="relative h-[40vh] bg-gradient-to-br from-primary to-primary/80 text-white flex items-center">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          Portal Educativo
        </h1>
        <p class="text-xl opacity-90">
          Bienvenido a nuestro sitio web
        </p>
      </div>
    </section>

    <slot />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>