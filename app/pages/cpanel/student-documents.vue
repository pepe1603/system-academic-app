<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { StudentDocument } from '~/composables/useStudentDocuments'

definePageMeta({ layout: 'c-panel' })
useSeoMeta({ title: 'Documentos de Estudiante - Panel de Control' })

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null
const viewMode = ref<ViewMode>(null)
const selectedDoc = ref<StudentDocument | null>(null)
const originalDocData = ref<StudentDocument | null>(null)
const showDeleted = ref(false)

const { documents, loading, error, fetchDocuments, fetchDeletedDocuments, getDocument, createDocument, updateDocument, deleteDocument } = useStudentDocuments()
const { students, fetchStudents: fetchAllStudents } = useStudents()

onMounted(() => {
  if (showDeleted.value) fetchDeletedDocuments()
  else fetchDocuments(0, 10)
  fetchAllStudents(0, 50)
})

watch(showDeleted, (v) => v ? fetchDeletedDocuments() : fetchDocuments(0, 10))

const documentTypeOptions = [
  { label: 'CURP', value: 'CURP' },
  { label: 'Acta de Nacimiento', value: 'BIRTH_CERTIFICATE' },
  { label: 'Foto', value: 'PHOTO' },
  { label: 'Certificado de Bachillerato', value: 'HIGH_SCHOOL_CERTIFICATE' },
  { label: 'Kardex de Bachillerato', value: 'HIGH_SCHOOL_KARDEX' },
  { label: 'Identificación', value: 'IDENTIFICATION' },
  { label: 'Comprobante de Domicilio', value: 'PROOF_OF_ADDRESS' },
  { label: 'Pago', value: 'PAYMENT' },
  { label: 'Otro', value: 'OTHER' }
]

const studentOptions = computed(() =>
  students.value.map(s => ({ label: `${s.enrollmentNumber} - ${s.firstName} ${s.lastName}`, value: s.id }))
)

const hasChanges = computed(() => {
  if (!originalDocData.value || viewMode.value !== 'edit') return false
  const o = originalDocData.value; const f = editForm.value
  return f.originalName !== (o.originalName||'') || f.fileName !== (o.fileName||'') ||
    f.filePath !== (o.filePath||'') || f.fileSizeBytes !== (o.fileSizeBytes??'') ||
    f.mimeType !== (o.mimeType||'') || f.documentNumber !== (o.documentNumber||'') ||
    f.issueDate !== (o.issueDate||'') || f.expirationDate !== (o.expirationDate||'') ||
    f.isVerified !== o.isVerified || f.observations !== (o.observations||'') || f.isActive !== o.isActive
})

