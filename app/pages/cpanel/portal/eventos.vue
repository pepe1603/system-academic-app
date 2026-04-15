<script setup lang="ts">
useSeoMeta({ title: 'Gestión de Eventos - Portal' })

definePageMeta({ layout: 'c-panel' })

const { createEvent, loading } = usePortalAdmin()

const form = ref({
  title: '',
  description: '',
  eventDate: '',
  location: '',
  isPublished: true
})

const handleCreate = async () => {
  if (!form.value.title || !form.value.eventDate) return
  
  await createEvent(form.value)
  
  form.value = { title: '', description: '', eventDate: '', location: '', isPublished: true }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Eventos</h1>
    
    <UCard>
      <template #header>
        <h2 class="font-semibold">Crear Nuevo Evento</h2>
      </template>
      
      <UForm @submit.prevent="handleCreate" class="space-y-4">
        <UFormField label="Título" name="title" required>
          <UInput v-model="form.title" placeholder="Título del evento" />
        </UFormField>
        
        <UFormField label="Descripción" name="description">
          <UTextarea v-model="form.description" :rows="3" />
        </UFormField>
        
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Fecha" name="eventDate" required>
            <UInput v-model="form.eventDate" type="date" />
          </UFormField>
          
          <UFormField label="Ubicación" name="location">
            <UInput v-model="form.location" placeholder="Lugar del evento" />
          </UFormField>
        </div>
        
        <UCheckbox v-model="form.isPublished" label="Publicar inmediatamente" />
        
        <UButton type="submit" :loading="loading">
          Crear Evento
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>