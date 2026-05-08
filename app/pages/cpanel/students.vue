<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Student } from '~/composables/useStudents'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Estudiantes - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()
const { fetchMyProfile } = useProfile()

const myProfile = ref<EnrichedProfile | null>(null)
const myCurp = computed(() => myProfile.value?.curp || null)
const myStudentId = computed(() => myProfile.value?.studentInfo?.studentId || null)

onMounted(async () => {
  myProfile.value = await fetchMyProfile()
})

const isMyStudentRecord = (student: Student) => {
  if (myStudentId.value) return student.id === myStudentId.value
  if (myCurp.value) return student.curp.toUpperCase() === myCurp.value.toUpperCase()
  return false
}

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedStudent = ref<Student | null>(null)
const originalStudentData = ref<Student | null>(null)
const showDeleted = ref(false)

const { students, loading, error, fetchStudents, fetchDeletedStudents, getStudent, createStudent, updateStudent, deleteStudent } = useStudents()
const { generations, fetchGenerations: fetchAllGenerations } = useGenerations()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedStudents()
  } else {
    fetchStudents(0, 10)
  }
  fetchAllGenerations(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedStudents()
  } else {
    fetchStudents(0, 10)
  }
})

const generationOptions = computed(() =>
  generations.value.map(g => ({ label: g.name, value: g.id }))
)

const genderOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'O' }
]

const hasChanges = computed(() => {
  if (!originalStudentData.value || viewMode.value !== 'edit') return false

  const orig = originalStudentData.value
  const f = editForm.value

  return (
    f.curp !== (orig.curp || '') ||
    f.enrollmentNumber !== (orig.enrollmentNumber || '') ||
    f.firstName !== (orig.firstName || '') ||
    f.lastName !== (orig.lastName || '') ||
    f.generationId !== (orig.generationId || '') ||
    f.institutionalEmail !== (orig.institutionalEmail || '') ||
    f.phone !== (orig.phone || '') ||
    f.birthDate !== (orig.birthDate || '') ||
    f.gender !== (orig.gender || '') ||
    f.enrollmentDate !== (orig.enrollmentDate || '')
  )
})

