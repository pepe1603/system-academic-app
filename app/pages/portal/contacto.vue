<script setup lang="ts">
useSeoMeta({
  title: 'Contacto - Portal Público',
  description: 'Contáctanos para resolver tus dudas'
})

definePageMeta({
  layout: 'portal'
})

const { sendContactMessage, loading, error } = usePortalContent()

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const success = ref(false)
const errorMessage = ref('')
const showSuccessAnimation = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  const result = await sendContactMessage(form.value)
  if (result) {
    success.value = true
    showSuccessAnimation.value = true
    form.value = { fullName: '', email: '', phone: '', subject: '', message: '' }
    setTimeout(() => {
      showSuccessAnimation.value = false
    }, 3000)
  } else {
    errorMessage.value = error.value || 'Error al enviar el mensaje. Por favor intenta de nuevo.'
  }
}

const resetForm = () => {
  success.value = false
  errorMessage.value = ''
  form.value = { fullName: '', email: '', phone: '', subject: '', message: '' }
}
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:py-16 lg:py-20 max-w-5xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Contacto</h1>
      <p class="text-muted-foreground text-lg md:text-xl">¿Tienes alguna pregunta? ¡Escríbenos!</p>
    </div>

    <div v-if="success" class="max-w-md mx-auto">
      <UCard class="text-center border-2 border-green-500/30 bg-green-500/5">
        <div class="py-8">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
            <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-green-500" />
          </div>
          <h2 class="text-2xl font-bold text-green-600 mb-2">¡Mensaje enviado!</h2>
          <p class="text-muted-foreground mb-6">Notre equipo te responderá a la brevedad posible.</p>
          <UButton variant="outline" @click="resetForm">
            <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
            Enviar otro mensaje
          </UButton>
        </div>
      </UCard>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <UCard class="p-6 md:p-8">
          <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-6" title="Error">
            <p>{{ errorMessage }}</p>
          </UAlert>

          <UForm @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Nombre completo" name="fullName" required>
                <UInput v-model="form.fullName" placeholder="Juan Pérez" size="lg" />
              </UFormField>

              <UFormField label="Correo electrónico" name="email" required>
                <UInput v-model="form.email" type="email" placeholder="juan@email.com" size="lg" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Teléfono (opcional)" name="phone">
                <UInput v-model="form.phone" type="tel" placeholder="+52 999 123 4567" size="lg" />
              </UFormField>

              <UFormField label="Asunto" name="subject" required>
                <UInput v-model="form.subject" placeholder="Consulta sobre..." size="lg" />
              </UFormField>
            </div>

            <UFormField label="Mensaje" name="message" required>
              <UTextarea v-model="form.message" placeholder="Escribe tu mensaje en detalle..." :rows="5" />
            </UFormField>

            <UButton type="submit" size="lg" class="w-full md:w-auto" :loading="loading">
              <UIcon name="i-lucide-send" class="w-5 h-5 mr-2" />
              Enviar mensaje
            </UButton>
          </UForm>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard class="bg-primary/5 border-primary/20">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-lightbulb" class="w-5 h-5 text-primary" />
              <h3 class="font-bold">Consejos</h3>
            </div>
          </template>
          <div class="space-y-3 text-sm">
            <p class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Incluye tu matrícula para respuestas más rápidas</span>
            </p>
            <p class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Describe tu consulta con detalles</span>
            </p>
            <p class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Verifica tu correo antes de enviar</span>
            </p>
          </div>
        </UCard>

        <UCard class="bg-amber-500/5 border-amber-500/20">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-amber-500" />
              <h3 class="font-bold">¡Próximamente!</h3>
            </div>
          </template>
          <p class="text-sm text-muted-foreground">
            Estaremos implementando chat en vivo para atención inmediata. ¡Mantente atento!
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>