<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Conduct } from '~/composables/useConduct'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Conducta - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()
const {
  records, loading, error,
  fetchRecords, fetchDeletedRecords, getRecord,
  createRecord, updateRecord, deleteRecord,
  fetchIncidentsByEnrollment, createIncident, deleteIncident,
  fetchDeletedIncidents
} = useConduct()
const { enrollments, fetchEnrollments: fetchAllEnrollments } = useEnrollments()
const { semesters, fetchSemesters: fetchAllSemesters } = useAcademicSemesters()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedRecord = ref<Conduct | null>(null)
const originalRecordData = ref<Conduct | null>(null)
const showDeleted = ref(false)
const showDeletedIncidents = ref(false)

const incidents = ref<ConductIncident[]>([])
const incidentsLoading = ref(false)

const incidentForm = ref({
  incidentType: '',
  description: '',
  incidentDate: '',
  severity: '',
  actionsTaken: '',
  attentionDate: ''
})

const resetIncidentForm = () => {
  incidentForm.value = {
    incidentType: '',
    description: '',
    incidentDate: '',
    severity: '',
    actionsTaken: '',
    attentionDate: ''
  }
}

const pageModel = ref(1)

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedRecords()
  } else {
    fetchRecords(0, 10)
  }
  fetchAllEnrollments(0, 50)
  fetchAllSemesters(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedRecords()
  } else {
    fetchRecords(0, 10)
  }
})

watch(pageModel, (newPage) => {
  fetchRecords(newPage - 1, 10)
})

const enrollmentOptions = computed(() =>
  enrollments.value.map(e => ({ label: `${e.studentName} - ${e.courseName} (${e.enrollmentNumber})`, value: e.id }))
)

const semesterOptions = computed(() =>
  semesters.value.map(s => ({ label: s.name, value: s.id }))
)

const enrollmentLookup = computed(() => {
  const map = new Map<string, Enrollment>()
  enrollments.value.forEach(e => map.set(e.id, e))
  return map
})

const closePanel = () => {
  viewMode.value = null
  selectedRecord.value = null
  originalRecordData.value = null
  incidents.value = []
}

