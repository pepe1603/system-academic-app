<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Certificate } from '~/composables/useCertificates'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Certificados - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedCertificate = ref<Certificate | null>(null)
const originalCertificateData = ref<Certificate | null>(null)
const showDeleted = ref(false)

const { certificates, loading, error, fetchCertificates, fetchDeletedCertificates, getCertificate, createCertificate, updateCertificate, deleteCertificate } = useCertificates()
const { students, fetchStudents: fetchAllStudents } = useStudents()
const { generations, fetchGenerations: fetchAllGenerations } = useGenerations()
const { records: teachers, fetchRecords: fetchAllTeachers } = useTeachers()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedCertificates()
  } else {
    fetchCertificates(0, 10)
  }
  fetchAllStudents(0, 50)
  fetchAllGenerations(0, 50)
  fetchAllTeachers(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedCertificates()
  } else {
    fetchCertificates(0, 10)
  }
})

const certificateTypeOptions = [
  { label: 'Parcial', value: 'PARTIAL' },
  { label: 'Total', value: 'TOTAL' },
  { label: 'Título', value: 'TITLE' },
  { label: 'Diploma', value: 'DIPLOMA' },
  { label: 'Constancia', value: 'CONSTANCIA' }
]

const statusOptions = [
  { label: 'Solicitado', value: 'REQUESTED' },
  { label: 'En proceso', value: 'IN_PROCESS' },
  { label: 'Emitido', value: 'ISSUED' },
  { label: 'Entregado', value: 'DELIVERED' },
  { label: 'Cancelado', value: 'CANCELLED' }
]

const studentOptions = computed(() =>
  students.value.map(s => ({ label: `${s.enrollmentNumber} - ${s.firstName} ${s.lastName}`, value: s.id }))
)

const generationOptions = computed(() =>
  generations.value.map(g => ({ label: g.name, value: g.id }))
)

const teacherOptions = computed(() =>
  teachers.value.map(t => ({ label: `${t.firstName} ${t.lastName}`, value: t.id }))
)

const hasChanges = computed(() => {
  if (!originalCertificateData.value || viewMode.value !== 'edit') return false

  const orig = originalCertificateData.value
  const f = editForm.value

  return (
    f.certificateType !== (orig.certificateType || '') ||
    f.status !== (orig.status || '') ||
    f.studentId !== (orig.studentId || '') ||
    f.generationId !== (orig.generationId || '') ||
    f.directorSigner !== (orig.directorSigner || '') ||
    f.secretarySigner !== (orig.secretarySigner || '') ||
    f.officialFolio !== (orig.officialFolio || '') ||
    f.internalFolio !== (orig.internalFolio || '') ||
    f.series !== (orig.series || '') ||
    f.finalAverage !== (orig.finalAverage ?? '') ||
    f.totalCredits !== (orig.totalCredits ?? '') ||
    f.totalSubjects !== (orig.totalSubjects ?? '') ||
    f.issueDate !== (orig.issueDate || '') ||
    f.deliveryDate !== (orig.deliveryDate || '') ||
    f.recordNumber !== (orig.recordNumber || '') ||
    f.recordBook !== (orig.recordBook || '') ||
    f.recordPage !== (orig.recordPage || '') ||
    f.observations !== (orig.observations || '')
  )
})

