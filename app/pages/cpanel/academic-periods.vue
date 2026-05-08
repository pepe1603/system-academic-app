<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AcademicPeriod } from '~/composables/useAcademicPeriods'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Períodos Académicos - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedPeriod = ref<AcademicPeriod | null>(null)
const originalPeriodData = ref<AcademicPeriod | null>(null)
const showDeleted = ref(false)

const { periods, loading, error, fetchPeriods, fetchDeletedPeriods, getPeriod, createPeriod, updatePeriod, deletePeriod } = useAcademicPeriods()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedPeriods()
  } else {
    fetchPeriods(0, 10)
  }
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedPeriods()
  } else {
    fetchPeriods(0, 10)
  }
})

const hasChanges = computed(() => {
  if (!originalPeriodData.value || viewMode.value !== 'edit') return false

  const orig = originalPeriodData.value
  const f = editForm.value

  return (
    f.name !== (orig.name || '') ||
    f.startDate !== (orig.startDate || '') ||
    f.endDate !== (orig.endDate || '')
  )
})

const discardChanges = () => {
  if (originalPeriodData.value) {
    const orig = originalPeriodData.value
    editForm.value = {
      name: orig.name || '',
      startDate: orig.startDate || '',
      endDate: orig.endDate || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchPeriods(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedPeriod.value = null
  originalPeriodData.value = null
}

const openCreate = () => {
  selectedPeriod.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (period: AcademicPeriod) => {
  selectedPeriod.value = await getPeriod(period.id)
  viewMode.value = 'view'
}

const openEdit = async (period: AcademicPeriod) => {
  selectedPeriod.value = await getPeriod(period.id)
  if (selectedPeriod.value) {
    originalPeriodData.value = { ...selectedPeriod.value }
    const p = selectedPeriod.value
    editForm.value = {
      name: p.name || '',
      startDate: p.startDate || '',
      endDate: p.endDate || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  name: '',
  startDate: '',
  endDate: ''
})

const editForm = ref({
  name: '',
  startDate: '',
  endDate: ''
})

const resetForm = () => {
  form.value = {
    name: '',
    startDate: '',
    endDate: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data = {
    name: form.value.name,
    startDate: form.value.startDate,
    endDate: form.value.endDate
  }
  const result = await createPeriod(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchPeriods(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedPeriod.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.startDate) data.startDate = editForm.value.startDate
  if (editForm.value.endDate) data.endDate = editForm.value.endDate

  const result = await updatePeriod(selectedPeriod.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchPeriods(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (period: AcademicPeriod) => {
  const confirmed = await confirm({
    title: 'Eliminar período',
    description: `¿Estás seguro de eliminar "${period.name}"? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deletePeriod(period.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchPeriods(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getActions = (period: AcademicPeriod): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(period)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(period)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(period)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(period)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Períodos Académicos</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Períodos eliminados' : 'Períodos activos' }}: {{ periods.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Período
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los períodos eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando períodos"
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
          @click="fetchPeriods(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="periods.length > 0" divide>
          <UPageCard v-for="period in periods" :key="period.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-calendar-range" class="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ period.name }}</h3>
                    <p class="text-sm text-muted-foreground">
                      <span v-if="period.startDate">{{ period.startDate }}</span>
                      <span v-if="period.startDate && period.endDate"> → </span>
                      <span v-if="period.endDate">{{ period.endDate }}</span>
                    </p>
                  </div>
                </div>
                <UBadge :color="period.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ period.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-play" class="size-4 mr-1" />
                    Inicio: {{ period.startDate || 'N/D' }}
                  </span>
                  <span>
                    <UIcon name="i-lucide-stop-circle" class="size-4 mr-1" />
                    Fin: {{ period.endDate || 'N/D' }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(period)">
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
          <h3 class="text-lg font-medium mb-2">No hay períodos académicos</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer período para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Período
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-calendar-range' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Período' : viewMode === 'view' ? `Período: ${selectedPeriod?.name}` : `Editar: ${selectedPeriod?.name}` }}
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
              <UInput v-model="form.name" placeholder="Ej: 2026-1" icon="i-lucide-tag" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de inicio" name="startDate" required>
                <UInput v-model="form.startDate" type="date" icon="i-lucide-play" />
              </UFormField>
              <UFormField label="Fecha de fin" name="endDate" required>
                <UInput v-model="form.endDate" type="date" icon="i-lucide-stop-circle" />
              </UFormField>
            </div>
          </div>

          <div v-else-if="viewMode === 'view' && selectedPeriod" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-calendar-range" class="size-8 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-bold">{{ selectedPeriod.name }}</h3>
                <UBadge :color="selectedPeriod.isActive ? 'success' : 'neutral'" variant="soft" class="mt-1">
                  {{ selectedPeriod.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-play" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fecha inicio</p>
                  <p class="font-semibold">{{ selectedPeriod.startDate || 'No definida' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-stop-circle" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fecha fin</p>
                  <p class="font-semibold">{{ selectedPeriod.endDate || 'No definida' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedPeriod" class="space-y-4">
            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: 2026-1" icon="i-lucide-tag" />
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
              <UButton v-if="viewMode === 'create'" @click="handleCreate" :loading="submitting" icon="i-lucide-save">
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
                  @click="handleUpdate"
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
