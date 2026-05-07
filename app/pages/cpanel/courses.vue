<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Course } from '~/composables/useCourses'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Cursos - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedCourse = ref<Course | null>(null)
const originalCourseData = ref<Course | null>(null)
const showDeleted = ref(false)

const { courses, loading, error, fetchCourses, fetchDeletedCourses, getCourse, createCourse, updateCourse, deleteCourse } = useCourses()
const { plans, fetchPlans: fetchStudyPlans } = useStudyPlans()
const { semesters, fetchSemesters: fetchAcademicSemesters } = useAcademicSemesters()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedCourses()
  } else {
    fetchCourses(0, 50)
  }
  fetchStudyPlans(0, 50)
  fetchAcademicSemesters(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedCourses()
  } else {
    fetchCourses(0, 50)
  }
})

const planOptions = computed(() =>
  plans.value.map(p => ({ label: `${p.code} - ${p.name}`, value: p.id }))
)

const semesterOptions = computed(() =>
  semesters.value.map(s => ({ label: s.name, value: s.id }))
)

const hasChanges = computed(() => {
  if (!originalCourseData.value || viewMode.value !== 'edit') return false

  const orig = originalCourseData.value
  const f = editForm.value

  return (
    f.courseCode !== (orig.courseCode || '') ||
    f.name !== (orig.name || '') ||
    f.credits !== (orig.credits || 0) ||
    f.hoursTheory !== (orig.hoursTheory || 0) ||
    f.hoursPractice !== (orig.hoursPractice || 0) ||
    f.description !== (orig.description || '') ||
    f.isMandatory !== orig.isMandatory ||
    f.isActive !== orig.isActive ||
    f.studyPlanId !== (orig.studyPlanId || '') ||
    f.semesterId !== (orig.semesterId || '')
  )
})

