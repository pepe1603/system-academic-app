<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AcademicSemester } from '~/composables/useAcademicSemesters'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Semestres Académicos - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedSemester = ref<AcademicSemester | null>(null)
const originalSemesterData = ref<AcademicSemester | null>(null)
const showDeleted = ref(false)

const { semesters, loading, error, fetchSemesters, fetchDeletedSemesters, getSemester, createSemester, updateSemester, deleteSemester } = useAcademicSemesters()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedSemesters()
  } else {
    fetchSemesters(0, 10)
  }
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedSemesters()
  } else {
    fetchSemesters(0, 10)
  }
})

const hasChanges = computed(() => {
  if (!originalSemesterData.value || viewMode.value !== 'edit') return false

  const orig = originalSemesterData.value
  const form = editForm.value

  return (
    form.name !== (orig.name || '') ||
    form.year !== (orig.year || 0) ||
    form.period !== (orig.period || 1) ||
    form.status !== (orig.status || 'DRAFT') ||
    form.isCurrent !== orig.isCurrent ||
    form.startDate !== (orig.startDate || '') ||
    form.endDate !== (orig.endDate || '') ||
    form.classesStartDate !== (orig.classesStartDate || '') ||
    form.classesEndDate !== (orig.classesEndDate || '') ||
    form.enrollmentDeadline !== (orig.enrollmentDeadline || '') ||
    form.dropDeadline !== (orig.dropDeadline || '')
  )
})

