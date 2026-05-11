<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ReportCard } from '~/composables/useReportCards'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Boletas - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedReport = ref<ReportCard | null>(null)
const originalReportData = ref<ReportCard | null>(null)
const showDeleted = ref(false)

const { reportCards, loading, error, fetchReportCards, fetchDeletedReportCards, getReportCard, createReportCard, updateReportCard, deleteReportCard } = useReportCards()
const { students, fetchStudents: fetchAllStudents } = useStudents()
const { semesters, fetchSemesters: fetchAllSemesters } = useAcademicSemesters()
const { generations, fetchGenerations: fetchAllGenerations } = useGenerations()
const { courses, fetchCourses: fetchAllCourses } = useCourses()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedReportCards()
  } else {
    fetchReportCards(0, 10)
  }
  fetchAllStudents(0, 50)
  fetchAllSemesters(0, 50)
  fetchAllGenerations(0, 50)
  fetchAllCourses(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedReportCards()
  } else {
    fetchReportCards(0, 10)
  }
})

const reportTypeOptions = [
  { label: 'Ordinario', value: 'ORDINARY' },
  { label: 'Extraordinario', value: 'EXTRAORDINARY' },
  { label: 'Especial', value: 'SPECIAL' },
  { label: 'Certificado parcial', value: 'PARTIAL_CERTIFICATE' },
  { label: 'Certificado final', value: 'FINAL_CERTIFICATE' }
]

const generationModeOptions = [
  { label: 'En línea', value: 'ONLINE' },
  { label: 'Oficial', value: 'OFFICIAL' }
]

const statusOptions = [
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Emitido', value: 'ISSUED' },
  { label: 'Entregado', value: 'DELIVERED' },
  { label: 'Archivado', value: 'ARCHIVED' },
  { label: 'Cancelado', value: 'CANCELLED' }
]

const studentOptions = computed(() =>
  students.value.map(s => ({ label: `${s.enrollmentNumber} - ${s.firstName} ${s.lastName}`, value: s.id }))
)

const semesterOptions = computed(() =>
  semesters.value.map((s: { id: string; name: string }) => ({ label: s.name, value: s.id }))
)

const generationOptions = computed(() =>
  generations.value.map(g => ({ label: g.name, value: g.id }))
)

const courseOptions = computed(() =>
  courses.value.map(c => ({ label: `${c.courseCode} - ${c.name}`, value: c.id }))
)

const hasChanges = computed(() => {
  if (!originalReportData.value || viewMode.value !== 'edit') return false

  const orig = originalReportData.value
  const f = editForm.value

  return (
    f.status !== (orig.status || 'PENDING') ||
    f.isSigned !== (orig.isSigned ?? false) ||
    f.deliveryDate !== (orig.deliveryDate || '') ||
    f.folio !== (orig.folio || '') ||
    f.observations !== (orig.observations || '')
  )
})

