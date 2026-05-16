<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AccessAudit } from '~/composables/useAccessAudit'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Auditoría de Acceso - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

const selectedLog = ref<AccessAudit | null>(null)
const showViewModal = ref(false)

const { logs, loading, error, fetchLogs, getLog, deleteLog } = useAccessAudit()

const filters = ref({
  userId: '',
  module: '',
  action: '',
  success: undefined as boolean | undefined
})

const pageModel = ref(1)

const loadLogs = () => {
  fetchLogs({
    page: pageModel.value - 1,
    size: 10,
    userId: filters.value.userId || undefined,
    module: filters.value.module || undefined,
    action: filters.value.action || undefined,
    success: filters.value.success
  })
}

onMounted(loadLogs)

watch(pageModel, loadLogs)

const applyFilters = () => {
  pageModel.value = 1
  loadLogs()
}

const clearFilters = () => {
  filters.value = { userId: '', module: '', action: '', success: undefined }
  pageModel.value = 1
  loadLogs()
}

const openView = async (log: AccessAudit) => {
  selectedLog.value = await getLog(log.id)
  showViewModal.value = true
}

const closeView = () => {
  showViewModal.value = false
  selectedLog.value = null
}

const handleDelete = async (log: AccessAudit) => {
  const confirmed = await confirm({
    title: 'Eliminar registro de auditoría',
    description: `¿Estás seguro de eliminar el registro de "${log.action}" por ${log.userEmail}?`
  })
  if (confirmed) {
    const result = await deleteLog(log.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      loadLogs()
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const actionBadgeColor = (action: string) => {
  switch (action) {
    case 'LOGIN': return 'success'
    case 'LOGOUT': return 'neutral'
    case 'CREATE': return 'info'
    case 'UPDATE': return 'warning'
    case 'DELETE': return 'error'
    default: return 'neutral'
  }
}

const getActions = (log: AccessAudit): DropdownMenuItem[][] => {
  const items: DropdownMenuItem[][] = [
    [{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(log) }]
  ]
  if (user?.roles?.includes('ADMIN')) {
    items.push([{ label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => handleDelete(log) }])
  }
  return items
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Auditoría de Acceso</h1>
        <p class="text-muted-foreground">Registros de acceso al sistema: {{ logs.length }}</p>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-3 flex-wrap">
            <UInput v-model="filters.userId" placeholder="ID de usuario" icon="i-lucide-user" size="sm" class="w-40" />
            <UInput v-model="filters.module" placeholder="Módulo" icon="i-lucide-puzzle" size="sm" class="w-32" />
            <UInput v-model="filters.action" placeholder="Acción" icon="i-lucide-activity" size="sm" class="w-32" />
            <USelect
              v-model="filters.success"
              :items="[
                { label: 'Todos', value: undefined },
                { label: 'Exitoso', value: true },
                { label: 'Fallido', value: false }
              ]"
              placeholder="Resultado"
              size="sm"
              class="w-36"
            />
          </div>
          <div class="flex items-center gap-2">
            <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-eraser" @click="clearFilters">Limpiar</UButton>
            <UButton size="sm" icon="i-lucide-search" @click="applyFilters">Buscar</UButton>
          </div>
        </div>
      </template>

      <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando registros" description="Por favor espera...">
        <template #icon><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" /></template>
      </UAlert>

      <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
        <template #actions>
          <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="loadLogs" />
        </template>
      </UAlert>

      <UPageList v-if="logs.length > 0" divide>
        <UPageCard v-for="log in logs" :key="log.id" variant="ghost">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-3">
                <UAvatar icon="i-lucide-shield" color="primary" variant="soft" class="w-12 h-12" />
                <div>
                  <h3 class="font-semibold text-lg">{{ log.userEmail }}</h3>
                  <p class="text-sm text-muted-foreground">{{ log.module }} · {{ log.ipAddress }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UBadge :color="actionBadgeColor(log.action)" variant="soft">{{ log.action }}</UBadge>
                <UBadge v-if="log.success" color="success" variant="soft">Éxito</UBadge>
                <UBadge v-else color="error" variant="soft">Fallido</UBadge>
              </div>
            </div>
          </template>
          <template #body>
            <div class="flex items-center justify-between">
              <div class="flex gap-4 text-sm text-muted-foreground">
                <span><UIcon name="i-lucide-calendar" class="size-4 mr-1" />{{ log.createdAt }}</span>
              </div>
              <UDropdownMenu :items="getActions(log)">
                <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
              </UDropdownMenu>
            </div>
          </template>
        </UPageCard>
      </UPageList>
      <div v-else-if="!loading" class="text-center py-12">
        <UIcon name="i-lucide-shield" class="size-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-medium mb-2">No hay registros de auditoría</h3>
        <p class="text-muted-foreground">Los registros aparecerán cuando los usuarios interactúen con el sistema</p>
      </div>
    </UCard>

    <div v-if="showViewModal && selectedLog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield" class="size-5" />
                <span class="font-semibold">Registro de Auditoría</span>
              </div>
              <UButton size="xs" variant="ghost" @click="closeView"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar icon="i-lucide-shield" color="primary" variant="soft" class="w-16 h-16 text-lg" />
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-bold">{{ selectedLog.userEmail }}</h3>
                  <UBadge :color="actionBadgeColor(selectedLog.action)" variant="soft">{{ selectedLog.action }}</UBadge>
                </div>
                <p class="text-sm text-muted-foreground">{{ selectedLog.module }}</p>
              </div>
            </div>
            <USeparator label="Detalles" />
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-user" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Usuario ID</p><p class="font-semibold font-mono text-sm">{{ selectedLog.userId }}</p></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-monitor" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">IP</p><p class="font-semibold font-mono text-sm">{{ selectedLog.ipAddress }}</p></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-activity" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Acción</p><p class="font-semibold">{{ selectedLog.action }}</p></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-puzzle" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Módulo</p><p class="font-semibold">{{ selectedLog.module }}</p></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-check-circle" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Resultado</p><p class="font-semibold">{{ selectedLog.success ? 'Exitoso' : 'Fallido' }}</p></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Fecha</p><p class="font-semibold">{{ selectedLog.createdAt }}</p></div>
              </div>
            </div>
            <USeparator v-if="selectedLog.metadata" label="Metadata" />
            <div v-if="selectedLog.metadata" class="p-3 bg-muted/50 rounded-lg">
              <pre class="text-xs font-mono whitespace-pre-wrap break-all">{{ selectedLog.metadata }}</pre>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closeView">Cerrar</UButton>
              <UButton v-if="user?.roles?.includes('ADMIN')" color="error" variant="outline" icon="i-lucide-trash" @click="handleDelete(selectedLog)">Eliminar</UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>
