<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ExtraordinaryExam } from '~/composables/useExtraordinaryExams'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Exámenes Extraordinarios - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedExam = ref<ExtraordinaryExam | null>(null)
const originalExamData = ref<ExtraordinaryExam | null>(null)
const showDeleted = ref(false)

const { exams, loading, error, fetchExams, fetchDeletedExams, getExam, createExam, updateExam, deleteExam } = useExtraordinaryExams()
const { students, fetchStudents: fetchAllStudents } = useStudents()
const { courses, fetchCourses: fetchAllCourses } = useCourses()
const { semesters, fetchSemesters: fetchAllSemesters } = useAcademicSemesters()
const { records: teachers, fetchRecords: fetchAllTeachers } = useTeachers()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedExams()
  } else {
    fetchExams(0, 10)
  }
  fetchAllStudents(0, 50)
  fetchAllCourses(0, 50)
  fetchAllSemesters(0, 50)
  fetchAllTeachers(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedExams()
  } else {
    fetchExams(0, 10)
  }
})

const statusOptions = [
  { label: 'Programado', value: 'SCHEDULED' },
  { label: 'Aplicado', value: 'APPLIED' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Reprobado', value: 'FAILED' },
  { label: 'Cancelado', value: 'CANCELLED' },
  { label: 'Inasistencia', value: 'NO_SHOW' }
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

const teacherOptions = computed(() =>
  teachers.value.map(t => ({ label: `${t.firstName} ${t.lastName}`, value: t.id }))
)

const hasChanges = computed(() => {
  if (!originalExamData.value || viewMode.value !== 'edit') return false

  const orig = originalExamData.value
  const f = editForm.value

  return (
    f.status !== (orig.status || '') ||
    f.attemptNumber !== (orig.attemptNumber ?? '') ||
    f.scheduledDate !== (orig.scheduledDate || '') ||
    f.applicationDate !== (orig.applicationDate || '') ||
    f.applicationTime !== (orig.applicationTime || '') ||
    f.applicationLocation !== (orig.applicationLocation || '') ||
    f.previousGrade !== (orig.previousGrade ?? '') ||
    f.grade !== (orig.grade ?? '') ||
    f.gradeLetter !== (orig.gradeLetter || '') ||
    f.examinerId !== (orig.examinerId || '') ||
    f.observation !== (orig.observation || '') ||
    f.cost !== (orig.cost ?? '') ||
    f.paymentReceipt !== (orig.paymentReceipt || '') ||
    f.paymentFolio !== (orig.paymentFolio || '')
  )
})

const discardChanges = () => {
  if (originalExamData.value) {
    const orig = originalExamData.value
    editForm.value = {
      status: orig.status || 'SCHEDULED',
      attemptNumber: orig.attemptNumber,
      scheduledDate: orig.scheduledDate || '',
      applicationDate: orig.applicationDate || '',
      applicationTime: orig.applicationTime || '',
      applicationLocation: orig.applicationLocation || '',
      previousGrade: orig.previousGrade ?? null,
      grade: orig.grade ?? null,
      gradeLetter: orig.gradeLetter || '',
      examinerId: orig.examinerId || '',
      observation: orig.observation || '',
      cost: orig.cost ?? null,
      paymentReceipt: orig.paymentReceipt || '',
      paymentFolio: orig.paymentFolio || ''
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

const openView = async (exam: ExtraordinaryExam) => {
  selectedExam.value = await getExam(exam.id)
  viewMode.value = 'view'
}

const openEdit = async (exam: ExtraordinaryExam) => {
  selectedExam.value = await getExam(exam.id)
  if (selectedExam.value) {
    originalExamData.value = { ...selectedExam.value }
    const e = selectedExam.value
    editForm.value = {
      status: e.status || 'SCHEDULED',
      attemptNumber: e.attemptNumber,
      scheduledDate: e.scheduledDate || '',
      applicationDate: e.applicationDate || '',
      applicationTime: e.applicationTime || '',
      applicationLocation: e.applicationLocation || '',
      previousGrade: e.previousGrade ?? null,
      grade: e.grade ?? null,
      gradeLetter: e.gradeLetter || '',
      examinerId: e.examinerId || '',
      observation: e.observation || '',
      cost: e.cost ?? null,
      paymentReceipt: e.paymentReceipt || '',
      paymentFolio: e.paymentFolio || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  courseId: '',
  academicSemesterId: '',
  attemptNumber: 1,
  scheduledDate: '',
  applicationTime: '',
  applicationLocation: '',
  previousGrade: null as number | null,
  examinerId: '',
  observation: '',
  cost: null as number | null,
  paymentReceipt: '',
  paymentFolio: ''
})

const editForm = ref({
  status: 'SCHEDULED',
  attemptNumber: 1,
  scheduledDate: '',
  applicationDate: '',
  applicationTime: '',
  applicationLocation: '',
  previousGrade: null as number | null,
  grade: null as number | null,
  gradeLetter: '',
  examinerId: '',
  observation: '',
  cost: null as number | null,
  paymentReceipt: '',
  paymentFolio: ''
})

const resetForm = () => {
  form.value = {
    studentId: '',
    courseId: '',
    academicSemesterId: '',
    attemptNumber: 1,
    scheduledDate: '',
    applicationTime: '',
    applicationLocation: '',
    previousGrade: null,
    examinerId: '',
    observation: '',
    cost: null,
    paymentReceipt: '',
    paymentFolio: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    courseId: form.value.courseId,
    academicSemesterId: form.value.academicSemesterId || undefined,
    attemptNumber: form.value.attemptNumber || undefined,
    scheduledDate: form.value.scheduledDate || undefined,
    applicationTime: form.value.applicationTime || undefined,
    applicationLocation: form.value.applicationLocation || undefined,
    previousGrade: form.value.previousGrade ?? undefined,
    examinerId: form.value.examinerId || undefined,
    observation: form.value.observation || undefined,
    cost: form.value.cost ?? undefined,
    paymentReceipt: form.value.paymentReceipt || undefined,
    paymentFolio: form.value.paymentFolio || undefined
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
  if (editForm.value.attemptNumber) data.attemptNumber = editForm.value.attemptNumber
  if (editForm.value.scheduledDate) data.scheduledDate = editForm.value.scheduledDate
  if (editForm.value.applicationDate) data.applicationDate = editForm.value.applicationDate
  if (editForm.value.applicationTime) data.applicationTime = editForm.value.applicationTime
  if (editForm.value.applicationLocation) data.applicationLocation = editForm.value.applicationLocation
  if (editForm.value.previousGrade !== null) data.previousGrade = editForm.value.previousGrade
  if (editForm.value.grade !== null) data.grade = editForm.value.grade
  if (editForm.value.gradeLetter) data.gradeLetter = editForm.value.gradeLetter
  if (editForm.value.examinerId) data.examinerId = editForm.value.examinerId
  if (editForm.value.observation) data.observation = editForm.value.observation
  if (editForm.value.cost !== null) data.cost = editForm.value.cost
  if (editForm.value.paymentReceipt) data.paymentReceipt = editForm.value.paymentReceipt
  if (editForm.value.paymentFolio) data.paymentFolio = editForm.value.paymentFolio

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

const handleDelete = async (exam: ExtraordinaryExam) => {
  const confirmed = await confirm({
    title: 'Eliminar examen extraordinario',
    description: `¿Estás seguro de eliminar el examen de "${exam.studentName}" en "${exam.courseCode}" (intento ${exam.attemptNumber})?`
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
    case 'SCHEDULED': return 'info'
    case 'APPLIED': return 'warning'
    case 'APPROVED': return 'success'
    case 'FAILED': return 'error'
    case 'CANCELLED': return 'neutral'
    case 'NO_SHOW': return 'neutral'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'SCHEDULED': return 'Programado'
    case 'APPLIED': return 'Aplicado'
    case 'APPROVED': return 'Aprobado'
    case 'FAILED': return 'Reprobado'
    case 'CANCELLED': return 'Cancelado'
    case 'NO_SHOW': return 'Inasistencia'
    default: return status
  }
}

const getActions = (exam: ExtraordinaryExam): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(exam)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(exam)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(exam)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(exam)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Exámenes Extraordinarios</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Exámenes eliminados' : 'Exámenes activos' }}: {{ exams.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Examen
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los exámenes eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando exámenes"
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
          @click="fetchExams(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="exams.length > 0" divide>
          <UPageCard v-for="exam in exams" :key="exam.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${exam.studentName.charAt(0)}${exam.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ exam.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ exam.courseCode }} · Intento {{ exam.attemptNumber }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="statusBadgeColor(exam.status)" variant="soft">
                    {{ statusLabel(exam.status) }}
                  </UBadge>
                  <UBadge v-if="exam.grade !== null && exam.grade !== undefined" color="primary" variant="soft">
                    {{ exam.grade }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-book-open" class="size-4 mr-1" />
                    {{ exam.courseName }}
                  </span>
                  <span v-if="exam.scheduledDate">
                    <UIcon name="i-lucide-calendar" class="size-4 mr-1" />
                    {{ exam.scheduledDate }}
                  </span>
                  <span v-if="exam.grade !== null && exam.grade !== undefined">
                    <UIcon name="i-lucide-star" class="size-4 mr-1" />
                    Calif: {{ exam.grade }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(exam)">
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
          <h3 class="text-lg font-medium mb-2">No hay exámenes extraordinarios</h3>
          <p class="text-muted-foreground mb-4">Registra el primer examen extraordinario para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Examen
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Examen Extraordinario' : viewMode === 'view' ? `Examen: ${selectedExam?.studentName}` : `Editar: ${selectedExam?.studentName}` }}
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
            <UFormField label="Estudiante" name="studentId" required>
              <USelect v-model="form.studentId" :items="studentOptions" placeholder="Seleccionar estudiante" icon="i-lucide-user-round" />
            </UFormField>

            <UFormField label="Curso" name="courseId" required>
              <USelect v-model="form.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Semestre académico" name="academicSemesterId">
              <USelect v-model="form.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar-range" />
            </UFormField>

            <USeparator label="Programación" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="N° de intento" name="attemptNumber">
                <UInput v-model="form.attemptNumber" type="number" min="1" placeholder="1" icon="i-lucide-hash" />
              </UFormField>

              <UFormField label="Fecha programada" name="scheduledDate">
                <UInput v-model="form.scheduledDate" type="date" icon="i-lucide-calendar" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Hora" name="applicationTime">
                <UInput v-model="form.applicationTime" placeholder="10:00" icon="i-lucide-clock" />
              </UFormField>

              <UFormField label="Lugar" name="applicationLocation">
                <UInput v-model="form.applicationLocation" placeholder="Salón / Aula" icon="i-lucide-map-pin" />
              </UFormField>
            </div>

            <USeparator label="Calificación previa" />

            <UFormField label="Calificación previa" name="previousGrade">
              <UInput v-model="form.previousGrade" type="number" step="0.01" placeholder="0.00" icon="i-lucide-star" />
            </UFormField>

            <USeparator label="Examinador" />

            <UFormField label="Docente examinador" name="examinerId">
              <USelect v-model="form.examinerId" :items="teacherOptions" placeholder="Seleccionar examinador" icon="i-lucide-graduation-cap" />
            </UFormField>

            <USeparator label="Pago" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Costo" name="cost">
                <UInput v-model="form.cost" type="number" step="0.01" placeholder="0.00" icon="i-lucide-dollar-sign" />
              </UFormField>

              <UFormField label="Folio de pago" name="paymentFolio">
                <UInput v-model="form.paymentFolio" placeholder="Folio" icon="i-lucide-hash" />
              </UFormField>
            </div>

            <UFormField label="Comprobante de pago" name="paymentReceipt">
              <UInput v-model="form.paymentReceipt" placeholder="N° de recibo" icon="i-lucide-receipt" />
            </UFormField>

            <UFormField label="Observaciones" name="observation">
              <UTextarea v-model="form.observation" placeholder="Observaciones (opcional)" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedExam" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedExam.studentName.charAt(0)}${selectedExam.studentName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedExam.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="statusBadgeColor(selectedExam.status)" variant="soft">
                    {{ statusLabel(selectedExam.status) }}
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    Intento {{ selectedExam.attemptNumber }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator label="Curso" />

            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Curso</p>
                <p class="font-semibold">{{ selectedExam.courseCode }} - {{ selectedExam.courseName }}</p>
              </div>
            </div>

            <USeparator label="Programación" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Programado</p>
                  <p class="font-semibold">{{ selectedExam.scheduledDate || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-check" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Aplicado</p>
                  <p class="font-semibold">{{ selectedExam.applicationDate || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-clock" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Hora</p>
                  <p class="font-semibold">{{ selectedExam.applicationTime || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-map-pin" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Lugar</p>
                  <p class="font-semibold">{{ selectedExam.applicationLocation || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Calificaciones" />

            <div class="grid grid-cols-3 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Previa</p>
                  <p class="font-semibold">{{ selectedExam.previousGrade ?? 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-award" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Calificación</p>
                  <p class="font-semibold">{{ selectedExam.grade ?? 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-sigma" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Letra</p>
                  <p class="font-semibold">{{ selectedExam.gradeLetter || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Examinador" />

            <div v-if="selectedExam.examinerName" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-graduation-cap" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Examinador</p>
                <p class="font-semibold">{{ selectedExam.examinerName }}</p>
              </div>
            </div>

            <USeparator label="Pago" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-dollar-sign" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Costo</p>
                  <p class="font-semibold">{{ selectedExam.cost != null ? `$${selectedExam.cost}` : 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Folio pago</p>
                  <p class="font-semibold">{{ selectedExam.paymentFolio || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedExam.paymentReceipt" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-receipt" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Comprobante</p>
                <p class="font-semibold">{{ selectedExam.paymentReceipt }}</p>
              </div>
            </div>

            <div v-if="selectedExam.academicSemesterName" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Semestre académico</p>
              <p class="text-sm">{{ selectedExam.academicSemesterName }}</p>
            </div>

            <div v-if="selectedExam.observation" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Observaciones</p>
              <p class="text-sm">{{ selectedExam.observation }}</p>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedExam" class="space-y-4">
            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>

            <UFormField label="N° de intento" name="attemptNumber">
              <UInput v-model="editForm.attemptNumber" type="number" min="1" icon="i-lucide-hash" />
            </UFormField>

            <USeparator label="Programación" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha programada" name="scheduledDate">
                <UInput v-model="editForm.scheduledDate" type="date" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Fecha de aplicación" name="applicationDate">
                <UInput v-model="editForm.applicationDate" type="date" icon="i-lucide-calendar-check" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Hora" name="applicationTime">
                <UInput v-model="editForm.applicationTime" placeholder="10:00" icon="i-lucide-clock" />
              </UFormField>
              <UFormField label="Lugar" name="applicationLocation">
                <UInput v-model="editForm.applicationLocation" placeholder="Salón / Aula" icon="i-lucide-map-pin" />
              </UFormField>
            </div>

            <USeparator label="Calificaciones" />

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Calificación previa" name="previousGrade">
                <UInput v-model="editForm.previousGrade" type="number" step="0.01" placeholder="0.00" icon="i-lucide-star" />
              </UFormField>
              <UFormField label="Calificación" name="grade">
                <UInput v-model="editForm.grade" type="number" step="0.01" placeholder="0.00" icon="i-lucide-award" />
              </UFormField>
              <UFormField label="Letra" name="gradeLetter">
                <UInput v-model="editForm.gradeLetter" placeholder="A, B, etc." icon="i-lucide-sigma" />
              </UFormField>
            </div>

            <USeparator label="Examinador" />

            <UFormField label="Docente examinador" name="examinerId">
              <USelect v-model="editForm.examinerId" :items="teacherOptions" placeholder="Seleccionar examinador" icon="i-lucide-graduation-cap" />
            </UFormField>

            <USeparator label="Pago" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Costo" name="cost">
                <UInput v-model="editForm.cost" type="number" step="0.01" placeholder="0.00" icon="i-lucide-dollar-sign" />
              </UFormField>
              <UFormField label="Folio de pago" name="paymentFolio">
                <UInput v-model="editForm.paymentFolio" placeholder="Folio" icon="i-lucide-hash" />
              </UFormField>
            </div>

            <UFormField label="Comprobante de pago" name="paymentReceipt">
              <UInput v-model="editForm.paymentReceipt" placeholder="N° de recibo" icon="i-lucide-receipt" />
            </UFormField>

            <UFormField label="Observaciones" name="observation">
              <UTextarea v-model="editForm.observation" placeholder="Observaciones (opcional)" />
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
