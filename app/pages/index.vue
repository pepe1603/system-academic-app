<script setup lang="ts">
useSeoMeta({
  title: 'Escuela Normal Emiliano Zapata - Inicio',
  description: 'Portal público institucional'
})

definePageMeta({
  layout: 'portal'
})

const { getInstitution, getNews, getEvents } = usePortalContent()

const { data: institution } = await useAsyncData('institution-home', () => getInstitution())
const { data: newsData } = await useAsyncData('news-home', () => getNews(false))
const { data: eventsData } = await useAsyncData('events-home', () => getEvents(false))

const news = computed(() => newsData.value?.slice(0, 3) || [])
const events = computed(() => eventsData.value?.slice(0, 3) || [])
</script>

<template>
  <div>
    <!-- Quick Contact -->
    <section class="py-8 md:py-10 bg-primary/5 border-b">
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="flex flex-wrap justify-center gap-6 text-sm">
          <a v-if="institution?.phone" :href="`tel:${institution.phone}`" class="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <UIcon name="i-lucide-phone" class="w-4 h-4" />
            {{ institution.phone }}
          </a>
          <a v-if="institution?.email" :href="`mailto:${institution.email}`" class="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <UIcon name="i-lucide-mail" class="w-4 h-4" />
            {{ institution.email }}
          </a>
        </div>
      </div>
    </section>

    <!-- Latest News - Parallax Cards -->
    <section class="py-12 md:py-20 lg:py-24">
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold">Últimas Noticias</h2>
            <p class="text-muted-foreground mt-2">Mantente informado</p>
          </div>
          <UButton to="/portal/noticias" variant="ghost">
            Ver todas <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          <div 
            v-for="(item, index) in news" 
            :key="item.id"
            class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            :class="index === 0 ? 'md:row-span-2' : ''"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              :class="index === 0 ? 'md:h-full' : 'h-48'"
            />
            <div v-else class="w-full h-48 md:h-full bg-gradient-to-br from-primary/60 to-primary/30" />
            <div class="absolute bottom-0 left-0 right-0 p-5 z-20">
              <UBadge color="white" variant="solid" class="mb-2">
                {{ new Date(item.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) }}
              </UBadge>
              <h3 class="font-bold text-lg text-white mb-1 group-hover:text-primary-200 transition-colors line-clamp-2">
                {{ item.title }}
              </h3>
              <p class="text-white/70 text-sm line-clamp-2 mb-2">{{ item.content }}</p>
              <UButton :to="`/portal/noticias/${item.id}`" size="xs" variant="outline" class="text-white border-white hover:bg-white hover:text-primary">
                Leer más
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="py-12 md:py-20 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold">Próximos Eventos</h2>
            <p class="text-muted-foreground mt-2">No te pierdas nada</p>
          </div>
          <UButton to="/portal/eventos" variant="ghost">
            Ver todos <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          <UCard v-for="event in events" :key="event.id" class="hover:shadow-lg transition-all group">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span class="text-2xl font-bold text-primary">{{ new Date(event.eventDate).getDate() }}</span>
                <span class="text-xs uppercase text-muted-foreground">{{ new Date(event.eventDate).toLocaleDateString('es-MX', { month: 'short' }) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{{ event.title }}</h3>
                <p class="text-muted-foreground text-sm line-clamp-2 mb-2">{{ event.description }}</p>
                <div class="flex items-center gap-1 text-sm text-muted-foreground">
                  <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                  {{ event.location }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 md:py-24 lg:py-28 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div class="container mx-auto px-6 max-w-4xl text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-4">¿Tienes alguna duda?</h2>
        <p class="opacity-90 mb-6 max-w-xl mx-auto">Escríbenos y nuestro equipo te contactará pronto</p>
        <UButton to="/portal/contacto" size="lg" class="bg-white text-primary hover:bg-white/90">
          <UIcon name="i-lucide-mail" class="w-4 h-4 mr-2" />
          Contáctanos
        </UButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-950 text-slate-400 py-12 md:py-16 lg:py-20">
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 text-center md:text-left">
          <div>
            <h3 class="font-bold text-white mb-3">{{ institution?.name || 'ENEZ' }}</h3>
            <p class="text-sm opacity-70">{{ institution?.address }}</p>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">Enlaces</h3>
            <div class="flex flex-col gap-1 text-sm">
              <NuxtLink to="/portal/nosotros" class="hover:text-white">Nosotros</NuxtLink>
              <NuxtLink to="/portal/noticias" class="hover:text-white">Noticias</NuxtLink>
              <NuxtLink to="/portal/eventos" class="hover:text-white">Eventos</NuxtLink>
              <NuxtLink to="/portal/servicios" class="hover:text-white">Servicios</NuxtLink>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">Contacto</h3>
            <p class="text-sm opacity-70">{{ institution?.phone }}</p>
            <p class="text-sm opacity-70">{{ institution?.email }}</p>
          </div>
        </div>
        <div class="border-t border-slate-800 mt-8 pt-6 text-center text-xs opacity-50">
          © {{ new Date().getFullYear() }} {{ institution?.name || 'Institución' }}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>