const discardChanges = () => {
  if (originalCourseData.value) {
    const orig = originalCourseData.value
    editForm.value = {
      courseCode: orig.courseCode || '',
      name: orig.name || '',
      credits: orig.credits || 0,
      hoursTheory: orig.hoursTheory || 0,
      hoursPractice: orig.hoursPractice || 0,
      description: orig.description || '',
      isMandatory: orig.isMandatory,
      isActive: orig.isActive,
      studyPlanId: orig.studyPlanId || '',
      semesterId: orig.semesterId || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchCourses(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedCourse.value = null
  originalCourseData.value = null
}

const openCreate = () => {
  selectedCourse.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (course: Course) => {
  selectedCourse.value = await getCourse(course.id)
  viewMode.value = 'view'
}

const openEdit = async (course: Course) => {
  selectedCourse.value = await getCourse(course.id)
  if (selectedCourse.value) {
    originalCourseData.value = { ...selectedCourse.value }
    const c = selectedCourse.value
    editForm.value = {
      courseCode: c.courseCode || '',
      name: c.name || '',
      credits: c.credits || 0,
      hoursTheory: c.hoursTheory || 0,
      hoursPractice: c.hoursPractice || 0,
      description: c.description || '',
      isMandatory: c.isMandatory,
      isActive: c.isActive,
      studyPlanId: c.studyPlanId || '',
      semesterId: c.semesterId || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  courseCode: '',
  name: '',
  credits: 0,
  hoursTheory: 0,
  hoursPractice: 0,
  description: '',
  isMandatory: true,
  isActive: true,
  studyPlanId: '',
  semesterId: ''
})

const editForm = ref({
  courseCode: '',
  name: '',
  credits: 0,
  hoursTheory: 0,
  hoursPractice: 0,
  description: '',
  isMandatory: true,
  isActive: true,
  studyPlanId: '',
  semesterId: ''
})

const resetForm = () => {
  form.value = {
    courseCode: '',
    name: '',
    credits: 0,
    hoursTheory: 0,
    hoursPractice: 0,
    description: '',
    isMandatory: true,
    isActive: true,
    studyPlanId: '',
    semesterId: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data = {
    studyPlanId: form.value.studyPlanId,
    semesterId: form.value.semesterId,
    courseCode: form.value.courseCode,
    name: form.value.name,
    credits: form.value.credits,
    hoursTheory: form.value.hoursTheory || undefined,
    hoursPractice: form.value.hoursPractice || undefined,
    description: form.value.description || undefined,
    isMandatory: form.value.isMandatory,
    isActive: form.value.isActive
  }
  const result = await createCourse(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchCourses(0, 50)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedCourse.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.courseCode) data.courseCode = editForm.value.courseCode
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.credits) data.credits = editForm.value.credits
  if (editForm.value.hoursTheory) data.hoursTheory = editForm.value.hoursTheory
  if (editForm.value.hoursPractice) data.hoursPractice = editForm.value.hoursPractice
  if (editForm.value.description) data.description = editForm.value.description
  data.isMandatory = editForm.value.isMandatory
  data.isActive = editForm.value.isActive
  if (editForm.value.studyPlanId) data.studyPlanId = editForm.value.studyPlanId
  if (editForm.value.semesterId) data.semesterId = editForm.value.semesterId

  const result = await updateCourse(selectedCourse.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchCourses(0, 50)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (course: Course) => {
  const confirmed = await confirm({
    title: 'Eliminar curso',
    description: `¿Estás seguro de eliminar "${course.courseCode} - ${course.name}"? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deleteCourse(course.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchCourses(0, 50)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getActions = (course: Course): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(course)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(course)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(course)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(course)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Cursos</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Cursos eliminados' : 'Cursos activos' }}: {{ courses.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Curso
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los cursos eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando cursos"
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
          @click="fetchCourses(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="courses.length > 0" divide>
          <UPageCard v-for="course in courses" :key="course.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-book-open" class="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ course.courseCode }} - {{ course.name }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ course.studyPlanCode }} · {{ course.semesterName }}
                      <UBadge v-if="course.isMandatory" color="primary" variant="soft" size="xs" class="ml-2">
                        Obligatorio
                      </UBadge>
                      <UBadge v-else color="neutral" variant="soft" size="xs" class="ml-2">
                        Optativo
                      </UBadge>
                    </p>
                  </div>
                </div>
                <UBadge :color="course.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ course.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-star" class="size-4 mr-1" />
                    {{ course.credits }} créditos
                  </span>
                  <span v-if="course.hoursTheory">
                    <UIcon name="i-lucide-book" class="size-4 mr-1" />
                    Teoría: {{ course.hoursTheory }}h
                  </span>
                  <span v-if="course.hoursPractice">
                    <UIcon name="i-lucide-flask" class="size-4 mr-1" />
                    Práctica: {{ course.hoursPractice }}h
                  </span>
                </div>

                <UDropdownMenu :items="getActions(course)">
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
          <h3 class="text-lg font-medium mb-2">No hay cursos</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer curso para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Curso
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-book-open' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Curso' : viewMode === 'view' ? `Curso: ${selectedCourse?.courseCode}` : `Editar: ${selectedCourse?.courseCode}` }}
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
            <UFormField label="Plan de estudio" name="studyPlanId" required>
              <USelect v-model="form.studyPlanId" :items="planOptions" placeholder="Seleccionar plan" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Semestre" name="semesterId" required>
              <USelect v-model="form.semesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-list" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Código del curso" name="courseCode" required>
                <UInput v-model="form.courseCode" placeholder="Ej: LEP106" icon="i-lucide-hash" />
              </UFormField>
              <UFormField label="Créditos" name="credits" required>
                <UInput v-model.number="form.credits" type="number" placeholder="8" icon="i-lucide-star" min="1" />
              </UFormField>
            </div>

            <UFormField label="Nombre" name="name" required>
              <UInput v-model="form.name" placeholder="Ej: Historia de la Educación" icon="i-lucide-tag" />
            </UFormField>

            <UFormField label="Descripción" name="description">
              <UTextarea v-model="form.description" placeholder="Descripción del curso" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Horas teoría" name="hoursTheory">
                <UInput v-model.number="form.hoursTheory" type="number" placeholder="4" icon="i-lucide-book" />
              </UFormField>
              <UFormField label="Horas práctica" name="hoursPractice">
                <UInput v-model.number="form.hoursPractice" type="number" placeholder="2" icon="i-lucide-flask" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Obligatorio" name="isMandatory">
                <UCheckbox v-model="form.isMandatory" label="Curso obligatorio" />
              </UFormField>
              <UFormField label="Activo" name="isActive">
                <UCheckbox v-model="form.isActive" label="Curso activo" />
              </UFormField>
            </div>
          </div>

          <div v-else-if="viewMode === 'view' && selectedCourse" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-book-open" class="size-8 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-bold">{{ selectedCourse.courseCode }}</h3>
                <p class="text-muted-foreground">{{ selectedCourse.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="selectedCourse.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ selectedCourse.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                  <UBadge v-if="selectedCourse.isMandatory" color="primary" variant="soft">
                    Obligatorio
                  </UBadge>
                  <UBadge v-else color="neutral" variant="soft">
                    Optativo
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Plan de estudio</p>
                  <p class="font-semibold">{{ selectedCourse.studyPlanName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-list" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Semestre</p>
                  <p class="font-semibold">{{ selectedCourse.semesterName }}</p>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-3 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Créditos</p>
                  <p class="font-semibold">{{ selectedCourse.credits }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Teoría</p>
                  <p class="font-semibold">{{ selectedCourse.hoursTheory || '0' }}h</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-flask" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Práctica</p>
                  <p class="font-semibold">{{ selectedCourse.hoursPractice || '0' }}h</p>
                </div>
              </div>
            </div>

            <div v-if="selectedCourse.description" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Descripción</p>
              <p class="text-sm">{{ selectedCourse.description }}</p>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedCourse" class="space-y-4">
            <UFormField label="Plan de estudio" name="studyPlanId">
              <USelect v-model="editForm.studyPlanId" :items="planOptions" placeholder="Seleccionar plan" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Semestre" name="semesterId">
              <USelect v-model="editForm.semesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-list" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Código del curso" name="courseCode">
                <UInput v-model="editForm.courseCode" placeholder="Ej: LEP106" icon="i-lucide-hash" />
              </UFormField>
              <UFormField label="Créditos" name="credits">
                <UInput v-model.number="editForm.credits" type="number" placeholder="8" icon="i-lucide-star" min="1" />
              </UFormField>
            </div>

            <UFormField label="Nombre" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: Historia de la Educación" icon="i-lucide-tag" />
            </UFormField>

            <UFormField label="Descripción" name="description">
              <UTextarea v-model="editForm.description" placeholder="Descripción del curso" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Horas teoría" name="hoursTheory">
                <UInput v-model.number="editForm.hoursTheory" type="number" placeholder="4" icon="i-lucide-book" />
              </UFormField>
              <UFormField label="Horas práctica" name="hoursPractice">
                <UInput v-model.number="editForm.hoursPractice" type="number" placeholder="2" icon="i-lucide-flask" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Obligatorio" name="isMandatory">
                <UCheckbox v-model="editForm.isMandatory" label="Curso obligatorio" />
              </UFormField>
              <UFormField label="Activo" name="isActive">
                <UCheckbox v-model="editForm.isActive" label="Curso activo" />
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