const discardChanges = () => {
  if (originalStudentData.value) {
    const orig = originalStudentData.value
    editForm.value = {
      curp: orig.curp || '',
      enrollmentNumber: orig.enrollmentNumber || '',
      firstName: orig.firstName || '',
      lastName: orig.lastName || '',
      generationId: orig.generationId || '',
      institutionalEmail: orig.institutionalEmail || '',
      phone: orig.phone || '',
      birthDate: orig.birthDate || '',
      gender: orig.gender || '',
      enrollmentDate: orig.enrollmentDate || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchStudents(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedStudent.value = null
  originalStudentData.value = null
}

const openCreate = () => {
  selectedStudent.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (student: Student) => {
  selectedStudent.value = await getStudent(student.id)
  viewMode.value = 'view'
}

const openEdit = async (student: Student) => {
  selectedStudent.value = await getStudent(student.id)
  if (selectedStudent.value) {
    originalStudentData.value = { ...selectedStudent.value }
    const s = selectedStudent.value
    editForm.value = {
      curp: s.curp || '',
      enrollmentNumber: s.enrollmentNumber || '',
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      generationId: s.generationId || '',
      institutionalEmail: s.institutionalEmail || '',
      phone: s.phone || '',
      birthDate: s.birthDate || '',
      gender: s.gender || '',
      enrollmentDate: s.enrollmentDate || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  curp: '',
  enrollmentNumber: '',
  firstName: '',
  lastName: '',
  generationId: '',
  institutionalEmail: '',
  phone: '',
  birthDate: '',
  gender: '',
  enrollmentDate: ''
})

const editForm = ref({
  curp: '',
  enrollmentNumber: '',
  firstName: '',
  lastName: '',
  generationId: '',
  institutionalEmail: '',
  phone: '',
  birthDate: '',
  gender: '',
  enrollmentDate: ''
})

const resetForm = () => {
  form.value = {
    curp: '',
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    generationId: '',
    institutionalEmail: '',
    phone: '',
    birthDate: '',
    gender: '',
    enrollmentDate: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data = {
    curp: form.value.curp,
    enrollmentNumber: form.value.enrollmentNumber,
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    generationId: form.value.generationId,
    institutionalEmail: form.value.institutionalEmail || undefined,
    phone: form.value.phone || undefined,
    birthDate: form.value.birthDate || undefined,
    gender: form.value.gender || undefined,
    enrollmentDate: form.value.enrollmentDate || undefined
  }
  const result = await createStudent(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchStudents(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedStudent.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.curp) data.curp = editForm.value.curp
  if (editForm.value.enrollmentNumber) data.enrollmentNumber = editForm.value.enrollmentNumber
  if (editForm.value.firstName) data.firstName = editForm.value.firstName
  if (editForm.value.lastName) data.lastName = editForm.value.lastName
  if (editForm.value.generationId) data.generationId = editForm.value.generationId
  if (editForm.value.institutionalEmail) data.institutionalEmail = editForm.value.institutionalEmail
  if (editForm.value.phone) data.phone = editForm.value.phone
  if (editForm.value.birthDate) data.birthDate = editForm.value.birthDate
  if (editForm.value.gender) data.gender = editForm.value.gender
  if (editForm.value.enrollmentDate) data.enrollmentDate = editForm.value.enrollmentDate

  const result = await updateStudent(selectedStudent.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchStudents(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (student: Student) => {
  const confirmed = await confirm({
    title: 'Eliminar estudiante',
    description: `¿Estás seguro de eliminar a "${student.firstName} ${student.lastName}" (${student.enrollmentNumber})? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deleteStudent(student.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchStudents(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getFullName = (student: Student) => `${student.firstName} ${student.lastName}`

const getActions = (student: Student): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(student)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(student)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(student)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(student)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Estudiantes</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Estudiantes eliminados' : 'Estudiantes activos' }}: {{ students.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Estudiante
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los estudiantes eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando estudiantes"
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
          @click="fetchStudents(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="students.length > 0" divide>
          <UPageCard
            v-for="student in students"
            :key="student.id"
            variant="ghost"
            :class="isMyStudentRecord(student) ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''"
          >
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :text="`${student.firstName.charAt(0)}${student.lastName.charAt(0)}`"
                    color="primary"
                    variant="soft"
                    class="w-12 h-12"
                  />
                  <div>
                    <h3 class="font-semibold text-lg">{{ getFullName(student) }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ student.enrollmentNumber }} · {{ student.curp }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="isMyStudentRecord(student)" color="primary" variant="solid" size="sm">
                    <UIcon name="i-lucide-user-check" class="size-3 mr-1" />
                    Tu registro académico
                  </UBadge>
                  <UBadge v-if="student.userId" color="info" variant="soft" size="sm">
                    <UIcon name="i-lucide-link" class="size-3 mr-1" />
                    Vinculado
                  </UBadge>
                  <UBadge v-else color="neutral" variant="soft" size="sm">
                    <UIcon name="i-lucide-link-off" class="size-3 mr-1" />
                    No vinculado
                  </UBadge>
                  <UBadge :color="student.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ student.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-users" class="size-4 mr-1" />
                    {{ student.generationName }}
                  </span>
                  <span v-if="student.institutionalEmail">
                    <UIcon name="i-lucide-mail" class="size-4 mr-1" />
                    {{ student.institutionalEmail }}
                  </span>
                </div>

                <UDropdownMenu :items="getActions(student)">
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
          <h3 class="text-lg font-medium mb-2">No hay estudiantes</h3>
          <p class="text-muted-foreground mb-4">Registra tu primer estudiante para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Estudiante
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-user-round' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Estudiante' : viewMode === 'view' ? `Estudiante: ${getFullName(selectedStudent!)}` : `Editar: ${getFullName(selectedStudent!)}` }}
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
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="CURP" name="curp" required>
                <UInput v-model="form.curp" placeholder="18 caracteres" icon="i-lucide-id-card" />
              </UFormField>
              <UFormField label="Matrícula" name="enrollmentNumber" required>
                <UInput v-model="form.enrollmentNumber" placeholder="Ej: 2025-001" icon="i-lucide-hash" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nombre" name="firstName" required>
                <UInput v-model="form.firstName" placeholder="Nombre" icon="i-lucide-user" />
              </UFormField>
              <UFormField label="Apellidos" name="lastName" required>
                <UInput v-model="form.lastName" placeholder="Apellidos" icon="i-lucide-user" />
              </UFormField>
            </div>

            <UFormField label="Generación" name="generationId" required>
              <USelect v-model="form.generationId" :items="generationOptions" placeholder="Seleccionar generación" icon="i-lucide-calendar-days" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="Email institucional" name="institutionalEmail">
              <UInput v-model="form.institutionalEmail" type="email" placeholder="correo@enez.edu.mx" icon="i-lucide-mail" />
            </UFormField>

            <UFormField label="Teléfono" name="phone">
              <UInput v-model="form.phone" placeholder="9611234567" icon="i-lucide-phone" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de nacimiento" name="birthDate">
                <UInput v-model="form.birthDate" type="date" icon="i-lucide-cake" />
              </UFormField>
              <UFormField label="Género" name="gender">
                <USelect v-model="form.gender" :items="genderOptions" placeholder="Seleccionar" icon="i-lucide-user-round" />
              </UFormField>
            </div>

            <UFormField label="Fecha de inscripción" name="enrollmentDate">
              <UInput v-model="form.enrollmentDate" type="date" icon="i-lucide-calendar-plus" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedStudent" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar
                :text="`${selectedStudent.firstName.charAt(0)}${selectedStudent.lastName.charAt(0)}`"
                color="primary"
                variant="soft"
                class="w-16 h-16 text-lg"
              />
              <div>
                <h3 class="text-xl font-bold">{{ getFullName(selectedStudent) }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge v-if="isMyStudentRecord(selectedStudent)" color="primary" variant="solid" size="sm">
                    <UIcon name="i-lucide-user-check" class="size-3 mr-1" />
                    Tu registro académico
                  </UBadge>
                  <UBadge v-if="selectedStudent.userId" color="info" variant="soft" size="sm">
                    <UIcon name="i-lucide-link" class="size-3 mr-1" />
                    Vinculado
                  </UBadge>
                  <UBadge v-else color="neutral" variant="soft" size="sm">
                    <UIcon name="i-lucide-link-off" class="size-3 mr-1" />
                    No vinculado
                  </UBadge>
                  <UBadge :color="selectedStudent.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ selectedStudent.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-id-card" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">CURP</p>
                  <p class="font-semibold">{{ selectedStudent.curp }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Matrícula</p>
                  <p class="font-semibold">{{ selectedStudent.enrollmentNumber }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-days" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Generación</p>
                  <p class="font-semibold">{{ selectedStudent.generationName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-cake" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Fecha de nacimiento</p>
                  <p class="font-semibold">{{ selectedStudent.birthDate || 'No registrada' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-mail" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Email</p>
                  <p class="font-semibold">{{ selectedStudent.institutionalEmail || 'No registrado' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-phone" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Teléfono</p>
                  <p class="font-semibold">{{ selectedStudent.phone || 'No registrado' }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-user-round" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Género</p>
                  <p class="font-semibold">{{ selectedStudent.gender === 'M' ? 'Masculino' : selectedStudent.gender === 'F' ? 'Femenino' : selectedStudent.gender || 'No registrado' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar-plus" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Inscripción</p>
                  <p class="font-semibold">{{ selectedStudent.enrollmentDate || 'No registrada' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedStudent" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="CURP" name="curp">
                <UInput v-model="editForm.curp" placeholder="18 caracteres" icon="i-lucide-id-card" />
              </UFormField>
              <UFormField label="Matrícula" name="enrollmentNumber">
                <UInput v-model="editForm.enrollmentNumber" placeholder="Ej: 2025-001" icon="i-lucide-hash" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nombre" name="firstName">
                <UInput v-model="editForm.firstName" placeholder="Nombre" icon="i-lucide-user" />
              </UFormField>
              <UFormField label="Apellidos" name="lastName">
                <UInput v-model="editForm.lastName" placeholder="Apellidos" icon="i-lucide-user" />
              </UFormField>
            </div>

            <UFormField label="Generación" name="generationId">
              <USelect v-model="editForm.generationId" :items="generationOptions" placeholder="Seleccionar generación" icon="i-lucide-calendar-days" />
            </UFormField>

            <USeparator label="Información adicional" />

            <UFormField label="Email institucional" name="institutionalEmail">
              <UInput v-model="editForm.institutionalEmail" type="email" placeholder="correo@enez.edu.mx" icon="i-lucide-mail" />
            </UFormField>

            <UFormField label="Teléfono" name="phone">
              <UInput v-model="editForm.phone" placeholder="9611234567" icon="i-lucide-phone" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de nacimiento" name="birthDate">
                <UInput v-model="editForm.birthDate" type="date" icon="i-lucide-cake" />
              </UFormField>
              <UFormField label="Género" name="gender">
                <USelect v-model="editForm.gender" :items="genderOptions" placeholder="Seleccionar" icon="i-lucide-user-round" />
              </UFormField>
            </div>

            <UFormField label="Fecha de inscripción" name="enrollmentDate">
              <UInput v-model="editForm.enrollmentDate" type="date" icon="i-lucide-calendar-plus" />
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
