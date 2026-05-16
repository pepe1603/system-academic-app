<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { EducationalResource } from '~/composables/useEducationalResources'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Recursos Educativos - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()
const { user } = useAuth()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedResource = ref<EducationalResource | null>(null)
const originalResourceData = ref<EducationalResource | null>(null)
const showDeleted = ref(false)

const { resources, loading, error, fetchResources, fetchDeletedResources, getResource, createResource, updateResource, deleteResource } = useEducationalResources()
const { courses, fetchCourses: fetchAllCourses } = useCourses()

onMounted(() => {
  if (showDeleted.value) {
    fetchDeletedResources()
  } else {
    fetchResources(0, 10)
  }
  fetchAllCourses(0, 50)
})

watch(showDeleted, (isDeleted) => {
  if (isDeleted) {
    fetchDeletedResources()
  } else {
    fetchResources(0, 10)
  }
})

const resourceTypeOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Enlace', value: 'LINK' },
  { label: 'Documento', value: 'DOCUMENT' },
  { label: 'Presentación', value: 'PRESENTATION' }
]

const courseOptions = computed(() =>
  courses.value.map(c => ({ label: `${c.courseCode || ''} - ${c.name}`, value: c.id }))
)

const hasChanges = computed(() => {
  if (!originalResourceData.value || viewMode.value !== 'edit') return false
  const orig = originalResourceData.value
  const f = editForm.value
  return (
    f.title !== (orig.title || '') ||
    f.resourceType !== (orig.resourceType || 'PDF') ||
    f.resourceUrl !== (orig.resourceUrl || '') ||
    f.courseId !== (orig.courseId || '') ||
    f.isPublished !== orig.isPublished
  )
})

