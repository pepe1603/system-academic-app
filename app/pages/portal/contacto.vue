<script setup lang="ts">
useSeoMeta({
  title: 'Contacto - Portal Público',
  description: 'Contáctanos para resolver tus dudas'
})

definePageMeta({
  layout: 'portal'
})

const { sendContactMessage, loading } = usePortal()

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const success = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  const result = await sendContactMessage(form.value)
  if (result) {
    success.value = true
    form.value = { fullName: '', email: '', phone: '', subject: '', message: '' }
  } else {
    errorMessage.value = 'Error al enviar el mensaje. Por favor intenta de nuevo.'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-2">Contacto</h1>
    <p class="text-muted-foreground mb-8">
      ¿Tienes alguna pregunta? ¡Escríbenos! Notre equipo te responderá pronto.
    </p>

    <UAlert v-if="success" color="success" variant="soft" class="mb-6" title="Mensaje enviado correctamente" />

    <UAlert v-if="errorMessage" color="error" variant="soft" class="mb-6" :title="errorMessage" />

    <UForm v-if="!success" @submit.prevent="handleSubmit" class="space-y-4">
      <UFormField label="Nombre completo" name="fullName" required>
        <UInput v-model="form.fullName" placeholder="Juan Pérez" size="lg" />
      </UFormField>

      <UFormField label="Correo electrónico" name="email" required>
        <UInput v-model="form.email" type="email" placeholder="juan@email.com" size="lg" />
      </UFormField>

      <UFormField label="Teléfono (opcional)" name="phone">
        <UInput v-model="form.phone" type="tel" placeholder="+52 999 123 4567" size="lg" />
      </UFormField>

      <UFormField label="Asunto" name="subject" required>
        <UInput v-model="form.subject" placeholder="Consulta sobre..." size="lg" />
      </UFormField>

      <UFormField label="Mensaje" name="message" required>
        <UTextarea v-model="form.message" placeholder="Escribe tu mensaje..." :rows="5" />
      </UFormField>

      <UButton type="submit" size="lg" block :loading="loading">
        <UIcon name="i-lucide-send" class="w-5 h-5 mr-2" />
        Enviar mensaje
      </UButton>
    </UForm>
  </div>
</template>