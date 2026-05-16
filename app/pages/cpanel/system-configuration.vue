<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { SystemConfiguration } from '~/composables/useSystemConfiguration'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Configuración del Sistema - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedConfig = ref<SystemConfiguration | null>(null)
const originalConfigData = ref<SystemConfiguration | null>(null)
const showDeleted = ref(false)

const { configs, loading, error, fetchConfigs, fetchDeletedConfigs, getConfig, getConfigByKey, createConfig, updateConfig, deleteConfig } = useSystemConfiguration()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedConfigs(0, 10)
  } else {
    fetchConfigs(0, 10)
  }
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedConfigs(0, 10)
  } else {
    fetchConfigs(0, 10)
  }
})

const dataTypeOptions = [
  { label: 'Cadena (STRING)', value: 'STRING' },
  { label: 'Número (NUMBER)', value: 'NUMBER' },
  { label: 'Booleano (BOOLEAN)', value: 'BOOLEAN' },
  { label: 'JSON', value: 'JSON' }
]

const hasChanges = computed(() => {
  if (!originalConfigData.value || viewMode.value !== 'edit') return false
  const orig = originalConfigData.value
  const f = editForm.value
  return (
    f.configValue !== (orig.configValue || '') ||
    f.description !== (orig.description || '') ||
    f.dataType !== (orig.dataType || 'STRING') ||
    f.module !== (orig.module || '') ||
    f.isActive !== orig.isActive
  )
})

