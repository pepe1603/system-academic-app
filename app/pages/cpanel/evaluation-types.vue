<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { EvaluationType } from '~/composables/useEvaluationTypes'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Tipos de Evaluación - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedType = ref<EvaluationType | null>(null)
const originalTypeData = ref<EvaluationType | null>(null)
const showInactive = ref(false)

const { types, loading, error, fetchTypes, fetchInactiveTypes, fetchTypesByCourse, getType, createType, updateType, deleteType } = useEvaluationTypes()
const { courses, fetchCourses: fetchAllCourses } = useCourses()

const selectedCourseId = ref('')

onMounted(() => {
  fetchAllCourses(0, 50)
  if (showInactive.value) {
    fetchInactiveTypes()
  } else {
    fetchTypes(0, 50)
  }
})

watch(showInactive, (inactive) => {
  if (inactive) {
    fetchInactiveTypes()
  } else {
    if (selectedCourseId.value) {
      fetchTypesByCourse(selectedCourseId.value)
    } else {
      fetchTypes(0, 50)
    }
  }
})

watch(selectedCourseId, (courseId) => {
  if (showInactive.value) return
  if (courseId) {
    fetchTypesByCourse(courseId)
  } else {
    fetchTypes(0, 50)
  }
})

const courseOptions = computed(() =>
  courses.value.map(c => ({ label: `${c.courseCode} - ${c.name}`, value: c.id }))
)

const hasChanges = computed(() => {
  if (!originalTypeData.value || viewMode.value !== 'edit') return false

  const orig = originalTypeData.value
  const f = editForm.value

  return (
    f.code !== (orig.code || '') ||
    f.name !== (orig.name || '') ||
    f.weight !== (orig.weight || 0) ||
    f.courseId !== (orig.courseId || '')
  )
})

const discardChanges = () => {
  if (originalTypeData.value) {
    const orig = originalTypeData.value
    editForm.value = {
      code: orig.code || '',
      name: orig.name || '',
      weight: orig.weight || 0,
      courseId: orig.courseId || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  if (!selectedCourseId.value) {
    fetchTypes(newPage - 1, 10)
  }
})

const closePanel = () => {
  viewMode.value = null
  selectedType.value = null
  originalTypeData.value = null
}

const openCreate = () => {
  selectedType.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (type: EvaluationType) => {
  selectedType.value = await getType(type.id)
  viewMode.value = 'view'
}

const openEdit = async (type: EvaluationType) => {
  selectedType.value = await getType(type.id)
  if (selectedType.value) {
    originalTypeData.value = { ...selectedType.value }
    const t = selectedType.value
    editForm.value = {
      code: t.code || '',
      name: t.name || '',
      weight: t.weight || 0,
      courseId: t.courseId || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  code: '',
  name: '',
  weight: 0,
  courseId: ''
})

const editForm = ref({
  code: '',
  name: '',
  weight: 0,
  courseId: ''
})

const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    weight: 0,
    courseId: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data = {
    courseId: form.value.courseId,
    code: form.value.code,
    name: form.value.name || undefined,
    weight: form.value.weight || undefined
  }
  const result = await createType(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    if (selectedCourseId.value) {
      fetchTypesByCourse(selectedCourseId.value)
    } else {
      fetchTypes(0, 50)
    }
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedType.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.code) data.code = editForm.value.code
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.weight) data.weight = editForm.value.weight
  if (editForm.value.courseId) data.courseId = editForm.value.courseId

  const result = await updateType(selectedType.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    if (selectedCourseId.value) {
      fetchTypesByCourse(selectedCourseId.value)
    } else {
      fetchTypes(0, 50)
    }
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (type: EvaluationType) => {
  const confirmed = await confirm({
    title: 'Eliminar tipo de evaluación',
    description: `¿Estás seguro de eliminar "${type.code}" (${type.courseCode})? Esta acción es permanente y no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deleteType(type.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      if (selectedCourseId.value) {
        fetchTypesByCourse(selectedCourseId.value)
      } else {
        fetchTypes(0, 50)
      }
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getActions = (type: EvaluationType): DropdownMenuItem[][] => {
  if (showInactive.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(type)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(type)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(type)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(type)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Tipos de Evaluación</h1>
        <p class="text-muted-foreground">
          {{ showInactive ? 'Tipos inactivos' : 'Tipos activos' }}: {{ types.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showInactive" label="Ver inactivos" />
        <UButton v-if="!showInactive" @click="openCreate" icon="i-lucide-plus">
          Nuevo Tipo
        </UButton>
      </div>
    </div>

    <UAlert v-if="showInactive" color="warning" variant="soft" icon="i-lucide-eye-off" class="mb-4">
      <template #title>Vista de inactivos</template>
      <template #description>Estás viendo los tipos de evaluación inactivos. No se pueden editar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando tipos de evaluación"
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
          @click="fetchTypes(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <UAlert color="neutral" variant="soft" class="mb-4" icon="i-lucide-info">
        <template #title>Filtrar por curso</template>
        <template #description>
          <div class="flex items-center gap-4 mt-2">
            <USelect v-model="selectedCourseId" :items="courseOptions" placeholder="Todos los cursos" icon="i-lucide-book-open" class="w-80" clearable />
          </div>
        </template>
      </UAlert>

      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="types.length > 0" divide>
          <UPageCard v-for="type in types" :key="type.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-clipboard-list" class="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ type.code }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ type.name || 'Sin nombre' }} · {{ type.courseCode }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium tabular-nums">{{ type.weight }}%</span>
                  <UBadge :color="type.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ type.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-book-open" class="size-4 mr-1" />
                    {{ type.courseName }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(type)">
                  <UButton size="sm" variant="ghost">
                    <UIcon name="i-lucide-more-horizontal" class="size-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-clipboard-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay tipos de evaluación</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer tipo de evaluación para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Tipo
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-clipboard-list' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Tipo de Evaluación' : viewMode === 'view' ? `Evaluación: ${selectedType?.code}` : `Editar: ${selectedType?.code}` }}
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
            <UFormField label="Curso" name="courseId" required>
              <USelect v-model="form.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Código" name="code" required class="col-span-2">
                <UInput v-model="form.code" placeholder="Ej: P1, TA, EX" icon="i-lucide-hash" />
              </UFormField>
              <UFormField label="Peso %" name="weight">
                <UInput v-model.number="form.weight" type="number" placeholder="25" icon="i-lucide-percent" min="0" max="100" />
              </UFormField>
            </div>

            <UFormField label="Nombre" name="name">
              <UInput v-model="form.name" placeholder="Ej: Primer Parcial" icon="i-lucide-tag" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedType" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-clipboard-list" class="size-8 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-bold">{{ selectedType.code }}</h3>
                <p class="text-muted-foreground">{{ selectedType.name || 'Sin nombre' }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="selectedType.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ selectedType.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Curso</p>
                  <p class="font-semibold">{{ selectedType.courseCode }} - {{ selectedType.courseName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-percent" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Peso</p>
                  <p class="font-semibold">{{ selectedType.weight }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedType" class="space-y-4">
            <UFormField label="Curso" name="courseId">
              <USelect v-model="editForm.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Código" name="code" class="col-span-2">
                <UInput v-model="editForm.code" placeholder="Ej: P1, TA, EX" icon="i-lucide-hash" />
              </UFormField>
              <UFormField label="Peso %" name="weight">
                <UInput v-model.number="editForm.weight" type="number" placeholder="25" icon="i-lucide-percent" min="0" max="100" />
              </UFormField>
            </div>

            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: Primer Parcial" icon="i-lucide-tag" />
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
