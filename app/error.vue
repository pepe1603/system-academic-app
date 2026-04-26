<script setup lang="ts">
useSeoMeta({ title: 'Página no encontrada' })

defineProps<{
  error: {
    statusCode: number
    statusMessage: string
    message?: string
  }
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="mb-8">
        <h1 class="text-[150px] font-bold text-primary/20 leading-none">
          {{ error?.statusCode || '4XX' }}
        </h1>
        <p class="text-2xl font-bold -mt-16 mb-4">
          {{ error?.statusMessage || 'Página no encontrada' }}
        </p>
      </div>

      <p class="text-muted-foreground text-lg mb-8">
        {{ error?.message || 'Lo sentimos, la página que buscas no existe o ha sido movida.' }}
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <UButton size="lg" @click="handleError">
          <UIcon name="i-lucide-home" class="w-5 h-5 mr-2" />
          Volver al inicio
        </UButton>
        <UButton size="lg" variant="outline" to="/portal">
          <UIcon name="i-lucide-school" class="w-5 h-5 mr-2" />
          Ver Portal
        </UButton>
      </div>
    </div>

    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
    </div>
  </div>
</template>