<script setup lang="ts">
useSeoMeta({
  title: 'Registrarse - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const handleRegister = async () => {
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
    <h2 class="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
    
    <UForm @submit.prevent="handleRegister" class="space-y-4">
      <UFormField label="Nombre Completo" name="name">
        <UInput
          v-model="form.name"
          placeholder="Juan Pérez"
          icon="i-lucide-user"
          size="lg"
        />
      </UFormField>

      <UFormField label="Correo Electrónico" name="email">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="correo@institucion.edu"
          icon="i-lucide-mail"
          size="lg"
        />
      </UFormField>

      <UFormField label="Contraseña" name="password">
        <UInput
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          icon="i-lucide-lock"
          size="lg"
        />
      </UFormField>

      <UFormField label="Confirmar Contraseña" name="confirmPassword">
        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="••••••••"
          icon="i-lucide-lock"
          size="lg"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="loading">
        Crear Cuenta
      </UButton>
    </UForm>

    <div class="mt-6 text-center">
      <p class="text-muted-foreground">
        ¿Ya tienes una cuenta?
        <NuxtLink to="/auth/login" class="text-primary-500 hover:underline">
          Inicia sesión
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
