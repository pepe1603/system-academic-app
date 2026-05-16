<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Semester } from '~/composables/useSemesters'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Semestres (Plan de Estudio) - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedSemester = ref<Semester | null>(null)
const originalSemesterData = ref<Semester | null>(null)
const showDeleted = ref(false)

const { semestersList, loading, error, fetchSemesters, fetchDeletedSemesters, getSemester, createSemester, updateSemester, deleteSemester } = useSemestersModule()
const { plans: studyPlans, fetchPlans: fetchAllStudyPlans } = useStudyPlans()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedSemesters()
  } else {
    fetchSemesters(0, 10)
  }
  fetchAllStudyPlans(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedSemesters()
  } else {
    fetchSemesters(0, 10)
  }
})

const studyPlanOptions = computed(() =>
  studyPlans.value.map(sp => ({ label: `${sp.code} - ${sp.name}`, value: sp.id }))
)

const hasChanges = computed(() => {
  if (!originalSemesterData.value || viewMode.value !== 'edit') return false
  const orig = originalSemesterData.value
  const f = editForm.value
  return (
    f.name !== (orig.name || '') ||
    f.semesterNumber !== (orig.semesterNumber ?? '') ||
    f.studyPlanId !== (orig.studyPlanId || '') ||
    f.isActive !== orig.isActive
  )
})

const discardChanges = () => {
  if (originalSemesterData.value) {
    const orig = originalSemesterData.value
    editForm.value = {
      name: orig.name || '',
      semesterNumber: orig.semesterNumber,
      studyPlanId: orig.studyPlanId || '',
      isActive: orig.isActive
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

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

const openView = async (semester: Semester) => {
  selectedSemester.value = await getSemester(semester.id)
  viewMode.value = 'view'
}

const openEdit = async (semester: Semester) => {
  selectedSemester.value = await getSemester(semester.id)
  if (selectedSemester.value) {
    originalSemesterData.value = { ...selectedSemester.value }
    const e = selectedSemester.value
    editForm.value = {
      name: e.name || '',
      semesterNumber: e.semesterNumber,
      studyPlanId: e.studyPlanId || '',
      isActive: e.isActive
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studyPlanId: '',
  semesterNumber: 1,
  name: ''
})

const editForm = ref({
  name: '',
  semesterNumber: 1,
  studyPlanId: '',
  isActive: true
})

const resetForm = () => {
  form.value = {
    studyPlanId: '',
    semesterNumber: 1,
    name: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studyPlanId: form.value.studyPlanId || undefined,
    semesterNumber: form.value.semesterNumber,
    name: form.value.name
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
  if (editForm.value.semesterNumber) data.semesterNumber = editForm.value.semesterNumber
  if (editForm.value.studyPlanId) data.studyPlanId = editForm.value.studyPlanId
  data.isActive = editForm.value.isActive

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

const handleDelete = async (semester: Semester) => {
  const confirmed = await confirm({
    title: 'Eliminar semestre',
    description: `¿Estás seguro de eliminar el semestre "${semester.name}" (N° ${semester.semesterNumber})?`
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

const getActions = (semester: Semester): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [[{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(semester) }]]
  }
  return [
    [
      { label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(semester) },
      { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => openEdit(semester) }
    ],
    [{ label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => handleDelete(semester) }]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Semestres (Plan de Estudio)</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Semestres eliminados' : 'Semestres activos' }}: {{ semestersList.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">Nuevo Semestre</UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los semestres eliminados.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando semestres" description="Por favor espera...">
      <template #icon><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" /></template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchSemesters(0, 10)" />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="semestersList.length > 0" divide>
          <UPageCard v-for="semester in semestersList" :key="semester.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar :text="`S${semester.semesterNumber}`" color="primary" variant="soft" class="w-12 h-12" />
                  <div>
                    <h3 class="font-semibold text-lg">{{ semester.name }}</h3>
                    <p class="text-sm text-muted-foreground">Semestre N° {{ semester.semesterNumber }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="semester.studyPlanName" color="neutral" variant="soft">{{ semester.studyPlanName }}</UBadge>
                  <UBadge :color="semester.isActive ? 'success' : 'neutral'" variant="soft">{{ semester.isActive ? 'Activo' : 'Inactivo' }}</UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span><UIcon name="i-lucide-hash" class="size-4 mr-1" />N° {{ semester.semesterNumber }}</span>
                  <span v-if="semester.studyPlanName"><UIcon name="i-lucide-book" class="size-4 mr-1" />{{ semester.studyPlanName }}</span>
                </div>
                <UDropdownMenu :items="getActions(semester)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-calendar-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay semestres</h3>
          <p class="text-muted-foreground mb-4">Registra el primer semestre para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nuevo Semestre</UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-md">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">{{ viewMode === 'create' ? 'Nuevo Semestre' : viewMode === 'view' ? `Semestre: ${selectedSemester?.name}` : `Editar: ${selectedSemester?.name}` }}</span>
                <UBadge v-if="viewMode === 'edit' && hasChanges" color="warning" variant="soft" class="animate-pulse"><UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />Cambios pendientes</UBadge>
                <UBadge v-else-if="viewMode === 'edit' && !hasChanges" color="success" variant="soft"><UIcon name="i-lucide-check" class="size-3 mr-1" />Sin cambios</UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div v-if="viewMode === 'create'" class="space-y-4">
            <UFormField label="Plan de estudio" name="studyPlanId">
              <USelect v-model="form.studyPlanId" :items="studyPlanOptions" placeholder="Seleccionar plan" icon="i-lucide-book" />
            </UFormField>
            <UFormField label="Número de semestre" name="semesterNumber" required>
              <UInput v-model="form.semesterNumber" type="number" min="1" max="10" placeholder="1" icon="i-lucide-hash" />
            </UFormField>
            <UFormField label="Nombre" name="name" required>
              <UInput v-model="form.name" placeholder="Ej: Primer Semestre" icon="i-lucide-file-text" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedSemester" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar :text="`S${selectedSemester.semesterNumber}`" color="primary" variant="soft" class="w-16 h-16 text-lg" />
              <div>
                <h3 class="text-xl font-bold">{{ selectedSemester.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge color="neutral" variant="soft">N° {{ selectedSemester.semesterNumber }}</UBadge>
                  <UBadge :color="selectedSemester.isActive ? 'success' : 'neutral'" variant="soft">{{ selectedSemester.isActive ? 'Activo' : 'Inactivo' }}</UBadge>
                </div>
              </div>
            </div>
            <USeparator label="Plan de estudio" />
            <div v-if="selectedSemester.studyPlanName" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-book" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Plan de estudio</p><p class="font-semibold">{{ selectedSemester.studyPlanName }}</p></div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedSemester" class="space-y-4">
            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Nombre del semestre" icon="i-lucide-file-text" />
            </UFormField>
            <UFormField label="Número de semestre" name="semesterNumber">
              <UInput v-model="editForm.semesterNumber" type="number" min="1" max="10" icon="i-lucide-hash" />
            </UFormField>
            <UFormField label="Plan de estudio" name="studyPlanId">
              <USelect v-model="editForm.studyPlanId" :items="studyPlanOptions" placeholder="Seleccionar plan" icon="i-lucide-book" />
            </UFormField>
            <UFormField label="Activo" name="isActive">
              <UCheckbox v-model="editForm.isActive" label="Semestre activo" />
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
