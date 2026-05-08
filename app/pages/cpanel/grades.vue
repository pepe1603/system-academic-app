<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Grade } from '~/composables/useGrades'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Calificaciones - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedGrade = ref<Grade | null>(null)
const originalGradeData = ref<Grade | null>(null)
const showDeleted = ref(false)

const { grades, loading, error, fetchGrades, fetchDeletedGrades, getGrade, createGrade, updateGrade, deleteGrade } = useGrades()
const { enrollments, fetchEnrollments: fetchAllEnrollments } = useEnrollments()
const { types, fetchTypes: fetchAllTypes } = useEvaluationTypes()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedGrades()
  } else {
    fetchGrades(0, 10)
  }
  fetchAllEnrollments(0, 50)
  fetchAllTypes(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedGrades()
  } else {
    fetchGrades(0, 10)
  }
})

const enrollmentOptions = computed(() =>
  enrollments.value.map(e => ({ label: `${e.studentName} - ${e.courseName} (${e.academicPeriodName})`, value: e.id }))
)

const evaluationTypeOptions = computed(() =>
  types.value.map(t => ({ label: `${t.code} - ${t.name || ''} (${t.weight}%)`, value: t.id }))
)

const hasChanges = computed(() => {
  if (!originalGradeData.value || viewMode.value !== 'edit') return false

  return editForm.value.score !== (originalGradeData.value.score ?? 0)
})

const discardChanges = () => {
  if (originalGradeData.value) {
    editForm.value = {
      score: originalGradeData.value.score ?? 0
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchGrades(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedGrade.value = null
  originalGradeData.value = null
}

const openCreate = () => {
  selectedGrade.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (grade: Grade) => {
  selectedGrade.value = await getGrade(grade.id)
  viewMode.value = 'view'
}

const openEdit = async (grade: Grade) => {
  selectedGrade.value = await getGrade(grade.id)
  if (selectedGrade.value) {
    originalGradeData.value = { ...selectedGrade.value }
    editForm.value = {
      score: selectedGrade.value.score ?? 0
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  enrollmentId: '',
  evaluationTypeId: '',
  score: 0
})

const editForm = ref({
  score: 0
})

const resetForm = () => {
  form.value = {
    enrollmentId: '',
    evaluationTypeId: '',
    score: 0
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const result = await createGrade({
    enrollmentId: form.value.enrollmentId,
    evaluationTypeId: form.value.evaluationTypeId,
    score: form.value.score
  })
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGrades(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedGrade.value) return

  submitting.value = true
  const result = await updateGrade(selectedGrade.value.id, { score: editForm.value.score })
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGrades(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (grade: Grade) => {
  const confirmed = await confirm({
    title: 'Eliminar calificación',
    description: `¿Estás seguro de eliminar la calificación de "${grade.studentName}" en "${grade.evaluationName}" (${grade.score})?`
  })
  if (confirmed) {
    const result = await deleteGrade(grade.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchGrades(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getActions = (grade: Grade): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(grade)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(grade)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(grade)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(grade)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Calificaciones</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Calificaciones eliminadas' : 'Calificaciones activas' }}: {{ grades.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nueva Calificación
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo las calificaciones eliminadas. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando calificaciones"
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
          @click="fetchGrades(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="grades.length > 0" divide>
          <UPageCard v-for="grade in grades" :key="grade.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${grade.studentName.charAt(0)}${grade.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ grade.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ grade.evaluationName }} · {{ grade.courseCode }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge color="primary" variant="soft" size="sm">
                    {{ grade.score }}
                  </UBadge>
                  <UBadge :color="!grade.isDeleted ? 'success' : 'neutral'" variant="soft">
                    {{ !grade.isDeleted ? 'Activo' : 'Eliminado' }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-book-open" class="size-4 mr-1" />
                    {{ grade.courseName }}
                  </span>
                  <span>
                    <UIcon name="i-lucide-hash" class="size-4 mr-1" />
                    {{ grade.enrollmentNumber }}
                  </span>
                  <span v-if="grade.evaluationWeight">
                    <UIcon name="i-lucide-percent" class="size-4 mr-1" />
                    {{ grade.evaluationWeight }}%
                  </span>
                </div>

                <UDropdownMenu :items="getActions(grade)">
                  <UButton size="sm" variant="ghost">
                    <UIcon name="i-lucide-more-horizontal" class="size-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-file-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay calificaciones</h3>
          <p class="text-muted-foreground mb-4">Registra la primera calificación para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nueva Calificación
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nueva Calificación' : viewMode === 'view' ? `Calificación: ${selectedGrade?.studentName}` : `Editar: ${selectedGrade?.studentName}` }}
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
            <UFormField label="Inscripción" name="enrollmentId" required>
              <USelect v-model="form.enrollmentId" :items="enrollmentOptions" placeholder="Seleccionar inscripción" icon="i-lucide-file-text" />
            </UFormField>

            <UFormField label="Tipo de evaluación" name="evaluationTypeId" required>
              <USelect v-model="form.evaluationTypeId" :items="evaluationTypeOptions" placeholder="Seleccionar tipo de evaluación" icon="i-lucide-clipboard-list" />
            </UFormField>

            <UFormField label="Calificación (0-100)" name="score" required>
              <UInput v-model="form.score" type="number" min="0" max="100" step="0.1" placeholder="0-100" icon="i-lucide-star" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedGrade" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedGrade.studentName.charAt(0)}${selectedGrade.studentName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedGrade.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge color="primary" variant="soft">
                    {{ selectedGrade.score }}
                  </UBadge>
                  <UBadge :color="!selectedGrade.isDeleted ? 'success' : 'neutral'" variant="soft">
                    {{ !selectedGrade.isDeleted ? 'Activo' : 'Eliminado' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-clipboard-list" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Evaluación</p>
                  <p class="font-semibold">{{ selectedGrade.evaluationCode }} - {{ selectedGrade.evaluationName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-percent" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Peso</p>
                  <p class="font-semibold">{{ selectedGrade.evaluationWeight }}%</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Curso</p>
                  <p class="font-semibold">{{ selectedGrade.courseCode }} - {{ selectedGrade.courseName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Matrícula</p>
                  <p class="font-semibold">{{ selectedGrade.enrollmentNumber }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Calificación</p>
                <p class="font-semibold text-2xl">{{ selectedGrade.score }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedGrade" class="space-y-4">
            <UFormField label="Calificación (0-100)" name="score">
              <UInput v-model="editForm.score" type="number" min="0" max="100" step="0.1" placeholder="0-100" icon="i-lucide-star" />
            </UFormField>
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
