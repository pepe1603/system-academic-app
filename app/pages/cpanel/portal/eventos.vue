<script setup lang="ts">
useSeoMeta({ title: 'Gestión de Eventos - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, loading, error } = usePortalContentAdmin()

const { data: eventsList, refresh, pending } = await useAsyncData('events-admin', () => getAllEvents())

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)

const form = ref({
  title: '',
  description: '',
  eventDate: '',
  location: '',
  isPublished: true
})

const resetForm = () => {
  form.value = { title: '', description: '', eventDate: '', location: '', isPublished: true }
  isEditing.value = false
  editingId.value = null
  showForm.value = false
}

const handleSubmit = async () => {
  if (!form.value.title || !form.value.eventDate) return

  let success = false
  formLoading.value = true
  
  try {
    if (isEditing.value && editingId.value) {
      success = await updateEvent(editingId.value, form.value)
    } else {
      const id = await createEvent(form.value)
      success = !!id
    }

    if (success) {
      resetForm()
      await refresh()
    }
  } finally {
    formLoading.value = false
  }
}

const handleEdit = async (id: string) => {
  formLoading.value = true
  try {
    const event = await getEventById(id)
    if (event) {
      form.value = {
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        isPublished: event.isPublished
      }
      isEditing.value = true
      editingId.value = id
      showForm.value = true
    }
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
    const success = await deleteEvent(id)
    if (success) await refresh()
  }
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Eventos</h1>
        <p class="text-muted-foreground">Gestiona los eventos del portal público</p>
      </div>
      <UButton @click="showForm = !showForm">
        <UIcon :name="showForm ? 'i-lucide-x' : 'i-lucide-plus'" class="w-4 h-4 mr-2" />
        {{ showForm ? 'Cancelar' : 'Nuevo Evento' }}
      </UButton>
    </div>

    <UCard v-if="showForm" class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">
          {{ isEditing ? 'Editar Evento' : 'Crear Nuevo Evento' }}
        </h2>
      </template>

      <UForm @submit.prevent="handleSubmit" class="space-y-6">
        <UFormField label="Título" name="title" required>
          <UInput v-model="form.title" placeholder="Título del evento" size="lg" />
        </UFormField>

        <UFormField label="Descripción" name="description">
          <UTextarea v-model="form.description" placeholder="Descripción del evento" :rows="4" />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Fecha" name="eventDate" required>
            <UInput v-model="form.eventDate" type="date" size="lg" />
          </UFormField>

          <UFormField label="Ubicación" name="location">
            <UInput v-model="form.location" placeholder="Lugar del evento" size="lg" />
          </UFormField>
        </div>

        <UCheckbox v-model="form.isPublished" label="Publicar inmediatamente" />

        <div class="flex gap-3">
          <UButton type="submit" :loading="formLoading">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Evento' }}
          </UButton>
          <UButton v-if="isEditing" variant="ghost" @click="resetForm">
            Cancelar
          </UButton>
        </div>
      </UForm>
    </UCard>

    <div v-if="pending" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
    </div>

    <div v-else-if="eventsList?.length" class="space-y-4">
      <UCard v-for="event in eventsList" :key="event.id">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <UBadge :color="event.isPublished ? 'success' : 'warning'">
                {{ event.isPublished ? 'Publicado' : 'Borrador' }}
              </UBadge>
              <UBadge color="info" variant="soft">
                {{ formatDate(event.eventDate) }}
              </UBadge>
              <h3 class="font-semibold text-lg">{{ event.title }}</h3>
            </div>
            <p class="text-muted-foreground line-clamp-2 mb-2">{{ event.description }}</p>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
              {{ event.location || 'Sin ubicación' }}
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <UButton variant="outline" size="sm" @click="handleEdit(event.id)">
              <UIcon name="i-lucide-pencil" class="w-4 h-4" />
            </UButton>
            <UButton variant="outline" size="sm" color="error" @click="handleDelete(event.id)">
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="text-center py-12 text-muted-foreground">
      <UIcon name="i-lucide-calendar" class="w-12 h-12 mb-4" />
      <p>No hay eventos creados</p>
    </div>
  </div>
</template>