const discardChanges = () => {
  if (originalConfigData.value) {
    const orig = originalConfigData.value
    editForm.value = {
      configValue: orig.configValue || '',
      description: orig.description || '',
      dataType: orig.dataType || 'STRING',
      module: orig.module || '',
      isActive: orig.isActive
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchConfigs(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedConfig.value = null
  originalConfigData.value = null
}

const openCreate = () => {
  selectedConfig.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (config: SystemConfiguration) => {
  selectedConfig.value = await getConfig(config.id)
  viewMode.value = 'view'
}

const openEdit = async (config: SystemConfiguration) => {
  selectedConfig.value = await getConfig(config.id)
  if (selectedConfig.value) {
    originalConfigData.value = { ...selectedConfig.value }
    const c = selectedConfig.value
    editForm.value = {
      configValue: c.configValue || '',
      description: c.description || '',
      dataType: c.dataType || 'STRING',
      module: c.module || '',
      isActive: c.isActive
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  configKey: '',
  configValue: '',
  description: '',
  dataType: 'STRING',
  module: ''
})

const editForm = ref({
  configValue: '',
  description: '',
  dataType: 'STRING',
  module: '',
  isActive: true
})

const resetForm = () => {
  form.value = {
    configKey: '',
    configValue: '',
    description: '',
    dataType: 'STRING',
    module: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    configKey: form.value.configKey,
    configValue: form.value.configValue,
    description: form.value.description || undefined,
    dataType: form.value.dataType || undefined,
    module: form.value.module || undefined
  }
  const result = await createConfig(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchConfigs(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedConfig.value) return
  submitting.value = true
  const data: any = {}
  if (editForm.value.configValue !== selectedConfig.value.configValue) data.configValue = editForm.value.configValue
  if (editForm.value.description !== (selectedConfig.value.description || '')) data.description = editForm.value.description || undefined
  if (editForm.value.dataType !== selectedConfig.value.dataType) data.dataType = editForm.value.dataType
  if (editForm.value.module !== (selectedConfig.value.module || '')) data.module = editForm.value.module || undefined
  data.isActive = editForm.value.isActive

  const result = await updateConfig(selectedConfig.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchConfigs(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (config: SystemConfiguration) => {
  const confirmed = await confirm({
    title: 'Eliminar configuración',
    description: `¿Estás seguro de eliminar "${config.configKey}"?`
  })
  if (confirmed) {
    const result = await deleteConfig(config.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchConfigs(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const dataTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'STRING': return 'info'
    case 'NUMBER': return 'warning'
    case 'BOOLEAN': return 'success'
    case 'JSON': return 'neutral'
    default: return 'neutral'
  }
}

const getActions = (config: SystemConfiguration): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [[{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(config) }]]
  }
  return [
    [
      { label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(config) },
      { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => openEdit(config) }
    ],
    [{ label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => handleDelete(config) }]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Configuración del Sistema</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Configuraciones eliminadas' : 'Configuraciones activas' }}: {{ configs.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nueva Configuración
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo las configuraciones eliminadas.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando configuraciones" description="Por favor espera...">
      <template #icon><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" /></template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchConfigs(0, 10)" />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="configs.length > 0" divide>
          <UPageCard v-for="config in configs" :key="config.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar icon="i-lucide-settings" color="primary" variant="soft" class="w-12 h-12" />
                  <div>
                    <h3 class="font-semibold text-lg font-mono">{{ config.configKey }}</h3>
                    <p class="text-sm text-muted-foreground">{{ config.description || 'Sin descripción' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="dataTypeBadgeColor(config.dataType)" variant="soft">{{ config.dataType }}</UBadge>
                  <UBadge v-if="!config.isActive" color="neutral" variant="soft">Inactivo</UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span><UIcon name="i-lucide-equal" class="size-4 mr-1" />{{ config.configValue }}</span>
                  <span v-if="config.module"><UIcon name="i-lucide-puzzle" class="size-4 mr-1" />{{ config.module }}</span>
                </div>
                <UDropdownMenu :items="getActions(config)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-settings" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay configuraciones</h3>
          <p class="text-muted-foreground mb-4">Crea la primera configuración del sistema para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nueva Configuración</UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">{{ viewMode === 'create' ? 'Nueva Configuración' : viewMode === 'view' ? `Config: ${selectedConfig?.configKey}` : `Editar: ${selectedConfig?.configKey}` }}</span>
                <UBadge v-if="viewMode === 'edit' && hasChanges" color="warning" variant="soft" class="animate-pulse"><UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />Cambios pendientes</UBadge>
                <UBadge v-else-if="viewMode === 'edit' && !hasChanges" color="success" variant="soft"><UIcon name="i-lucide-check" class="size-3 mr-1" />Sin cambios</UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div v-if="viewMode === 'create'" class="space-y-4">
            <UFormField label="Clave" name="configKey" required>
              <UInput v-model="form.configKey" placeholder="MAX_LOGIN_ATTEMPTS" icon="i-lucide-key" />
            </UFormField>
            <UFormField label="Valor" name="configValue" required>
              <UInput v-model="form.configValue" placeholder="Valor de configuración" icon="i-lucide-equal" />
            </UFormField>
            <UFormField label="Descripción" name="description">
              <UInput v-model="form.description" placeholder="Descripción opcional" icon="i-lucide-align-left" />
            </UFormField>
            <UFormField label="Tipo de dato" name="dataType">
              <USelect v-model="form.dataType" :items="dataTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-type" />
            </UFormField>
            <UFormField label="Módulo" name="module">
              <UInput v-model="form.module" placeholder="Ej: AUTH, STUDENTS" icon="i-lucide-puzzle" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedConfig" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar icon="i-lucide-settings" color="primary" variant="soft" class="w-16 h-16 text-lg" />
              <div>
                <h3 class="text-xl font-bold font-mono">{{ selectedConfig.configKey }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="dataTypeBadgeColor(selectedConfig.dataType)" variant="soft">{{ selectedConfig.dataType }}</UBadge>
                  <UBadge v-if="selectedConfig.isActive" color="success" variant="soft">Activo</UBadge>
                  <UBadge v-else color="neutral" variant="soft">Inactivo</UBadge>
                </div>
              </div>
            </div>
            <USeparator label="Valor" />
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-equal" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Valor</p><p class="font-semibold font-mono">{{ selectedConfig.configValue }}</p></div>
            </div>
            <USeparator v-if="selectedConfig.description" label="Descripción" />
            <div v-if="selectedConfig.description" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-align-left" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Descripción</p><p class="font-semibold">{{ selectedConfig.description }}</p></div>
            </div>
            <USeparator v-if="selectedConfig.module" label="Módulo" />
            <div v-if="selectedConfig.module" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-puzzle" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Módulo</p><p class="font-semibold">{{ selectedConfig.module }}</p></div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedConfig" class="space-y-4">
            <UFormField label="Valor" name="configValue">
              <UInput v-model="editForm.configValue" placeholder="Valor de configuración" icon="i-lucide-equal" />
            </UFormField>
            <UFormField label="Descripción" name="description">
              <UInput v-model="editForm.description" placeholder="Descripción opcional" icon="i-lucide-align-left" />
            </UFormField>
            <UFormField label="Tipo de dato" name="dataType">
              <USelect v-model="editForm.dataType" :items="dataTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-type" />
            </UFormField>
            <UFormField label="Módulo" name="module">
              <UInput v-model="editForm.module" placeholder="Ej: AUTH, STUDENTS" icon="i-lucide-puzzle" />
            </UFormField>
            <UFormField label="Activo" name="isActive">
              <UCheckbox v-model="editForm.isActive" label="Configuración activa" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closePanel">Cerrar</UButton>
              <UButton v-if="viewMode === 'create'" @click="handleCreate" :loading="submitting" icon="i-lucide-save">Crear</UButton>
              <template v-if="viewMode === 'edit'">
                <UButton v-if="hasChanges" @click="discardChanges" variant="outline" color="neutral" icon="i-lucide-undo-2">Descartar</UButton>
                <UButton @click="handleUpdate" :loading="submitting" icon="i-lucide-save" :disabled="!hasChanges">Guardar</UButton>
              </template>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>
