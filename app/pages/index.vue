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

const navItems = [
  { label: 'Inicio', to: '/', icon: 'i-lucide-home' },
  { label: 'Nosotros', to: '/portal/nosotros', icon: 'i-lucide-users' },
  { label: 'Noticias', to: '/portal/noticias', icon: 'i-lucide-newspaper' },
  { label: 'Eventos', to: '/portal/eventos', icon: 'i-lucide-calendar' },
  { label: 'Servicios', to: '/portal/servicios', icon: 'i-lucide-briefcase' },
  { label: 'Contacto', to: '/portal/contacto', icon: 'i-lucide-mail' }
]
</script>

<template>
  <div>
    <!-- Main Content starts after carousel in layout -->
    
    <!-- Quick Contact Links -->
    <section class="py-8 border-b">
      <div class="container mx-auto px-6">
        <div class="flex flex-wrap justify-center gap-8 text-sm">
          <div v-if="institution?.phone" class="flex items-center gap-2 text-muted-foreground">
            <UIcon name="i-lucide-phone" class="w-4 h-4" />
            <span>{{ institution.phone }}</span>
          </div>
          <div v-if="institution?.email" class="flex items-center gap-2 text-muted-foreground">
            <UIcon name="i-lucide-mail" class="w-4 h-4" />
            <span>{{ institution.email }}</span>
          </div>
          <NuxtLink to="/portal/contacto" class="flex items-center gap-2 text-primary font-medium">
            <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
            <span>Envíanos un mensaje</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Latest News - Parallax Cards -->
    <section class="py-16">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl md:text-3xl font-bold">Últimas Noticias</h2>
          <UButton variant="ghost" to="/portal/noticias">
            Ver todas <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="(item, index) in news" 
            :key="item.id"
            class="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
            <div v-if="item.imageUrl">
              <img :src="item.imageUrl" :alt="item.title" class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div v-else class="w-full h-40 bg-gradient-to-br from-primary/30 to-primary/10" />
            <div class="relative z-20 p-4">
              <h3 class="font-semibold text-lg mb-1 line-clamp-2">{{ item.title }}</h3>
              <p class="text-sm text-muted-foreground line-clamp-2 mb-2">{{ item.content }}</p>
              <div class="flex justify-between items-center">
                <span class="text-xs text-muted-foreground">
                  {{ new Date(item.createdAt).toLocaleDateString('es-MX') }}
                </span>
                <UButton :to="`/portal/noticias/${item.id}`" size="xs" variant="ghost">
                  Leer más
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="py-16 bg-slate-50 dark:bg-slate-900">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold">Próximos Eventos</h2>
            <p class="text-muted-foreground">No te loses nuestras actividades</p>
          </div>
          <UButton variant="ghost" to="/portal/eventos">
            Ver todos <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UCard v-for="event in events" :key="event.id" class="hover:shadow-lg transition-shadow">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span class="text-xl font-bold text-primary">{{ new Date(event.eventDate).getDate() }}</span>
                <span class="text-xs uppercase text-muted-foreground">{{ new Date(event.eventDate).toLocaleDateString('es-MX', { month: 'short' }) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold mb-1 line-clamp-1">{{ event.title }}</h3>
                <p class="text-sm text-muted-foreground line-clamp-2 mb-2">{{ event.description }}</p>
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                  <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                  {{ event.location }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-4">¿Tienes alguna duda?</h2>
        <p class="opacity-90 mb-6">Nuestro equipo está para ayudarte</p>
        <UButton to="/portal/contacto" size="lg" class="bg-white text-primary hover:bg-white/90">
          <UIcon name="i-lucide-mail" class="w-4 h-4 mr-2" />
          Contáctanos
        </UButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-950 text-slate-400 py-12">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 class="font-bold text-white mb-3">Contacto</h3>
            <p class="text-sm">{{ institution?.phone }}</p>
            <p class="text-sm">{{ institution?.email }}</p>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">Enlaces</h3>
            <div class="flex flex-col gap-1 text-sm">
              <NuxtLink to="/portal/nosotros" class="hover:text-white">Nosotros</NuxtLink>
              <NuxtLink to="/portal/servicios" class="hover:text-white">Servicios</NuxtLink>
              <NuxtLink to="/portal/contacto" class="hover:text-white">Contacto</NuxtLink>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white mb-3">{{ institution?.name || 'Institución' }}</h3>
            <p class="text-sm opacity-70">{{ institution?.address }}</p>
          </div>
        </div>
        <div class="border-t border-slate-800 mt-8 pt-6 text-center text-xs opacity-50">
          © {{ new Date().getFullYear() }} {{ institution?.name || 'Institución' }}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>