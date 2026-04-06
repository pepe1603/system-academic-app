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
const twoFactorCode = ref(['', '', '', '', '', ''])
const backupCode = ref('')
const requiresTwoFactor = ref(false)
const tempToken = ref('')
const showBackupOption = ref(false)
const resendLoading = ref(false)
const cooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const otpRefs = ref<HTMLInputElement[]>([])

const fullTwoFactorCode = computed(() => twoFactorCode.value.join(''))

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value.length > 1) {
    const chars = value.slice(0, 6 - index).split('')
    chars.forEach((char, i) => {
      if (index + i < 6) {
        twoFactorCode.value[index + i] = char
      }
    })
    const nextIndex = Math.min(index + chars.length, 5)
    nextTick(() => otpRefs.value[nextIndex]?.focus())
    return
  }

  twoFactorCode.value[index] = value.slice(-1)

  if (value && index < 5) {
    nextTick(() => otpRefs.value[index + 1]?.focus())
  }
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !twoFactorCode.value[index] && index > 0) {
    twoFactorCode.value[index - 1] = ''
    nextTick(() => otpRefs.value[index - 1]?.focus())
  }
}

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const chars = pastedData.replace(/\D/g, '').slice(0, 6).split('')

  chars.forEach((char, i) => {
    twoFactorCode.value[i] = char
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
      startCooldown()
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
    const message = err.data?.message || err.message || err.statusMessage || 'Credenciales inválidas'
    errorMessage.value = message
  }
}

const handleVerifyTwoFactor = async () => {
  errorMessage.value = ''
  const code = showBackupOption.value ? backupCode.value : fullTwoFactorCode.value
  
  if (!showBackupOption.value && fullTwoFactorCode.value.length !== 6) {
    errorMessage.value = 'Ingresa el código completo de 6 dígitos'
    return
  }
  
  if (showBackupOption.value && !backupCode.value) {
    errorMessage.value = 'Ingresa tu código de respaldo'
    return
  }

  try {
    const { verifyTwoFactor } = useAuth()
    await verifyTwoFactor(code)
    await navigateTo('/cpanel')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }, message?: string }
    errorMessage.value = err.data?.message || err.message || 'Código inválido'
  }
}

const handleResendCode = async () => {
  if (cooldown.value > 0) return

  resendLoading.value = true
  try {
    await $fetch('/api/resend-2fa', {
      method: 'POST',
      body: { tempToken: tempToken.value }
    })
    startCooldown()
  } catch {
    startCooldown()
  } finally {
    resendLoading.value = false
  }
}

const toggleBackupOption = () => {
  showBackupOption.value = !showBackupOption.value
  twoFactorCode.value = ['', '', '', '', '', '']
  backupCode.value = ''
  nextTick(() => {
    if (showBackupOption.value) {
      const backupInput = document.querySelector<HTMLInputElement>('#backup-code')
      backupInput?.focus()
    } else {
      otpRefs.value[0]?.focus()
    }
  })
}

const goBack = () => {
  requiresTwoFactor.value = false
  twoFactorCode.value = ['', '', '', '', '', '']
  backupCode.value = ''
  errorMessage.value = ''
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
}

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
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

    <template v-else>
      <UButton variant="ghost" size="sm" @click="goBack" class="mb-4 -ml-2">
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" />
        Volver
      </UButton>

      <div class="text-center mb-6">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <UIcon name="i-lucide-shield-check" class="w-8 h-8 text-primary" />
        </div>
        <h3 class="font-semibold mb-1">Verificación de Dos Factores</h3>
        <p class="text-sm text-muted-foreground">
          Ingresa el código de tu aplicación autenticadora
        </p>
      </div>

      <template v-if="!showBackupOption">
        <div class="flex justify-center gap-2 mb-4">
          <input
            v-for="(_, index) in 6"
            :key="index"
            :ref="(el) => { if (el) otpRefs[index] = el as HTMLInputElement }"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :value="twoFactorCode[index]"
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
          :disabled="fullTwoFactorCode.length !== 6"
          @click="handleVerifyTwoFactor"
        >
          Verificar
        </UButton>

        <div class="mt-4 text-center space-y-2">
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

      <template v-else>
        <UForm @submit.prevent="handleVerifyTwoFactor" class="space-y-4">
          <UFormField label="Código de Respaldo" name="backupCode">
            <UInput
              id="backup-code"
              v-model="backupCode"
              type="text"
              placeholder="ABCD-1234"
              icon="i-lucide-key"
              size="lg"
              class="font-mono uppercase"
            />
          </UFormField>

          <UButton type="submit" block size="lg" :loading="loading">
            Verificar
          </UButton>
        </UForm>
      </template>

      <div class="mt-4 text-center">
        <button
          type="button"
          class="text-sm text-primary-500 hover:underline"
          @click="toggleBackupOption"
        >
          {{ showBackupOption ? '← Usar código de la app' : '¿No tienes acceso? Usa código de respaldo' }}
        </button>
      </div>
    </template>

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
