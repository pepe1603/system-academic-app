<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AcademicGroup } from '~/composables/useAcademicGroups'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Grupos Académicos - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedGroup = ref<AcademicGroup | null>(null)
const originalGroupData = ref<AcademicGroup | null>(null)
const showDeleted = ref(false)

const { groups, loading, error, fetchGroups, fetchDeletedGroups, getGroup, createGroup, updateGroup, deleteGroup } = useAcademicGroups()
const { semesters, fetchSemesters: fetchAcademicSemesters } = useAcademicSemesters()
const { courses, fetchCourses: fetchAllCourses } = useCourses()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedGroups()
  } else {
    fetchGroups(0, 50)
  }
  fetchAcademicSemesters(0, 50)
  fetchAllCourses(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedGroups()
  } else {
    fetchGroups(0, 50)
  }
})

const semesterOptions = computed(() =>
  semesters.value.map(s => ({ label: s.name, value: s.id }))
)

const courseOptions = computed(() =>
  courses.value.map(c => ({ label: `${c.courseCode} - ${c.name}`, value: c.id }))
)

const hasChanges = computed(() => {
  if (!originalGroupData.value || viewMode.value !== 'edit') return false

  const orig = originalGroupData.value
  const f = editForm.value

  return (
    f.name !== (orig.name || '') ||
    f.capacity !== (orig.capacity || 30) ||
    f.academicSemesterId !== (orig.academicSemesterId || '') ||
    f.courseId !== (orig.courseId || '') ||
    f.teacherId !== (orig.teacherId || '')
  )
})

