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
  <div class="container mx-auto px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12">Nosotros</h1>

    <div v-if="institution" class="space-y-20">
      <section class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <UIcon name="i-lucide-book-open" class="w-7 h-7 text-primary" />
          Historia
        </h2>
        <p class="text-muted-foreground leading-8 text-lg">
          {{ institution.history || 'Próximamente...' }}
        </p>
      </section>

      <section class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <UIcon name="i-lucide-target" class="w-7 h-7 text-primary" />
          Misión
        </h2>
        <p class="text-muted-foreground leading-8 text-lg">
          {{ institution.mission || 'Próximamente...' }}
        </p>
      </section>

      <section class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <UIcon name="i-lucide-eye" class="w-7 h-7 text-primary" />
          Visión
        </h2>
        <p class="text-muted-foreground leading-8 text-lg">
          {{ institution.vision || 'Próximamente...' }}
        </p>
      </section>

      <section class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <UIcon name="i-lucide-heart" class="w-7 h-7 text-primary" />
          Valores
        </h2>
        <p class="text-muted-foreground leading-8 text-lg">
          {{ institution.values || 'Próximamente...' }}
        </p>
      </section>

      <section class="max-w-3xl mx-auto bg-muted/30 p-8 rounded-lg">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <UIcon name="i-lucide-building-2" class="w-7 h-7 text-primary" />
          Nuestra Institución
        </h2>
        <div class="grid gap-6">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-muted-foreground" />
            <span class="text-lg">{{ institution.address || 'Dirección no disponible' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-phone" class="w-5 h-5 text-muted-foreground" />
            <span class="text-lg">{{ institution.phone || 'Teléfono no disponible' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-mail" class="w-5 h-5 text-muted-foreground" />
            <span class="text-lg">{{ institution.email || 'Email no disponible' }}</span>
          </div>
          <div v-if="institution.website" class="flex items-center gap-3">
            <UIcon name="i-lucide-globe" class="w-5 h-5 text-muted-foreground" />
            <a :href="institution.website" target="_blank" class="text-primary hover:underline text-lg">
              {{ institution.website }}
            </a>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="text-center py-16">
      <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin mx-auto mb-4" />
      <p class="text-muted-foreground">Cargando información...</p>
    </div>
  </div>
</template>