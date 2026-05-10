<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Attendance } from '~/composables/useAttendances'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Asistencias - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedAttendance = ref<Attendance | null>(null)
const originalAttendanceData = ref<Attendance | null>(null)
const showDeleted = ref(false)

const { attendances, loading, error, fetchAttendances, fetchDeletedAttendances, getAttendance, createAttendance, updateAttendance, deleteAttendance } = useAttendances()
const { enrollments, fetchEnrollments: fetchAllEnrollments } = useEnrollments()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedAttendances()
  } else {
    fetchAttendances(0, 10)
  }
  fetchAllEnrollments(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedAttendances()
  } else {
    fetchAttendances(0, 10)
  }
})

const statusOptions = [
  { label: 'Presente', value: 'PRESENT' },
  { label: 'Ausente', value: 'ABSENT' },
  { label: 'Justificado', value: 'JUSTIFIED' },
  { label: 'Tardía', value: 'LATE' }
]

const enrollmentOptions = computed(() =>
  enrollments.value.map(e => ({ label: `${e.studentName} - ${e.courseName} (${e.academicPeriodName})`, value: e.id }))
)

const hasChanges = computed(() => {
  if (!originalAttendanceData.value || viewMode.value !== 'edit') return false

  const orig = originalAttendanceData.value
  const f = editForm.value

  return (
    f.status !== (orig.status || 'PRESENT') ||
    f.classTime !== (orig.classTime || '') ||
    f.subjectCode !== (orig.subjectCode || '') ||
    f.observations !== (orig.observations || '')
  )
})