const discardChanges = () => {
  if (originalGroupData.value) {
    const orig = originalGroupData.value
    editForm.value = {
      name: orig.name || '',
      capacity: orig.capacity || 30,
      academicSemesterId: orig.academicSemesterId || '',
      courseId: orig.courseId || '',
      teacherId: orig.teacherId || ''
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchGroups(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedGroup.value = null
  originalGroupData.value = null
}

const openCreate = () => {
  selectedGroup.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (group: AcademicGroup) => {
  selectedGroup.value = await getGroup(group.id)
  viewMode.value = 'view'
}

const openEdit = async (group: AcademicGroup) => {
  selectedGroup.value = await getGroup(group.id)
  if (selectedGroup.value) {
    originalGroupData.value = { ...selectedGroup.value }
    const g = selectedGroup.value
    editForm.value = {
      name: g.name || '',
      capacity: g.capacity || 30,
      academicSemesterId: g.academicSemesterId || '',
      courseId: g.courseId || '',
      teacherId: g.teacherId || ''
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  name: '',
  capacity: 30,
  academicSemesterId: '',
  courseId: '',
  teacherId: ''
})

const editForm = ref({
  name: '',
  capacity: 30,
  academicSemesterId: '',
  courseId: '',
  teacherId: ''
})

const resetForm = () => {
  form.value = {
    name: '',
    capacity: 30,
    academicSemesterId: '',
    courseId: '',
    teacherId: ''
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data = {
    name: form.value.name,
    academicSemesterId: form.value.academicSemesterId,
    courseId: form.value.courseId,
    teacherId: form.value.teacherId || undefined,
    capacity: form.value.capacity
  }
  const result = await createGroup(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGroups(0, 50)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedGroup.value) return

  submitting.value = true
  const data: any = {}
  if (editForm.value.name) data.name = editForm.value.name
  if (editForm.value.capacity) data.capacity = editForm.value.capacity
  if (editForm.value.academicSemesterId) data.academicSemesterId = editForm.value.academicSemesterId
  if (editForm.value.courseId) data.courseId = editForm.value.courseId
  if (editForm.value.teacherId) data.teacherId = editForm.value.teacherId

  const result = await updateGroup(selectedGroup.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchGroups(0, 50)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (group: AcademicGroup) => {
  const confirmed = await confirm({
    title: 'Eliminar grupo',
    description: `¿Estás seguro de eliminar el grupo "${group.name}" (${group.courseCode})? Esta acción no se puede deshacer.`
  })
  if (confirmed) {
    const result = await deleteGroup(group.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchGroups(0, 50)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getActions = (group: AcademicGroup): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [
      [
        {
          label: 'Ver detalles',
          icon: 'i-lucide-eye',
          onSelect: () => openView(group)
        }
      ]
    ]
  }

  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(group)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(group)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(group)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Grupos Académicos</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Grupos eliminados' : 'Grupos activos' }}: {{ groups.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Grupo
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los grupos eliminados. No se pueden editar ni restaurar desde aquí.</template>
    </UAlert>

    <UAlert
      v-if="loading"
      color="info"
      variant="soft"
      class="mb-4"
      title="Cargando grupos"
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
          @click="fetchGroups(0, 10)"
        />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="groups.length > 0" divide>
          <UPageCard v-for="group in groups" :key="group.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UIcon name="i-lucide-users" class="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">Grupo {{ group.name }}</h3>
                    <p class="text-sm text-muted-foreground">
                      {{ group.courseCode }} - {{ group.courseName }}
                      <span class="ml-2">· {{ group.academicSemesterName }}</span>
                    </p>
                  </div>
                </div>
                <UBadge :color="group.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ group.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </div>
            </template>

            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <UIcon name="i-lucide-user-round" class="size-4 mr-1" />
                    Capacidad: {{ group.capacity }}
                  </span>
                  <span v-if="group.teacherFullName">
                    <UIcon name="i-lucide-graduation-cap" class="size-4 mr-1" />
                    {{ group.teacherFullName }}
                  </span>
                  <span v-else>
                    <UIcon name="i-lucide-graduation-cap" class="size-4 mr-1" />
                    Sin docente asignado
                  </span>
                </div>

                <UDropdownMenu :items="getActions(group)">
                  <UButton size="sm" variant="ghost">
                    <UIcon name="i-lucide-more-horizontal" class="size-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-users-x" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay grupos académicos</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer grupo para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">
            Nuevo Grupo
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
                  :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-users' : 'i-lucide-pencil'"
                  class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Nuevo Grupo' : viewMode === 'view' ? `Grupo ${selectedGroup?.name}` : `Editar: Grupo ${selectedGroup?.name}` }}
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
            <UFormField label="Nombre del grupo" name="name" required>
              <UInput v-model="form.name" placeholder="Ej: A, B, C" icon="i-lucide-tag" />
            </UFormField>

            <UFormField label="Semestre académico" name="academicSemesterId" required>
              <USelect v-model="form.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar" />
            </UFormField>

            <UFormField label="Curso" name="courseId" required>
              <USelect v-model="form.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Capacidad" name="capacity">
              <UInput v-model.number="form.capacity" type="number" placeholder="30" icon="i-lucide-user-round" min="1" />
            </UFormField>

            <UFormField label="Docente (UUID)" name="teacherId">
              <UInput v-model="form.teacherId" placeholder="UUID del docente (opcional)" icon="i-lucide-graduation-cap" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedGroup" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="i-lucide-users" class="size-8 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-bold">Grupo {{ selectedGroup.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="selectedGroup.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ selectedGroup.isActive ? 'Activo' : 'Inactivo' }}
                  </UBadge>
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Curso</p>
                  <p class="font-semibold">{{ selectedGroup.courseCode }} - {{ selectedGroup.courseName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Semestre</p>
                  <p class="font-semibold">{{ selectedGroup.academicSemesterName }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-user-round" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Capacidad</p>
                  <p class="font-semibold">{{ selectedGroup.capacity }} estudiantes</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UIcon name="i-lucide-graduation-cap" class="size-5 text-muted-foreground" />
                <div>
                  <p class="text-xs text-muted-foreground uppercase">Docente</p>
                  <p class="font-semibold">{{ selectedGroup.teacherFullName || 'No asignado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedGroup" class="space-y-4">
            <UFormField label="Nombre del grupo" name="name">
              <UInput v-model="editForm.name" placeholder="Ej: A, B, C" icon="i-lucide-tag" />
            </UFormField>

            <UFormField label="Semestre académico" name="academicSemesterId">
              <USelect v-model="editForm.academicSemesterId" :items="semesterOptions" placeholder="Seleccionar semestre" icon="i-lucide-calendar" />
            </UFormField>

            <UFormField label="Curso" name="courseId">
              <USelect v-model="editForm.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>

            <UFormField label="Capacidad" name="capacity">
              <UInput v-model.number="editForm.capacity" type="number" placeholder="30" icon="i-lucide-user-round" min="1" />
            </UFormField>

            <UFormField label="Docente (UUID)" name="teacherId">
              <UInput v-model="editForm.teacherId" placeholder="UUID del docente (opcional)" icon="i-lucide-graduation-cap" />
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