const discardChanges = () => {
  if (originalReportData.value) {
    const orig = originalReportData.value
    editForm.value = {
      status: orig.status || 'PENDING',
      isSigned: orig.isSigned ?? false,
      deliveryDate: orig.deliveryDate || '',
      folio: orig.folio || '',
      observations: orig.observations || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchReportCards(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedReport.value = null
  originalReportData.value = null
}

const openCreate = () => {
  selectedReport.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (report: ReportCard) => {
  selectedReport.value = await getReportCard(report.id)
  viewMode.value = 'view'
}

const openEdit = async (report: ReportCard) => {
  selectedReport.value = await getReportCard(report.id)
  if (selectedReport.value) {
    originalReportData.value = { ...selectedReport.value }
    const r = selectedReport.value
    editForm.value = {
      status: r.status || 'PENDING',
      isSigned: r.isSigned ?? false,
      deliveryDate: r.deliveryDate || '',
      folio: r.folio || '',
      observations: r.observations || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  academicSemesterId: '',
  generationId: '',
  reportCardType: 'ORDINARY',
  generationMode: 'ONLINE',
  folio: '',
  observations: '',
  details: [] as Array<{
    courseId: string
    subjectName: string
    subjectCode: string
    credits: number
    grade?: number
    gradeLetter?: string
    subjectStatus?: string
  }>
})

const editForm = ref({
  status: 'PENDING',
  isSigned: false,
  deliveryDate: '',
  folio: '',
  observations: ''
})

const resetForm = () => {
  form.value = {
    studentId: '',
    academicSemesterId: '',
    generationId: '',
    reportCardType: 'ORDINARY',
    generationMode: 'ONLINE',
    folio: '',
    observations: '',
    details: []
  }
}

const addDetailRow = () => {
  form.value.details.push({
    courseId: '',
    subjectName: '',
    subjectCode: '',
    credits: 0,
    grade: undefined,
    gradeLetter: '',
    subjectStatus: 'APPROVED'
  })
}

const removeDetailRow = (index: number) => {
  form.value.details.splice(index, 1)
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    academicSemesterId: form.value.academicSemesterId,
    reportCardType: form.value.reportCardType,
    generationMode: form.value.generationMode,
    details: form.value.details.map(d => ({
      courseId: d.courseId,
      subjectName: d.subjectName,
      subjectCode: d.subjectCode,
      credits: d.credits,
      ...(d.grade !== undefined ? { grade: d.grade } : {}),
      ...(d.gradeLetter ? { gradeLetter: d.gradeLetter } : {}),
      ...(d.subjectStatus ? { subjectStatus: d.subjectStatus } : {})
    }))
  }
  if (form.value.generationId) data.generationId = form.value.generationId
  if (form.value.folio) data.folio = form.value.folio
  if (form.value.observations) data.observations = form.value.observations

  const result = await createReportCard(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchReportCards(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedReport.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.status) data.status = editForm.value.status
  data.isSigned = editForm.value.isSigned
  if (editForm.value.deliveryDate) data.deliveryDate = editForm.value.deliveryDate
  if (editForm.value.folio) data.folio = editForm.value.folio
  if (editForm.value.observations) data.observations = editForm.value.observations

  const result = await updateReportCard(selectedReport.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchReportCards(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (report: ReportCard) => {
  const confirmed = await confirm({
    title: 'Eliminar boleta',
    description: `¿Estás seguro de eliminar la boleta de "${report.studentName}" (${report.folio || 'Sin folio'})?`
  })
  if (confirmed) {
    const result = await deleteReportCard(report.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchReportCards(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'ISSUED': return 'info'
    case 'DELIVERED': return 'success'
    case 'ARCHIVED': return 'neutral'
    case 'CANCELLED': return 'error'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Pendiente'
    case 'ISSUED': return 'Emitido'
    case 'DELIVERED': return 'Entregado'
    case 'ARCHIVED': return 'Archivado'
    case 'CANCELLED': return 'Cancelado'
    default: return status
  }
}

const getActions = (report: ReportCard): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(report)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(report)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(report)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(report)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Boletas</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Boletas eliminadas' : 'Boletas registradas' }}: {{ reportCards.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nueva Boleta
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo las boletas eliminadas. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando boletas" description="Por favor espera...">
      <template #icon>
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
      </template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchReportCards(0, 10)" />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="reportCards.length > 0" divide>
          <UPageCard v-for="report in reportCards" :key="report.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${report.studentName.charAt(0)}${report.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary" variant="soft" class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ report.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ report.academicSemesterName }} · {{ report.folio || 'Sin folio' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="report.overallAverage !== undefined && report.overallAverage !== null" color="primary" variant="soft" size="sm">
                    {{ report.overallAverage }}
                  </UBadge>
                  <UBadge v-if="report.isSigned" color="success" variant="soft" size="sm">Firmada</UBadge>
                  <UBadge :color="statusBadgeColor(report.status)" variant="soft">{{ statusLabel(report.status) }}</UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span><UIcon name="i-lucide-hash" class="size-4 mr-1" />{{ report.enrollmentNumber }}</span>
                  <span><UIcon name="i-lucide-layers" class="size-4 mr-1" />{{ report.totalSubjects || 0 }} materias</span>
                  <span v-if="report.reportCardType"><UIcon name="i-lucide-tag" class="size-4 mr-1" />{{ report.reportCardType }}</span>
                </div>
                <UDropdownMenu :items="getActions(report)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-file-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay boletas</h3>
          <p class="text-muted-foreground mb-4">Crea la primera boleta para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nueva Boleta</UButton>
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
                <UIcon :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nueva Boleta' : viewMode === 'view' ? `Boleta: ${selectedReport?.studentName}` : `Editar: ${selectedReport?.studentName}` }}
                </span>
                <UBadge v-if="viewMode === 'edit' && hasChanges" color="warning" variant="soft" class="animate-pulse">
                  <UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />Cambios pendientes
                </UBadge>
                <UBadge v-else-if="viewMode === 'edit' && !hasChanges" color="success" variant="soft">
                  <UIcon name="i-lucide-check" class="size-3 mr-1" />Sin cambios
                </UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div class="max-h-[60vh] overflow-y-auto space-y-4 px-1">
            <div v-if="viewMode === 'create'">
              <UFormField label="Estudiante" name="studentId" required>
                <USelect v-model="form.studentId" :items="studentOptions" placeholder="Seleccionar estudiante" icon="i-lucide-user-round" />
              </UFormField>
              <UFormField label="Semestre académico" name="academicSemesterId" required>
                <USelect v-model="form.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar-range" />
              </UFormField>
              <UFormField label="Generación" name="generationId">
                <USelect v-model="form.generationId" :items="generationOptions" placeholder="Seleccionar generación (opcional)" icon="i-lucide-calendar-days" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Tipo de boleta" name="reportCardType">
                  <USelect v-model="form.reportCardType" :items="reportTypeOptions" icon="i-lucide-tag" />
                </UFormField>
                <UFormField label="Modo de generación" name="generationMode">
                  <USelect v-model="form.generationMode" :items="generationModeOptions" icon="i-lucide-globe" />
                </UFormField>
              </div>
              <UFormField label="Folio" name="folio">
                <UInput v-model="form.folio" placeholder="Ej: BOL-2025-001" icon="i-lucide-hash" />
              </UFormField>
              <UFormField label="Observaciones" name="observations">
                <UTextarea v-model="form.observations" placeholder="Notas adicionales..." />
              </UFormField>

              <USeparator label="Materias" class="my-4" />

              <div v-for="(detail, index) in form.details" :key="index" class="p-4 border rounded-lg space-y-3 mb-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Materia #{{ index + 1 }}</span>
                  <UButton size="xs" color="error" variant="ghost" @click="removeDetailRow(index)" icon="i-lucide-x" />
                </div>
                <UFormField label="Curso" required>
                  <USelect v-model="detail.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
                </UFormField>
                <div class="grid grid-cols-2 gap-3">
                  <UFormField label="Nombre de materia" required>
                    <UInput v-model="detail.subjectName" placeholder="Nombre de la materia" />
                  </UFormField>
                  <UFormField label="Clave" required>
                    <UInput v-model="detail.subjectCode" placeholder="Ej: LEP101" />
                  </UFormField>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <UFormField label="Créditos" required>
                    <UInput v-model="detail.credits" type="number" min="0" />
                  </UFormField>
                  <UFormField label="Calificación">
                    <UInput v-model="detail.grade" type="number" min="0" max="100" step="0.1" placeholder="0-100" />
                  </UFormField>
                  <UFormField label="Letra">
                    <UInput v-model="detail.gradeLetter" placeholder="A, B, C..." />
                  </UFormField>
                </div>
              </div>

              <UButton @click="addDetailRow" color="neutral" variant="outline" icon="i-lucide-plus" class="w-full">
                Agregar materia
              </UButton>
            </div>

            <div v-else-if="viewMode === 'view' && selectedReport">
              <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <UAvatar :text="`${selectedReport.studentName.charAt(0)}${selectedReport.studentName.split(' ').pop()?.charAt(0) || ''}`"
                  color="primary" variant="soft" class="w-16 h-16 text-lg" />
                <div>
                  <h3 class="text-xl font-bold">{{ selectedReport.studentName }}</h3>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <UBadge :color="statusBadgeColor(selectedReport.status)" variant="soft">{{ statusLabel(selectedReport.status) }}</UBadge>
                    <UBadge v-if="selectedReport.isSigned" color="success" variant="soft">Firmada</UBadge>
                  </div>
                </div>
              </div>

              <USeparator />

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Folio</p><p class="font-semibold">{{ selectedReport.folio || 'N/A' }}</p></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-calendar-range" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Semestre</p><p class="font-semibold">{{ selectedReport.academicSemesterName }}</p></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Promedio</p><p class="font-semibold text-2xl">{{ selectedReport.overallAverage ?? 'N/A' }}</p></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-type" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Letra</p><p class="font-semibold">{{ selectedReport.averageLetter || 'N/A' }}</p></div>
                </div>
              </div>

              <USeparator label="Materias" />

              <UTable v-if="selectedReport.details.length > 0" :data="selectedReport.details" class="w-full">
                <template #header>
                  <tr>
                    <th class="text-left">Clave</th>
                    <th class="text-left">Materia</th>
                    <th class="text-center">Créd.</th>
                    <th class="text-center">Calif.</th>
                    <th class="text-center">Estado</th>
                  </tr>
                </template>
                <template #body>
                  <tr v-for="detail in selectedReport.details" :key="detail.id" class="border-t">
                    <td class="py-2 text-sm">{{ detail.subjectCode }}</td>
                    <td class="py-2 text-sm">{{ detail.subjectName }}</td>
                    <td class="py-2 text-sm text-center">{{ detail.credits }}</td>
                    <td class="py-2 text-sm text-center font-semibold">{{ detail.grade ?? 'N/A' }}</td>
                    <td class="py-2 text-sm text-center">
                      <UBadge v-if="detail.subjectStatus" variant="soft" size="sm">{{ detail.subjectStatus }}</UBadge>
                    </td>
                  </tr>
                </template>
              </UTable>
              <p v-else class="text-sm text-muted-foreground text-center py-4">Sin materias registradas</p>
            </div>

            <div v-else-if="viewMode === 'edit' && selectedReport" class="space-y-4">
              <UFormField label="Estado" name="status">
                <USelect v-model="editForm.status" :items="statusOptions" icon="i-lucide-flag" />
              </UFormField>
              <div class="flex items-center gap-2">
                <UCheckbox v-model="editForm.isSigned" label="Firmada" />
              </div>
              <UFormField label="Fecha de entrega" name="deliveryDate">
                <UInput v-model="editForm.deliveryDate" type="date" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Folio" name="folio">
                <UInput v-model="editForm.folio" placeholder="Ej: BOL-2025-001" icon="i-lucide-hash" />
              </UFormField>
              <UFormField label="Observaciones" name="observations">
                <UTextarea v-model="editForm.observations" placeholder="Notas adicionales..." />
              </UFormField>
            </div>
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
