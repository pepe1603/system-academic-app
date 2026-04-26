<script setup lang="ts">
useSeoMeta({ title: 'Gestión de Anuncios - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getAllAds, getAdById, createAd, updateAd, deleteAd, loading, error } = usePortalContentAdmin()

const { data: adsList, refresh, pending } = await useAsyncData('ads-admin', () => getAllAds())

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)

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

const positionOptions = [
  { label: 'Banner (principal)', value: 'BANNER' },
  { label: 'Sidebar (lateral)', value: 'SIDEBAR' },
  { label: 'Footer (pie)', value: 'FOOTER' }
]

const resetForm = () => {
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
  isEditing.value = false
  editingId.value = null
  showForm.value = false
}

const handleSubmit = async () => {
  if (!form.value.title) return

  const data = {
    ...form.value,
    startDate: form.value.startDate || null,
    endDate: form.value.endDate || null
  }

  let success = false
  formLoading.value = true
  
  try {
    if (isEditing.value && editingId.value) {
      success = await updateAd(editingId.value, data)
    } else {
      const id = await createAd(data)
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
  console.log('[DEBUG-anuncios] handleEdit CLICKED, id:', id, 'accessToken exists:', !!useAuth().accessToken.value)
  formLoading.value = true
  try {
    const ad = await getAdById(id)
    console.log('[DEBUG] getAdById result:', ad, 'error:', error.value)
    if (ad) {
      form.value = {
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl || '',
        linkUrl: ad.linkUrl || '',
        position: ad.position,
        displayOrder: ad.displayOrder,
        isPublished: ad.isPublished,
        startDate: ad.startDate || '',
        endDate: ad.endDate || ''
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
  if (confirm('¿Estás seguro de que deseas eliminar este anuncio?')) {
    const success = await deleteAd(id)
    if (success) await refresh()
  }
}

const getPositionLabel = (pos: string) => {
  const option = positionOptions.find(o => o.value === pos)
  return option?.label || pos
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Anuncios</h1>
        <p class="text-muted-foreground">Gestiona los anuncios y banners del portal</p>
      </div>
      <UButton @click="showForm = !showForm">
        <UIcon :name="showForm ? 'i-lucide-x' : 'i-lucide-plus'" class="w-4 h-4 mr-2" />
        {{ showForm ? 'Cancelar' : 'Nuevo Anuncio' }}
      </UButton>
    </div>

    <UCard v-if="showForm" class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">
          {{ isEditing ? 'Editar Anuncio' : 'Crear Nuevo Anuncio' }}
        </h2>
      </template>

      <UForm @submit.prevent="handleSubmit" class="space-y-6">
        <UFormField label="Título" name="title" required>
          <UInput v-model="form.title" placeholder="Título del anuncio" size="lg" />
        </UFormField>

        <UFormField label="Descripción" name="description">
          <UTextarea v-model="form.description" placeholder="Descripción del anuncio" :rows="3" />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Posición" name="position">
            <USelect v-model="form.position" :items="positionOptions" size="lg" :leading-icon="undefined" />
          </UFormField>

          <UFormField label="Orden de visualización" name="displayOrder">
            <UInput v-model.number="form.displayOrder" type="number" size="lg" />
          </UFormField>
        </div>

        <UFormField label="URL de Imagen" name="imageUrl">
          <UInput v-model="form.imageUrl" placeholder="https://ejemplo.com/imagen.jpg" />
        </UFormField>

        <UFormField label="URL de Enlace" name="linkUrl">
          <UInput v-model="form.linkUrl" placeholder="/pagina-destino" />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Fecha de inicio" name="startDate">
            <UInput v-model="form.startDate" type="date" size="lg" />
          </UFormField>

          <UFormField label="Fecha de fin" name="endDate">
            <UInput v-model="form.endDate" type="date" size="lg" />
          </UFormField>
        </div>

        <UCheckbox v-model="form.isPublished" label="Publicar inmediatamente" />

        <div class="flex gap-3">
          <UButton type="submit" :loading="formLoading">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Anuncio' }}
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

<div v-else-if="adsList?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard 
        v-for="ad in adsList" 
        :key="ad.id" 
        class="group relative overflow-hidden"
        :class="ad.imageUrl ? 'h-64' : 'h-auto'"
      >
        <template v-if="ad.imageUrl">
          <div class="absolute inset-0">
            <img :src="ad.imageUrl" :alt="ad.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
            <UBadge :color="ad.isPublished ? 'success' : 'warning'" class="mb-2">
              {{ ad.isPublished ? 'Publicado' : 'Borrador' }}
            </UBadge>
            <h3 class="font-semibold text-xl mb-1">{{ ad.title }}</h3>
            <p class="text-sm text-white/80 line-clamp-2">{{ ad.description }}</p>
          </div>
          <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton variant="solid" size="sm" @click="handleEdit(ad.id)">
              <UIcon name="i-lucide-pencil" class="w-4 h-4" />
            </UButton>
            <UButton variant="solid" size="sm" color="error" @click="handleDelete(ad.id)">
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center gap-2 mb-3">
            <UBadge :color="ad.isPublished ? 'success' : 'warning'">
              {{ ad.isPublished ? 'Publicado' : 'Borrador' }}
            </UBadge>
            <UBadge variant="soft">{{ getPositionLabel(ad.position) }}</UBadge>
            <span class="text-xs text-muted-foreground">Orden: {{ ad.displayOrder }}</span>
          </div>
          <h3 class="font-semibold text-lg mb-2">{{ ad.title }}</h3>
          <p class="text-muted-foreground text-sm mb-4">{{ ad.description }}</p>
          <div class="flex gap-2">
            <UButton variant="outline" size="sm" @click="handleEdit(ad.id)">
              <UIcon name="i-lucide-pencil" class="w-4 h-4 mr-1" />
              Editar
            </UButton>
            <UButton variant="outline" size="sm" color="error" @click="handleDelete(ad.id)">
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <div v-else class="text-center py-12 text-muted-foreground">
      <UIcon name="i-lucide-megaphone" class="w-12 h-12 mb-4" />
      <p>No hay anuncios creados</p>
    </div>
  </div>
</template>