const discardChanges = () => {
  if (originalDocData.value) {
    const o = originalDocData.value
    editForm.value = {
      originalName: o.originalName||'', fileName: o.fileName||'', filePath: o.filePath||'',
      fileSizeBytes: o.fileSizeBytes??null, mimeType: o.mimeType||'',
      documentNumber: o.documentNumber||'', issueDate: o.issueDate||'',
      expirationDate: o.expirationDate||'', isVerified: o.isVerified,
      observations: o.observations||'', isActive: o.isActive
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)
watch(pageModel, (p) => fetchDocuments(p-1, 10))

const closePanel = () => { viewMode.value = null; selectedDoc.value = null; originalDocData.value = null }
const openCreate = () => { selectedDoc.value = null; resetForm(); viewMode.value = 'create' }

const openView = async (d: StudentDocument) => { selectedDoc.value = await getDocument(d.id); viewMode.value = 'view' }

const openEdit = async (d: StudentDocument) => {
  selectedDoc.value = await getDocument(d.id)
  if (selectedDoc.value) {
    originalDocData.value = { ...selectedDoc.value }
    const e = selectedDoc.value
    editForm.value = {
      originalName: e.originalName||'', fileName: e.fileName||'', filePath: e.filePath||'',
      fileSizeBytes: e.fileSizeBytes??null, mimeType: e.mimeType||'',
      documentNumber: e.documentNumber||'', issueDate: e.issueDate||'',
      expirationDate: e.expirationDate||'', isVerified: e.isVerified,
      observations: e.observations||'', isActive: e.isActive
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '', documentType: 'CURP', originalName: '', fileName: '', filePath: '',
  fileSizeBytes: null as number|null, mimeType: '', documentNumber: '',
  issueDate: '', expirationDate: '', observations: ''
})

const editForm = ref({
  originalName: '', fileName: '', filePath: '', fileSizeBytes: null as number|null,
  mimeType: '', documentNumber: '', issueDate: '', expirationDate: '',
  isVerified: false, observations: '', isActive: true
})

const resetForm = () => {
  form.value = { studentId: '', documentType: 'CURP', originalName: '', fileName: '', filePath: '',
    fileSizeBytes: null, mimeType: '', documentNumber: '', issueDate: '', expirationDate: '', observations: '' }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId, documentType: form.value.documentType,
    originalName: form.value.originalName, fileName: form.value.fileName, filePath: form.value.filePath,
    fileSizeBytes: form.value.fileSizeBytes ?? undefined, mimeType: form.value.mimeType || undefined,
    documentNumber: form.value.documentNumber || undefined, issueDate: form.value.issueDate || undefined,
    expirationDate: form.value.expirationDate || undefined, observations: form.value.observations || undefined
  }
  const r = await createDocument(data); submitting.value = false
  if (r.success) { toast.add({ title: r.message, color: 'success' }); closePanel(); fetchDocuments(0,10) }
  else toast.add({ title: r.message, color: 'error' })
}

const handleUpdate = async () => {
  if (!selectedDoc.value) return; submitting.value = true
  const data: any = {}
  if (editForm.value.originalName) data.originalName = editForm.value.originalName
  if (editForm.value.fileName) data.fileName = editForm.value.fileName
  if (editForm.value.filePath) data.filePath = editForm.value.filePath
  if (editForm.value.fileSizeBytes !== null) data.fileSizeBytes = editForm.value.fileSizeBytes
  if (editForm.value.mimeType) data.mimeType = editForm.value.mimeType
  if (editForm.value.documentNumber) data.documentNumber = editForm.value.documentNumber
  if (editForm.value.issueDate) data.issueDate = editForm.value.issueDate
  if (editForm.value.expirationDate) data.expirationDate = editForm.value.expirationDate
  data.isVerified = editForm.value.isVerified
  if (editForm.value.observations) data.observations = editForm.value.observations
  data.isActive = editForm.value.isActive
  const r = await updateDocument(selectedDoc.value.id, data); submitting.value = false
  if (r.success) { toast.add({ title: r.message, color: 'success' }); closePanel(); fetchDocuments(0,10) }
  else toast.add({ title: r.message, color: 'error' })
}

const handleDelete = async (d: StudentDocument) => {
  const ok = await confirm({ title: 'Eliminar documento', description: `¿Eliminar "${d.originalName}" de ${d.studentName}?` })
  if (ok) {
    const r = await deleteDocument(d.id)
    if (r.success) { toast.add({ title: r.message, color: 'success' }); fetchDocuments(0,10) }
    else toast.add({ title: r.message, color: 'error' })
  }
}

const docTypeLabel = (t: string) => documentTypeOptions.find(o => o.value === t)?.label || t

const getActions = (d: StudentDocument): DropdownMenuItem[][] => {
  if (showDeleted.value) return [[{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(d) }]]
  return [
    [{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(d) },
     { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => openEdit(d) }],
    [{ label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => handleDelete(d) }]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Documentos de Estudiantes</h1>
        <p class="text-muted-foreground">{{ showDeleted ? 'Documentos eliminados' : 'Documentos activos' }}: {{ documents.length }}</p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">Nuevo Documento</UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los documentos eliminados.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando documentos" description="Por favor espera...">
      <template #icon><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" /></template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchDocuments(0,10)" />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="documents.length > 0" divide>
          <UPageCard v-for="doc in documents" :key="doc.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar :text="doc.documentType.substring(0,2)" color="primary" variant="soft" class="w-12 h-12" />
                  <div>
                    <h3 class="font-semibold text-lg">{{ doc.originalName }}</h3>
                    <p class="text-sm text-muted-foreground">{{ docTypeLabel(doc.documentType) }} · {{ doc.studentName }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="doc.isVerified" color="success" variant="soft">Verificado</UBadge>
                  <UBadge v-else color="warning" variant="soft">Pendiente</UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span><UIcon name="i-lucide-file" class="size-4 mr-1" />{{ doc.fileName }}</span>
                  <span v-if="doc.mimeType"><UIcon name="i-lucide-file-type" class="size-4 mr-1" />{{ doc.mimeType }}</span>
                  <span v-if="doc.fileSizeBytes"><UIcon name="i-lucide-hard-drive" class="size-4 mr-1" />{{ (doc.fileSizeBytes / 1024).toFixed(1) }} KB</span>
                </div>
                <UDropdownMenu :items="getActions(doc)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-file-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay documentos</h3>
          <p class="text-muted-foreground mb-4">Registra el primer documento para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nuevo Documento</UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode==='create'?'i-lucide-plus':viewMode==='view'?'i-lucide-file-text':'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">{{ viewMode==='create'?'Nuevo Documento':viewMode==='view'?`Documento: ${selectedDoc?.originalName}`:`Editar: ${selectedDoc?.originalName}` }}</span>
                <UBadge v-if="viewMode==='edit' && hasChanges" color="warning" variant="soft" class="animate-pulse"><UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />Cambios pendientes</UBadge>
                <UBadge v-else-if="viewMode==='edit' && !hasChanges" color="success" variant="soft"><UIcon name="i-lucide-check" class="size-3 mr-1" />Sin cambios</UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div v-if="viewMode==='create'" class="space-y-4">
            <UFormField label="Estudiante" name="studentId" required>
              <USelect v-model="form.studentId" :items="studentOptions" placeholder="Seleccionar estudiante" icon="i-lucide-user-round" />
            </UFormField>
            <UFormField label="Tipo de documento" name="documentType" required>
              <USelect v-model="form.documentType" :items="documentTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-type" />
            </UFormField>
            <UFormField label="Nombre original" name="originalName" required>
              <UInput v-model="form.originalName" placeholder="Nombre del archivo original" icon="i-lucide-file" />
            </UFormField>
            <UFormField label="Nombre de archivo" name="fileName" required>
              <UInput v-model="form.fileName" placeholder="archivo.pdf" icon="i-lucide-file" />
            </UFormField>
            <UFormField label="Ruta del archivo" name="filePath" required>
              <UInput v-model="form.filePath" placeholder="/documentos/archivo.pdf" icon="i-lucide-folder-open" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Tamaño (bytes)" name="fileSizeBytes">
                <UInput v-model="form.fileSizeBytes" type="number" placeholder="0" icon="i-lucide-hard-drive" />
              </UFormField>
              <UFormField label="Tipo MIME" name="mimeType">
                <UInput v-model="form.mimeType" placeholder="application/pdf" icon="i-lucide-file-type" />
              </UFormField>
            </div>
            <USeparator label="Información del documento" />
            <UFormField label="N° de documento" name="documentNumber">
              <UInput v-model="form.documentNumber" placeholder="Número de documento" icon="i-lucide-hash" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de emisión" name="issueDate">
                <UInput v-model="form.issueDate" type="date" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Fecha de vencimiento" name="expirationDate">
                <UInput v-model="form.expirationDate" type="date" icon="i-lucide-calendar-x" />
              </UFormField>
            </div>
            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="form.observations" placeholder="Observaciones (opcional)" />
            </UFormField>
          </div>

          <div v-else-if="viewMode==='view' && selectedDoc" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar :text="selectedDoc.documentType.substring(0,2)" color="primary" variant="soft" class="w-16 h-16 text-lg" />
              <div>
                <h3 class="text-xl font-bold">{{ selectedDoc.originalName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge color="neutral" variant="soft">{{ docTypeLabel(selectedDoc.documentType) }}</UBadge>
                  <UBadge :color="selectedDoc.isVerified?'success':'warning'" variant="soft">{{ selectedDoc.isVerified?'Verificado':'Pendiente' }}</UBadge>
                </div>
              </div>
            </div>
            <USeparator label="Estudiante" />
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-user-round" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Estudiante</p><p class="font-semibold">{{ selectedDoc.studentName }} ({{ selectedDoc.enrollmentNumber }})</p></div>
            </div>
            <USeparator label="Archivo" />
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-file" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Archivo</p><p class="font-semibold">{{ selectedDoc.fileName }}</p></div>
            </div>
            <div v-if="selectedDoc.filePath" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-folder-open" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Ruta</p><p class="font-semibold text-sm break-all">{{ selectedDoc.filePath }}</p></div>
            </div>
            <div v-if="selectedDoc.mimeType || selectedDoc.fileSizeBytes" class="grid grid-cols-2 gap-4">
              <div v-if="selectedDoc.mimeType" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-file-type" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Tipo MIME</p><p class="font-semibold">{{ selectedDoc.mimeType }}</p></div>
              </div>
              <div v-if="selectedDoc.fileSizeBytes" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hard-drive" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Tamaño</p><p class="font-semibold">{{ (selectedDoc.fileSizeBytes/1024).toFixed(1) }} KB</p></div>
              </div>
            </div>
            <USeparator v-if="selectedDoc.documentNumber||selectedDoc.issueDate||selectedDoc.expirationDate" label="Detalles" />
            <div v-if="selectedDoc.documentNumber" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">N° Documento</p><p class="font-semibold">{{ selectedDoc.documentNumber }}</p></div>
            </div>
            <div v-if="selectedDoc.issueDate||selectedDoc.expirationDate" class="grid grid-cols-2 gap-4">
              <div v-if="selectedDoc.issueDate" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Emisión</p><p class="font-semibold">{{ selectedDoc.issueDate }}</p></div>
              </div>
              <div v-if="selectedDoc.expirationDate" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-x" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">Vencimiento</p><p class="font-semibold">{{ selectedDoc.expirationDate }}</p></div>
              </div>
            </div>
            <div v-if="selectedDoc.observations" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Observaciones</p><p class="text-sm">{{ selectedDoc.observations }}</p>
            </div>
          </div>

          <div v-else-if="viewMode==='edit' && selectedDoc" class="space-y-4">
            <UFormField label="Nombre original" name="originalName">
              <UInput v-model="editForm.originalName" icon="i-lucide-file" />
            </UFormField>
            <UFormField label="Nombre de archivo" name="fileName">
              <UInput v-model="editForm.fileName" icon="i-lucide-file" />
            </UFormField>
            <UFormField label="Ruta del archivo" name="filePath">
              <UInput v-model="editForm.filePath" icon="i-lucide-folder-open" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Tamaño (bytes)" name="fileSizeBytes">
                <UInput v-model="editForm.fileSizeBytes" type="number" icon="i-lucide-hard-drive" />
              </UFormField>
              <UFormField label="Tipo MIME" name="mimeType">
                <UInput v-model="editForm.mimeType" icon="i-lucide-file-type" />
              </UFormField>
            </div>
            <UFormField label="N° de documento" name="documentNumber">
              <UInput v-model="editForm.documentNumber" icon="i-lucide-hash" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de emisión" name="issueDate">
                <UInput v-model="editForm.issueDate" type="date" icon="i-lucide-calendar" />
              </UFormField>
              <UFormField label="Fecha de vencimiento" name="expirationDate">
                <UInput v-model="editForm.expirationDate" type="date" icon="i-lucide-calendar-x" />
              </UFormField>
            </div>
            <div class="flex gap-4">
              <UFormField label="Verificado" name="isVerified">
                <UCheckbox v-model="editForm.isVerified" label="Documento verificado" />
              </UFormField>
              <UFormField label="Activo" name="isActive">
                <UCheckbox v-model="editForm.isActive" label="Documento activo" />
              </UFormField>
            </div>
            <UFormField label="Observaciones" name="observations">
              <UTextarea v-model="editForm.observations" placeholder="Observaciones" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closePanel">Cerrar</UButton>
              <UButton v-if="viewMode==='create'" @click="handleCreate" :loading="submitting" icon="i-lucide-save">Crear</UButton>
              <template v-if="viewMode==='edit'">
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
