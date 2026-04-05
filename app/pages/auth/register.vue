<script setup lang="ts">
useSeoMeta({
  title: 'Registrarse - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

const { register, loading } = useRegister()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  type: 'STUDENT' as 'STUDENT' | 'TEACHER',
  curp: '',
  enrollmentNumber: '',
  rfc: '',
  employeeNumber: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const showConfirmation = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  if (form.value.type === 'STUDENT' && !form.value.enrollmentNumber) {
    errorMessage.value = 'Número de matrícula es requerido para estudiantes'
    return
  }

  if (form.value.type === 'TEACHER' && !form.value.employeeNumber) {
    errorMessage.value = 'Número de empleado es requerido para profesores'
    return
  }

  try {
    const payload = {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
      type: form.value.type,
      curp: form.value.type === 'STUDENT' ? form.value.curp : undefined,
      enrollmentNumber: form.value.type === 'STUDENT' ? form.value.enrollmentNumber : undefined,
      rfc: form.value.type === 'TEACHER' ? form.value.rfc : undefined,
      employeeNumber: form.value.type === 'TEACHER' ? form.value.employeeNumber : undefined
    }

    const response = await register(payload)

    if (response.success) {
      successMessage.value = response.message
      showConfirmation.value = true
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al registrar usuario'
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
    
    <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-4">
      {{ errorMessage }}
    </UAlert>

    <UAlert v-if="successMessage" color="success" variant="soft" class="mb-4">
      {{ successMessage }}
    </UAlert>

    <div v-if="showConfirmation" class="text-center py-4">
      <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-500 mb-4" />
      <p class="text-lg mb-4">¡Registro exitoso!</p>
      <UButton @click="navigateTo('/auth/login')">
        Ir a Iniciar Sesión
      </UButton>
    </div>

    <UForm v-else @submit.prevent="handleRegister" class="space-y-4">
      <UFormField label="Usuario" name="username">
        <UInput
          v-model="form.username"
          placeholder="usuario123"
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

      <UFormField label="Tipo de Usuario" name="type">
        <USelect
          v-model="form.type"
          :options="[
            { label: 'Estudiante', value: 'STUDENT' },
            { label: 'Profesor', value: 'TEACHER' }
          ]"
          size="lg"
        />
      </UFormField>

      <template v-if="form.type === 'STUDENT'">
        <UFormField label="CURP" name="curp">
          <UInput
            v-model="form.curp"
            placeholder="XAXX010101HNEXXXX18"
            icon="i-lucide-id-card"
            size="lg"
          />
        </UFormField>

        <UFormField label="Número de Matrícula" name="enrollmentNumber">
          <UInput
            v-model="form.enrollmentNumber"
            placeholder="2021001234"
            icon="i-lucide-graduation-cap"
            size="lg"
          />
        </UFormField>
      </template>

      <template v-else>
        <UFormField label="RFC" name="rfc">
          <UInput
            v-model="form.rfc"
            placeholder="XAXX010101XXX"
            icon="i-lucide-building2"
            size="lg"
          />
        </UFormField>

        <UFormField label="Número de Empleado" name="employeeNumber">
          <UInput
            v-model="form.employeeNumber"
            placeholder="EMP001234"
            icon="i-lucide-briefcase"
            size="lg"
          />
        </UFormField>
      </template>

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
