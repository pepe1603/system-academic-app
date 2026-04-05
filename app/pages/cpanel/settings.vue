<script setup lang="ts">
useSeoMeta({
  title: 'Configuración - Panel de Control'
})

definePageMeta({
  layout: 'c-panel'
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Configuración</h1>
    </div>

    <UCard>
      <div class="text-center py-12 text-muted-foreground">
        <UIcon name="i-lucide-settings" class="w-16 h-16 mb-4 opacity-50" />
        <p>Módulo de configuración en desarrollo</p>
      </div>
    </UCard>
  </div>
</template>
