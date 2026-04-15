<script setup lang="ts">
useSeoMeta({ title: 'Gestión de Anuncios - Portal' })

definePageMeta({ layout: 'c-panel' })

const { createAd, loading } = usePortalAdmin()

const form = ref({
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  position: 'BANNER' as 'BANNER' | 'SIDEBAR' | 'FOOTER',
  displayOrder: 0,
  isPublished: true,
  startDate: '',
  endDate: ''
})

const handleCreate = async () => {
  if (!form.value.title) return
  
  await createAd(form.value)
  
  form.value = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'BANNER',
    displayOrder: 0,
    isPublished: true,
    startDate: '',
    endDate: ''
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Anuncios</h1>
    
    <UCard>
      <template #header>
        <h2 class="font-semibold">Crear Nuevo Anuncio</h2>
      </template>
      
      <UForm @submit.prevent="handleCreate" class="space-y-4">
        <UFormField label="Título" name="title" required>
          <UInput v-model="form.title" />
        </UFormField>
        
        <UFormField label="Descripción" name="description">
          <UTextarea v-model="form.description" :rows="2" />
        </UFormField>
        
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Posición" name="position">
            <USelect v-model="form.position" :items="['BANNER', 'SIDEBAR', 'FOOTER']" />
          </UFormField>
          
          <UFormField label="Orden" name="order">
            <UInput v-model.number="form.displayOrder" type="number" />
          </UFormField>
        </div>
        
        <UFormField label="URL de imagen" name="imageUrl">
          <UInput v-model="form.imageUrl" placeholder="/images/ads/banner.jpg" />
        </UFormField>
        
        <UFormField label="URL de enlace" name="linkUrl">
          <UInput v-model="form.linkUrl" placeholder="/programa" />
        </UFormField>
        
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Fecha inicio" name="startDate">
            <UInput v-model="form.startDate" type="date" />
          </UFormField>
          
          <UFormField label="Fecha fin" name="endDate">
            <UInput v-model="form.endDate" type="date" />
          </UFormField>
        </div>
        
        <UCheckbox v-model="form.isPublished" label="Publicar inmediatamente" />
        
        <UButton type="submit" :loading="loading">
          Crear Anuncio
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>