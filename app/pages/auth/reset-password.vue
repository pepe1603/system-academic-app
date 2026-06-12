<script setup lang="ts">
useSeoMeta({
  title: 'Recuperar Contraseña - Sistema Académico'
})

definePageMeta({
  layout: 'auth'
})

type Step = 1 | 2 | 3 | 4

const email = ref('')
const otpCode = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const errorMessage = ref('')
const cooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const currentStep = ref<Step>(1)

const otpRefs = ref<HTMLInputElement[]>([])

const steps = [
  { step: 1, label: 'Email', icon: 'i-lucide-mail' },
  { step: 2, label: 'Código', icon: 'i-lucide-shield-check' },
  { step: 3, label: 'Nueva Clave', icon: 'i-lucide-lock' },
  { step: 4, label: 'Listo', icon: 'i-lucide-check-circle' }
]

const isStepActive = (step: number) => currentStep.value === step
const isStepCompleted = (step: number) => currentStep.value > step

const fullOtp = computed(() => otpCode.value.join(''))

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value.length > 1) {
    const chars = value.slice(0, 6 - index).split('')
    chars.forEach((char, i) => {
      if (index + i < 6) {
        otpCode.value[index + i] = char
      }
    })
    const nextIndex = Math.min(index + chars.length, 5)
    nextTick(() => otpRefs.value[nextIndex]?.focus())
    return
  }

  otpCode.value[index] = value.slice(-1)

  if (value && index < 5) {
    nextTick(() => otpRefs.value[index + 1]?.focus())
  }
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpCode.value[index] && index > 0) {
    otpCode.value[index - 1] = ''
    nextTick(() => otpRefs.value[index - 1]?.focus())
  }
}

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const chars = pastedData.replace(/\D/g, '').slice(0, 6).split('')

  chars.forEach((char, i) => {
    otpCode.value[i] = char
  })

  const lastFilledIndex = Math.min(chars.length, 5)
  nextTick(() => otpRefs.value[lastFilledIndex]?.focus())
}

const startCooldown = () => {
  cooldown.value = 60
  cooldownInterval = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

const handleRequestRecovery = async () => {
  if (!email.value) {
    errorMessage.value = 'Por favor ingresa tu correo electrónico'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/recovery', {
      method: 'POST',
      body: { email: email.value }
    })
    currentStep.value = 2
    startCooldown()
  } catch {
    currentStep.value = 2
    startCooldown()
  } finally {
    loading.value = false
  }
}

const handleResendCode = async () => {
  if (cooldown.value > 0 || !email.value) return

  resendLoading.value = true
  try {
    await $fetch('/api/recovery', {
      method: 'POST',
      body: { email: email.value }
    })
    startCooldown()
  } catch {
    startCooldown()
  } finally {
    resendLoading.value = false
  }
}

const handleVerifyOtp = async () => {
  if (fullOtp.value.length !== 6) {
    errorMessage.value = 'Ingresa el código completo de 6 dígitos'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/verify-otp', {
      method: 'POST',
      body: {
        email: email.value,
        code: fullOtp.value,
        purpose: 'PASSWORD_RECOVERY'
      }
    })
    currentStep.value = 3
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }, message?: string }
    errorMessage.value = err.data?.message || err.message || 'Código inválido'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (newPassword.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        token: fullOtp.value,
        newPassword: newPassword.value
      }
    })
    currentStep.value = 4
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }, message?: string }
    errorMessage.value = err.data?.message || err.message || 'Error al restablecer contraseña'
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-center mb-2">
      Recuperar Contraseña
    </h2>

    <div class="flex items-center justify-center gap-2 mb-6">
      <template v-for="(s, index) in steps" :key="s.step">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
            :class="[
              isStepActive(s.step) ? 'bg-primary text-primary-foreground' : '',
              isStepCompleted(s.step) && !isStepActive(s.step) ? 'bg-green-500 text-white' : '',
              !isStepActive(s.step) && !isStepCompleted(s.step) ? 'bg-gray-200 text-gray-500 dark:bg-gray-700' : ''
            ]"
          >
            <UIcon v-if="isStepCompleted(s.step) && !isStepActive(s.step)" name="i-lucide-check" class="w-4 h-4" />
            <UIcon v-else :name="s.icon" class="w-4 h-4" />
          </div>
          <span class="text-sm hidden sm:inline">{{ s.label }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="w-4 h-px bg-gray-300 dark:bg-gray-600" />
      </template>
    </div>

    <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-4" :title="errorMessage" />

    <template v-if="currentStep === 1">
      <p class="text-muted-foreground text-center mb-6">
        Ingresa tu correo y te enviaremos un código de verificación.
      </p>

      <UForm @submit.prevent="handleRequestRecovery" class="space-y-4">
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
          Enviar Código
        </UButton>
      </UForm>
    </template>

    <template v-else-if="currentStep === 2">
      <p class="text-muted-foreground text-center mb-6">
        Ingresa el código de 6 dígitos enviado a<br>
        <strong>{{ email }}</strong>
      </p>

      <div class="flex justify-center gap-2 mb-6">
        <input
          v-for="(_, index) in 6"
          :key="index"
          :ref="(el: HTMLInputElement | null) => { if (el) otpRefs[index] = el }"
          type="text"
          inputmode="numeric"
          maxlength="1"
          :value="otpCode[index]"
          @input="handleOtpInput(index, $event)"
          @keydown="handleOtpKeydown(index, $event)"
          @paste="handleOtpPaste"
          @focus="($event.target as HTMLInputElement).select()"
          class="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <UButton
        block
        size="lg"
        :loading="loading"
        :disabled="fullOtp.length !== 6"
        @click="handleVerifyOtp"
      >
        Verificar Código
      </UButton>

      <div class="mt-4 text-center">
        <UButton
          variant="ghost"
          size="sm"
          :loading="resendLoading"
          :disabled="cooldown > 0"
          @click="handleResendCode"
        >
          <template v-if="cooldown > 0">
            Reenviar código en {{ cooldown }}s
          </template>
          <template v-else>
            Reenviar código
          </template>
        </UButton>
      </div>
    </template>

    <template v-else-if="currentStep === 3">
      <p class="text-muted-foreground text-center mb-6">
        Código verificado. Ahora ingresa tu nueva contraseña.
      </p>

      <UForm @submit.prevent="handleResetPassword" class="space-y-4">
        <UFormField label="Nueva Contraseña" name="newPassword">
          <UInput
            v-model="newPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            icon="i-lucide-lock"
            size="lg"
          />
        </UFormField>

        <UFormField label="Confirmar Contraseña" name="confirmPassword">
          <UInput
            v-model="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            icon="i-lucide-lock"
            size="lg"
          />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading">
          Restablecer Contraseña
        </UButton>
      </UForm>
    </template>

    <template v-else-if="currentStep === 4">
      <div class="text-center py-6">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-green-500" />
        </div>
        <h3 class="text-xl font-bold mb-2">¡Contraseña Restablecida!</h3>
        <p class="text-muted-foreground mb-6">
          Tu contraseña ha sido actualizada exitosamente.
        </p>
        <UButton to="/auth/login" size="lg">
          Iniciar Sesión
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
