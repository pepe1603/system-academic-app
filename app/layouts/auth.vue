<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-950">
    <div class="w-full max-w-md p-8">
      <NuxtLink to="/" class="flex items-center justify-center gap-2 mb-8">
        <UIcon name="i-lucide-graduation-cap" class="w-10 h-10 text-primary-500" />
        <span class="font-bold text-2xl">Sistema Académico</span>
      </NuxtLink>

      <UCard class="shadow-xl">
        <slot />
      </UCard>
    </div>
  </div>
</template>
