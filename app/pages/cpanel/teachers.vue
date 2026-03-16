<script setup lang="ts">
useSeoMeta({
  title: 'Docentes - Panel de Control'
})

definePageMeta({
  layout: 'cPanel'
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Docentes</h1>
      <UButton icon="i-lucide-plus">Agregar Docente</UButton>
    </div>

    <UCard>
      <div class="text-center py-12 text-muted-foreground">
        <UIcon name="i-lucide-chalkboard-teacher" class="w-16 h-16 mb-4 opacity-50" />
        <p>Módulo de gestión de docentes en desarrollo</p>
      </div>
    </UCard>
  </div>
</template>
