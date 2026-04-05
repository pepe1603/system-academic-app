<script setup lang="ts">
useSeoMeta({
  title: 'Recuperar Contraseña - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

const handleReset = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/auth/recovery', {
      method: 'POST',
      body: { email: email.value }
    })
    submitted.value = true
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al solicitar recuperación'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <template v-if="!submitted">
      <h2 class="text-2xl font-bold text-center mb-2">Recuperar Contraseña</h2>
      <p class="text-muted-foreground text-center mb-6">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      
      <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-4">
        {{ errorMessage }}
      </UAlert>
      
      <UForm @submit.prevent="handleReset" class="space-y-4">
        <UFormField label="Correo Electrónico" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="correo@institucion.edu"
            icon="i-lucide-mail"
            size="lg"
          />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading">
          Enviar Enlace de Recuperación
        </UButton>
      </UForm>
    </template>

    <template v-else>
      <div class="text-center">
        <UIcon name="i-lucide-mail-check" class="w-16 h-16 text-green-500 mb-4" />
        <h2 class="text-2xl font-bold mb-2">Correo Enviado</h2>
        <p class="text-muted-foreground mb-6">
          Hemos enviado un enlace de recuperación a <strong>{{ email }}</strong>
        </p>
        <UButton to="/auth/login" variant="outline">
          Volver a Iniciar Sesión
        </UButton>
      </div>
    </template>

    <div class="mt-6 text-center">
      <NuxtLink to="/auth/login" class="text-primary-500 hover:underline">
        ← Volver a Iniciar Sesión
      </NuxtLink>
    </div>
  </div>
</template>
