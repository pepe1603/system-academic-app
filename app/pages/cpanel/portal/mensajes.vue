<script setup lang="ts">
useSeoMeta({ title: 'Mensajes de Contacto - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getAllMessages, markAsRead, respondMessage, loading } = usePortalAdmin()

const { data: messages, refresh } = await useAsyncData('contact-messages', () => getAllMessages())

const selectedMessage = ref<string | null>(null)
const responseText = ref('')

const handleMarkAsRead = async (id: string) => {
  await markAsRead(id)
  refresh()
}

const handleRespond = async () => {
  if (!selectedMessage.value || !responseText.value) return
  
  const success = await respondMessage(selectedMessage.value, responseText.value)
  if (success) {
    responseText.value = ''
    selectedMessage.value = null
    refresh()
  }
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Mensajes de Contacto</h1>
    
    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
    </div>
    
    <div v-else-if="messages?.length" class="space-y-4">
      <UCard v-for="msg in messages" :key="msg.id">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <UBadge :color="msg.isRead ? 'gray' : 'primary'">
                {{ msg.isRead ? 'Leído' : 'Sin leer' }}
              </UBadge>
              <span class="font-semibold">{{ msg.fullName }}</span>
            </div>
            
            <p class="text-sm text-muted-foreground mb-1">{{ msg.email }}</p>
            <p class="text-sm font-medium mb-2">{{ msg.subject }}</p>
            <p class="text-sm">{{ msg.message }}</p>
            
            <div class="text-xs text-muted-foreground mt-2">
              {{ formatDate(msg.createdAt) }}
            </div>
            
            <div v-if="msg.isResponded" class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p class="text-sm font-medium text-green-700 dark:text-green-400">Respuesta:</p>
              <p class="text-sm">{{ msg.response }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ msg.responseDate ? formatDate(msg.responseDate) : '' }}
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 ml-4">
            <UButton
              v-if="!msg.isRead"
              variant="outline"
              size="sm"
              @click="handleMarkAsRead(msg.id)"
            >
              Marcar leído
            </UButton>
            
            <UButton
              variant="ghost"
              size="sm"
              @click="selectedMessage = msg.id"
            >
              Responder
            </UButton>
          </div>
        </div>
        
        <div v-if="selectedMessage === msg.id" class="mt-4 pt-4 border-t">
          <UFormField label="Respuesta" name="response">
            <UTextarea v-model="responseText" placeholder="Escribe tu respuesta..." :rows="3" />
          </UFormField>
          <div class="flex gap-2 mt-2">
            <UButton size="sm" @click="handleRespond" :loading="loading">
              Enviar respuesta
            </UButton>
            <UButton size="sm" variant="ghost" @click="selectedMessage = null">
              Cancelar
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
    
    <div v-else class="text-center py-12 text-muted-foreground">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 mb-4" />
      <p>No hay mensajes de contacto</p>
    </div>
  </div>
</template>