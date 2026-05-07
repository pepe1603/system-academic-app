<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Generation } from '~/composables/useGenerations'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Generaciones - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedGeneration = ref<Generation | null>(null)
const originalGenerationData = ref<Generation | null>(null)
const showDeleted = ref(false)

const { generations, loading, error, fetchGenerations, fetchDeletedGenerations, getGeneration, createGeneration, updateGeneration, deleteGeneration } = useGenerations()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedGenerations()
  } else {
    fetchGenerations(0, 10)
  }
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedGenerations()
  } else {
    fetchGenerations(0, 10)
  }
})

const hasChanges = computed(() => {
  if (!originalGenerationData.value || viewMode.value !== 'edit') return false
  
  const orig = originalGenerationData.value
  const form = editForm.value
  
  return (
    form.name !== (orig.name || '') ||
    form.entryYear !== (orig.entryYear || 0) ||
    form.graduationYear !== (orig.graduationYear || undefined) ||
    form.status !== (orig.status || 'ACTIVE') ||
    form.startDate !== (orig.startDate || '') ||
    form.endDate !== (orig.endDate || '')
  )
})

const discardChanges = () => {
  if (originalGenerationData.value) {
    editForm.value = {
      name: originalGenerationData.value.name || '',
      entryYear: originalGenerationData.value.entryYear || 0,
      graduationYear: originalGenerationData.value.graduationYear || undefined,
      status: originalGenerationData.value.status || 'ACTIVE',
      startDate: originalGenerationData.value.startDate || '',
      endDate: originalGenerationData.value.endDate || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const availableStatuses = [
  { label: 'Activa', value: 'ACTIVE' },
  { label: 'Egresada', value: 'GRADUATED' },
  { label: 'Archivada', value: 'ARCHIVED' }
]

const pageModel = ref(1)

onMounted(() => {
  fetchGenerations(0, 10)
})

watch(pageModel, (newPage) => {
  fetchGenerations(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedGeneration.value = null
  originalGenerationData.value = null
}

const openCreate = () => {
  selectedGeneration.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (generation: Generation) => {
  selectedGeneration.value = await getGeneration(generation.id)
  viewMode.value = 'view'
}

const openEdit = async (generation: Generation) => {
  selectedGeneration.value = await getGeneration(generation.id)
  if (selectedGeneration.value) {
    originalGenerationData.value = { ...selectedGeneration.value }
    editForm.value = {
      name: selectedGeneration.value.name || '',
      entryYear: selectedGeneration.value.entryYear || 0,
      graduationYear: selectedGeneration.value.graduationYear || undefined,
      status: selectedGeneration.value.status || 'ACTIVE',
      startDate: selectedGeneration.value.startDate || '',
      endDate: selectedGeneration.value.endDate || ''
    }
  }
  viewMode.value = 'edit'
}
  viewMode.value = 'edit'
}

const form = ref({
  name: '',
  entryYear: new Date().getFullYear(),
  graduationYear: new Date().getFullYear() + 4,
  status: 'ACTIVE',
  startDate: '',
  endDate: ''
})

const editForm = ref({
  name: '',
  entryYear: 0,
  graduationYear: undefined as number | undefined,
  status: 'ACTIVE' as string,
  startDate: '',
  endDate: ''
})

const resetForm = () => {
  form.value = {
    name: '',
    entryYear: new Date().getFullYear(),
    graduationYear: new Date().getFullYear() + 4,
    status: 'ACTIVE',
    startDate: '',
    endDate: ''
  }
}

const submitting = ref(false)

const handleCreateGeneration = async () => {
  submitting.value = true
  const data = {
    name: form.value.name,
    entryYear: form.value.entryYear,
    graduationYear: form.value.graduationYear,
    status: form.value.status,
    startDate: form.value.startDate,
    endDate: form.value.endDate || undefined
  }
  const result = await createGeneration(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGenerations(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdateGeneration = async () => {
  if (!selectedGeneration.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.entryYear) data.entryYear = editForm.value.entryYear
  if (editForm.value.graduationYear) data.graduationYear = editForm.value.graduationYear
  if (editForm.value.status) data.status = editForm.value.status
  if (editForm.value.startDate) data.startDate = editForm.value.startDate
  if (editForm.value.endDate) data.endDate = editForm.value.endDate

  const result = await updateGeneration(selectedGeneration.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    originalGenerationData.value = {
      ...originalGenerationData.value!,
      name: editForm.value.name,
      entryYear: editForm.value.entryYear,
      graduationYear: editForm.value.graduationYear,
      status: editForm.value.status as any,
      startDate: editForm.value.startDate,
      endDate: editForm.value.endDate
    }
    closePanel()
    fetchGenerations(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (generation: Generation) => {
  const confirmed = await confirm({
    title: 'Eliminar generación',
    description: `¿Estás seguro de eliminar "${generation.name}"? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deleteGeneration(generation.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchGenerations(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getStatusColor = (status: string): 'success' | 'warning' | 'neutral' => {
  const colors: Record<string, 'success' | 'warning' | 'neutral'> = {
    ACTIVE: 'success',
    GRADUATED: 'warning',
    ARCHIVED: 'neutral'
  }
  return colors[status] || 'neutral'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ACTIVE: 'Activa',
    GRADUATED: 'Egresada',
    ARCHIVED: 'Archivada'
  }
  return labels[status] || status
}

const getGenerationActions = (generation: Generation): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(generation)
        }
      ]
    ]
  }
  
  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(generation)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(generation)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(generation)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Generaciones</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Generaciones eliminadas' : 'Generaciones activas' }}: {{ generations.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nueva Generación
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo las generaciones eliminadas. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando generaciones"
      description="Por favor espera..."
    >
      <template #icon>
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
      </template>
    </UAlert>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      class="mb-4"
      icon="i-lucide-circle-x"
      title="Ocurrió un error"
      :description="error"
    >
      <template #actions>
        <UButton
          color="error"
          variant="soft"
          size="xs"
          icon="i-lucide-refresh-cw"
          label="Reintentar"
          @click="fetchGenerations(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <UAlert color="neutral" variant="soft" class="mb-4" icon="i-lucide-info">
        <template #title>Guía de generaciones</template>
        <template #description>
          <div class="space-y-1 text-sm">
            <p><UBadge color="success" variant="soft">Activa</UBadge> - Generación en curso con estudiantes activos</p>
            <p><UBadge color="warning" variant="soft">Egresada</UBadge> - Generación que ha completado sus estudios</p>
            <p><UBadge color="neutral" variant="soft">Archivada</UBadge> - Generación inactiva para referencia histórica</p>
          </div>
        </template>
      </UAlert>

      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="generations.length > 0" divide>
          <UPageCard v-for="generation in generations" :key="generation.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-calendar" class="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ generation.name }}</h3>
                    <p class="text-sm text-muted-foreground">
                      Año de ingreso: {{ generation.entryYear }}
                      <span v-if="generation.graduationYear"> · Egreso: {{ generation.graduationYear }}</span>
                    </p>
                  </div>
                </div>
                <UBadge :color="getStatusColor(generation.status)" variant="soft">
                  {{ getStatusLabel(generation.status) }}
                </UBadge>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span v-if="generation.startDate">
                    <UIcon name="i-lucide-play" class="size-4 mr-1" />
                    Inicio: {{ generation.startDate }}
                  </span>
                  <span v-if="generation.endDate">
                    <UIcon name="i-lucide-stop-circle" class="size-4 mr-1" />
                    Fin: {{ generation.endDate }}
                  </span>
                </div>

                <UDropdownMenu :items="getGenerationActions(generation)">
                  <UButton size="sm" variant="ghost">
                    <UIcon name="i-lucide-more-horizontal" class="size-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-calendar-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay generaciones</h3>
          <p class="text-muted-foreground mb-4">Crea tu primera generación para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nueva Generación
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-calendar' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nueva Generación' : viewMode === 'view' ? `Generación: ${selectedGeneration?.name}` : `Editar: ${selectedGeneration?.name}` }}
                </span>
                <UBadge v-if="viewMode === 'edit' && hasChanges" color="warning" variant="soft" class="animate-pulse">
                  <UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />
                  Cambios pendientes
                </UBadge>
                <UBadge v-else-if="viewMode === 'edit' && !hasChanges" color="success" variant="soft">
                  <UIcon name="i-lucide-check" class="size-3 mr-1" />
                  Sin cambios
                </UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel">
                <UIcon name="i-lucide-x" class="size-4" />
              </UButton>
            </div>
          </template>

          <div v-if="viewMode === 'create'" class="space-y-4">
            <UFormField label="Nombre" name="name" required>
              <UInput v-model="form.name" placeholder="Ej: Generación 2024" icon="i-lucide-tag" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Año de ingreso" name="entryYear" required>
                <UInput v-model.number="form.entryYear" type="number" placeholder="2024" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Año de egreso" name="graduationYear">
                <UInput v-model.number="form.graduationYear" type="number" placeholder="2028" icon="i-lucide-graduation-cap" />
              </UFormField>
            </div>

            <UFormField label="Estado" name="status" required>
              <USelect v-model="form.status" :items="availableStatuses" placeholder="Seleccionar estado" icon="i-lucide-toggle-right" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de inicio" name="startDate" required>
                <UInput v-model="form.startDate" type="date" icon="i-lucide-play" />
              </UFormField>
              <UFormField label="Fecha de fin" name="endDate">
                <UInput v-model="form.endDate" type="date" icon="i-lucide-stop-circle" />
              </UFormField>
            </div>
          </div>

          <div v-else-if="viewMode === 'view' && selectedGeneration" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-calendar" class="size-8 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-bold">{{ selectedGeneration.name }}</h3>
                <UBadge :color="getStatusColor(selectedGeneration.status)" variant="soft" class="mt-1">
                  {{ getStatusLabel(selectedGeneration.status) }}
                </UBadge>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-plus" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Año de ingreso</p>
                  <p class="font-semibold">{{ selectedGeneration.entryYear }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-graduation-cap" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Año de egreso</p>
                  <p class="font-semibold">{{ selectedGeneration.graduationYear || 'No definido' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-play" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fecha inicio</p>
                  <p class="font-semibold">{{ selectedGeneration.startDate || 'No definida' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-stop-circle" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fecha fin</p>
                  <p class="font-semibold">{{ selectedGeneration.endDate || 'No definida' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedGeneration" class="space-y-4">
            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: Generación 2024" icon="i-lucide-tag" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Año de ingreso" name="entryYear">
                <UInput v-model.number="editForm.entryYear" type="number" placeholder="2024" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Año de egreso" name="graduationYear">
                <UInput v-model.number="editForm.graduationYear" type="number" placeholder="2028" icon="i-lucide-graduation-cap" />
              </UFormField>
            </div>

            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="availableStatuses" placeholder="Seleccionar estado" icon="i-lucide-toggle-right" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de inicio" name="startDate">
                <UInput v-model="editForm.startDate" type="date" icon="i-lucide-play" />
              </UFormField>
              <UFormField label="Fecha de fin" name="endDate">
                <UInput v-model="editForm.endDate" type="date" icon="i-lucide-stop-circle" />
              </UFormField>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closePanel">Cerrar</UButton>
              <UButton v-if="viewMode === 'create'" @click="handleCreateGeneration" :loading="submitting" icon="i-lucide-save">
                Crear
              </UButton>
              <template v-if="viewMode === 'edit'">
                <UButton 
                  v-if="hasChanges" 
                  @click="discardChanges" 
                  variant="outline" 
                  color="neutral"
                  icon="i-lucide-undo-2"
                >
                  Descartar
                </UButton>
                <UButton 
                  @click="handleUpdateGeneration" 
                  :loading="submitting" 
                  icon="i-lucide-save"
                  :disabled="!hasChanges"
                >
                  Guardar
                </UButton>
              </template>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>