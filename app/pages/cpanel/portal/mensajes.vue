<script setup lang="ts">
useSeoMeta({ title: 'Buzón de Mensajes - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getAllMessages, markAsRead, respondMessage, loading } = usePortalContentAdmin()

const { data: messages, refresh } = await useAsyncData('contact-messages', () => getAllMessages())

const selectedMessage = ref<string | null>(null)
const responseText = ref('')

const activeMessage = computed(() => {
  if (!selectedMessage.value || !messages.value) return null
  return messages.value.find(m => m.id === selectedMessage.value)
})

const handleSelectMessage = (id: string) => {
  selectedMessage.value = id
  const msg = messages.value?.find(m => m.id === id)
  if (msg && !msg.isRead) {
    markAsRead(id)
    refresh()
  }
}

const handleSendResponse = async () => {
  if (!selectedMessage.value || !responseText.value) return

  const success = await respondMessage(selectedMessage.value, responseText.value)
  if (success) {
    responseText.value = ''
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

const formatTime = (date: string) => new Date(date).toLocaleTimeString('es-MX', {
  hour: '2-digit',
  minute: '2-digit'
})

const unreadCount = computed(() => messages.value?.filter(m => !m.isRead).length || 0)
</script>

<template>
  <div class="h-[calc(100vh-140px)] flex gap-6">
    <div class="w-1/3 border rounded-lg flex flex-col bg-background">
      <div class="p-4 border-b">
        <h2 class="font-semibold text-lg">Buzón de Entrada</h2>
        <p class="text-sm text-muted-foreground">
          {{ unreadCount }} mensaje{{ unreadCount !== 1 ? 's' : '' }} sin leer
        </p>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
          :class="[
            selectedMessage === msg.id ? 'bg-primary/10' : '',
            !msg.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
          ]"
          @click="handleSelectMessage(msg.id)"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span class="text-sm font-medium text-primary">
                {{ msg.fullName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium truncate">{{ msg.fullName }}</span>
                <span class="text-xs text-muted-foreground">{{ formatTime(msg.createdAt) }}</span>
              </div>
              <p class="text-sm text-muted-foreground truncate">{{ msg.subject }}</p>
              <p class="text-xs text-muted-foreground mt-1 line-clamp-1">{{ msg.email }}</p>
            </div>
            <div v-if="!msg.isRead" class="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 border rounded-lg flex flex-col bg-background">
      <template v-if="activeMessage">
        <div class="p-4 border-b">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span class="text-lg font-medium text-primary">
                {{ activeMessage.fullName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <h3 class="font-semibold text-lg">{{ activeMessage.fullName }}</h3>
              <p class="text-sm text-muted-foreground">{{ activeMessage.email }}</p>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <UBadge :color="activeMessage.isRead ? 'neutral' : 'primary'">
                {{ activeMessage.isRead ? 'Leído' : 'Sin leer' }}
              </UBadge>
              <UBadge v-if="activeMessage.isResponded" color="success" variant="soft">
                Respondido
              </UBadge>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm font-medium text-muted-foreground">Asunto: {{ activeMessage.subject }}</p>
            <p class="text-xs text-muted-foreground mt-1">{{ formatDate(activeMessage.createdAt) }}</p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span class="text-sm font-medium text-primary">
                {{ activeMessage.fullName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 bg-muted/30 rounded-lg p-4">
              <p class="text-sm">{{ activeMessage.message }}</p>
            </div>
          </div>

          <div v-if="activeMessage.isResponded" class="flex gap-4 flex-row-reverse">
            <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-building-2" class="w-5 h-5 text-green-500" />
            </div>
            <div class="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-green-700 dark:text-green-400">Respuesta enviada</span>
                <span class="text-xs text-muted-foreground">
                  {{ activeMessage.responseDate ? formatDate(activeMessage.responseDate) : '' }}
                </span>
              </div>
              <p class="text-sm">{{ activeMessage.response }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 border-t">
          <div class="flex gap-3">
            <UTextarea
              v-model="responseText"
              placeholder="Escribe tu respuesta..."
              :rows="2"
              class="flex-1"
            />
            <UButton
              @click="handleSendResponse"
              :loading="loading"
              :disabled="!responseText.trim()"
              class="self-end"
            >
              <UIcon name="i-lucide-send" class="w-4 h-4 mr-2" />
              Enviar
            </UButton>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex-1 flex items-center justify-center text-center p-12">
          <div>
            <UIcon name="i-lucide-message-circle" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">Selecciona un mensaje</h3>
            <p class="text-muted-foreground">Elige un mensaje del listado para ver su contenido</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>