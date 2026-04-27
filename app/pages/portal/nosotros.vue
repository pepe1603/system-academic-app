<script setup lang="ts">
useSeoMeta({
  title: 'Nosotros - Escuela Normal Emiliano Zapata',
  description: 'Conoce más sobre nuestra historia, misión, visión y filosofía institucional'
})

definePageMeta({
  layout: 'portal'
})

const { getInstitution } = usePortalContent()
const { data: institution } = await useAsyncData('institution', () => getInstitution())
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-6xl">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Nosotros</h1>
      <p class="text-muted-foreground text-lg md:text-xl">Conoce más sobre nuestra institución</p>
    </div>

    <div v-if="institution" class="space-y-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UCard class="hover:shadow-xl transition-all duration-500 group">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UIcon name="i-lucide-book-open" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-2xl font-bold">Historia</h2>
            </div>
          </template>
          <p class="text-muted-foreground leading-relaxed">
            {{ institution.history || 'Próximamente...' }}
          </p>
        </UCard>

        <UCard class="hover:shadow-xl transition-all duration-500 group">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UIcon name="i-lucide-target" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-2xl font-bold">Misión</h2>
            </div>
          </template>
          <p class="text-muted-foreground leading-relaxed">
            {{ institution.mission || 'Próximamente...' }}
          </p>
        </UCard>

        <UCard class="hover:shadow-xl transition-all duration-500 group">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UIcon name="i-lucide-eye" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-2xl font-bold">Visión</h2>
            </div>
          </template>
          <p class="text-muted-foreground leading-relaxed">
            {{ institution.vision || 'Próximamente...' }}
          </p>
        </UCard>

        <UCard class="hover:shadow-xl transition-all duration-500 group">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UIcon name="i-lucide-heart" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-2xl font-bold">Valores</h2>
            </div>
          </template>
          <p class="text-muted-foreground leading-relaxed">
            {{ institution.values || 'Próximamente...' }}
          </p>
        </UCard>
      </div>

      <UCard class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <UIcon name="i-lucide-building-2" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ institution.name || 'Nuestra Institución' }}</h2>
              <p class="text-muted-foreground text-sm">Información de contacto</p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
            <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Dirección</p>
              <p class="font-medium">{{ institution.address || 'No disponible' }}</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
            <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-phone" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Teléfono</p>
              <a :href="`tel:${institution.phone}`" class="font-medium hover:text-primary transition-colors">
                {{ institution.phone || 'No disponible' }}
              </a>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
            <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-mail" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Correo electrónico</p>
              <a :href="`mailto:${institution.email}`" class="font-medium hover:text-primary transition-colors text-sm">
                {{ institution.email || 'No disponible' }}
              </a>
            </div>
          </div>

          <div v-if="institution.website" class="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
            <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-globe" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Sitio web</p>
              <a :href="institution.website" target="_blank" class="font-medium hover:text-primary transition-colors text-sm">
                Visitar sitio
              </a>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin mx-auto mb-4" />
      <p class="text-muted-foreground">Cargando información...</p>
    </div>
  </div>
</template>