<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { getAllAds } = usePortalContent()

const { data: adsList } = await useAsyncData('portal-ads', () => getAllAds())

const ads = computed(() => adsList.value?.filter(a => a.isPublished) || [])

const currentIndex = ref(0)
const selectedAd = ref<any>(null)
let interval: NodeJS.Timeout | null = null

const openAdModal = (ad: any) => {
  selectedAd.value = ad
}

const closeAdModal = () => {
  selectedAd.value = null
}

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

const openMenu = ref<string | null>(null)

const toggleMenu = (menu: string) => {
  openMenu.value = openMenu.value === menu ? null : menu
}

const closeMenus = () => {
  openMenu.value = null
}
</script>

<template>
  <div>
    <!-- Navbar Minimal con Dropdowns -->
    <nav class="border-b bg-background/80 backdrop-blur sticky top-0 z-50" @mouseleave="closeMenus">
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center gap-3 font-semibold">
            <UIcon name="i-lucide-graduation-cap" class="w-7 h-7 text-primary" />
            <span class="hidden sm:inline text-lg">ENEZ</span>
          </NuxtLink>
          
          <div class="hidden md:flex items-center gap-2">
            <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2">
              Inicio
            </NuxtLink>
            
            <div class="relative">
              <button 
                @click="toggleMenu('institucion')" 
                @mouseenter="openMenu = 'institucion'"
                class="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2"
              >
                Institución
                <UIcon name="i-lucide-chevron-down" class="w-3 h-3 transition-transform" :class="openMenu === 'institucion' ? 'rotate-180' : ''" />
              </button>
              <div 
                v-if="openMenu === 'institucion'" 
                class="absolute top-full left-0 mt-1 w-48 bg-background border rounded-lg shadow-xl py-2 z-50"
              >
                <NuxtLink to="/portal/nosotros" class="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Nosotros
                </NuxtLink>
                <NuxtLink to="/portal/contacto" class="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Contacto
                </NuxtLink>
              </div>
            </div>
            
            <NuxtLink to="/portal/noticias" class="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2">
              Noticias
            </NuxtLink>
            
            <NuxtLink to="/portal/eventos" class="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2">
              Eventos
            </NuxtLink>
            
            <NuxtLink to="/portal/servicios" class="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2">
              Servicios
            </NuxtLink>
          </div>
          
          <UButton to="/cpanel" variant="outline" size="sm">
            <UIcon name="i-lucide-settings" class="w-4 h-4" />
            <span class="hidden lg:inline ml-2">Admin</span>
          </UButton>
        </div>
      </div>
    </nav>

    <!-- Carousel Banner -->
    <section v-if="ads.length > 0" class="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
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
              <UButton v-if="ad.linkUrl" size="lg" @click="openAdModal(ad)">
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

      <!-- Click whole slide to open modal -->
      <button
        v-if="ads[currentIndex]?.linkUrl"
        @click="openAdModal(ads[currentIndex])"
        class="absolute inset-0 z-10 cursor-pointer"
        aria-label="Ver más información"
      />
    </section>

    <!-- Ad Modal -->
    <Teleport to="body">
      <div v-if="selectedAd" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="closeAdModal">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeAdModal" />
        <div class="relative bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
          <button @click="closeAdModal" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <UIcon name="i-lucide-x" class="w-6 h-6" />
          </button>
          <div v-if="selectedAd.imageUrl" class="h-64 md:h-80">
            <img :src="selectedAd.imageUrl" :alt="selectedAd.title" class="w-full h-full object-cover" />
          </div>
          <div class="p-6 md:p-8">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">{{ selectedAd.title }}</h2>
            <p class="text-muted-foreground text-lg mb-6 whitespace-pre-wrap">{{ selectedAd.description }}</p>
            <UButton variant="outline" @click="closeAdModal">
              Cerrar
            </UButton>
          </div>
        </div>
      </div>
    </Teleport>

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