const discardChanges = () => {
  if (originalResourceData.value) {
    const orig = originalResourceData.value
    editForm.value = {
      title: orig.title || '',
      resourceType: orig.resourceType || 'PDF',
      resourceUrl: orig.resourceUrl || '',
      courseId: orig.courseId || '',
      isPublished: orig.isPublished
    }
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

const pageModel = ref(1)

watch(pageModel, (newPage) => {
  fetchResources(newPage - 1, 10)
})

const closePanel = () => {
  viewMode.value = null
  selectedResource.value = null
  originalResourceData.value = null
}

const openCreate = () => {
  selectedResource.value = null
  resetForm()
  viewMode.value = 'create'
}

const openView = async (resource: EducationalResource) => {
  selectedResource.value = await getResource(resource.id)
  viewMode.value = 'view'
}

const openEdit = async (resource: EducationalResource) => {
  selectedResource.value = await getResource(resource.id)
  if (selectedResource.value) {
    originalResourceData.value = { ...selectedResource.value }
    const r = selectedResource.value
    editForm.value = {
      title: r.title || '',
      resourceType: r.resourceType || 'PDF',
      resourceUrl: r.resourceUrl || '',
      courseId: r.courseId || '',
      isPublished: r.isPublished
    }
  }
  viewMode.value = 'edit'
}

const form = ref({
  title: '',
  resourceType: 'PDF',
  resourceUrl: '',
  courseId: '',
  isPublished: true
})

const editForm = ref({
  title: '',
  resourceType: 'PDF',
  resourceUrl: '',
  courseId: '',
  isPublished: true
})

const resetForm = () => {
  form.value = {
    title: '',
    resourceType: 'PDF',
    resourceUrl: '',
    courseId: '',
    isPublished: true
  }
}

const submitting = ref(false)

const handleCreate = async () => {
  submitting.value = true
  const data: any = {
    title: form.value.title,
    resourceType: form.value.resourceType,
    resourceUrl: form.value.resourceUrl,
    courseId: form.value.courseId || undefined,
    isPublished: form.value.isPublished
  }
  const result = await createResource(data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchResources(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdate = async () => {
  if (!selectedResource.value) return
  submitting.value = true
  const data: any = {}
  if (editForm.value.title) data.title = editForm.value.title
  if (editForm.value.resourceType) data.resourceType = editForm.value.resourceType
  if (editForm.value.resourceUrl) data.resourceUrl = editForm.value.resourceUrl
  if (editForm.value.courseId) data.courseId = editForm.value.courseId
  data.isPublished = editForm.value.isPublished

  const result = await updateResource(selectedResource.value.id, data)
  submitting.value = false

  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchResources(0, 10)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (resource: EducationalResource) => {
  const confirmed = await confirm({
    title: 'Eliminar recurso educativo',
    description: `¿Estás seguro de eliminar "${resource.title}"?`
  })
  if (confirmed) {
    const result = await deleteResource(resource.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchResources(0, 10)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const resourceTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'PDF': return 'error'
    case 'VIDEO': return 'info'
    case 'LINK': return 'warning'
    case 'DOCUMENT': return 'primary'
    case 'PRESENTATION': return 'success'
    default: return 'neutral'
  }
}

const resourceTypeIcon = (type: string) => {
  switch (type) {
    case 'PDF': return 'i-lucide-file-text'
    case 'VIDEO': return 'i-lucide-video'
    case 'LINK': return 'i-lucide-link'
    case 'DOCUMENT': return 'i-lucide-file'
    case 'PRESENTATION': return 'i-lucide-presentation'
    default: return 'i-lucide-file'
  }
}

const getActions = (resource: EducationalResource): DropdownMenuItem[][] => {
  if (showDeleted.value) {
    return [[{ label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(resource) }]]
  }
  return [
    [
      { label: 'Ver detalles', icon: 'i-lucide-eye', onSelect: () => openView(resource) },
      { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => openEdit(resource) }
    ],
    [{ label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => handleDelete(resource) }]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 justify-between">
      <div>
        <h1 class="text-3xl font-bold">Recursos Educativos</h1>
        <p class="text-muted-foreground">
          {{ showDeleted ? 'Recursos eliminados' : 'Recursos activos' }}: {{ resources.length }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <UCheckbox v-if="user?.roles?.includes('ADMIN')" v-model="showDeleted" label="Ver eliminados" />
        <UButton v-if="!showDeleted" @click="openCreate" icon="i-lucide-plus">
          Nuevo Recurso
        </UButton>
      </div>
    </div>

    <UAlert v-if="showDeleted" color="warning" variant="soft" icon="i-lucide-trash-2" class="mb-4">
      <template #title>Vista de papelera</template>
      <template #description>Estás viendo los recursos educativos eliminados.</template>
    </UAlert>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" title="Cargando recursos educativos" description="Por favor espera...">
      <template #icon><UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" /></template>
    </UAlert>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4" icon="i-lucide-circle-x" title="Ocurrió un error" :description="error">
      <template #actions>
        <UButton color="error" variant="soft" size="xs" icon="i-lucide-refresh-cw" label="Reintentar" @click="fetchResources(0, 10)" />
      </template>
    </UAlert>

    <div v-if="viewMode === null">
      <div class="bg-background rounded-lg p-6">
        <UPageList v-if="resources.length > 0" divide>
          <UPageCard v-for="resource in resources" :key="resource.id" variant="ghost">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <UAvatar :icon="resourceTypeIcon(resource.resourceType)" color="primary" variant="soft" class="w-12 h-12" />
                  <div>
                    <h3 class="font-semibold text-lg">{{ resource.title }}</h3>
                    <p class="text-sm text-muted-foreground">{{ resource.resourceType }} · {{ resource.resourceUrl }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge v-if="resource.isPublished" color="success" variant="soft">Publicado</UBadge>
                  <UBadge v-else color="neutral" variant="soft">Borrador</UBadge>
                </div>
              </div>
            </template>
            <template #body>
              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-sm text-muted-foreground">
                  <span><UIcon :name="resourceTypeIcon(resource.resourceType)" class="size-4 mr-1" />{{ resource.resourceType }}</span>
                  <span v-if="resource.courseName"><UIcon name="i-lucide-book-open" class="size-4 mr-1" />{{ resource.courseName }}</span>
                </div>
                <UDropdownMenu :items="getActions(resource)">
                  <UButton size="sm" variant="ghost"><UIcon name="i-lucide-more-horizontal" class="size-4" /></UButton>
                </UDropdownMenu>
              </div>
            </template>
          </UPageCard>
        </UPageList>
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-folder-open" class="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium mb-2">No hay recursos educativos</h3>
          <p class="text-muted-foreground mb-4">Crea el primer recurso educativo para comenzar</p>
          <UButton @click="openCreate" icon="i-lucide-plus">Nuevo Recurso</UButton>
        </div>
      </div>
    </div>

    <div v-if="viewMode !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-lg">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode === 'create' ? 'i-lucide-plus' : viewMode === 'view' ? 'i-lucide-file-text' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">{{ viewMode === 'create' ? 'Nuevo Recurso Educativo' : viewMode === 'view' ? `Recurso: ${selectedResource?.title}` : `Editar: ${selectedResource?.title}` }}</span>
                <UBadge v-if="viewMode === 'edit' && hasChanges" color="warning" variant="soft" class="animate-pulse"><UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />Cambios pendientes</UBadge>
                <UBadge v-else-if="viewMode === 'edit' && !hasChanges" color="success" variant="soft"><UIcon name="i-lucide-check" class="size-3 mr-1" />Sin cambios</UBadge>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel"><UIcon name="i-lucide-x" class="size-4" /></UButton>
            </div>
          </template>

          <div v-if="viewMode === 'create'" class="space-y-4">
            <UFormField label="Título" name="title" required>
              <UInput v-model="form.title" placeholder="Título del recurso" icon="i-lucide-heading" />
            </UFormField>
            <UFormField label="Tipo de recurso" name="resourceType" required>
              <USelect v-model="form.resourceType" :items="resourceTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-type" />
            </UFormField>
            <UFormField label="URL del recurso" name="resourceUrl" required>
              <UInput v-model="form.resourceUrl" placeholder="https://..." icon="i-lucide-link" />
            </UFormField>
            <UFormField label="Curso (opcional)" name="courseId">
              <USelect v-model="form.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>
            <UFormField label="Publicado" name="isPublished">
              <UCheckbox v-model="form.isPublished" label="Publicar recurso" />
            </UFormField>
          </div>

          <div v-else-if="viewMode === 'view' && selectedResource" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <UAvatar :icon="resourceTypeIcon(selectedResource.resourceType)" color="primary" variant="soft" class="w-16 h-16 text-lg" />
              <div>
                <h3 class="text-xl font-bold">{{ selectedResource.title }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge :color="resourceTypeBadgeColor(selectedResource.resourceType)" variant="soft">{{ selectedResource.resourceType }}</UBadge>
                  <UBadge v-if="selectedResource.isPublished" color="success" variant="soft">Publicado</UBadge>
                  <UBadge v-else color="neutral" variant="soft">Borrador</UBadge>
                </div>
              </div>
            </div>
            <USeparator label="URL" />
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-link" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">URL</p><a :href="selectedResource.resourceUrl" target="_blank" class="font-semibold text-primary hover:underline">{{ selectedResource.resourceUrl }}</a></div>
            </div>
            <USeparator v-if="selectedResource.courseName" label="Curso" />
            <div v-if="selectedResource.courseName" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-book-open" class="size-5 text-muted-foreground" />
              <div><p class="text-xs text-muted-foreground uppercase">Curso asociado</p><p class="font-semibold">{{ selectedResource.courseName }}</p></div>
            </div>
          </div>

          <div v-else-if="viewMode === 'edit' && selectedResource" class="space-y-4">
            <UFormField label="Título" name="title" required>
              <UInput v-model="editForm.title" placeholder="Título del recurso" icon="i-lucide-heading" />
            </UFormField>
            <UFormField label="Tipo de recurso" name="resourceType" required>
              <USelect v-model="editForm.resourceType" :items="resourceTypeOptions" placeholder="Seleccionar tipo" icon="i-lucide-file-type" />
            </UFormField>
            <UFormField label="URL del recurso" name="resourceUrl" required>
              <UInput v-model="editForm.resourceUrl" placeholder="https://..." icon="i-lucide-link" />
            </UFormField>
            <UFormField label="Curso (opcional)" name="courseId">
              <USelect v-model="editForm.courseId" :items="courseOptions" placeholder="Seleccionar curso" icon="i-lucide-book-open" />
            </UFormField>
            <UFormField label="Publicado" name="isPublished">
              <UCheckbox v-model="editForm.isPublished" label="Publicar recurso" />
            </UFormField>
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
