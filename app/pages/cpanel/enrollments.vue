<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Enrollment } from '~/composables/useEnrollments'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Inscripciones - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedEnrollment = ref<Enrollment | null>(null)
const originalEnrollmentData = ref<Enrollment | null>(null)
const showDeleted = ref(false)

const { enrollments, loading, error, fetchEnrollments, fetchDeletedEnrollments, getEnrollment, createEnrollment, updateEnrollment, deleteEnrollment } = useEnrollments()
const { students, fetchStudents: fetchAllStudents } = useStudents()
const { courses, fetchCourses: fetchAllCourses } = useCourses()
const { periods, fetchPeriods: fetchAllPeriods } = useAcademicPeriods()
const { groups, fetchGroups: fetchAllGroups } = useAcademicGroups()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedEnrollments()
  } else {
    fetchEnrollments(0, 10)
  }
  fetchAllStudents(0, 50)
  fetchAllCourses(0, 50)
  fetchAllPeriods(0, 50)
  fetchAllGroups(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedEnrollments()
  } else {
    fetchEnrollments(0, 10)
  }
})

const statusOptions = [
  { label: 'Inscrito', value: 'ENROLLED' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Reprobado', value: 'FAILED' },
  { label: 'Retirado', value: 'WITHDRAWN' }
]

const studentOptions = computed(() =>
  students.value.map(s => ({ label: `${s.enrollmentNumber} - ${s.firstName} ${s.lastName}`, value: s.id }))
)

const courseOptions = computed(() =>
  courses.value.map(c => ({ label: `${c.courseCode} - ${c.name}`, value: c.id }))
)

const periodOptions = computed(() =>
  periods.value.map((p: { id: string; name: string }) => ({ label: p.name, value: p.id }))
)

const groupOptions = computed(() =>
  groups.value.map(g => ({ label: g.name, value: g.id }))
)

const hasChanges = computed(() => {
  if (!originalEnrollmentData.value || viewMode.value !== 'edit') return false

  const orig = originalEnrollmentData.value
  const f = editForm.value

  return (
    f.studentId !== (orig.studentId || '') ||
    f.courseId !== (orig.courseId || '') ||
    f.academicPeriodId !== (orig.academicPeriodId || '') ||
    f.groupId !== (orig.groupId || '') ||
    f.status !== (orig.status || '')
  )
})

const discardChanges = () => {
  if (originalEnrollmentData.value) {
    const orig = originalEnrollmentData.value
    editForm.value = {
      studentId: orig.studentId || '',
      courseId: orig.courseId || '',
      academicPeriodId: orig.academicPeriodId || '',
      groupId: orig.groupId || '',
      status: orig.status || 'ENROLLED'
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchEnrollments(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedEnrollment.value = null
  originalEnrollmentData.value = null
}

const openCreate = () => {
  selectedEnrollment.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (enrollment: Enrollment) => {
  selectedEnrollment.value = await getEnrollment(enrollment.id)
  viewMode.value = 'view'
}

const openEdit = async (enrollment: Enrollment) => {
  selectedEnrollment.value = await getEnrollment(enrollment.id)
  if (selectedEnrollment.value) {
    originalEnrollmentData.value = { ...selectedEnrollment.value }
    const e = selectedEnrollment.value
    editForm.value = {
      studentId: e.studentId || '',
      courseId: e.courseId || '',
      academicPeriodId: e.academicPeriodId || '',
      groupId: e.groupId || '',
      status: e.status || 'ENROLLED'
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  courseId: '',
  academicPeriodId: '',
  groupId: '',
  status: 'ENROLLED'
})

const editForm = ref({
  studentId: '',
  courseId: '',
  academicPeriodId: '',
  groupId: '',
  status: 'ENROLLED'
})

const resetForm = () => {
  form.value = {
    studentId: '',
    courseId: '',
    academicPeriodId: '',
    groupId: '',
    status: 'ENROLLED'
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    courseId: form.value.courseId,
    academicPeriodId: form.value.academicPeriodId,
    groupId: form.value.groupId || undefined,
    status: form.value.status
  }
  const result = await createEnrollment(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchEnrollments(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedEnrollment.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.studentId) data.studentId = editForm.value.studentId
  if (editForm.value.courseId) data.courseId = editForm.value.courseId
  if (editForm.value.academicPeriodId) data.academicPeriodId = editForm.value.academicPeriodId
  if (editForm.value.groupId) data.groupId = editForm.value.groupId
  if (editForm.value.status) data.status = editForm.value.status

  const result = await updateEnrollment(selectedEnrollment.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchEnrollments(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (enrollment: Enrollment) => {
  const confirmed = await confirm({
    title: 'Eliminar inscripción',
    description: `¿Estás seguro de eliminar la inscripción de "${enrollment.studentName}" en "${enrollment.courseName}" (${enrollment.academicPeriodName})?`
  })
  if (confirmed) {
    const result = await deleteEnrollment(enrollment.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchEnrollments(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'ENROLLED': return 'info'
    case 'APPROVED': return 'success'
    case 'FAILED': return 'error'
    case 'WITHDRAWN': return 'warning'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'ENROLLED': return 'Inscrito'
    case 'APPROVED': return 'Aprobado'
    case 'FAILED': return 'Reprobado'
    case 'WITHDRAWN': return 'Retirado'
    default: return status
  }
}

const getActions = (enrollment: Enrollment): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(enrollment)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(enrollment)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(enrollment)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(enrollment)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Inscripciones</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Inscripciones eliminadas' : 'Inscripciones activas' }}: {{ enrollments.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nueva Inscripción
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo las inscripciones eliminadas. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando inscripciones"
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
          @click="fetchEnrollments(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="enrollments.length > 0" divide>
          <UPageCard v-for="enrollment in enrollments" :key="enrollment.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${enrollment.studentName.charAt(0)}${enrollment.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ enrollment.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ enrollment.enrollmentNumber }} · {{ enrollment.courseCode }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="statusBadgeColor(enrollment.status)" variant="soft">
                    {{ statusLabel(enrollment.status) }}
                  </UBadge>
                  <UBadge :color="enrollment.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ enrollment.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-book-open" class="size-4 mr-1" />
                    {{ enrollment.courseName }}
                  </span>
                  <span>
                    <UIcon name="i-lucide-clock" class="size-4 mr-1" />
                    {{ enrollment.academicPeriodName }}
                  </span>
                  <span v-if="enrollment.groupName">
                    <UIcon name="i-lucide-users" class="size-4 mr-1" />
                    {{ enrollment.groupName }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(enrollment)">
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
          <h3 class="text-lg font-medium mb-2">No hay inscripciones</h3>
          <p class="text-muted-foreground mb-4">Registra la primera inscripción para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nueva Inscripción
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
                  {{ viewMode === 'create' ? 'Nueva Inscripción' : viewMode === 'view' ? `Inscripción: ${selectedEnrollment?.studentName}` : `Editar: ${selectedEnrollment?.studentName}` }}
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

            <UFormField label="Período académico" name="academicPeriodId" required>
              <USelect v-model="form.academicPeriodId" :items="periodOptions" placeholder="Seleccionar período" icon="i-lucide-clock" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="Grupo" name="groupId">
              <USelect v-model="form.groupId" :items="groupOptions" placeholder="Seleccionar grupo (opcional)" icon="i-lucide-users" />
            </UFormField>

            <UFormField label="Estado" name="status">
              <USelect v-model="form.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedEnrollment" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedEnrollment.studentName.charAt(0)}${selectedEnrollment.studentName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedEnrollment.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="statusBadgeColor(selectedEnrollment.status)" variant="soft">
                    {{ statusLabel(selectedEnrollment.status) }}
                  </UBadge>
                  <UBadge :color="selectedEnrollment.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ selectedEnrollment.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Matrícula</p>
                  <p class="font-semibold">{{ selectedEnrollment.enrollmentNumber }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Curso</p>
                  <p class="font-semibold">{{ selectedEnrollment.courseCode }} - {{ selectedEnrollment.courseName }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-clock" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Período</p>
                  <p class="font-semibold">{{ selectedEnrollment.academicPeriodName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-users" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Grupo</p>
                  <p class="font-semibold">{{ selectedEnrollment.groupName || 'No asignado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedEnrollment" class="space-y-4">
            <UFormField label="Estudiante" name="studentId">
              <USelect v-model="editForm.studentId" :items="studentOptions" placeholder="Seleccionar estudiante" icon="i-lucide-user-round" />
            </UFormField>

            <UFormField label="Curso" name="courseId">
              <USelect v-model="editForm.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Período académico" name="academicPeriodId">
              <USelect v-model="editForm.academicPeriodId" :items="periodOptions" placeholder="Seleccionar período" icon="i-lucide-clock" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="Grupo" name="groupId">
              <USelect v-model="editForm.groupId" :items="groupOptions" placeholder="Seleccionar grupo (opcional)" icon="i-lucide-users" />
            </UFormField>

            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
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
