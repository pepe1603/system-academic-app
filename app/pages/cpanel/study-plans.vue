<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { StudyPlan } from '~/composables/useStudyPlans'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Planes de Estudio - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedPlan = ref<StudyPlan | null>(null)
const originalPlanData = ref<StudyPlan | null>(null)
const showDeleted = ref(false)

const { plans, loading, error, fetchPlans, fetchDeletedPlans, getPlan, createPlan, updatePlan, deletePlan } = useStudyPlans()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedPlans(0, 10)
  } else {
    fetchPlans(0, 10)
  }
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedPlans(0, 10)
  } else {
    fetchPlans(0, 10)
  }
})

const hasChanges = computed(() => {
  if (!originalPlanData.value || viewMode.value !== 'edit') return false
  
  const orig = originalPlanData.value
  const form = editForm.value
  
  return (
    form.code !== (orig.code || '') ||
    form.name !== (orig.name || '') ||
    form.version !== (orig.version || '') ||
    form.description !== (orig.description || '') ||
    form.titleDegree !== (orig.titleDegree || '') ||
    form.totalCredits !== (orig.totalCredits || undefined) ||
    form.durationSemesters !== (orig.durationSemesters || undefined)
  )
})

const discardChanges = () => {
  if (originalPlanData.value) {
    editForm.value = {
      code: originalPlanData.value.code || '',
      name: originalPlanData.value.name || '',
      version: originalPlanData.value.version || '',
      description: originalPlanData.value.description || '',
      titleDegree: originalPlanData.value.titleDegree || '',
      totalCredits: originalPlanData.value.totalCredits || undefined,
      durationSemesters: originalPlanData.value.durationSemesters || undefined
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const closePanel = () => {
  viewMode.value = null
  selectedPlan.value = null
  originalPlanData.value = null
}

const openCreate = () => {
  selectedPlan.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (plan: StudyPlan) => {
  selectedPlan.value = await getPlan(plan.id)
  viewMode.value = 'view'
}

const openEdit = async (plan: StudyPlan) => {
  selectedPlan.value = await getPlan(plan.id)
  if (selectedPlan.value) {
    originalPlanData.value = { ...selectedPlan.value }
    editForm.value = {
      code: selectedPlan.value.code || '',
      name: selectedPlan.value.name || '',
      version: selectedPlan.value.version || '',
      description: selectedPlan.value.description || '',
      titleDegree: selectedPlan.value.titleDegree || '',
      totalCredits: selectedPlan.value.totalCredits || undefined,
      durationSemesters: selectedPlan.value.durationSemesters || undefined
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  code: '',
  name: '',
  version: '',
  description: '',
  titleDegree: '',
  totalCredits: undefined as number | undefined,
  durationSemesters: undefined as number | undefined
})

const editForm = ref({
  code: '',
  name: '',
  version: '',
  description: '',
  titleDegree: '',
  totalCredits: undefined as number | undefined,
  durationSemesters: undefined as number | undefined
})

const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    version: '',
    description: '',
    titleDegree: '',
    totalCredits: undefined,
    durationSemesters: undefined
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const result = await createPlan({
    code: form.value.code.toUpperCase(),
    name: form.value.name,
    version: form.value.version || undefined,
    description: form.value.description || undefined,
    titleDegree: form.value.titleDegree || undefined,
    totalCredits: form.value.totalCredits || undefined,
    durationSemesters: form.value.durationSemesters || undefined
  })
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedPlan.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.code) data.code = editForm.value.code.toUpperCase()
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.version) data.version = editForm.value.version
  if (editForm.value.description) data.description = editForm.value.description
  if (editForm.value.titleDegree) data.titleDegree = editForm.value.titleDegree
  if (editForm.value.totalCredits) data.totalCredits = editForm.value.totalCredits
  if (editForm.value.durationSemesters) data.durationSemesters = editForm.value.durationSemesters

  const result = await updatePlan(selectedPlan.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    originalPlanData.value = {
      ...originalPlanData.value!,
      code: editForm.value.code,
      name: editForm.value.name,
      version: editForm.value.version,
      description: editForm.value.description,
      titleDegree: editForm.value.titleDegree,
      totalCredits: editForm.value.totalCredits,
      durationSemesters: editForm.value.durationSemesters
    }
    closePanel()
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (plan: StudyPlan) => {
  const confirmed = await confirm({
    title: 'Eliminar plan de estudio',
    description: `¿Estás seguro de eliminar "${plan.name}" (${plan.code})? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deletePlan(plan.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getPlanActions = (plan: StudyPlan): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(plan)
        }
      ]
    ]
  }
  
  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(plan)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(plan)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(plan)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Planes de Estudio</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Planes eliminados' : 'Planes activos' }}: {{ plans.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Plan
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los planes de estudio eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando planes de estudio"
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
          @click="fetchPlans(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="plans.length > 0" divide>
          <UPageCard v-for="plan in plans" :key="plan.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-book-open" class="size-6 text-primary" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <UBadge color="primary" variant="soft" size="sm">{{ plan.code }}</UBadge>
                      <h3 class="font-semibold text-lg">{{ plan.name }}</h3>
                    </div>
                    <p class="text-sm text-muted-foreground">
                      {{ plan.durationSemesters || '?' }} semestres
                      <span v-if="plan.totalCredits"> · {{ plan.totalCredits }} créditos</span>
                      <span v-if="plan.version"> · v{{ plan.version }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span v-if="plan.titleDegree">
                    <UIcon name="i-lucide-graduation-cap" class="size-4 mr-1" />
                    {{ plan.titleDegree }}
                  </span>
                  <span v-if="plan.description" class="truncate max-w-md">
                    <UIcon name="i-lucide-align-left" class="size-4 mr-1" />
                    {{ plan.description }}
                  </span>
                </div>

                <UDropdownMenu :items="getPlanActions(plan)">
                  <UButton size="sm" variant="ghost">
                    <UIcon name="i-lucide-more-horizontal" class="size-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-book-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">
            {{ showDeleted ? 'No hay planes eliminados' : 'No hay planes de estudio' }}
          </h3>
          <p class="text-muted-foreground mb-4">
            {{ showDeleted ? 'No se encontraron planes en la papelera' : 'Crea tu primer plan de estudio para comenzar' }}
          </p>
          <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
            Nuevo Plan
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-2xl">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-book-open' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Plan de Estudio' : viewMode === 'view' ? `Plan: ${selectedPlan?.name}` : `Editar: ${selectedPlan?.name}` }}
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
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Código" name="code" required description="Ej: LENF, LEP">
                <UInput v-model="form.code" placeholder="Ej: LENF" icon="i-lucide-hash" maxlength="20" />
              </UFormField>
              <UFormField label="Versión" name="version">
                <UInput v-model="form.version" placeholder="Ej: 2024" icon="i-lucide-tag" />
              </UFormField>
            </div>

            <UFormField label="Nombre" name="name" required>
              <UInput v-model="form.name" placeholder="Ej: Licenciatura en Enfermería" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Título que otorga" name="titleDegree">
              <UInput v-model="form.titleDegree" placeholder="Ej: Licenciado/a en Enfermería" icon="i-lucide-graduation-cap" />
            </UFormField>

            <UFormField label="Descripción" name="description">
              <UTextarea v-model="form.description" placeholder="Descripción del plan de estudio" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Créditos totales" name="totalCredits">
                <UInput v-model.number="form.totalCredits" type="number" placeholder="Ej: 240" icon="i-lucide-award" :min="0" />
              </UFormField>
              <UFormField label="Duración (semestres)" name="durationSemesters">
                <UInput v-model.number="form.durationSemesters" type="number" placeholder="Ej: 8" icon="i-lucide-layers" :min="1" />
              </UFormField>
            </div>
          </div>

          <div v-else-if="viewMode === 'view' && selectedPlan" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-book-open" class="size-8 text-primary" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <UBadge color="primary" variant="soft">{{ selectedPlan.code }}</UBadge>
                  <h3 class="text-xl font-bold">{{ selectedPlan.name }}</h3>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ selectedPlan.durationSemesters || '?' }} semestres
                  <span v-if="selectedPlan.totalCredits"> · {{ selectedPlan.totalCredits }} créditos</span>
                  <span v-if="selectedPlan.version"> · v{{ selectedPlan.version }}</span>
                </p>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Código</p>
                  <p class="font-semibold font-mono">{{ selectedPlan.code }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-tag" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Versión</p>
                  <p class="font-semibold">{{ selectedPlan.version || 'No definida' }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-graduation-cap" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Título que otorga</p>
                <p class="font-semibold">{{ selectedPlan.titleDegree || 'No definido' }}</p>
              </div>
            </div>

            <div v-if="selectedPlan.description" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Descripción</p>
              <p class="text-sm">{{ selectedPlan.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-award" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Créditos totales</p>
                  <p class="font-semibold">{{ selectedPlan.totalCredits || 'No definido' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-layers" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Duración</p>
                  <p class="font-semibold">{{ selectedPlan.durationSemesters ? `${selectedPlan.durationSemesters} semestres` : 'No definida' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedPlan" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Código" name="code">
                <UInput v-model="editForm.code" placeholder="Ej: LENF" icon="i-lucide-hash" maxlength="20" />
              </UFormField>
              <UFormField label="Versión" name="version">
                <UInput v-model="editForm.version" placeholder="Ej: 2024" icon="i-lucide-tag" />
              </UFormField>
            </div>

            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: Licenciatura en Enfermería" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Título que otorga" name="titleDegree">
              <UInput v-model="editForm.titleDegree" placeholder="Ej: Licenciado/a en Enfermería" icon="i-lucide-graduation-cap" />
            </UFormField>

            <UFormField label="Descripción" name="description">
              <UTextarea v-model="editForm.description" placeholder="Descripción del plan de estudio" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Créditos totales" name="totalCredits">
                <UInput v-model.number="editForm.totalCredits" type="number" placeholder="Ej: 240" icon="i-lucide-award" :min="0" />
              </UFormField>
              <UFormField label="Duración (semestres)" name="durationSemesters">
                <UInput v-model.number="editForm.durationSemesters" type="number" placeholder="Ej: 8" icon="i-lucide-layers" :min="1" />
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