<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Guardian } from '~/composables/useGuardians'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Tutores - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedGuardian = ref<Guardian | null>(null)
const originalGuardianData = ref<Guardian | null>(null)
const showDeleted = ref(false)

const { guardians, loading, error, fetchGuardians, fetchDeletedGuardians, getGuardian, createGuardian, updateGuardian, deleteGuardian } = useGuardians()
const { students, fetchStudents: fetchAllStudents } = useStudents()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedGuardians()
  } else {
    fetchGuardians(0, 10)
  }
  fetchAllStudents(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedGuardians()
  } else {
    fetchGuardians(0, 10)
  }
})

const relationshipOptions = [
  { label: 'Padre', value: 'FATHER' },
  { label: 'Madre', value: 'MOTHER' },
  { label: 'Tutor', value: 'GUARDIAN' },
  { label: 'Hermano(a)', value: 'SIBLING' },
  { label: 'Otro', value: 'OTHER' }
]

const studentOptions = computed(() =>
  students.value.map(s => ({ label: `${s.enrollmentNumber} - ${s.firstName} ${s.lastName}`, value: s.id }))
)

const hasChanges = computed(() => {
  if (!originalGuardianData.value || viewMode.value !== 'edit') return false

  const orig = originalGuardianData.value
  const f = editForm.value

  return (
    f.fullName !== (orig.fullName || '') ||
    f.relationship !== (orig.relationship || '') ||
    f.curp !== (orig.curp || '') ||
    f.primaryPhone !== (orig.primaryPhone || '') ||
    f.secondaryPhone !== (orig.secondaryPhone || '') ||
    f.email !== (orig.email || '') ||
    f.occupation !== (orig.occupation || '') ||
    f.company !== (orig.company || '') ||
    f.address !== (orig.address || '') ||
    f.isEmergencyContact !== orig.isEmergencyContact ||
    f.isActive !== orig.isActive
  )
})

