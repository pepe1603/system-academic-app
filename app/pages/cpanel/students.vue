<script setup lang="ts">
useSeoMeta({
  title: 'Estudiantes - Panel de Control'
})

definePageMeta({
  layout: 'c-panel'
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Estudiantes</h1>
      <UButton icon="i-lucide-plus">Agregar Estudiante</UButton>
    </div>

    <UCard>
      <div class="text-center py-12 text-muted-foreground">
        <UIcon name="i-lucide-user-round" class="w-16 h-16 mb-4 opacity-50" />
        <p>Módulo de gestión de estudiantes en desarrollo</p>
      </div>
    </UCard>
  </div>
</template>
