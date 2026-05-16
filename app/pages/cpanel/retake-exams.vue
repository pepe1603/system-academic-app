<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { RetakeExam } from '~/composables/useRetakeExams'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Retake Exams - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedExam = ref<RetakeExam | null>(null)
const originalExamData = ref<RetakeExam | null>(null)
const showDeleted = ref(false)

const { exams, loading, error, fetchExams, fetchDeletedExams, getExam, createExam, updateExam, deleteExam } = useRetakeExams()
const { students, fetchStudents: fetchAllStudents } = useStudents()
const { courses, fetchCourses: fetchAllCourses } = useCourses()
const { semesters, fetchSemesters: fetchAllSemesters } = useAcademicSemesters()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedExams()
  } else {
    fetchExams(0, 10)
  }
  fetchAllStudents(0, 50)
  fetchAllCourses(0, 50)
  fetchAllSemesters(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedExams()
  } else {
    fetchExams(0, 10)
  }
})

const statusOptions = [
  { label: 'Inscrito', value: 'ENROLLED' },
  { label: 'Cursando', value: 'IN_PROGRESS' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Reprobado', value: 'FAILED' },
  { label: 'Cancelado', value: 'CANCELLED' }
]

const studentOptions = computed(() =>
  students.value.map(s => ({ label: `${s.enrollmentNumber} - ${s.firstName} ${s.lastName}`, value: s.id }))
)

const courseOptions = computed(() =>
  courses.value.map(c => ({ label: `${c.courseCode} - ${c.name}`, value: c.id }))
)

const semesterOptions = computed(() =>
  semesters.value.map((s: { id: string; name: string }) => ({ label: s.name, value: s.id }))
)

const hasChanges = computed(() => {
  if (!originalExamData.value || viewMode.value !== 'edit') return false
  const orig = originalExamData.value
  const f = editForm.value
  return (
    f.status !== (orig.status || '') ||
    f.originSemesterId !== (orig.originSemesterId || '') ||
    f.previousAverage !== (orig.previousAverage ?? '')
  )
})

const discardChanges = () => {
  if (originalExamData.value) {
    const orig = originalExamData.value
    editForm.value = {
      status: orig.status || 'ENROLLED',
      originSemesterId: orig.originSemesterId || '',
      previousAverage: orig.previousAverage ?? null
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchExams(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedExam.value = null
  originalExamData.value = null
}

const openCreate = () => {
  selectedExam.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (exam: RetakeExam) => {
  selectedExam.value = await getExam(exam.id)
  viewMode.value = 'view'
}

const openEdit = async (exam: RetakeExam) => {
  selectedExam.value = await getExam(exam.id)
  if (selectedExam.value) {
    originalExamData.value = { ...selectedExam.value }
    const e = selectedExam.value
    editForm.value = {
      status: e.status || 'ENROLLED',
      originSemesterId: e.originSemesterId || '',
      previousAverage: e.previousAverage ?? null
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  courseId: '',
  academicSemesterId: '',
  originSemesterId: '',
  previousAverage: null as number | null
})

const editForm = ref({
  status: 'ENROLLED',
  originSemesterId: '',
  previousAverage: null as number | null
})

const resetForm = () => {
  form.value = {
    studentId: '',
    courseId: '',
    academicSemesterId: '',
    originSemesterId: '',
    previousAverage: null
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    courseId: form.value.courseId,
    academicSemesterId: form.value.academicSemesterId,
    originSemesterId: form.value.originSemesterId || undefined,
    previousAverage: form.value.previousAverage ?? undefined
  }
  const result = await createExam(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchExams(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedExam.value) return
  submitting.value = true
  const data: any = {}
  if (editForm.value.status) data.status = editForm.value.status
  if (editForm.value.originSemesterId) data.originSemesterId = editForm.value.originSemesterId
  if (editForm.value.previousAverage !== null) data.previousAverage = editForm.value.previousAverage

  const result = await updateExam(selectedExam.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchExams(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (exam: RetakeExam) => {
  const confirmed = await confirm({
    title: 'Eliminar retake exam',
    description: `¿Estás seguro de eliminar el retake de "${exam.studentName}" en "${exam.courseCode}"?`
  })
  if (confirmed) {
    const result = await deleteExam(exam.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchExams(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'ENROLLED': return 'info'
    case 'IN_PROGRESS': return 'warning'
    case 'APPROVED': return 'success'
    case 'FAILED': return 'error'
    case 'CANCELLED': return 'neutral'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'ENROLLED': return 'Inscrito'
    case 'IN_PROGRESS': return 'Cursando'
    case 'APPROVED': return 'Aprobado'
    case 'FAILED': return 'Reprobado'
    case 'CANCELLED': return 'Cancelado'
    default: return status
  }
}

const getActions = (exam: RetakeExam): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [[{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(exam) }]]
  }
  return [
    [
      { label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(exam) },
      { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => openEdit(exam) }
    ],
    [{ label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => handleDelete(exam) }]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Retake Exams</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Retake exams eliminados' : 'Retake exams activos' }}: {{ exams.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Retake
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los retake exams eliminados.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando retake exams" description="Por favor espera...">
      <template #icon><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" /></template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchExams(0, 10)" />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="exams.length > 0" divide>
          <UPageCard v-for="exam in exams" :key="exam.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar :text="`${exam.studentName.charAt(0)}${exam.studentName.split(' ').pop()?.charAt(0) || ''}`" color="primary" variant="soft" class="w-12 h-12" />
                  <div>
                    <h3 class="font-semibold text-lg">{{ exam.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">{{ exam.courseCode }} · {{ exam.enrollmentNumber }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="statusBadgeColor(exam.status)" variant="soft">{{ statusLabel(exam.status) }}</UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span><UIcon name="i-lucide-book-open" class="size-4 mr-1" />{{ exam.courseName }}</span>
                  <span v-if="exam.academicSemesterName"><UIcon name="i-lucide-calendar-range" class="size-4 mr-1" />{{ exam.academicSemesterName }}</span>
                  <span v-if="exam.previousAverage != null"><UIcon name="i-lucide-star" class="size-4 mr-1" />Prev: {{ exam.previousAverage }}</span>
                </div>
                <UDropdownMenu :items="getActions(exam)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-file-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay retake exams</h3>
          <p class="text-muted-foreground mb-4">Registra el primer retake exam para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nuevo Retake</UButton>
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
                <span class="font-semibold">{{ viewMode === 'create' ? 'Nuevo Retake Exam' : viewMode === 'view' ? `Retake: ${selectedExam?.studentName}` : `Editar: ${selectedExam?.studentName}` }}</span>
                <UBadge v-if="viewMode === 'edit' && hasChanges" color="warning" variant="soft" class="animate-pulse"><UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />Cambios pendientes</UBadge>
                <UBadge v-else-if="viewMode === 'edit' && !hasChanges" color="success" variant="soft"><UIcon name="i-lucide-check" class="size-3 mr-1" />Sin cambios</UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div v-if="viewMode === 'create'" class="space-y-4">
            <UFormField label="Estudiante" name="studentId" required>
              <USelect v-model="form.studentId" :items="studentOptions" placeholder="Seleccionar estudiante" icon="i-lucide-user-round" />
            </UFormField>
            <UFormField label="Curso" name="courseId" required>
              <USelect v-model="form.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>
            <UFormField label="Semestre académico" name="academicSemesterId" required>
              <USelect v-model="form.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar-range" />
            </UFormField>
            <USeparator label="Información adicional" />
            <UFormField label="Semestre de origen" name="originSemesterId">
              <USelect v-model="form.originSemesterId" :items="semesterOptions" placeholder="Semestre donde reprobó" icon="i-lucide-calendar-arrow-up" />
            </UFormField>
            <UFormField label="Promedio anterior" name="previousAverage">
              <UInput v-model="form.previousAverage" type="number" step="0.01" placeholder="0.00" icon="i-lucide-star" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedExam" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar :text="`${selectedExam.studentName.charAt(0)}${selectedExam.studentName.split(' ').pop()?.charAt(0) || ''}`" color="primary" variant="soft" class="w-16 h-16 text-lg" />
              <div>
                <h3 class="text-xl font-bold">{{ selectedExam.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="statusBadgeColor(selectedExam.status)" variant="soft">{{ statusLabel(selectedExam.status) }}</UBadge>
                </div>
              </div>
            </div>
            <USeparator label="Curso" />
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Curso</p><p class="font-semibold">{{ selectedExam.courseCode }} - {{ selectedExam.courseName }}</p></div>
            </div>
            <USeparator label="Semestres" />
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-range" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Semestre actual</p><p class="font-semibold">{{ selectedExam.academicSemesterName || 'N/A' }}</p></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-arrow-up" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Semestre origen</p><p class="font-semibold">{{ selectedExam.originSemesterName || 'N/A' }}</p></div>
              </div>
            </div>
            <USeparator label="Calificación" />
            <div v-if="selectedExam.previousAverage != null" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Promedio anterior</p><p class="font-semibold">{{ selectedExam.previousAverage }}</p></div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedExam" class="space-y-4">
            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>
            <UFormField label="Semestre de origen" name="originSemesterId">
              <USelect v-model="editForm.originSemesterId" :items="semesterOptions" placeholder="Semestre donde reprobó" icon="i-lucide-calendar-arrow-up" />
            </UFormField>
            <UFormField label="Promedio anterior" name="previousAverage">
              <UInput v-model="editForm.previousAverage" type="number" step="0.01" placeholder="0.00" icon="i-lucide-star" />
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
