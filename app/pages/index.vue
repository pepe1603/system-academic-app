<script setup lang="ts">
useSeoMeta({
  title: 'Escuela Normal Emiliano Zapata - Portal Público',
  description: 'Portal público de la Escuela Normal Emiliano Zapata'
})

definePageMeta({
  layout: 'portal'
})

const { getInstitution, getNews, getEvents, getAllAds } = usePortalContent()

const { data: institution } = await useAsyncData('institution-home', () => getInstitution())
const { data: newsData } = await useAsyncData('news-home', () => getNews(false))
const { data: eventsData } = await useAsyncData('events-home', () => getEvents(false))
const { data: adsList } = await useAsyncData('ads-all', () => getAllAds())

const news = computed(() => newsData.value?.slice(0, 3) || [])
const events = computed(() => eventsData.value?.slice(0, 3) || [])
const filteredAds = computed(() => adsList.value?.filter(a => a.isPublished) || [])
const heroAd = computed(() => filteredAds.value[0] || null)

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
    <!-- Header -->
    <nav class="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between h-20">
          <NuxtLink to="/" class="flex items-center gap-3 font-semibold text-xl">
            <UIcon name="i-lucide-graduation-cap" class="w-8 h-8 text-primary" />
            <span class="hidden sm:inline">{{ institution?.name || 'ENEZ' }}</span>
          </NuxtLink>
          
          <div class="hidden md:flex items-center gap-2">
            <UButton
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              size="md"
            >
              {{ item.label }}
            </UButton>
          </div>
          
          <div class="flex items-center gap-3">
            <UButton to="/cpanel" variant="outline" size="md">
              <UIcon name="i-lucide-settings" class="w-4 h-4 mr-2" />
              <span class="hidden sm:inline">Admin</span>
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section v-if="heroAd" class="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <div class="absolute inset-0">
        <img
          v-if="heroAd.imageUrl"
          :src="heroAd.imageUrl"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div class="relative z-20 container mx-auto px-6 h-full flex items-center">
        <div class="text-white max-w-4xl">
          <UBadge v-if="heroAd.linkUrl" color="white" variant="solid" class="mb-4">
            Destacado
          </UBadge>
          <h1 class="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {{ heroAd.title || 'Bienvenido a nuestro Portal' }}
          </h1>
          <p class="text-xl md:text-2xl opacity-90 mb-8 line-clamp-3">
            {{ heroAd.description || 'Institución educativa comprometida con la excelencia académica' }}
          </p>
          <div class="flex flex-wrap gap-4">
            <UButton v-if="heroAd.linkUrl" size="xl" :to="heroAd.linkUrl">
              Ver más <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
            </UButton>
            <UButton to="/portal/nosotros" size="xl" variant="outline" class="border-white text-white hover:bg-white/10">
              Conócenos
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Welcome Section (when no ad) -->
    <section v-if="!heroAd" class="relative py-24 bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          {{ institution?.name || 'Escuela Normal Emiliano Zapata' }}
        </h1>
        <p class="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
          {{ institution?.mission || 'Formando profesionales de la educación con excelencia y compromiso social' }}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <UButton to="/portal/nosotros" size="lg" variant="outline" class="border-white text-white hover:bg-white/10">
            Conócenos
          </UButton>
          <UButton to="/portal/servicios" size="lg" variant="outline" class="border-white text-white hover:bg-white/10">
            Servicios
          </UButton>
          <UButton to="/portal/contacto" size="lg">
            Contáctanos
          </UButton>
        </div>
      </div>
    </section>

    <!-- Institutional Info -->
    <section v-if="institution" class="py-16">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center p-4">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-map-pin" class="w-7 h-7 text-primary" />
            </div>
            <h4 class="font-semibold text-sm mb-1">Ubicación</h4>
            <p class="text-sm text-muted-foreground">{{ institution.address }}</p>
          </div>
          <div class="text-center p-4">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-phone" class="w-7 h-7 text-primary" />
            </div>
            <h4 class="font-semibold text-sm mb-1">Teléfono</h4>
            <p class="text-sm text-muted-foreground">{{ institution.phone }}</p>
          </div>
          <div class="text-center p-4">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-mail" class="w-7 h-7 text-primary" />
            </div>
            <h4 class="font-semibold text-sm mb-1">Email</h4>
            <p class="text-sm text-muted-foreground">{{ institution.email }}</p>
          </div>
          <div class="text-center p-4">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-globe" class="w-7 h-7 text-primary" />
            </div>
            <h4 class="font-semibold text-sm mb-1">Web</h4>
            <a :href="institution.website" target="_blank" class="text-sm text-primary hover:underline">
              Visitar
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest News - Parallax Cards -->
    <section class="py-20 bg-slate-50 dark:bg-slate-900">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold">Últimas Noticias</h2>
          <UButton variant="ghost" size="lg" to="/portal/noticias">
            Ver todas <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="(item, index) in news" 
            :key="item.id"
            class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            :class="index === 0 ? 'md:row-span-2' : ''"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-primary/60 to-primary/30" />
            <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
              <UBadge color="white" variant="solid" class="mb-2">
                {{ new Date(item.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) }}
              </UBadge>
              <h3 class="font-bold text-xl text-white mb-2 group-hover:text-primary-200 transition-colors">
                {{ item.title }}
              </h3>
              <p class="text-white/80 text-sm line-clamp-2 mb-3">{{ item.content }}</p>
              <UButton :to="`/portal/noticias/${item.id}`" size="sm" variant="outline" class="text-white border-white hover:bg-white hover:text-primary">
                Leer más
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events - Featured Cards -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold">Próximos Eventos</h2>
            <p class="text-muted-foreground mt-2">No te pierdas nuestras actividades</p>
          </div>
          <UButton variant="ghost" size="lg" to="/portal/eventos">
            Ver todos <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UCard 
            v-for="(event, index) in events" 
            :key="event.id"
            class="group border-2 border-transparent hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            :class="index === 0 ? 'md:col-span-2' : ''"
          >
            <div v-if="index === 0" class="aspect-video mb-4 overflow-hidden rounded-t-lg">
              <div class="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                <UIcon name="i-lucide-calendar" class="w-20 h-20 text-primary/30" />
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span class="text-2xl font-bold text-primary">{{ new Date(event.eventDate).getDate() }}</span>
                <span class="text-xs text-muted-foreground uppercase">{{ new Date(event.eventDate).toLocaleDateString('es-MX', { month: 'short' }) }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{{ event.title }}</h3>
                <p class="text-muted-foreground text-sm line-clamp-2 mb-2">{{ event.description }}</p>
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                  {{ event.location }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">¿Necesitas más información?</h2>
        <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Nuestro equipo está listo para atenderte y resolver todas tus dudas
        </p>
        <UButton size="xl" to="/portal/contacto" class="bg-white text-primary hover:bg-white/90">
          <UIcon name="i-lucide-mail" class="w-5 h-5 mr-2" />
          Contáctanos
        </UButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-300 py-16">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <UIcon name="i-lucide-graduation-cap" class="w-8 h-8 text-primary" />
              <span class="font-bold text-xl text-white">{{ institution?.name || 'ENEZ' }}</span>
            </div>
            <p class="text-sm opacity-70">{{ institution?.address }}</p>
          </div>
          <div>
            <h3 class="font-bold text-white mb-4">Enlaces</h3>
            <div class="flex flex-col gap-2 text-sm">
              <NuxtLink to="/portal/nosotros" class="hover:text-white transition-colors">Nosotros</NuxtLink>
              <NuxtLink to="/portal/noticias" class="hover:text-white transition-colors">Noticias</NuxtLink>
              <NuxtLink to="/portal/eventos" class="hover:text-white transition-colors">Eventos</NuxtLink>
              <NuxtLink to="/portal/servicios" class="hover:text-white transition-colors">Servicios</NuxtLink>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white mb-4">Contacto</h3>
            <div class="flex flex-col gap-2 text-sm opacity-70">
              <p>{{ institution?.phone }}</p>
              <p>{{ institution?.email }}</p>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-white mb-4">Legal</h3>
            <div class="flex flex-col gap-2 text-sm">
              <NuxtLink to="/portal/privacidad" class="hover:text-white transition-colors">Política de Privacidad</NuxtLink>
              <NuxtLink to="/portal/terminos" class="hover:text-white transition-colors">Términos</NuxtLink>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-700 mt-10 pt-8 text-center text-sm opacity-50">
          © {{ new Date().getFullYear() }} {{ institution?.name || 'Institución' }}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>