const discardChanges = () => {
  if (originalGuardianData.value) {
    const orig = originalGuardianData.value
    editForm.value = {
      fullName: orig.fullName || '',
      relationship: orig.relationship || 'GUARDIAN',
      curp: orig.curp || '',
      primaryPhone: orig.primaryPhone || '',
      secondaryPhone: orig.secondaryPhone || '',
      email: orig.email || '',
      occupation: orig.occupation || '',
      company: orig.company || '',
      address: orig.address || '',
      isEmergencyContact: orig.isEmergencyContact,
      isActive: orig.isActive
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchGuardians(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedGuardian.value = null
  originalGuardianData.value = null
}

const openCreate = () => {
  selectedGuardian.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (guardian: Guardian) => {
  selectedGuardian.value = await getGuardian(guardian.id)
  viewMode.value = 'view'
}

const openEdit = async (guardian: Guardian) => {
  selectedGuardian.value = await getGuardian(guardian.id)
  if (selectedGuardian.value) {
    originalGuardianData.value = { ...selectedGuardian.value }
    const e = selectedGuardian.value
    editForm.value = {
      fullName: e.fullName || '',
      relationship: e.relationship || 'GUARDIAN',
      curp: e.curp || '',
      primaryPhone: e.primaryPhone || '',
      secondaryPhone: e.secondaryPhone || '',
      email: e.email || '',
      occupation: e.occupation || '',
      company: e.company || '',
      address: e.address || '',
      isEmergencyContact: e.isEmergencyContact,
      isActive: e.isActive
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  studentId: '',
  fullName: '',
  relationship: 'GUARDIAN',
  curp: '',
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  occupation: '',
  company: '',
  address: '',
  isEmergencyContact: true
})

const editForm = ref({
  fullName: '',
  relationship: 'GUARDIAN',
  curp: '',
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  occupation: '',
  company: '',
  address: '',
  isEmergencyContact: true,
  isActive: true
})

const resetForm = () => {
  form.value = {
    studentId: '',
    fullName: '',
    relationship: 'GUARDIAN',
    curp: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    occupation: '',
    company: '',
    address: '',
    isEmergencyContact: true
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    studentId: form.value.studentId,
    fullName: form.value.fullName,
    relationship: form.value.relationship,
    curp: form.value.curp || undefined,
    primaryPhone: form.value.primaryPhone || undefined,
    secondaryPhone: form.value.secondaryPhone || undefined,
    email: form.value.email || undefined,
    occupation: form.value.occupation || undefined,
    company: form.value.company || undefined,
    address: form.value.address || undefined,
    isEmergencyContact: form.value.isEmergencyContact
  }
  const result = await createGuardian(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGuardians(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedGuardian.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.fullName) data.fullName = editForm.value.fullName
  if (editForm.value.relationship) data.relationship = editForm.value.relationship
  if (editForm.value.curp) data.curp = editForm.value.curp
  if (editForm.value.primaryPhone) data.primaryPhone = editForm.value.primaryPhone
  if (editForm.value.secondaryPhone) data.secondaryPhone = editForm.value.secondaryPhone
  if (editForm.value.email) data.email = editForm.value.email
  if (editForm.value.occupation) data.occupation = editForm.value.occupation
  if (editForm.value.company) data.company = editForm.value.company
  if (editForm.value.address) data.address = editForm.value.address
  data.isEmergencyContact = editForm.value.isEmergencyContact
  data.isActive = editForm.value.isActive

  const result = await updateGuardian(selectedGuardian.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGuardians(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (guardian: Guardian) => {
  const confirmed = await confirm({
    title: 'Eliminar tutor',
    description: `¿Estás seguro de eliminar al tutor "${guardian.fullName}" del estudiante "${guardian.studentName}"?`
  })
  if (confirmed) {
    const result = await deleteGuardian(guardian.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchGuardians(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const relationshipLabel = (rel: string) => {
  switch (rel) {
    case 'FATHER': return 'Padre'
    case 'MOTHER': return 'Madre'
    case 'GUARDIAN': return 'Tutor'
    case 'SIBLING': return 'Hermano(a)'
    case 'OTHER': return 'Otro'
    default: return rel
  }
}

const getActions = (guardian: Guardian): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(guardian)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(guardian)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(guardian)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(guardian)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Tutores</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Tutores eliminados' : 'Tutores activos' }}: {{ guardians.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Tutor
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los tutores eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando tutores"
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
          @click="fetchGuardians(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="guardians.length > 0" divide>
          <UPageCard v-for="guardian in guardians" :key="guardian.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${guardian.fullName.charAt(0)}${guardian.fullName.split(' ').pop()?.charAt(0) || ''}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ guardian.fullName }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ relationshipLabel(guardian.relationship) }} · {{ guardian.studentName }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge color="neutral" variant="soft">
                    {{ guardian.enrollmentNumber }}
                  </UBadge>
                  <UBadge v-if="guardian.isEmergencyContact" color="warning" variant="soft">
                    Emergencia
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span v-if="guardian.primaryPhone">
                    <UIcon name="i-lucide-phone" class="size-4 mr-1" />
                    {{ guardian.primaryPhone }}
                  </span>
                  <span v-if="guardian.email">
                    <UIcon name="i-lucide-mail" class="size-4 mr-1" />
                    {{ guardian.email }}
                  </span>
                  <span v-if="guardian.occupation">
                    <UIcon name="i-lucide-briefcase" class="size-4 mr-1" />
                    {{ guardian.occupation }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(guardian)">
                  <UButton size="sm" variant="ghost">
                    <UIcon name="i-lucide-more-horizontal" class="size-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-user-round-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay tutores</h3>
          <p class="text-muted-foreground mb-4">Registra el primer tutor para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Tutor
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
                  {{ viewMode === 'create' ? 'Nuevo Tutor' : viewMode === 'view' ? `Tutor: ${selectedGuardian?.fullName}` : `Editar: ${selectedGuardian?.fullName}` }}
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

            <UFormField label="Nombre completo" name="fullName" required>
              <UInput v-model="form.fullName" placeholder="Nombre completo del tutor" icon="i-lucide-user" />
            </UFormField>

            <UFormField label="Parentesco" name="relationship" required>
              <USelect v-model="form.relationship" :items="relationshipOptions" placeholder="Seleccionar parentesco" icon="i-lucide-users" />
            </UFormField>

            <USeparator label="Información de contacto" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Teléfono principal" name="primaryPhone">
                <UInput v-model="form.primaryPhone" placeholder="Teléfono" icon="i-lucide-phone" />
              </UFormField>

              <UFormField label="Teléfono secundario" name="secondaryPhone">
                <UInput v-model="form.secondaryPhone" placeholder="Teléfono secundario" icon="i-lucide-phone" />
              </UFormField>
            </div>

            <UFormField label="Correo electrónico" name="email">
              <UInput v-model="form.email" type="email" placeholder="correo@ejemplo.com" icon="i-lucide-mail" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="CURP" name="curp">
              <UInput v-model="form.curp" placeholder="CURP" icon="i-lucide-id-card" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Ocupación" name="occupation">
                <UInput v-model="form.occupation" placeholder="Ocupación" icon="i-lucide-briefcase" />
              </UFormField>

              <UFormField label="Empresa" name="company">
                <UInput v-model="form.company" placeholder="Empresa" icon="i-lucide-building-2" />
              </UFormField>
            </div>

            <UFormField label="Dirección" name="address">
              <UTextarea v-model="form.address" placeholder="Dirección (opcional)" />
            </UFormField>

            <UFormField label="Contacto de emergencia" name="isEmergencyContact">
              <UCheckbox v-model="form.isEmergencyContact" label="Marcar como contacto de emergencia" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedGuardian" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedGuardian.fullName.charAt(0)}${selectedGuardian.fullName.split(' ').pop()?.charAt(0) || ''}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ selectedGuardian.fullName }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge color="neutral" variant="soft">
                    {{ relationshipLabel(selectedGuardian.relationship) }}
                  </UBadge>
                  <UBadge :color="selectedGuardian.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ selectedGuardian.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                  <UBadge v-if="selectedGuardian.isEmergencyContact" color="warning" variant="soft">
                    Emergencia
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator label="Estudiante" />

            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-user-round" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Estudiante</p>
                <p class="font-semibold">{{ selectedGuardian.studentName }} ({{ selectedGuardian.enrollmentNumber }})</p>
              </div>
            </div>

            <USeparator label="Contacto" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-phone" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Tel. principal</p>
                  <p class="font-semibold">{{ selectedGuardian.primaryPhone || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-phone" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Tel. secundario</p>
                  <p class="font-semibold">{{ selectedGuardian.secondaryPhone || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-mail" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Correo</p>
                <p class="font-semibold">{{ selectedGuardian.email || 'N/A' }}</p>
              </div>
            </div>

            <USeparator label="Datos personales" />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-id-card" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">CURP</p>
                  <p class="font-semibold">{{ selectedGuardian.curp || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-briefcase" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Ocupación</p>
                  <p class="font-semibold">{{ selectedGuardian.occupation || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedGuardian.company" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-building-2" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Empresa</p>
                <p class="font-semibold">{{ selectedGuardian.company }}</p>
              </div>
            </div>

            <div v-if="selectedGuardian.address" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-xs text-muted-foreground uppercase mb-1">Dirección</p>
              <p class="text-sm">{{ selectedGuardian.address }}</p>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedGuardian" class="space-y-4">
            <UFormField label="Nombre completo" name="fullName">
              <UInput v-model="editForm.fullName" placeholder="Nombre completo del tutor" icon="i-lucide-user" />
            </UFormField>

            <UFormField label="Parentesco" name="relationship">
              <USelect v-model="editForm.relationship" :items="relationshipOptions" placeholder="Seleccionar parentesco" icon="i-lucide-users" />
            </UFormField>

            <UFormField label="CURP" name="curp">
              <UInput v-model="editForm.curp" placeholder="CURP" icon="i-lucide-id-card" />
            </UFormField>

            <USeparator label="Contacto" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Teléfono principal" name="primaryPhone">
                <UInput v-model="editForm.primaryPhone" placeholder="Teléfono" icon="i-lucide-phone" />
              </UFormField>

              <UFormField label="Teléfono secundario" name="secondaryPhone">
                <UInput v-model="editForm.secondaryPhone" placeholder="Teléfono secundario" icon="i-lucide-phone" />
              </UFormField>
            </div>

            <UFormField label="Correo electrónico" name="email">
              <UInput v-model="editForm.email" type="email" placeholder="correo@ejemplo.com" icon="i-lucide-mail" />
            </UFormField>

            <USeparator label="Información adicional" />

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Ocupación" name="occupation">
                <UInput v-model="editForm.occupation" placeholder="Ocupación" icon="i-lucide-briefcase" />
              </UFormField>

              <UFormField label="Empresa" name="company">
                <UInput v-model="editForm.company" placeholder="Empresa" icon="i-lucide-building-2" />
              </UFormField>
            </div>

            <UFormField label="Dirección" name="address">
              <UTextarea v-model="editForm.address" placeholder="Dirección (opcional)" />
            </UFormField>

            <div class="flex gap-4">
              <UFormField label="Contacto de emergencia" name="isEmergencyContact">
                <UCheckbox v-model="editForm.isEmergencyContact" label="Emergencia" />
              </UFormField>

              <UFormField label="Activo" name="isActive">
                <UCheckbox v-model="editForm.isActive" label="Tutor activo" />
              </UFormField>
            </div>
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
