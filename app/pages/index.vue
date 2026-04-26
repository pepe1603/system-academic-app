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
              <span class="hidden sm:inline">Ir a CPanel</span>
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <section v-if="filteredAds.length" class="relative h-72 md:h-96 overflow-hidden">
      <div class="absolute inset-0">
        <img
          v-if="filteredAds[0]?.imageUrl"
          :src="filteredAds[0].imageUrl"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gradient-to-r from-primary to-primary/70" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>
      <div class="relative z-20 container mx-auto px-6 h-full flex items-center">
        <div class="text-white max-w-3xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            {{ filteredAds[0]?.title || 'Bienvenido a nuestro Portal' }}
          </h1>
          <p class="text-lg md:text-xl opacity-90 mb-6 line-clamp-3">
            {{ filteredAds[0]?.description || 'Instituto educativo de excelencia' }}
          </p>
          <div v-if="filteredAds[0]?.linkUrl" class="mt-6">
            <UButton size="xl" :to="filteredAds[0].linkUrl">
              Ver más <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="bg-gradient-to-r from-primary to-primary/70 text-white py-20">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          {{ institution?.name || 'Escuela Normal Emiliano Zapata' }}
        </h1>
        <p class="text-2xl opacity-90 max-w-3xl mx-auto mb-10">
          {{ institution?.mission || 'Formando profesionales de la educación con excelencia y compromiso social' }}
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-6">
          <UButton to="/portal/nosotros" variant="outline" class="border-white text-white hover:bg-white/10">
            Conócenos
          </UButton>
          <UButton to="/portal/servicios" variant="outline" class="border-white text-white hover:bg-white/10">
            Servicios
          </UButton>
          <UButton to="/portal/contacto">
            Contacto
          </UButton>
        </div>
      </div>
    </section>

    <section v-if="institution" class="py-16 bg-muted/30">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center p-6">
            <UIcon name="i-lucide-map-pin" class="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 class="font-semibold text-lg mb-2">Ubicación</h3>
            <p class="text-muted-foreground">{{ institution.address }}</p>
          </div>
          <div class="text-center p-6">
            <UIcon name="i-lucide-phone" class="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 class="font-semibold text-lg mb-2">Teléfono</h3>
            <p class="text-muted-foreground">{{ institution.phone }}</p>
          </div>
          <div class="text-center p-6">
            <UIcon name="i-lucide-mail" class="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 class="font-semibold text-lg mb-2">Email</h3>
            <p class="text-muted-foreground">{{ institution.email }}</p>
          </div>
          <div class="text-center p-6">
            <UIcon name="i-lucide-globe" class="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 class="font-semibold text-lg mb-2">Web</h3>
            <a :href="institution.website" target="_blank" class="text-primary hover:underline">
              {{ institution.website?.replace('https://', '') }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-4xl font-bold">Últimas Noticias</h2>
          <UButton variant="ghost" size="lg" to="/portal/noticias">
            Ver todas <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UCard v-for="item in news" :key="item.id" class="hover:shadow-xl transition-shadow">
            <template #header>
              <h3 class="font-semibold text-xl line-clamp-2">{{ item.title }}</h3>
            </template>
            <p class="text-muted-foreground line-clamp-4">{{ item.content }}</p>
            <template #footer>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">
                  {{ new Date(item.createdAt).toLocaleDateString('es-MX') }}
                </span>
                <UButton variant="ghost" size="sm" :to="`/portal/noticias/${item.id}`">
                  Leer más
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </section>

    <section v-if="filteredAds?.length" class="py-16 bg-muted/30">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-4xl font-bold">Anuncios</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="ad in filteredAds" 
            :key="ad.id"
            class="relative h-56 rounded-xl overflow-hidden cursor-pointer group"
          >
            <div v-if="ad.imageUrl" class="absolute inset-0">
              <img :src="ad.imageUrl" :alt="ad.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div v-else class="absolute inset-0 bg-gradient-to-r from-primary to-primary/70" />
            
            <div class="absolute bottom-0 left-0 right-0 p-5" :class="ad.imageUrl ? 'text-white' : ''">
              <h3 class="font-bold text-xl mb-1">{{ ad.title }}</h3>
              <p class="text-sm line-clamp-2" :class="ad.imageUrl ? 'text-white/80' : 'text-muted-foreground'">
                {{ ad.description }}
              </p>
            </div>
            
            <NuxtLink 
              v-if="ad.linkUrl" 
              :to="ad.linkUrl"
              class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
            >
              <UButton variant="solid" size="lg">
                Ver más <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-muted/30">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-4xl font-bold">Próximos Eventos</h2>
          <UButton variant="ghost" size="lg" to="/portal/eventos">
            Ver todos <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UCard v-for="event in events" :key="event.id" class="hover:shadow-xl transition-shadow">
            <template #header>
              <div class="flex items-start justify-between">
                <h3 class="font-semibold text-xl line-clamp-2">{{ event.title }}</h3>
                <UBadge color="primary">{{ event.eventDate }}</UBadge>
              </div>
            </template>
            <p class="text-muted-foreground line-clamp-3">{{ event.description }}</p>
            <template #footer>
              <div class="flex items-center gap-3 text-muted-foreground">
                <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
                {{ event.location }}
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </section>

    <section class="py-20">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl font-bold mb-6">¿Necesitas más información?</h2>
        <p class="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Contáctanos para resolver cualquier duda sobre nuestros servicios y programas educativos
        </p>
        <UButton size="xl" to="/portal/contacto">
          <UIcon name="i-lucide-mail" class="w-5 h-5 mr-2" />
          Contáctanos
        </UButton>
      </div>
    </section>

    <footer class="bg-primary text-primary-foreground py-12">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 class="font-bold text-xl mb-4">{{ institution?.name || 'ENEZ' }}</h3>
            <p class="text-lg opacity-80">{{ institution?.address }}</p>
          </div>
          <div>
            <h3 class="font-bold text-xl mb-4">Contacto</h3>
            <p class="text-lg opacity-80">{{ institution?.phone }}</p>
            <p class="text-lg opacity-80">{{ institution?.email }}</p>
          </div>
          <div>
            <h3 class="font-bold text-xl mb-4">Enlaces Rápidos</h3>
            <div class="flex flex-col gap-3 text-lg">
              <NuxtLink to="/portal/nosotros" class="opacity-80 hover:opacity-100">Nosotros</NuxtLink>
              <NuxtLink to="/portal/noticias" class="opacity-80 hover:opacity-100">Noticias</NuxtLink>
              <NuxtLink to="/portal/servicios" class="opacity-80 hover:opacity-100">Servicios</NuxtLink>
            </div>
          </div>
        </div>
        <div class="border-t border-primary-foreground/20 mt-10 pt-8 text-center text-lg opacity-60">
          © {{ new Date().getFullYear() }} {{ institution?.name || 'Escuela Normal Emiliano Zapata' }}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </div>
</template>
