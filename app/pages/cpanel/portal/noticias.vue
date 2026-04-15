<script setup lang="ts">
useSeoMeta({ title: 'Gestión de Noticias - Portal' })

definePageMeta({ layout: 'c-panel' })

const { createNews, deleteNews, loading, error } = usePortalAdmin()

const title = ref('')
const content = ref('')
const isPublished = ref(true)

const handleCreate = async () => {
  if (!title.value || !content.value) return
  
  const id = await createNews({
    title: title.value,
    content: content.value,
    isPublished: isPublished.value
  })
  
  if (id) {
    title.value = ''
    content.value = ''
    isPublished.value = true
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Noticias</h1>
    
    <UCard class="mb-6">
      <template #header>
        <h2 class="font-semibold">Crear Nueva Noticia</h2>
      </template>
      
      <UForm @submit.prevent="handleCreate" class="space-y-4">
        <UFormField label="Título" name="title" required>
          <UInput v-model="title" placeholder="Título de la noticia" />
        </UFormField>
        
        <UFormField label="Contenido" name="content" required>
          <UTextarea v-model="content" placeholder="Contenido de la noticia" :rows="4" />
        </UFormField>
        
        <UFormField label="Publicada" name="published">
          <UCheckbox v-model="isPublished" label="Publicar inmediatamente" />
        </UFormField>
        
        <UButton type="submit" :loading="loading">
          Crear Noticia
        </UButton>
      </UForm>
    </UCard>
    
    <UAlert v-if="error" color="error" variant="soft" :title="error" />
  </div>
</template>