const discardChanges = () => {
  if (originalSemesterData.value) {
    editForm.value = {
      name: originalSemesterData.value.name || '',
      year: originalSemesterData.value.year || new Date().getFullYear(),
      period: originalSemesterData.value.period || 1,
      status: originalSemesterData.value.status || 'DRAFT',
      isCurrent: originalSemesterData.value.isCurrent || false,
      startDate: originalSemesterData.value.startDate || '',
      endDate: originalSemesterData.value.endDate || '',
      classesStartDate: originalSemesterData.value.classesStartDate || '',
      classesEndDate: originalSemesterData.value.classesEndDate || '',
      enrollmentDeadline: originalSemesterData.value.enrollmentDeadline || '',
      dropDeadline: originalSemesterData.value.dropDeadline || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const statusOptions = [
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'Abierto', value: 'OPEN' },
  { label: 'Cerrado', value: 'CLOSED' },
  { label: 'Archivado', value: 'ARCHIVED' }
]

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchSemesters(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedSemester.value = null
  originalSemesterData.value = null
}

const openCreate = () => {
  selectedSemester.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (semester: AcademicSemester) => {
  selectedSemester.value = await getSemester(semester.id)
  viewMode.value = 'view'
}

const openEdit = async (semester: AcademicSemester) => {
  selectedSemester.value = await getSemester(semester.id)
  if (selectedSemester.value) {
    originalSemesterData.value = { ...selectedSemester.value }
    editForm.value = {
      name: selectedSemester.value.name || '',
      year: selectedSemester.value.year || new Date().getFullYear(),
      period: selectedSemester.value.period || 1,
      status: selectedSemester.value.status || 'DRAFT',
      isCurrent: selectedSemester.value.isCurrent || false,
      startDate: selectedSemester.value.startDate || '',
      endDate: selectedSemester.value.endDate || '',
      classesStartDate: selectedSemester.value.classesStartDate || '',
      classesEndDate: selectedSemester.value.classesEndDate || '',
      enrollmentDeadline: selectedSemester.value.enrollmentDeadline || '',
      dropDeadline: selectedSemester.value.dropDeadline || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  name: '',
  year: new Date().getFullYear(),
  period: 1 as number,
  status: 'DRAFT' as string,
  isCurrent: false,
  startDate: '',
  endDate: '',
  classesStartDate: '',
  classesEndDate: '',
  enrollmentDeadline: '',
  dropDeadline: ''
})

const editForm = ref({
  name: '',
  year: 0,
  period: 1 as number,
  status: 'DRAFT' as string,
  isCurrent: false,
  startDate: '',
  endDate: '',
  classesStartDate: '',
  classesEndDate: '',
  enrollmentDeadline: '',
  dropDeadline: ''
})

const resetForm = () => {
  form.value = {
    name: '',
    year: new Date().getFullYear(),
    period: 1,
    status: 'DRAFT',
    isCurrent: false,
    startDate: '',
    endDate: '',
    classesStartDate: '',
    classesEndDate: '',
    enrollmentDeadline: '',
    dropDeadline: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data = {
    name: form.value.name,
    year: form.value.year,
    period: form.value.period,
    status: form.value.status,
    isCurrent: form.value.isCurrent,
    startDate: form.value.startDate || undefined,
    endDate: form.value.endDate || undefined,
    classesStartDate: form.value.classesStartDate || undefined,
    classesEndDate: form.value.classesEndDate || undefined,
    enrollmentDeadline: form.value.enrollmentDeadline || undefined,
    dropDeadline: form.value.dropDeadline || undefined
  }
  const result = await createSemester(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchSemesters(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedSemester.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.year) data.year = editForm.value.year
  if (editForm.value.period) data.period = editForm.value.period
  if (editForm.value.status) data.status = editForm.value.status
  data.isCurrent = editForm.value.isCurrent
  if (editForm.value.startDate) data.startDate = editForm.value.startDate
  if (editForm.value.endDate) data.endDate = editForm.value.endDate
  if (editForm.value.classesStartDate) data.classesStartDate = editForm.value.classesStartDate
  if (editForm.value.classesEndDate) data.classesEndDate = editForm.value.classesEndDate
  if (editForm.value.enrollmentDeadline) data.enrollmentDeadline = editForm.value.enrollmentDeadline
  if (editForm.value.dropDeadline) data.dropDeadline = editForm.value.dropDeadline

  const result = await updateSemester(selectedSemester.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchSemesters(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (semester: AcademicSemester) => {
  const confirmed = await confirm({
    title: 'Eliminar semestre',
    description: `¿Estás seguro de eliminar "${semester.name}"? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deleteSemester(semester.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchSemesters(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getStatusColor = (status: string): 'success' | 'warning' | 'neutral' => {
  const colors: Record<string, 'success' | 'warning' | 'neutral'> = {
    DRAFT: 'neutral',
    OPEN: 'success',
    CLOSED: 'warning',
    ARCHIVED: 'neutral'
  }
  return colors[status] || 'neutral'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: 'Borrador',
    OPEN: 'Abierto',
    CLOSED: 'Cerrado',
    ARCHIVED: 'Archivado'
  }
  return labels[status] || status
}

const getPeriodLabel = (period: number): string => {
  return period === 1 ? '1er Semestre' : period === 2 ? '2do Semestre' : `${period}° Semestre`
}

const getActions = (semester: AcademicSemester): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(semester)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(semester)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(semester)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(semester)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Semestres Académicos</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Semestres eliminados' : 'Semestres activos' }}: {{ semesters.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Semestre
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los semestres eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando semestres"
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
          @click="fetchSemesters(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <UAlert color="neutral" variant="soft" class="mb-4" icon="i-lucide-info">
        <template #title>Guía de estados</template>
        <template #description>
          <div class="space-y-1 text-sm">
            <p><UBadge color="neutral" variant="soft">Borrador</UBadge> - Semestre en planificación, aún no activo</p>
            <p><UBadge color="success" variant="soft">Abierto</UBadge> - Semestre en curso con matrícula activa</p>
            <p><UBadge color="warning" variant="soft">Cerrado</UBadge> - Semestre finalizado, solo consulta</p>
            <p><UBadge color="neutral" variant="soft">Archivado</UBadge> - Semestre archivado para referencia histórica</p>
          </div>
        </template>
      </UAlert>

      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="semesters.length > 0" divide>
          <UPageCard v-for="semester in semesters" :key="semester.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-calendar" class="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ semester.name }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ semester.year }} · {{ getPeriodLabel(semester.period) }}
                      <UBadge v-if="semester.isCurrent" color="primary" variant="soft" size="xs" class="ml-2">
                        Actual
                      </UBadge>
                    </p>
                  </div>
                </div>
                <UBadge :color="getStatusColor(semester.status)" variant="soft">
                  {{ getStatusLabel(semester.status) }}
                </UBadge>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span v-if="semester.startDate">
                    <UIcon name="i-lucide-play" class="size-4 mr-1" />
                    Inicio: {{ semester.startDate }}
                  </span>
                  <span v-if="semester.endDate">
                    <UIcon name="i-lucide-stop-circle" class="size-4 mr-1" />
                    Fin: {{ semester.endDate }}
                  </span>
                  <span v-if="semester.enrollmentDeadline">
                    <UIcon name="i-lucide-clock" class="size-4 mr-1" />
                    Matrícula: {{ semester.enrollmentDeadline }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(semester)">
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
          <h3 class="text-lg font-medium mb-2">No hay semestres académicos</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer semestre para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Semestre
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
                  {{ viewMode === 'create' ? 'Nuevo Semestre' : viewMode === 'view' ? `Semestre: ${selectedSemester?.name}` : `Editar: ${selectedSemester?.name}` }}
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
              <UInput v-model="form.name" placeholder="Ej: 2025-1" icon="i-lucide-tag" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Año" name="year" required>
                <UInput v-model.number="form.year" type="number" placeholder="2025" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Período" name="period" required>
                <USelect v-model="form.period" :items="[{ label: '1er Semestre', value: 1 }, { label: '2do Semestre', value: 2 }]" placeholder="Seleccionar período" icon="i-lucide-list" />
              </UFormField>
            </div>

            <UFormField label="Estado" name="status" required>
              <USelect v-model="form.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-toggle-right" />
            </UFormField>

            <UFormField label="Semestre actual" name="isCurrent">
              <UCheckbox v-model="form.isCurrent" label="Marcar como semestre actual" />
            </UFormField>

            <USeparator label="Fechas del semestre" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de inicio" name="startDate">
                <UInput v-model="form.startDate" type="date" icon="i-lucide-play" />
              </UFormField>
              <UFormField label="Fecha de fin" name="endDate">
                <UInput v-model="form.endDate" type="date" icon="i-lucide-stop-circle" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Inicio de clases" name="classesStartDate">
                <UInput v-model="form.classesStartDate" type="date" icon="i-lucide-book-open" />
              </UFormField>
              <UFormField label="Fin de clases" name="classesEndDate">
                <UInput v-model="form.classesEndDate" type="date" icon="i-lucide-book-x" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Límite de matrícula" name="enrollmentDeadline">
                <UInput v-model="form.enrollmentDeadline" type="date" icon="i-lucide-clock" />
              </UFormField>
              <UFormField label="Límite de bajas" name="dropDeadline">
                <UInput v-model="form.dropDeadline" type="date" icon="i-lucide-alarm-clock-off" />
              </UFormField>
            </div>
          </div>

          <div v-else-if="viewMode === 'view' && selectedSemester" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-calendar" class="size-8 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-bold">{{ selectedSemester.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="getStatusColor(selectedSemester.status)" variant="soft">
                    {{ getStatusLabel(selectedSemester.status) }}
                  </UBadge>
                  <UBadge v-if="selectedSemester.isCurrent" color="primary" variant="soft">
                    Actual
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Año</p>
                  <p class="font-semibold">{{ selectedSemester.year }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-list" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Período</p>
                  <p class="font-semibold">{{ getPeriodLabel(selectedSemester.period) }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Fechas" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-play" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Inicio semestre</p>
                  <p class="font-semibold">{{ selectedSemester.startDate || 'No definida' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-stop-circle" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fin semestre</p>
                  <p class="font-semibold">{{ selectedSemester.endDate || 'No definida' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Inicio clases</p>
                  <p class="font-semibold">{{ selectedSemester.classesStartDate || 'No definida' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-x" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fin clases</p>
                  <p class="font-semibold">{{ selectedSemester.classesEndDate || 'No definida' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-clock" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Límite matrícula</p>
                  <p class="font-semibold">{{ selectedSemester.enrollmentDeadline || 'No definida' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-alarm-clock-off" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Límite bajas</p>
                  <p class="font-semibold">{{ selectedSemester.dropDeadline || 'No definida' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedSemester" class="space-y-4">
            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: 2025-1" icon="i-lucide-tag" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Año" name="year">
                <UInput v-model.number="editForm.year" type="number" placeholder="2025" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Período" name="period">
                <USelect v-model="editForm.period" :items="[{ label: '1er Semestre', value: 1 }, { label: '2do Semestre', value: 2 }]" placeholder="Seleccionar período" icon="i-lucide-list" />
              </UFormField>
            </div>

            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-toggle-right" />
            </UFormField>

            <UFormField label="Semestre actual" name="isCurrent">
              <UCheckbox v-model="editForm.isCurrent" label="Marcar como semestre actual" />
            </UFormField>

            <USeparator label="Fechas del semestre" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de inicio" name="startDate">
                <UInput v-model="editForm.startDate" type="date" icon="i-lucide-play" />
              </UFormField>
              <UFormField label="Fecha de fin" name="endDate">
                <UInput v-model="editForm.endDate" type="date" icon="i-lucide-stop-circle" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Inicio de clases" name="classesStartDate">
                <UInput v-model="editForm.classesStartDate" type="date" icon="i-lucide-book-open" />
              </UFormField>
              <UFormField label="Fin de clases" name="classesEndDate">
                <UInput v-model="editForm.classesEndDate" type="date" icon="i-lucide-book-x" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Límite de matrícula" name="enrollmentDeadline">
                <UInput v-model="editForm.enrollmentDeadline" type="date" icon="i-lucide-clock" />
              </UFormField>
              <UFormField label="Límite de bajas" name="dropDeadline">
                <UInput v-model="editForm.dropDeadline" type="date" icon="i-lucide-alarm-clock-off" />
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
