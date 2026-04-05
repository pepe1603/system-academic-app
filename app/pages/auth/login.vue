<script setup lang="ts">
useSeoMeta({
  title: 'Iniciar Sesión - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

const { login, loading } = useAuth()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const twoFactorCode = ref('')
const requiresTwoFactor = ref(false)
const tempToken = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    const response = await login({
      username: email.value,
      password: password.value
    })

    if (response.data && 'requiresTwoFactor' in response.data && response.data.requiresTwoFactor) {
      requiresTwoFactor.value = true
      tempToken.value = response.data.tempToken
    } else if (response.success) {
      await navigateTo('/cpanel')
    }
  } catch (error: unknown) {
    const err = error as { 
      statusCode?: number
      statusMessage?: string
      message?: string
      data?: { message?: string }
    }
    
    console.log('[LOGIN] Error capturado - estructura completa:', JSON.stringify(error, null, 2))
    console.log('[LOGIN] message:', err.message)
    console.log('[LOGIN] statusMessage:', err.statusMessage)
    console.log('[LOGIN] data:', err.data)
    
    const message = err.data?.message || err.message || err.statusMessage || 'Credenciales inválidas'
    console.log('[LOGIN] Mensaje a mostrar:', message)
    errorMessage.value = message
    console.log('[LOGIN] errorMessage.value después de asignar:', errorMessage.value)
  }
}

const handleVerifyTwoFactor = async () => {
  errorMessage.value = ''
  try {
    const { verifyTwoFactor } = useAuth()
    await verifyTwoFactor(twoFactorCode.value)
    await navigateTo('/cpanel')
  } catch (error: unknown) {
    const errorObj = error as { data?: { message?: string } }
    errorMessage.value = errorObj.data?.message || 'Código inválido'
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-6">
      Iniciar Sesión
    </h2>
    
    <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-4" :title="errorMessage" />

    <UForm v-if="!requiresTwoFactor" @submit.prevent="handleLogin" class="space-y-4">
      <UFormField label="Usuario" name="username">
        <UInput
          v-model="email"
          type="text"
          placeholder="usuario"
          icon="i-lucide-user"
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

    <UForm v-else @submit.prevent="handleVerifyTwoFactor" class="space-y-4">
      <UAlert color="info" variant="soft" class="mb-4">
        Ingrese el código de verificación de su aplicación autenticadora
      </UAlert>

      <UFormField label="Código 2FA" name="code">
        <UInput
          v-model="twoFactorCode"
          type="text"
          placeholder="123456"
          icon="i-lucide-shield-check"
          size="lg"
          maxlength="6"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="loading">
        Verificar
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