const discardChanges = () => {
  if (originalAttendanceData.value) {
    const orig = originalAttendanceData.value
    editForm.value = {
      status: orig.status || 'PRESENT',
      classTime: orig.classTime || '',
      subjectCode: orig.subjectCode || '',
      observations: orig.observations || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchAttendances(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedAttendance.value = null
  originalAttendanceData.value = null
}

const openCreate = () => {
  selectedAttendance.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (attendance: Attendance) => {
  selectedAttendance.value = await getAttendance(attendance.id)
  viewMode.value = 'view'
}

const openEdit = async (attendance: Attendance) => {
  selectedAttendance.value = await getAttendance(attendance.id)
  if (selectedAttendance.value) {
    originalAttendanceData.value = { ...selectedAttendance.value }
    const a = selectedAttendance.value
    editForm.value = {
      status: a.status || 'PRESENT',
      classTime: a.classTime || '',
      subjectCode: a.subjectCode || '',
      observations: a.observations || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  enrollmentId: '',
  attendanceDate: '',
  status: 'PRESENT',
  classTime: '',
  subjectCode: '',
  observations: ''
})

const editForm = ref({
  status: 'PRESENT',
  classTime: '',
  subjectCode: '',
  observations: ''
})

const resetForm = () => {
  form.value = {
    enrollmentId: '',
    attendanceDate: '',
    status: 'PRESENT',
    classTime: '',
    subjectCode: '',
    observations: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    enrollmentId: form.value.enrollmentId,
    attendanceDate: form.value.attendanceDate,
    status: form.value.status
  }
  if (form.value.classTime) data.classTime = form.value.classTime
  if (form.value.subjectCode) data.subjectCode = form.value.subjectCode
  if (form.value.observations) data.observations = form.value.observations

  const result = await createAttendance(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchAttendances(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedAttendance.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.status) data.status = editForm.value.status
  if (editForm.value.classTime) data.classTime = editForm.value.classTime
  if (editForm.value.subjectCode) data.subjectCode = editForm.value.subjectCode
  if (editForm.value.observations) data.observations = editForm.value.observations

  const result = await updateAttendance(selectedAttendance.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchAttendances(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (attendance: Attendance) => {
  const confirmed = await confirm({
    title: 'Eliminar asistencia',
    description: `¿Estás seguro de eliminar la asistencia de "${attendance.studentName}" del ${attendance.attendanceDate}?`
  })
  if (confirmed) {
    const result = await deleteAttendance(attendance.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchAttendances(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'PRESENT': return 'success'
    case 'ABSENT': return 'error'
    case 'JUSTIFIED': return 'warning'
    case 'LATE': return 'info'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'PRESENT': return 'Presente'
    case 'ABSENT': return 'Ausente'
    case 'JUSTIFIED': return 'Justificado'
    case 'LATE': return 'Tardía'
    default: return status
  }
}

const getActions = (attendance: Attendance): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(attendance)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(attendance)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(attendance)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(attendance)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Asistencias</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Asistencias eliminadas' : 'Asistencias registradas' }}: {{ attendances.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Registrar Asistencia
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo las asistencias eliminadas. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando asistencias"
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
          @click="fetchAttendances(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="attendances.length > 0" divide>
          <UPageCard v-for="attendance in attendances" :key="attendance.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${attendance.studentName.charAt(0)}${attendance.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ attendance.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ attendance.attendanceDate }} · {{ attendance.courseCode }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="statusBadgeColor(attendance.status)" variant="soft">
                    {{ statusLabel(attendance.status) }}
                  </UBadge>
                  <UBadge :color="!attendance.isDeleted ? 'success' : 'neutral'" variant="soft">
                    {{ !attendance.isDeleted ? 'Activo' : 'Eliminado' }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-book-open" class="size-4 mr-1" />
                    {{ attendance.courseName }}
                  </span>
                  <span v-if="attendance.classTime">
                    <UIcon name="i-lucide-clock" class="size-4 mr-1" />
                    {{ attendance.classTime }}
                  </span>
                  <span v-if="attendance.subjectCode">
                    <UIcon name="i-lucide-hash" class="size-4 mr-1" />
                    {{ attendance.subjectCode }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(attendance)">
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
          <h3 class="text-lg font-medium mb-2">No hay registros de asistencia</h3>
          <p class="text-muted-foreground mb-4">Registra la primera asistencia para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Registrar Asistencia
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
                  {{ viewMode === 'create' ? 'Registrar Asistencia' : viewMode === 'view' ? `Asistencia: ${selectedAttendance?.studentName}` : `Editar: ${selectedAttendance?.studentName}` }}
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

            <UFormField label="Fecha" name="attendanceDate" required>
              <UInput v-model="form.attendanceDate" type="date" icon="i-lucide-calendar" />
            </UFormField>

            <UFormField label="Estado" name="status">
              <USelect v-model="form.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="Horario" name="classTime">
              <UInput v-model="form.classTime" placeholder="Ej: 07:00-09:00" icon="i-lucide-clock" />
            </UFormField>

            <UFormField label="Clave de materia" name="subjectCode">
              <UInput v-model="form.subjectCode" placeholder="Ej: LEP101" icon="i-lucide-hash" />
            </UFormField>

            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="form.observations" placeholder="Notas adicionales..." />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedAttendance" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedAttendance.studentName.charAt(0)}${selectedAttendance.studentName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedAttendance.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="statusBadgeColor(selectedAttendance.status)" variant="soft">
                    {{ statusLabel(selectedAttendance.status) }}
                  </UBadge>
                  <UBadge :color="!selectedAttendance.isDeleted ? 'success' : 'neutral'" variant="soft">
                    {{ !selectedAttendance.isDeleted ? 'Activo' : 'Eliminado' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fecha</p>
                  <p class="font-semibold">{{ selectedAttendance.attendanceDate }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-clock" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Horario</p>
                  <p class="font-semibold">{{ selectedAttendance.classTime || 'No especificado' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Curso</p>
                  <p class="font-semibold">{{ selectedAttendance.courseCode }} - {{ selectedAttendance.courseName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Matrícula</p>
                  <p class="font-semibold">{{ selectedAttendance.enrollmentNumber }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedAttendance.subjectCode" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Clave de materia</p>
                <p class="font-semibold">{{ selectedAttendance.subjectCode }}</p>
              </div>
            </div>

            <div v-if="selectedAttendance.observations" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Observaciones</p>
              <p>{{ selectedAttendance.observations }}</p>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedAttendance" class="space-y-4">
            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>

            <UFormField label="Horario" name="classTime">
              <UInput v-model="editForm.classTime" placeholder="Ej: 07:00-09:00" icon="i-lucide-clock" />
            </UFormField>

            <UFormField label="Clave de materia" name="subjectCode">
              <UInput v-model="editForm.subjectCode" placeholder="Ej: LEP101" icon="i-lucide-hash" />
            </UFormField>

            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="editForm.observations" placeholder="Notas adicionales..." />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closePanel">Cerrar</UButton>
              <UButton v-if="viewMode === 'create'" @click="handleCreate" :loading="submitting" icon="i-lucide-save">
                Registrar
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
