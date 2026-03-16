<script setup lang="ts">
useSeoMeta({
  title: 'Usuarios - Panel de Control'
})

definePageMeta({
  layout: 'cPanel'
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Usuarios</h1>
      <UButton icon="i-lucide-plus">Agregar Usuario</UButton>
    </div>

    <UCard>
      <div class="text-center py-12 text-muted-foreground">
        <UIcon name="i-lucide-users" class="w-16 h-16 mb-4 opacity-50" />
        <p>Módulo de gestión de usuarios en desarrollo</p>
      </div>
    </UCard>
  </div>
</template>
