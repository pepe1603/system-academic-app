<script setup lang="ts">
useSeoMeta({ title: 'Información Institucional - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getInstitution, loading: loadingPublic } = usePortalContent()
const { updateInstitution, loading, error } = usePortalContentAdmin()

const { data: institution, pending } = await useAsyncData('institution-admin', () => getInstitution())

const form = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  mission: '',
  vision: '',
  history: '',
  values: '',
  logoUrl: ''
})

const saved = ref(false)

watchEffect(() => {
  if (institution.value) {
    form.value = {
      name: institution.value.name || '',
      address: institution.value.address || '',
      phone: institution.value.phone || '',
      email: institution.value.email || '',
      website: institution.value.website || '',
      mission: institution.value.mission || '',
      vision: institution.value.vision || '',
      history: institution.value.history || '',
      values: institution.value.values || '',
      logoUrl: institution.value.logoUrl || ''
    }
  }
})

const handleSave = async () => {
  saved.value = false
  const success = await updateInstitution(form.value)
  if (success) {
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Información Institucional</h1>
        <p class="text-muted-foreground">Edita la información que se muestra en el portal público</p>
      </div>
    </div>

    <div v-if="pending" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
    </div>

    <template v-else>
      <UAlert v-if="saved" color="success" variant="soft" class="mb-6" title="Cambios guardados correctamente" />
      <UAlert v-if="error" color="error" variant="soft" class="mb-6" :title="error" />

      <UCard>
      <UForm @submit.prevent="handleSave" class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-building-2" class="w-5 h-5 text-primary" />
            Datos Generales
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Nombre de la Institución" name="name">
              <UInput v-model="form.name" size="lg" />
            </UFormField>

            <UFormField label="Dirección" name="address">
              <UInput v-model="form.address" size="lg" />
            </UFormField>

            <UFormField label="Teléfono" name="phone">
              <UInput v-model="form.phone" size="lg" />
            </UFormField>

            <UFormField label="Correo electrónico" name="email">
              <UInput v-model="form.email" type="email" size="lg" />
            </UFormField>

            <UFormField label="Website" name="website" class="md:col-span-2">
              <UInput v-model="form.website" size="lg" placeholder="https://www.institucion.edu.mx" />
            </UFormField>

            <UFormField label="URL del Logo" name="logoUrl" class="md:col-span-2">
              <UInput v-model="form.logoUrl" size="lg" placeholder="/images/logo.png" />
            </UFormField>
          </div>
        </div>

        <UDivider />

        <div>
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-target" class="w-5 h-5 text-primary" />
            Misión
          </h3>
          <UFormField label="Misión institucional" name="mission">
            <UTextarea v-model="form.mission" :rows="4" placeholder="Describe la misión de la institución..." />
          </UFormField>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-eye" class="w-5 h-5 text-primary" />
            Visión
          </h3>
          <UFormField label="Visión institucional" name="vision">
            <UTextarea v-model="form.vision" :rows="4" placeholder="Describe la visión de la institución..." />
          </UFormField>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="w-5 h-5 text-primary" />
            Historia
          </h3>
          <UFormField label="Historia de la institución" name="history">
            <UTextarea v-model="form.history" :rows="4" placeholder="Cuenta la historia de la institución..." />
          </UFormField>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-heart" class="w-5 h-5 text-primary" />
            Valores
          </h3>
          <UFormField label="Valores institucionales" name="values">
            <UTextarea v-model="form.values" :rows="3" placeholder="Lista los valores de la institución..." />
          </UFormField>
        </div>

        <div class="flex justify-end pt-4">
          <UButton type="submit" size="lg" :loading="loading">
            <UIcon name="i-lucide-save" class="w-5 h-5 mr-2" />
            Guardar Cambios
          </UButton>
        </div>
      </UForm>
    </UCard>
    </template>
  </div>
</template>