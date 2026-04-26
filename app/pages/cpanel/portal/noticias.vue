<script setup lang="ts">
useSeoMeta({ title: 'Gestión de Noticias - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getAllNews, getNewsById, createNews, updateNews, deleteNews, loading, error } = usePortalContentAdmin()

const { data: newsList, refresh, pending } = await useAsyncData('news-admin', () => getAllNews())

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)

const form = ref({
  title: '',
  content: '',
  imageUrl: '',
  isPublished: true
})

const resetForm = () => {
  form.value = { title: '', content: '', imageUrl: '', isPublished: true }
  isEditing.value = false
  editingId.value = null
  showForm.value = false
}

const handleSubmit = async () => {
  if (!form.value.title || !form.value.content) return

  let success = false
  formLoading.value = true
  
  try {
    if (isEditing.value && editingId.value) {
      success = await updateNews(editingId.value, form.value)
    } else {
      const id = await createNews(form.value)
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
    const news = await getNewsById(id)
    if (news) {
      form.value = {
        title: news.title,
        content: news.content,
        imageUrl: news.imageUrl || '',
        isPublished: news.isPublished
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
  if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
    const success = await deleteNews(id)
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
        <h1 class="text-3xl font-bold">Noticias</h1>
        <p class="text-muted-foreground">Gestiona las noticias del portal público</p>
      </div>
      <UButton @click="showForm = !showForm">
        <UIcon :name="showForm ? 'i-lucide-x' : 'i-lucide-plus'" class="w-4 h-4 mr-2" />
        {{ showForm ? 'Cancelar' : 'Nueva Noticia' }}
      </UButton>
    </div>

    <UCard v-if="showForm" class="mb-8">
      <template #header>
        <h2 class="font-semibold text-lg">
          {{ isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia' }}
        </h2>
      </template>

      <UForm @submit.prevent="handleSubmit" class="space-y-6">
        <UFormField label="Título" name="title" required>
          <UInput v-model="form.title" placeholder="Título de la noticia" size="lg" />
        </UFormField>

        <UFormField label="Contenido" name="content" required>
          <UTextarea v-model="form.content" placeholder="Contenido de la noticia" :rows="6" />
        </UFormField>

        <UFormField label="URL de Imagen" name="imageUrl">
          <UInput v-model="form.imageUrl" placeholder="https://ejemplo.com/imagen.jpg" />
        </UFormField>

        <UCheckbox v-model="form.isPublished" label="Publicar inmediatamente" />

        <div class="flex gap-3">
          <UButton type="submit" :loading="formLoading">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Noticia' }}
          </UButton>
          <UButton v-if="isEditing" variant="ghost" @click="resetForm">
            Cancelar
          </UButton>
        </div>
      </UForm>
    </UCard>

    <div v-if="newsList?.length" class="space-y-4">
      <UCard v-for="item in newsList" :key="item.id">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <UBadge :color="item.isPublished ? 'success' : 'warning'">
                {{ item.isPublished ? 'Publicada' : 'Borrador' }}
              </UBadge>
              <h3 class="font-semibold text-lg">{{ item.title }}</h3>
            </div>
            <p class="text-muted-foreground line-clamp-2 mb-3">{{ item.content }}</p>
            <div class="text-sm text-muted-foreground">
              {{ formatDate(item.createdAt) }}
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <UButton variant="outline" size="sm" @click="handleEdit(item.id)">
              <UIcon name="i-lucide-pencil" class="w-4 h-4" />
            </UButton>
            <UButton variant="outline" size="sm" color="error" @click="handleDelete(item.id)">
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="text-center py-12 text-muted-foreground">
      <UIcon name="i-lucide-newspaper" class="w-12 h-12 mb-4" />
      <p>No hay noticias creadas</p>
    </div>
  </div>
</template>