const discardChanges = () => {
  if (originalCertificateData.value) {
    const orig = originalCertificateData.value
    editForm.value = {
      studentId: orig.studentId || '',
      generationId: orig.generationId || '',
      certificateType: orig.certificateType || 'PARTIAL',
      status: orig.status || 'REQUESTED',
      officialFolio: orig.officialFolio || '',
      internalFolio: orig.internalFolio || '',
      series: orig.series || '',
      finalAverage: orig.finalAverage ?? null,
      totalCredits: orig.totalCredits ?? null,
      totalSubjects: orig.totalSubjects ?? null,
      issueDate: orig.issueDate || '',
      deliveryDate: orig.deliveryDate || '',
      directorSigner: orig.directorSigner || '',
      secretarySigner: orig.secretarySigner || '',
      recordNumber: orig.recordNumber || '',
      recordBook: orig.recordBook || '',
      recordPage: orig.recordPage || '',
      observations: orig.observations || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchCertificates(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedCertificate.value = null
  originalCertificateData.value = null
}

const openCreate = () => {
  selectedCertificate.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (certificate: Certificate) => {
  selectedCertificate.value = await getCertificate(certificate.id)
  viewMode.value = 'view'
}

const openEdit = async (certificate: Certificate) => {
  selectedCertificate.value = await getCertificate(certificate.id)
  if (selectedCertificate.value) {
    originalCertificateData.value = { ...selectedCertificate.value }
    const e = selectedCertificate.value
    editForm.value = {
      studentId: e.studentId || '',
      generationId: e.generationId || '',
      certificateType: e.certificateType || 'PARTIAL',
      status: e.status || 'REQUESTED',
      officialFolio: e.officialFolio || '',
      internalFolio: e.internalFolio || '',
      series: e.series || '',
      finalAverage: e.finalAverage ?? null,
      totalCredits: e.totalCredits ?? null,
      totalSubjects: e.totalSubjects ?? null,
      issueDate: e.issueDate || '',
      deliveryDate: e.deliveryDate || '',
      directorSigner: e.directorSigner || '',
      secretarySigner: e.secretarySigner || '',
      recordNumber: e.recordNumber || '',
      recordBook: e.recordBook || '',
      recordPage: e.recordPage || '',
      observations: e.observations || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  generationId: '',
  certificateType: 'PARTIAL',
  officialFolio: '',
  internalFolio: '',
  series: '',
  finalAverage: null as number | null,
  totalCredits: null as number | null,
  totalSubjects: null as number | null,
  issueDate: '',
  directorSigner: '',
  secretarySigner: '',
  recordNumber: '',
  recordBook: '',
  recordPage: '',
  observations: ''
})

const editForm = ref({
  studentId: '',
  generationId: '',
  certificateType: 'PARTIAL',
  status: 'REQUESTED',
  officialFolio: '',
  internalFolio: '',
  series: '',
  finalAverage: null as number | null,
  totalCredits: null as number | null,
  totalSubjects: null as number | null,
  issueDate: '',
  deliveryDate: '',
  directorSigner: '',
  secretarySigner: '',
  recordNumber: '',
  recordBook: '',
  recordPage: '',
  observations: ''
})

const resetForm = () => {
  form.value = {
    studentId: '',
    generationId: '',
    certificateType: 'PARTIAL',
    officialFolio: '',
    internalFolio: '',
    series: '',
    finalAverage: null,
    totalCredits: null,
    totalSubjects: null,
    issueDate: '',
    directorSigner: '',
    secretarySigner: '',
    recordNumber: '',
    recordBook: '',
    recordPage: '',
    observations: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    generationId: form.value.generationId || undefined,
    certificateType: form.value.certificateType,
    officialFolio: form.value.officialFolio || undefined,
    internalFolio: form.value.internalFolio || undefined,
    series: form.value.series || undefined,
    finalAverage: form.value.finalAverage ?? undefined,
    totalCredits: form.value.totalCredits ?? undefined,
    totalSubjects: form.value.totalSubjects ?? undefined,
    issueDate: form.value.issueDate || undefined,
    directorSigner: form.value.directorSigner || undefined,
    secretarySigner: form.value.secretarySigner || undefined,
    recordNumber: form.value.recordNumber || undefined,
    recordBook: form.value.recordBook || undefined,
    recordPage: form.value.recordPage || undefined,
    observations: form.value.observations || undefined
  }
  const result = await createCertificate(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchCertificates(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedCertificate.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.certificateType) data.certificateType = editForm.value.certificateType
  if (editForm.value.status) data.status = editForm.value.status
  if (editForm.value.officialFolio) data.officialFolio = editForm.value.officialFolio
  if (editForm.value.internalFolio) data.internalFolio = editForm.value.internalFolio
  if (editForm.value.series) data.series = editForm.value.series
  if (editForm.value.finalAverage !== null) data.finalAverage = editForm.value.finalAverage
  if (editForm.value.totalCredits !== null) data.totalCredits = editForm.value.totalCredits
  if (editForm.value.totalSubjects !== null) data.totalSubjects = editForm.value.totalSubjects
  if (editForm.value.issueDate) data.issueDate = editForm.value.issueDate
  if (editForm.value.deliveryDate) data.deliveryDate = editForm.value.deliveryDate
  if (editForm.value.directorSigner) data.directorSigner = editForm.value.directorSigner
  if (editForm.value.secretarySigner) data.secretarySigner = editForm.value.secretarySigner
  if (editForm.value.recordNumber) data.recordNumber = editForm.value.recordNumber
  if (editForm.value.recordBook) data.recordBook = editForm.value.recordBook
  if (editForm.value.recordPage) data.recordPage = editForm.value.recordPage
  if (editForm.value.observations) data.observations = editForm.value.observations

  const result = await updateCertificate(selectedCertificate.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchCertificates(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (certificate: Certificate) => {
  const confirmed = await confirm({
    title: 'Eliminar certificado',
    description: `¿Estás seguro de eliminar el certificado tipo "${certificateTypeLabel(certificate.certificateType)}" de "${certificate.studentName}"?`
  })
  if (confirmed) {
    const result = await deleteCertificate(certificate.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchCertificates(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const certificateTypeLabel = (type: string) => {
  switch (type) {
    case 'PARTIAL': return 'Parcial'
    case 'TOTAL': return 'Total'
    case 'TITLE': return 'Título'
    case 'DIPLOMA': return 'Diploma'
    case 'CONSTANCIA': return 'Constancia'
    default: return type
  }
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'REQUESTED': return 'info'
    case 'IN_PROCESS': return 'warning'
    case 'ISSUED': return 'success'
    case 'DELIVERED': return 'primary'
    case 'CANCELLED': return 'error'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'REQUESTED': return 'Solicitado'
    case 'IN_PROCESS': return 'En proceso'
    case 'ISSUED': return 'Emitido'
    case 'DELIVERED': return 'Entregado'
    case 'CANCELLED': return 'Cancelado'
    default: return status
  }
}

const getActions = (certificate: Certificate): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(certificate)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(certificate)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(certificate)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(certificate)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Certificados</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Certificados eliminados' : 'Certificados activos' }}: {{ certificates.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Certificado
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los certificados eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando certificados"
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
          @click="fetchCertificates(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="certificates.length > 0" divide>
          <UPageCard v-for="certificate in certificates" :key="certificate.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${certificate.studentName.charAt(0)}${certificate.studentName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ certificate.studentName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ certificateTypeLabel(certificate.certificateType) }} · {{ certificate.enrollmentNumber }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge :color="statusBadgeColor(certificate.status)" variant="soft">
                    {{ statusLabel(certificate.status) }}
                  </UBadge>
                  <UBadge v-if="certificate.officialFolio" color="neutral" variant="outline">
                    Folio: {{ certificate.officialFolio }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-hash" class="size-4 mr-1" />
                    {{ certificate.certificateType }}
                  </span>
                  <span v-if="certificate.generationName">
                    <UIcon name="i-lucide-calendar-days" class="size-4 mr-1" />
                    {{ certificate.generationName }}
                  </span>
                  <span v-if="certificate.issueDate">
                    <UIcon name="i-lucide-calendar" class="size-4 mr-1" />
                    Emisión: {{ certificate.issueDate }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(certificate)">
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
          <h3 class="text-lg font-medium mb-2">No hay certificados</h3>
          <p class="text-muted-foreground mb-4">Registra el primer certificado para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Certificado
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
                  {{ viewMode === 'create' ? 'Nuevo Certificado' : viewMode === 'view' ? `Certificado: ${selectedCertificate?.studentName}` : `Editar: ${selectedCertificate?.studentName}` }}
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

            <UFormField label="Tipo de certificado" name="certificateType" required>
              <USelect v-model="form.certificateType" :items="certificateTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-text" />
            </UFormField>

            <USeparator label="Información del certificado" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Folio oficial" name="officialFolio">
                <UInput v-model="form.officialFolio" placeholder="Folio oficial" icon="i-lucide-hash" />
              </UFormField>

              <UFormField label="Folio interno" name="internalFolio">
                <UInput v-model="form.internalFolio" placeholder="Folio interno" icon="i-lucide-hash" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Serie" name="series">
                <UInput v-model="form.series" placeholder="Serie" icon="i-lucide-scan-barcode" />
              </UFormField>

              <UFormField label="Generación" name="generationId">
                <USelect v-model="form.generationId" :items="generationOptions" placeholder="Seleccionar generación" icon="i-lucide-calendar-days" />
              </UFormField>
            </div>

            <USeparator label="Datos académicos" />

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Promedio final" name="finalAverage">
                <UInput v-model="form.finalAverage" type="number" step="0.01" placeholder="0.00" icon="i-lucide-star" />
              </UFormField>

              <UFormField label="Total créditos" name="totalCredits">
                <UInput v-model="form.totalCredits" type="number" placeholder="0" icon="i-lucide-copy-check" />
              </UFormField>

              <UFormField label="Total materias" name="totalSubjects">
                <UInput v-model="form.totalSubjects" type="number" placeholder="0" icon="i-lucide-book-open" />
              </UFormField>
            </div>

            <USeparator label="Fecha de emisión" />

            <UFormField label="Fecha de emisión" name="issueDate">
              <UInput v-model="form.issueDate" type="date" icon="i-lucide-calendar" />
            </UFormField>

            <USeparator label="Firmantes" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Director" name="directorSigner">
                <USelect v-model="form.directorSigner" :items="teacherOptions" placeholder="Seleccionar director" icon="i-lucide-graduation-cap" />
              </UFormField>

              <UFormField label="Secretario" name="secretarySigner">
                <USelect v-model="form.secretarySigner" :items="teacherOptions" placeholder="Seleccionar secretario" icon="i-lucide-graduation-cap" />
              </UFormField>
            </div>

            <USeparator label="Registro" />

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="N° de registro" name="recordNumber">
                <UInput v-model="form.recordNumber" placeholder="Número" icon="i-lucide-hash" />
              </UFormField>

              <UFormField label="Libro" name="recordBook">
                <UInput v-model="form.recordBook" placeholder="Libro" icon="i-lucide-book" />
              </UFormField>

              <UFormField label="Página" name="recordPage">
                <UInput v-model="form.recordPage" placeholder="Página" icon="i-lucide-file" />
              </UFormField>
            </div>

            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="form.observations" placeholder="Observaciones (opcional)" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedCertificate" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedCertificate.studentName.charAt(0)}${selectedCertificate.studentName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedCertificate.studentName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="statusBadgeColor(selectedCertificate.status)" variant="soft">
                    {{ statusLabel(selectedCertificate.status) }}
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ certificateTypeLabel(selectedCertificate.certificateType) }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator label="Folios" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Folio oficial</p>
                  <p class="font-semibold">{{ selectedCertificate.officialFolio || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Folio interno</p>
                  <p class="font-semibold">{{ selectedCertificate.internalFolio || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Datos académicos" />

            <div class="grid grid-cols-3 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-star" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Promedio</p>
                  <p class="font-semibold">{{ selectedCertificate.finalAverage ?? 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-copy-check" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Créditos</p>
                  <p class="font-semibold">{{ selectedCertificate.totalCredits ?? 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Materias</p>
                  <p class="font-semibold">{{ selectedCertificate.totalSubjects ?? 'N/A' }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Fechas" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Emisión</p>
                  <p class="font-semibold">{{ selectedCertificate.issueDate || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-check" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Entrega</p>
                  <p class="font-semibold">{{ selectedCertificate.deliveryDate || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Firmantes" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-graduation-cap" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Director</p>
                  <p class="font-semibold">{{ selectedCertificate.directorName || 'No asignado' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-graduation-cap" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Secretario</p>
                  <p class="font-semibold">{{ selectedCertificate.secretaryName || 'No asignado' }}</p>
                </div>
              </div>
            </div>

            <USeparator label="Registro" />

            <div class="grid grid-cols-3 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">N° Registro</p>
                  <p class="font-semibold">{{ selectedCertificate.recordNumber || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Libro</p>
                  <p class="font-semibold">{{ selectedCertificate.recordBook || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-file" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Página</p>
                  <p class="font-semibold">{{ selectedCertificate.recordPage || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedCertificate.observations" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Observaciones</p>
              <p class="text-sm">{{ selectedCertificate.observations }}</p>
            </div>

            <div v-if="selectedCertificate.generationName" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Generación</p>
              <p class="text-sm">{{ selectedCertificate.generationName }}</p>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedCertificate" class="space-y-4">
            <UFormField label="Tipo de certificado" name="certificateType">
              <USelect v-model="editForm.certificateType" :items="certificateTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-text" />
            </UFormField>

            <UFormField label="Estado" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" placeholder="Seleccionar estado" icon="i-lucide-flag" />
            </UFormField>

            <USeparator label="Folios" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Folio oficial" name="officialFolio">
                <UInput v-model="editForm.officialFolio" placeholder="Folio oficial" icon="i-lucide-hash" />
              </UFormField>

              <UFormField label="Folio interno" name="internalFolio">
                <UInput v-model="editForm.internalFolio" placeholder="Folio interno" icon="i-lucide-hash" />
              </UFormField>
            </div>

            <UFormField label="Serie" name="series">
              <UInput v-model="editForm.series" placeholder="Serie" icon="i-lucide-scan-barcode" />
            </UFormField>

            <USeparator label="Datos académicos" />

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Promedio final" name="finalAverage">
                <UInput v-model="editForm.finalAverage" type="number" step="0.01" placeholder="0.00" icon="i-lucide-star" />
              </UFormField>

              <UFormField label="Total créditos" name="totalCredits">
                <UInput v-model="editForm.totalCredits" type="number" placeholder="0" icon="i-lucide-copy-check" />
              </UFormField>

              <UFormField label="Total materias" name="totalSubjects">
                <UInput v-model="editForm.totalSubjects" type="number" placeholder="0" icon="i-lucide-book-open" />
              </UFormField>
            </div>

            <USeparator label="Fechas" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de emisión" name="issueDate">
                <UInput v-model="editForm.issueDate" type="date" icon="i-lucide-calendar" />
              </UFormField>

              <UFormField label="Fecha de entrega" name="deliveryDate">
                <UInput v-model="editForm.deliveryDate" type="date" icon="i-lucide-calendar-check" />
              </UFormField>
            </div>

            <USeparator label="Firmantes" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Director" name="directorSigner">
                <USelect v-model="editForm.directorSigner" :items="teacherOptions" placeholder="Seleccionar director" icon="i-lucide-graduation-cap" />
              </UFormField>

              <UFormField label="Secretario" name="secretarySigner">
                <USelect v-model="editForm.secretarySigner" :items="teacherOptions" placeholder="Seleccionar secretario" icon="i-lucide-graduation-cap" />
              </UFormField>
            </div>

            <USeparator label="Registro" />

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="N° de registro" name="recordNumber">
                <UInput v-model="editForm.recordNumber" placeholder="Número" icon="i-lucide-hash" />
              </UFormField>

              <UFormField label="Libro" name="recordBook">
                <UInput v-model="editForm.recordBook" placeholder="Libro" icon="i-lucide-book" />
              </UFormField>

              <UFormField label="Página" name="recordPage">
                <UInput v-model="editForm.recordPage" placeholder="Página" icon="i-lucide-file" />
              </UFormField>
            </div>

            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="editForm.observations" placeholder="Observaciones (opcional)" />
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
