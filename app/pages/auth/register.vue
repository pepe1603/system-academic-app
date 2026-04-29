<script setup lang="ts">
useSeoMeta({
  title: 'Registrarse - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

const { step, loading, error, initRegistration, verifyRegistration, reset } = useRegistration()

const form = ref({
  curp: '',
  email: '',
  otp: ''
})

const errorMessage = ref('')
const successMessage = ref('')

const handleInit = async () => {
  errorMessage.value = ''
  
  if (!form.value.curp || form.value.curp.length !== 18) {
    errorMessage.value = 'CURP debe tener 18 caracteres'
    return
  }

  if (!form.value.email) {
    errorMessage.value = 'Email es requerido'
    return
  }

  try {
    const response = await initRegistration({
      curp: form.value.curp.toUpperCase(),
      email: form.value.email.toLowerCase()
    })

    if (response.success) {
      errorMessage.value = ''
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al iniciar registro'
  }
}

const handleVerify = async () => {
  errorMessage.value = ''
  
  if (!form.value.otp || form.value.otp.length !== 6) {
    errorMessage.value = 'Código debe tener 6 dígitos'
    return
  }

  try {
    const response = await verifyRegistration({
      curp: form.value.curp.toUpperCase(),
      otp: form.value.otp
    })

    if (response.success) {
      successMessage.value = response.message || '¡Registro exitoso! Revisa tu email para los datos de acceso.'
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al verificar código'
  }
}

const handleReset = () => {
  form.value = { curp: '', email: '', otp: '' }
  errorMessage.value = ''
  successMessage.value = ''
  reset()
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-6">Registro en el Sistema</h2>
    
    <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-4">
      {{ errorMessage }}
    </UAlert>

    <UAlert v-if="successMessage" color="success" variant="soft" class="mb-4">
      {{ successMessage }}
    </UAlert>

    <!-- Paso 1: Iniciar registro -->
    <div v-if="step === 1 && !successMessage">
      <div class="mb-4 p-4 bg-primary/10 rounded-lg">
        <p class="text-sm text-primary">
          <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
          Paso 1: Inicia tu registro proporcionando tu CURP y correo institucional.
        </p>
      </div>

      <UForm @submit.prevent="handleInit" class="space-y-4">
        <UFormField label="CURP" name="curp">
          <UInput
            v-model="form.curp"
            placeholder="XAXX010101HNEXXXX18"
            icon="i-lucide-id-card"
            size="lg"
            :maxlength="18"
          />
        </UFormField>

        <UFormField label="Correo Institucional" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="tu.email@institucion.edu"
            icon="i-lucide-mail"
            size="lg"
          />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading">
          Continuar
        </UButton>
      </UForm>
    </div>

    <!-- Paso 2: Verificar código -->
    <div v-if="step === 2 && !successMessage">
      <div class="mb-4 p-4 bg-primary/10 rounded-lg">
        <p class="text-sm text-primary">
          <UIcon name="i-lucide-mail" class="w-4 h-4 inline mr-1" />
          Se ha enviado un código de verificaci��n a {{ form.email }}
        </p>
      </div>

      <UForm @submit.prevent="handleVerify" class="space-y-4">
        <UFormField label="Código de Verificación" name="otp">
          <UInput
            v-model="form.otp"
            placeholder="123456"
            icon="i-lucide-shield-check"
            size="lg"
            :maxlength="6"
            inputmode="numeric"
          />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading">
          Verificar y Crear Cuenta
        </UButton>

        <UButton variant="ghost" block size="sm" @click="handleReset">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" />
          Volver
        </UButton>
      </UForm>
    </div>

    <!-- Éxito -->
    <div v-if="successMessage" class="text-center py-4">
      <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-500 mb-4" />
      <p class="text-lg mb-4">¡Registro completado!</p>
      <UButton @click="navigateTo('/auth/login')">
        Ir a Iniciar Sesión
      </UButton>
    </div>

    <div class="mt-6 text-center">
      <p class="text-muted-foreground">
        ¿Ya tienes cuenta?
        <NuxtLink to="/auth/login" class="text-primary hover:underline">
          Inicia sesión
        </NuxtLink>
      </p>
    </div>
  </div>
</template>