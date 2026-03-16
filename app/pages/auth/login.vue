<script setup lang="ts">
useSeoMeta({
  title: 'Iniciar Sesión - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    await navigateTo('/cpanel')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
    
    <UForm @submit.prevent="handleLogin" class="space-y-4">
      <UFormField label="Correo Electrónico" name="email">
        <UInput
          v-model="email"
          type="email"
          placeholder="correo@institucion.edu"
          icon="i-lucide-mail"
          size="lg"
        />
      </UFormField>

      <UFormField label="Contraseña" name="password">
        <UInput
          v-model="password"
          type="password"
          placeholder="••••••••"
          icon="i-lucide-lock"
          size="lg"
        />
      </UFormField>

      <div class="flex justify-between items-center">
        <UCheckbox label="Recordarme" />
        <NuxtLink to="/auth/reset-password" class="text-sm text-primary-500 hover:underline">
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>

      <UButton type="submit" block size="lg" :loading="loading">
        Iniciar Sesión
      </UButton>
    </UForm>

    <div class="mt-6 text-center">
      <p class="text-muted-foreground">
        ¿No tienes una cuenta?
        <NuxtLink to="/auth/register" class="text-primary-500 hover:underline">
          Regístrate aquí
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
