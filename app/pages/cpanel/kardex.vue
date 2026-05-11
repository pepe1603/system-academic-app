<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { KardexRecord } from '~/composables/useKardex'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Kardex - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedRecord = ref<KardexRecord | null>(null)
const originalRecordData = ref<KardexRecord | null>(null)
const showDeleted = ref(false)

const { records, loading, error, fetchKardex, fetchDeletedKardex, getKardex, createKardex, updateKardex, deleteKardex } = useKardex()
const { students, fetchStudents: fetchAllStudents } = useStudents()
const { courses, fetchCourses: fetchAllCourses } = useCourses()
const { semesters, fetchSemesters: fetchAllSemesters } = useAcademicSemesters()
const { enrollments, fetchEnrollments: fetchAllEnrollments } = useEnrollments()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedKardex()
  } else {
    fetchKardex(0, 10)
  }
  fetchAllStudents(0, 50)
  fetchAllCourses(0, 50)
  fetchAllSemesters(0, 50)
  fetchAllEnrollments(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedKardex()
  } else {
    fetchKardex(0, 10)
  }
})

const statusOptions = [
  { label: 'Inscrito', value: 'ENROLLED' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Reprobado', value: 'FAILED' },
  { label: 'Extraordinario', value: 'EXTRAORDINARY' },
  { label: 'Baja', value: 'DROPPED' },
  { label: 'Validado', value: 'VALIDATED' },
  { label: 'Equivalencia', value: 'EQUIVALENCE' }
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

const enrollmentOptions = computed(() =>
  enrollments.value.map(e => ({ label: `${e.studentName} - ${e.courseName} (${e.academicPeriodName})`, value: e.id }))
)

const hasChanges = computed(() => {
  if (!originalRecordData.value || viewMode.value !== 'edit') return false

  const orig = originalRecordData.value
  const f = editForm.value

  return (
    f.status !== (orig.status || 'ENROLLED') ||
    f.finalGrade !== (orig.finalGrade ?? undefined) ||
    f.letterGrade !== (orig.letterGrade || '') ||
    f.attemptNumber !== (orig.attemptNumber ?? 1) ||
    f.approvalDate !== (orig.approvalDate || '') ||
    f.isOfficialized !== (orig.isOfficialized ?? false) ||
    f.officialFolio !== (orig.officialFolio || '') ||
    f.observations !== (orig.observations || '')
  )
})

const discardChanges = () => {
  if (originalRecordData.value) {
    const orig = originalRecordData.value
    editForm.value = {
      status: orig.status || 'ENROLLED',
      finalGrade: orig.finalGrade ?? undefined,
      letterGrade: orig.letterGrade || '',
      attemptNumber: orig.attemptNumber ?? 1,
      approvalDate: orig.approvalDate || '',
      isOfficialized: orig.isOfficialized ?? false,
      officialFolio: orig.officialFolio || '',
      observations: orig.observations || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchKardex(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedRecord.value = null
  originalRecordData.value = null
}

const openCreate = () => {
  selectedRecord.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (record: KardexRecord) => {
  selectedRecord.value = await getKardex(record.id)
  viewMode.value = 'view'
}

const openEdit = async (record: KardexRecord) => {
  selectedRecord.value = await getKardex(record.id)
  if (selectedRecord.value) {
    originalRecordData.value = { ...selectedRecord.value }
    const r = selectedRecord.value
    editForm.value = {
      status: r.status || 'ENROLLED',
      finalGrade: r.finalGrade ?? undefined,
      letterGrade: r.letterGrade || '',
      attemptNumber: r.attemptNumber ?? 1,
      approvalDate: r.approvalDate || '',
      isOfficialized: r.isOfficialized ?? false,
      officialFolio: r.officialFolio || '',
      observations: r.observations || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  courseId: '',
  academicSemesterId: '',
  enrollmentId: '',
  status: 'ENROLLED',
  finalGrade: undefined as number | undefined,
  attemptNumber: 1,
  observations: ''
})

const editForm = ref({
  status: 'ENROLLED',
  finalGrade: undefined as number | undefined,
  letterGrade: '',
  attemptNumber: 1,
  approvalDate: '',
  isOfficialized: false,
  officialFolio: '',
  observations: ''
})

const resetForm = () => {
  form.value = {
    studentId: '',
    courseId: '',
    academicSemesterId: '',
    enrollmentId: '',
    status: 'ENROLLED',
    finalGrade: undefined,
    attemptNumber: 1,
    observations: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    courseId: form.value.courseId,
    academicSemesterId: form.value.academicSemesterId,
    status: form.value.status
  }
  if (form.value.enrollmentId) data.enrollmentId = form.value.enrollmentId
  if (form.value.finalGrade !== undefined) data.finalGrade = form.value.finalGrade
  if (form.value.attemptNumber > 1) data.attemptNumber = form.value.attemptNumber
  if (form.value.observations) data.observations = form.value.observations

  const result = await createKardex(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchKardex(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedRecord.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.status) data.status = editForm.value.status
  if (editForm.value.finalGrade !== undefined) data.finalGrade = editForm.value.finalGrade
  if (editForm.value.letterGrade) data.letterGrade = editForm.value.letterGrade
  if (editForm.value.attemptNumber) data.attemptNumber = editForm.value.attemptNumber
  if (editForm.value.approvalDate) data.approvalDate = editForm.value.approvalDate
  data.isOfficialized = editForm.value.isOfficialized
  if (editForm.value.officialFolio) data.officialFolio = editForm.value.officialFolio
  if (editForm.value.observations) data.observations = editForm.value.observations

  const result = await updateKardex(selectedRecord.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchKardex(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (record: KardexRecord) => {
  const confirmed = await confirm({
    title: 'Eliminar registro kardex',
    description: `¿Estás seguro de eliminar el registro de "${record.studentName}" en "${record.courseName}" (${record.academicSemesterName})?`
  })
  if (confirmed) {
    const result = await deleteKardex(record.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchKardex(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'success'
    case 'FAILED': return 'error'
    case 'ENROLLED': return 'info'
    case 'EXTRAORDINARY': return 'warning'
    case 'DROPPED': return 'neutral'
    case 'VALIDATED': return 'primary'
    case 'EQUIVALENCE': return 'secondary'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'ENROLLED': return 'Inscrito'
    case 'APPROVED': return 'Aprobado'
    case 'FAILED': return 'Reprobado'
    case 'EXTRAORDINARY': return 'Extraordinario'
    case 'DROPPED': return 'Baja'
    case 'VALIDATED': return 'Validado'
    case 'EQUIVALENCE': return 'Equivalencia'
    default: return status
  }
}

const getActions = (record: KardexRecord): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(record)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(record)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(record)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(record)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Kardex</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Registros eliminados' : 'Historial académico' }}: {{ records.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Registro
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los registros kardex eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando kardex"
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
          @click="fetchKardex(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="records.length > 0" divide>
          <UPageCard v-for="record in records" :key="record.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${record.studentName.charAt(0)}${record.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ record.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ record.enrollmentNumber }} · {{ record.courseCode }} · Intento {{ record.attemptNumber }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="record.finalGrade !== undefined && record.finalGrade !== null" color="primary" variant="soft" size="sm">
                    {{ record.finalGrade }}
                  </UBadge>
                  <UBadge v-if="record.isOfficialized" color="success" variant="soft" size="sm">
                    Oficial
                  </UBadge>
                  <UBadge :color="statusBadgeColor(record.status)" variant="soft">
                    {{ statusLabel(record.status) }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-book-open" class="size-4 mr-1" />
                    {{ record.courseName }}
                  </span>
                  <span>
                    <UIcon name="i-lucide-calendar-range" class="size-4 mr-1" />
                    {{ record.academicSemesterName }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(record)">
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
          <h3 class="text-lg font-medium mb-2">No hay registros kardex</h3>
          <p class="text-muted-foreground mb-4">Crea el primer registro para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Registro
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
                  {{ viewMode === 'create' ? 'Nuevo Registro Kardex' : viewMode === 'view' ? `Kardex: ${selectedRecord?.studentName}` : `Editar: ${selectedRecord?.studentName}` }}
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

            <UFormField label="Semestre académico" name="academicSemesterId" required>
              <USelect v-model="form.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar-range" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="Inscripción relacionada" name="enrollmentId">
              <USelect v-model="form.enrollmentId" :items="enrollmentOptions" placeholder="Seleccionar inscripción (opcional)" icon="i-lucide-file-text" />
            </UFormField>

            <UFormField label="Estado" name="status">
              <USelect v-model="form.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>

            <UFormField label="Calificación final (0-100)" name="finalGrade">
              <UInput v-model="form.finalGrade" type="number" min="0" max="100" step="0.1" placeholder="Opcional" icon="i-lucide-star" />
            </UFormField>

            <UFormField label="Número de intento" name="attemptNumber">
              <UInput v-model="form.attemptNumber" type="number" min="1" step="1" icon="i-lucide-repeat" />
            </UFormField>

            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="form.observations" placeholder="Notas adicionales..." />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedRecord" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedRecord.studentName.charAt(0)}${selectedRecord.studentName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedRecord.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <UBadge :color="statusBadgeColor(selectedRecord.status)" variant="soft">
                    {{ statusLabel(selectedRecord.status) }}
                  </UBadge>
                  <UBadge v-if="selectedRecord.isOfficialized" color="success" variant="soft">
                    Oficializado
                  </UBadge>
                  <UBadge :color="!selectedRecord.isDeleted ? 'success' : 'neutral'" variant="soft">
                    {{ !selectedRecord.isDeleted ? 'Activo' : 'Eliminado' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Calificación</p>
                  <p class="font-semibold text-2xl">{{ selectedRecord.finalGrade ?? 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-type" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Letra</p>
                  <p class="font-semibold">{{ selectedRecord.letterGrade || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Curso</p>
                  <p class="font-semibold">{{ selectedRecord.courseCode }} - {{ selectedRecord.courseName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-range" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Semestre</p>
                  <p class="font-semibold">{{ selectedRecord.academicSemesterName }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-repeat" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Intento</p>
                  <p class="font-semibold">{{ selectedRecord.attemptNumber }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Matrícula</p>
                  <p class="font-semibold">{{ selectedRecord.enrollmentNumber }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedRecord.officialFolio" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-file-text" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Folio oficial</p>
                <p class="font-semibold">{{ selectedRecord.officialFolio }}</p>
              </div>
            </div>

            <div v-if="selectedRecord.observations" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Observaciones</p>
              <p>{{ selectedRecord.observations }}</p>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedRecord" class="space-y-4">
            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>

            <UFormField label="Calificación final (0-100)" name="finalGrade">
              <UInput v-model="editForm.finalGrade" type="number" min="0" max="100" step="0.1" placeholder="0-100" icon="i-lucide-star" />
            </UFormField>

            <UFormField label="Calificación en letra" name="letterGrade">
              <UInput v-model="editForm.letterGrade" placeholder="Ej: A, B, C, D, F" icon="i-lucide-type" />
            </UFormField>

            <UFormField label="Número de intento" name="attemptNumber">
              <UInput v-model="editForm.attemptNumber" type="number" min="1" step="1" icon="i-lucide-repeat" />
            </UFormField>

            <USeparator label="Oficialización" />

            <div class="flex items-center gap-2">
              <UCheckbox v-model="editForm.isOfficialized" label="Oficializado" />
            </div>

            <UFormField label="Folio oficial" name="officialFolio">
              <UInput v-model="editForm.officialFolio" placeholder="Ej: KAR-2025-001" icon="i-lucide-file-text" />
            </UFormField>

            <UFormField label="Fecha de aprobación" name="approvalDate">
              <UInput v-model="editForm.approvalDate" type="date" icon="i-lucide-calendar" />
            </UFormField>

            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="editForm.observations" placeholder="Notas adicionales..." />
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
