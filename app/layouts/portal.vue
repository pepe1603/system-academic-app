<script setup lang="ts">
const { getInstitution, getAds } = usePortal()

const { data: institution } = await useAsyncData('institution', () => getInstitution())
const { data: ads } = await useAsyncData('ads', () => getAds())

const banners = computed(() => ads.value?.filter(a => a.position === 'BANNER' && a.isPublished) || [])
const sidebarAds = computed(() => ads.value?.filter(a => a.position === 'SIDEBAR' && a.isPublished) || [])
</script>

<template>
  <div>
    <section v-if="institution" class="py-12 bg-gradient-to-r from-primary/10 to-primary/5">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">{{ institution.name }}</h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">{{ institution.mission }}</p>
        <div class="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
          <span v-if="institution.phone">
            <UIcon name="i-lucide-phone" class="w-4 h-4 inline mr-1" />
            {{ institution.phone }}
          </span>
          <span v-if="institution.email">
            <UIcon name="i-lucide-mail" class="w-4 h-4 inline mr-1" />
            {{ institution.email }}
          </span>
        </div>
      </div>
    </section>

    <section v-if="banners.length" class="py-8 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            v-for="banner in banners"
            :key="banner.id"
            :href="banner.linkUrl || '#'"
            class="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <img
              v-if="banner.imageUrl"
              :src="banner.imageUrl"
              :alt="banner.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-4 bg-white dark:bg-gray-800">
              <h3 class="font-semibold">{{ banner.title }}</h3>
              <p v-if="banner.description" class="text-sm text-muted-foreground mt-1 line-clamp-2">
                {{ banner.description }}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <slot />
  </div>
</template>