const openCreate = () => {
  selectedRecord.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (record: Conduct) => {
  selectedRecord.value = await getRecord(record.id)
  if (selectedRecord.value) {
    await loadIncidents(selectedRecord.value.enrollmentId)
  }
  viewMode.value = 'view'
}

const openEdit = async (record: Conduct) => {
  selectedRecord.value = await getRecord(record.id)
  if (selectedRecord.value) {
    originalRecordData.value = { ...selectedRecord.value }
    const r = selectedRecord.value
    editForm.value = {
      grade: r.grade || '',
      observations: r.observations || '',
      warnings: r.warnings ?? 0,
      congratulations: r.congratulations ?? 0
    }
    await loadIncidents(selectedRecord.value.enrollmentId)
  }
  viewMode.value = 'edit'
}

const loadIncidents = async (enrollmentId: string) => {
  incidentsLoading.value = true
  try {
    if (showDeletedIncidents.value) {
      incidents.value = await fetchDeletedIncidents()
    } else {
      incidents.value = await fetchIncidentsByEnrollment(enrollmentId)
    }
  } finally {
    incidentsLoading.value = false
  }
}

watch(showDeletedIncidents, () => {
  if (selectedRecord.value) {
    loadIncidents(selectedRecord.value.enrollmentId)
  }
})

const hasChanges = computed(() => {
  if (!originalRecordData.value || viewMode.value !== 'edit') return false

  const orig = originalRecordData.value
  const f = editForm.value

  return (
    f.grade !== (orig.grade || '') ||
    f.observations !== (orig.observations || '') ||
    f.warnings !== (orig.warnings ?? 0) ||
    f.congratulations !== (orig.congratulations ?? 0)
  )
})

const discardChanges = () => {
  if (originalRecordData.value) {
    const orig = originalRecordData.value
    editForm.value = {
      grade: orig.grade || '',
      observations: orig.observations || '',
      warnings: orig.warnings ?? 0,
      congratulations: orig.congratulations ?? 0
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const form = ref({
  enrollmentId: '',
  academicSemesterId: '',
  grade: '',
  observations: '',
  warnings: 0,
  congratulations: 0
})

const editForm = ref({
  grade: '',
  observations: '',
  warnings: 0,
  congratulations: 0
})

const resetForm = () => {
  form.value = {
    enrollmentId: '',
    academicSemesterId: '',
    grade: '',
    observations: '',
    warnings: 0,
    congratulations: 0
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    enrollmentId: form.value.enrollmentId,
    academicSemesterId: form.value.academicSemesterId
  }
  if (form.value.grade) data.grade = form.value.grade
  if (form.value.observations) data.observations = form.value.observations
  if (form.value.warnings > 0) data.warnings = form.value.warnings
  if (form.value.congratulations > 0) data.congratulations = form.value.congratulations

  const result = await createRecord(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchRecords(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedRecord.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.grade) data.grade = editForm.value.grade
  if (editForm.value.observations) data.observations = editForm.value.observations
  if (editForm.value.warnings >= 0) data.warnings = editForm.value.warnings
  if (editForm.value.congratulations >= 0) data.congratulations = editForm.value.congratulations

  const result = await updateRecord(selectedRecord.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchRecords(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (record: Conduct) => {
  const confirmed = await confirm({
    title: 'Eliminar registro de conducta',
    description: `¿Estás seguro de eliminar el registro de "${record.studentName}"?`
  })
  if (confirmed) {
    const result = await deleteRecord(record.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchRecords(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const submittingIncident = ref(false)

const handleCreateIncident = async () => {
  if (!selectedRecord.value) return

  submittingIncident.value = true
  const data: any = {
    enrollmentId: selectedRecord.value.enrollmentId,
    incidentType: incidentForm.value.incidentType,
    description: incidentForm.value.description,
    incidentDate: incidentForm.value.incidentDate
  }
  if (incidentForm.value.severity) data.severity = incidentForm.value.severity
  if (incidentForm.value.actionsTaken) data.actionsTaken = incidentForm.value.actionsTaken
  if (incidentForm.value.attentionDate) data.attentionDate = incidentForm.value.attentionDate

  const result = await createIncident(data)
  submittingIncident.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    resetIncidentForm()
    await loadIncidents(selectedRecord.value.enrollmentId)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDeleteIncident = async (incident: ConductIncident) => {
  if (!selectedRecord.value) return

  const confirmed = await confirm({
    title: 'Eliminar incidente',
    description: `¿Estás seguro de eliminar este incidente?`
  })
  if (confirmed) {
    const result = await deleteIncident(incident.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      await loadIncidents(selectedRecord.value.enrollmentId)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const gradeOptions = [
  { label: 'Excelente', value: 'EXCELLENT' },
  { label: 'Buena', value: 'GOOD' },
  { label: 'Regular', value: 'FAIR' },
  { label: 'Mala', value: 'POOR' }
]

const incidentTypeOptions = [
  { label: 'Falta leve', value: 'MINOR' },
  { label: 'Falta grave', value: 'MAJOR' },
  { label: 'Falta muy grave', value: 'CRITICAL' },
  { label: 'Logro / Reconocimiento', value: 'ACHIEVEMENT' }
]

const severityOptions = [
  { label: 'Baja', value: 'LOW' },
  { label: 'Media', value: 'MEDIUM' },
  { label: 'Alta', value: 'HIGH' }
]

const gradeLabel = (grade: string) => {
  const opt = gradeOptions.find(o => o.value === grade)
  return opt ? opt.label : grade
}

const severityBadgeColor = (severity?: string) => {
  switch (severity) {
    case 'LOW': return 'info'
    case 'MEDIUM': return 'warning'
    case 'HIGH': return 'error'
    default: return 'neutral'
  }
}

const incidentTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'MINOR': return 'warning'
    case 'MAJOR': return 'error'
    case 'CRITICAL': return 'error'
    case 'ACHIEVEMENT': return 'success'
    default: return 'neutral'
  }
}

const incidentTypeLabel = (type: string) => {
  const opt = incidentTypeOptions.find(o => o.value === type)
  return opt ? opt.label : type
}

const getActions = (record: Conduct): DropdownMenuItem[][] => {
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
        <h1 class="text-3xl font-bold">Conducta</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Registros eliminados' : 'Registros de conducta' }}: {{ records.length }}
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
      <template #description>Estás viendo los registros de conducta eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando registros" description="Por favor espera...">
      <template #icon>
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
      </template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchRecords(0, 10)" />
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
                    color="primary" variant="soft" class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ record.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ record.enrollmentNumber }} · {{ record.academicSemesterName }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="record.grade" color="primary" variant="soft" size="sm">{{ gradeLabel(record.grade) }}</UBadge>
                  <div class="flex gap-1">
                    <UBadge v-if="record.warnings && record.warnings > 0" color="error" variant="soft" size="sm">
                      {{ record.warnings }} amonestacione
                    </UBadge>
                    <UBadge v-if="record.congratulations && record.congratulations > 0" color="success" variant="soft" size="sm">
                      {{ record.congratulations }} felicitacione
                    </UBadge>
                  </div>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span v-if="record.courseCode"><UIcon name="i-lucide-book-open" class="size-4 mr-1" />{{ record.courseCode }}</span>
                  <span v-if="record.registrationDate"><UIcon name="i-lucide-calendar" class="size-4 mr-1" />{{ record.registrationDate }}</span>
                </div>
                <UDropdownMenu :items="getActions(record)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-file-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay registros de conducta</h3>
          <p class="text-muted-foreground mb-4">Crea el primer registro para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nuevo Registro</UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full" :class="viewMode === 'edit' ? 'max-w-2xl' : 'max-w-lg'">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Registro de Conducta' : viewMode === 'view' ? `Conducta: ${selectedRecord?.studentName}` : `Editar: ${selectedRecord?.studentName}` }}
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
              <UFormField label="Inscripción" name="enrollmentId" required>
                <USelect v-model="form.enrollmentId" :items="enrollmentOptions" placeholder="Seleccionar inscripción" icon="i-lucide-file-text" />
              </UFormField>
              <UFormField label="Semestre académico" name="academicSemesterId" required>
                <USelect v-model="form.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar-range" />
              </UFormField>
              <UFormField label="Calificación" name="grade">
                <USelect v-model="form.grade" :items="gradeOptions" placeholder="Seleccionar calificación" icon="i-lucide-star" />
              </UFormField>
              <UFormField label="Observaciones" name="observations">
                <UTextarea v-model="form.observations" placeholder="Notas adicionales..." />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Amonestaciones" name="warnings">
                  <UInput v-model="form.warnings" type="number" min="0" icon="i-lucide-alert-triangle" />
                </UFormField>
                <UFormField label="Felicitaciones" name="congratulations">
                  <UInput v-model="form.congratulations" type="number" min="0" icon="i-lucide-award" />
                </UFormField>
              </div>
            </div>

            <div v-else-if="viewMode === 'view' && selectedRecord">
              <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <UAvatar
                  :text="`${selectedRecord.studentName.charAt(0)}${selectedRecord.studentName.split(' ').pop()?.charAt(0) || ''}`"
                  color="primary" variant="soft" class="w-16 h-16 text-lg" />
                <div>
                  <h3 class="text-xl font-bold">{{ selectedRecord.studentName }}</h3>
                  <p class="text-sm text-muted-foreground">{{ selectedRecord.enrollmentNumber }}</p>
                </div>
              </div>

              <USeparator />

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Calificación</p><p class="font-semibold">{{ selectedRecord.grade ? gradeLabel(selectedRecord.grade) : 'No asignada' }}</p></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-calendar-range" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Semestre</p><p class="font-semibold">{{ selectedRecord.academicSemesterName }}</p></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-alert-triangle" class="size-5 text-muted-foreground text-error" />
                  <div><p class="text-xs text-muted-foreground uppercase">Amonestaciones</p><p class="font-semibold text-lg">{{ selectedRecord.warnings ?? 0 }}</p></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-award" class="size-5 text-muted-foreground text-success" />
                  <div><p class="text-xs text-muted-foreground uppercase">Felicitaciones</p><p class="font-semibold text-lg">{{ selectedRecord.congratulations ?? 0 }}</p></div>
                </div>
              </div>

              <div v-if="selectedRecord.observations" class="p-3 bg-muted/50 rounded-lg">
                <p class="text-xs text-muted-foreground uppercase mb-1">Observaciones</p>
                <p>{{ selectedRecord.observations }}</p>
              </div>

              <USeparator label="Incidentes" />
              <div v-if="incidentsLoading" class="text-center py-4">
                <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin mx-auto text-muted-foreground" />
              </div>
              <UTable v-else-if="incidents.length > 0" :data="incidents" class="w-full">
                <template #header>
                  <tr>
                    <th class="text-left">Tipo</th>
                    <th class="text-left">Descripción</th>
                    <th class="text-center">Fecha</th>
                    <th class="text-center">Severidad</th>
                  </tr>
                </template>
                <template #body>
                  <tr v-for="inc in incidents" :key="inc.id" class="border-t">
                    <td class="py-2 text-sm">
                      <UBadge :color="incidentTypeBadgeColor(inc.incidentType)" variant="soft" size="sm">{{ incidentTypeLabel(inc.incidentType) }}</UBadge>
                    </td>
                    <td class="py-2 text-sm">{{ inc.description }}</td>
                    <td class="py-2 text-sm text-center">{{ inc.incidentDate }}</td>
                    <td class="py-2 text-sm text-center">
                      <UBadge v-if="inc.severity" :color="severityBadgeColor(inc.severity)" variant="soft" size="sm">{{ inc.severity }}</UBadge>
                    </td>
                  </tr>
                </template>
              </UTable>
              <p v-else class="text-sm text-muted-foreground text-center py-4">Sin incidentes registrados</p>
            </div>

            <div v-else-if="viewMode === 'edit' && selectedRecord" class="space-y-4">
              <UFormField label="Calificación" name="grade">
                <USelect v-model="editForm.grade" :items="gradeOptions" placeholder="Seleccionar calificación" icon="i-lucide-star" />
              </UFormField>
              <UFormField label="Observaciones" name="observations">
                <UTextarea v-model="editForm.observations" placeholder="Notas adicionales..." />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Amonestaciones" name="warnings">
                  <UInput v-model="editForm.warnings" type="number" min="0" icon="i-lucide-alert-triangle" />
                </UFormField>
                <UFormField label="Felicitaciones" name="congratulations">
                  <UInput v-model="editForm.congratulations" type="number" min="0" icon="i-lucide-award" />
                </UFormField>
              </div>

              <USeparator label="Incidentes" />

              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Lista de incidentes ({{ incidents.length }})</span>
                <UCheckbox v-model="showDeletedIncidents" label="Ver eliminados" size="sm" />
              </div>

              <div v-if="incidentsLoading" class="text-center py-4">
                <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin mx-auto text-muted-foreground" />
              </div>
              <template v-else>
                <div v-for="inc in incidents" :key="inc.id" class="p-3 border rounded-lg space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <UBadge :color="incidentTypeBadgeColor(inc.incidentType)" variant="soft" size="sm">{{ incidentTypeLabel(inc.incidentType) }}</UBadge>
                      <UBadge v-if="inc.severity" :color="severityBadgeColor(inc.severity)" variant="soft" size="sm">{{ inc.severity }}</UBadge>
                    </div>
                    <UButton v-if="!showDeletedIncidents" size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="handleDeleteIncident(inc)" />
                  </div>
                  <p class="text-sm">{{ inc.description }}</p>
                  <div class="flex gap-4 text-xs text-muted-foreground">
                    <span>{{ inc.incidentDate }}</span>
                    <span v-if="inc.actionsTaken">Acciones: {{ inc.actionsTaken }}</span>
                  </div>
                </div>

                <USeparator label="Nuevo incidente" class="my-2" />

                <div class="space-y-3 p-3 border rounded-lg">
                  <UFormField label="Tipo de incidente" required>
                    <USelect v-model="incidentForm.incidentType" :items="incidentTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-tag" />
                  </UFormField>
                  <UFormField label="Descripción" required>
                    <UTextarea v-model="incidentForm.description" placeholder="Describir el incidente..." />
                  </UFormField>
                  <div class="grid grid-cols-2 gap-3">
                    <UFormField label="Fecha del incidente" required>
                      <UInput v-model="incidentForm.incidentDate" type="date" icon="i-lucide-calendar" />
                    </UFormField>
                    <UFormField label="Severidad">
                      <USelect v-model="incidentForm.severity" :items="severityOptions" placeholder="Seleccionar" icon="i-lucide-alert-circle" />
                    </UFormField>
                  </div>
                  <UFormField label="Acciones tomadas">
                    <UTextarea v-model="incidentForm.actionsTaken" placeholder="Acciones realizadas..." />
                  </UFormField>
                  <UFormField label="Fecha de atención">
                    <UInput v-model="incidentForm.attentionDate" type="date" icon="i-lucide-calendar-check" />
                  </UFormField>
                  <UButton @click="handleCreateIncident" :loading="submittingIncident" icon="i-lucide-plus" block>
                    Registrar Incidente
                  </UButton>
                </div>
              </template>
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
