<script setup lang="ts">
useSeoMeta({
  title: 'Escuela Normal Emiliano Zapata - Inicio',
  description: 'Portal público institucional'
})

definePageMeta({
  layout: 'portal'
})

const { getInstitution, getNews, getEvents } = usePortalContent()

const { data: newsData } = await useAsyncData('news-home', () => getNews(false))
const { data: eventsData } = await useAsyncData('events-home', () => getEvents(false))
const { data: institution } = await useAsyncData('institution-footer', () => getInstitution())

const news = computed(() => newsData.value?.slice(0, 3) || [])
const events = computed(() => eventsData.value?.slice(0, 3) || [])
</script>

<template>
  <div>
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
            class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-[280px] md:h-[320px]"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-primary/60 to-primary/30" />
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12 text-center md:text-left">
          <div>
            <h3 class="font-bold text-white text-lg mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-graduation-cap" class="w-5 h-5 text-primary" />
              {{ institution?.name || 'ENEZ' }}
            </h3>
            <p class="text-sm opacity-70">{{ institution?.address }}</p>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">Enlaces</h3>
            <div class="flex flex-col gap-1 text-sm">
              <NuxtLink to="/portal/nosotros" class="hover:text-white transition-colors">Nosotros</NuxtLink>
              <NuxtLink to="/portal/noticias" class="hover:text-white transition-colors">Noticias</NuxtLink>
              <NuxtLink to="/portal/eventos" class="hover:text-white transition-colors">Eventos</NuxtLink>
              <NuxtLink to="/portal/servicios" class="hover:text-white transition-colors">Servicios</NuxtLink>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">Contacto</h3>
            <div class="space-y-2 text-sm">
              <p class="opacity-70">{{ institution?.phone }}</p>
              <p class="opacity-70">{{ institution?.email }}</p>
              <a v-if="institution?.website" :href="institution.website" target="_blank" class="text-primary hover:text-white transition-colors block">
                {{ institution.website }}
              </a>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">Síguenos</h3>
            <div class="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.921c-1.906 0-2.303.943-2.303 2.327v2.965h3.914l-.638 3.47h-3.276v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#1DA1F2] flex items-center justify-center transition-all duration-300 hover:scale-110">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] flex items-center justify-center transition-all duration-300 hover:scale-110">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-1.344 6.157-3.99 6.157H7.021c-2.643 0-3.997-2.953-3.99-6.157 0-3.203.012-3.583.07-4.849.148-3.227 1.667-4.771 4.919-4.919 1.266-.058 1.645-.07 4.849-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.364 2.69.059 7.047.014 8.326 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.636 6.78 6.988 6.985C8.317 19.993 8.733 20 12 20c3.259 0 3.668-.014 4.948-.072 4.354-.204 6.786-2.637 6.989-6.985.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.073-4.949-.203-4.357-2.636-6.775-6.989-6.975C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#FF0000] flex items-center justify-center transition-all duration-300 hover:scale-110">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-800 mt-8 pt-6 text-center text-xs opacity-50">
          © {{ new Date().getFullYear() }} {{ institution?.name || 'Institución' }}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>