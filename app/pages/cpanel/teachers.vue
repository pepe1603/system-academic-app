<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Teacher } from '~/composables/useTeachers'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Docentes - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()
const {
  records, loading, error,
  fetchRecords, fetchDeletedRecords, getRecord,
  createRecord, updateRecord, deleteRecord
} = useTeachers()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedRecord = ref<Teacher | null>(null)
const originalRecordData = ref<Teacher | null>(null)
const showDeleted = ref(false)

const pageModel = ref(1)
const searchQuery = ref('')

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const q = searchQuery.value.toLowerCase()
  return records.value.filter(r =>
    r.firstName.toLowerCase().includes(q) ||
    r.lastName.toLowerCase().includes(q) ||
    (r.employeeNumber && r.employeeNumber.toLowerCase().includes(q)) ||
    (r.curp && r.curp.toLowerCase().includes(q)) ||
    (r.institutionalEmail && r.institutionalEmail.toLowerCase().includes(q))
  )
})

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedRecords()
  } else {
    fetchRecords(0, 10)
  }
})

watch(showDeleted, (isDeleted) => {
  searchQuery.value = ''
  if (isDeleted) {
    fetchDeletedRecords()
  } else {
    fetchRecords(0, 10)
  }
})

watch(pageModel, (newPage) => {
  if (!showDeleted.value) {
    fetchRecords(newPage - 1, 10)
  }
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

const openView = async (record: Teacher) => {
  if (showDeleted.value) {
    selectedRecord.value = { ...record }
  } else {
    selectedRecord.value = await getRecord(record.id)
  }
  viewMode.value = 'view'
}

const openEdit = async (record: Teacher) => {
  selectedRecord.value = await getRecord(record.id)
  if (selectedRecord.value) {
    originalRecordData.value = { ...selectedRecord.value }
    const r = selectedRecord.value
    editForm.value = {
      firstName: r.firstName || '',
      lastName: r.lastName || '',
      employeeNumber: r.employeeNumber || '',
      rfc: r.rfc || '',
      curp: r.curp || '',
      institutionalEmail: r.institutionalEmail || '',
      secondaryEmail: r.secondaryEmail || '',
      phone: r.phone || '',
      secondaryPhone: r.secondaryPhone || ''
    }
  }
  viewMode.value = 'edit'
}

const hasChanges = computed(() => {
  if (!originalRecordData.value || viewMode.value !== 'edit') return false

  const orig = originalRecordData.value
  const f = editForm.value

  return (
    f.firstName !== orig.firstName ||
    f.lastName !== orig.lastName ||
    f.employeeNumber !== (orig.employeeNumber || '') ||
    f.rfc !== (orig.rfc || '') ||
    f.curp !== (orig.curp || '') ||
    f.institutionalEmail !== (orig.institutionalEmail || '') ||
    f.secondaryEmail !== (orig.secondaryEmail || '') ||
    f.phone !== (orig.phone || '') ||
    f.secondaryPhone !== (orig.secondaryPhone || '')
  )
})

const discardChanges = () => {
  if (originalRecordData.value) {
    const orig = originalRecordData.value
    editForm.value = {
      firstName: orig.firstName,
      lastName: orig.lastName,
      employeeNumber: orig.employeeNumber || '',
      rfc: orig.rfc || '',
      curp: orig.curp || '',
      institutionalEmail: orig.institutionalEmail || '',
      secondaryEmail: orig.secondaryEmail || '',
      phone: orig.phone || '',
      secondaryPhone: orig.secondaryPhone || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const form = ref({
  firstName: '',
  lastName: '',
  employeeNumber: '',
  rfc: '',
  curp: '',
  institutionalEmail: '',
  secondaryEmail: '',
  phone: '',
  secondaryPhone: ''
})

const editForm = ref({
  firstName: '',
  lastName: '',
  employeeNumber: '',
  rfc: '',
  curp: '',
  institutionalEmail: '',
  secondaryEmail: '',
  phone: '',
  secondaryPhone: ''
})

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    employeeNumber: '',
    rfc: '',
    curp: '',
    institutionalEmail: '',
    secondaryEmail: '',
    phone: '',
    secondaryPhone: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    firstName: form.value.firstName,
    lastName: form.value.lastName
  }
  if (form.value.employeeNumber) data.employeeNumber = form.value.employeeNumber
  if (form.value.rfc) data.rfc = form.value.rfc
  if (form.value.curp) data.curp = form.value.curp
  if (form.value.institutionalEmail) data.institutionalEmail = form.value.institutionalEmail
  if (form.value.secondaryEmail) data.secondaryEmail = form.value.secondaryEmail
  if (form.value.phone) data.phone = form.value.phone
  if (form.value.secondaryPhone) data.secondaryPhone = form.value.secondaryPhone

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
  if (editForm.value.firstName) data.firstName = editForm.value.firstName
  if (editForm.value.lastName) data.lastName = editForm.value.lastName
  if (editForm.value.employeeNumber) data.employeeNumber = editForm.value.employeeNumber
  if (editForm.value.rfc) data.rfc = editForm.value.rfc
  if (editForm.value.curp) data.curp = editForm.value.curp
  if (editForm.value.institutionalEmail) data.institutionalEmail = editForm.value.institutionalEmail
  if (editForm.value.secondaryEmail) data.secondaryEmail = editForm.value.secondaryEmail
  if (editForm.value.phone) data.phone = editForm.value.phone
  if (editForm.value.secondaryPhone) data.secondaryPhone = editForm.value.secondaryPhone

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

const handleDelete = async (record: Teacher) => {
  const confirmed = await confirm({
    title: 'Eliminar docente',
    description: `¿Estás seguro de eliminar a "${record.firstName} ${record.lastName}"?`
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

const getActions = (record: Teacher): DropdownMenuItem[][] => {
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
        <h1 class="text-3xl font-bold">Docentes</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Docentes eliminados' : 'Docentes registrados' }}: {{ records.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Agregar Docente
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los docentes eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando docentes" description="Por favor espera...">
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
        <div class="flex items-center justify-between mb-4">
          <UInput v-model="searchQuery" placeholder="Buscar por nombre, empleado, CURP o email..." icon="i-lucide-search" class="w-80" />
          <span class="text-sm text-muted-foreground">{{ filteredRecords.length }} de {{ records.length }}</span>
        </div>
        <UPageList v-if="filteredRecords.length > 0" divide>
          <UPageCard v-for="record in filteredRecords" :key="record.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${record.firstName.charAt(0)}${record.lastName.charAt(0)}`"
                    color="primary" variant="soft" class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ record.firstName }} {{ record.lastName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ record.employeeNumber || 'Sin número de empleado' }}
                      <span v-if="record.institutionalEmail"> · {{ record.institutionalEmail }}</span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="record.rfc" color="neutral" variant="soft" size="sm">{{ record.rfc }}</UBadge>
                  <UBadge :color="record.isActive ? 'success' : 'neutral'" variant="soft" size="sm">
                    {{ record.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span v-if="record.curp"><UIcon name="i-lucide-id-card" class="size-4 mr-1" />{{ record.curp }}</span>
                  <span v-if="record.phone"><UIcon name="i-lucide-phone" class="size-4 mr-1" />{{ record.phone }}</span>
                  <span v-if="record.createdAt"><UIcon name="i-lucide-calendar" class="size-4 mr-1" />{{ record.createdAt }}</span>
                </div>
                <UDropdownMenu :items="getActions(record)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-graduation-cap" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">{{ searchQuery ? 'Sin resultados de búsqueda' : (showDeleted ? 'No hay docentes eliminados' : 'No hay docentes registrados') }}</h3>
          <p class="text-muted-foreground mb-4">{{ searchQuery ? 'Intenta con otros términos de búsqueda' : (showDeleted ? 'No hay registros en la papelera' : 'Agrega el primer docente para comenzar') }}</p>
          <UButton v-if="!showDeleted && !searchQuery" @click="openCreate" icon="i-lucide-plus">Agregar Docente</UButton>
          <UButton v-else-if="searchQuery" variant="outline" @click="searchQuery = ''" icon="i-lucide-x">Limpiar búsqueda</UButton>
        </div>

        <div v-if="records.length > 0 && !showDeleted" class="flex items-center justify-between mt-6 pt-4 border-t">
          <UButton size="sm" variant="outline" :disabled="pageModel <= 1" @click="pageModel--" icon="i-lucide-chevron-left">
            Anterior
          </UButton>
          <span class="text-sm text-muted-foreground">Página {{ pageModel }}</span>
          <UButton size="sm" variant="outline" :disabled="records.length < 10" @click="pageModel++" trailing-icon="i-lucide-chevron-right">
            Siguiente
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg" :class="viewMode === 'edit' ? 'max-w-2xl' : 'max-w-lg'">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-graduation-cap' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Docente' : viewMode === 'view' ? `Docente: ${selectedRecord?.firstName} ${selectedRecord?.lastName}` : `Editar: ${selectedRecord?.firstName} ${selectedRecord?.lastName}` }}
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
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Nombre(s)" name="firstName" required>
                  <UInput v-model="form.firstName" placeholder="Nombre" icon="i-lucide-user" />
                </UFormField>
                <UFormField label="Apellidos" name="lastName" required>
                  <UInput v-model="form.lastName" placeholder="Apellidos" icon="i-lucide-user" />
                </UFormField>
              </div>
              <UFormField label="Número de empleado" name="employeeNumber">
                <UInput v-model="form.employeeNumber" placeholder="Ej: DOC-001" icon="i-lucide-hash" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="RFC" name="rfc">
                  <UInput v-model="form.rfc" placeholder="RFC" icon="i-lucide-file-text" />
                </UFormField>
                <UFormField label="CURP" name="curp">
                  <UInput v-model="form.curp" placeholder="CURP" icon="i-lucide-id-card" />
                </UFormField>
              </div>
              <UFormField label="Email institucional" name="institutionalEmail">
                <UInput v-model="form.institutionalEmail" type="email" placeholder="correo@institucion.edu" icon="i-lucide-mail" />
              </UFormField>
              <UFormField label="Email secundario" name="secondaryEmail">
                <UInput v-model="form.secondaryEmail" type="email" placeholder="correo@personal.com" icon="i-lucide-mail" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Teléfono" name="phone">
                  <UInput v-model="form.phone" placeholder="Teléfono" icon="i-lucide-phone" />
                </UFormField>
                <UFormField label="Teléfono secundario" name="secondaryPhone">
                  <UInput v-model="form.secondaryPhone" placeholder="Tel. secundario" icon="i-lucide-phone" />
                </UFormField>
              </div>
            </div>

            <div v-else-if="viewMode === 'view' && selectedRecord">
              <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <UAvatar
                  :text="`${selectedRecord.firstName.charAt(0)}${selectedRecord.lastName.charAt(0)}`"
                  color="primary" variant="soft" class="w-16 h-16 text-lg" />
                <div>
                  <h3 class="text-xl font-bold">{{ selectedRecord.firstName }} {{ selectedRecord.lastName }}</h3>
                  <p class="text-sm text-muted-foreground">{{ selectedRecord.employeeNumber || 'Sin número de empleado' }}</p>
                </div>
              </div>

              <USeparator />

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">No. Empleado</p><p class="font-semibold">{{ selectedRecord.employeeNumber || '—' }}</p></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-file-text" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">RFC</p><p class="font-semibold">{{ selectedRecord.rfc || '—' }}</p></div>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-id-card" class="size-5 text-muted-foreground" />
                <div><p class="text-xs text-muted-foreground uppercase">CURP</p><p class="font-semibold">{{ selectedRecord.curp || '—' }}</p></div>
              </div>

              <USeparator />

              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-mail" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Email</p><p class="font-semibold">{{ selectedRecord.institutionalEmail || '—' }}</p></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UIcon name="i-lucide-phone" class="size-5 text-muted-foreground" />
                  <div><p class="text-xs text-muted-foreground uppercase">Teléfono</p><p class="font-semibold">{{ selectedRecord.phone || '—' }}</p></div>
                </div>
              </div>
            </div>

            <div v-else-if="viewMode === 'edit' && selectedRecord" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Nombre(s)" name="firstName">
                  <UInput v-model="editForm.firstName" placeholder="Nombre" icon="i-lucide-user" />
                </UFormField>
                <UFormField label="Apellidos" name="lastName">
                  <UInput v-model="editForm.lastName" placeholder="Apellidos" icon="i-lucide-user" />
                </UFormField>
              </div>
              <UFormField label="Número de empleado" name="employeeNumber">
                <UInput v-model="editForm.employeeNumber" placeholder="Ej: DOC-001" icon="i-lucide-hash" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="RFC" name="rfc">
                  <UInput v-model="editForm.rfc" placeholder="RFC" icon="i-lucide-file-text" />
                </UFormField>
                <UFormField label="CURP" name="curp">
                  <UInput v-model="editForm.curp" placeholder="CURP" icon="i-lucide-id-card" />
                </UFormField>
              </div>
              <UFormField label="Email institucional" name="institutionalEmail">
                <UInput v-model="editForm.institutionalEmail" type="email" placeholder="correo@institucion.edu" icon="i-lucide-mail" />
              </UFormField>
              <UFormField label="Email secundario" name="secondaryEmail">
                <UInput v-model="editForm.secondaryEmail" type="email" placeholder="correo@personal.com" icon="i-lucide-mail" />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Teléfono" name="phone">
                  <UInput v-model="editForm.phone" placeholder="Teléfono" icon="i-lucide-phone" />
                </UFormField>
                <UFormField label="Teléfono secundario" name="secondaryPhone">
                  <UInput v-model="editForm.secondaryPhone" placeholder="Tel. secundario" icon="i-lucide-phone" />
                </UFormField>
              </div>
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
