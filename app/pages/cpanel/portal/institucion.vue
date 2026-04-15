<script setup lang="ts">
useSeoMeta({ title: 'Información Institucional - Portal' })

definePageMeta({ layout: 'c-panel' })

const { getInstitution, updateInstitution, loading } = usePortal()
const { updateInstitution: updateAdmin } = usePortalAdmin()

const { data: institution } = await useAsyncData('institution-admin', () => getInstitution())

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
  await updateAdmin(form.value)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Información Institucional</h1>
    
    <UCard>
      <UForm @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Nombre" name="name">
            <UInput v-model="form.name" />
          </UFormField>
          
          <UFormField label="Dirección" name="address">
            <UInput v-model="form.address" />
          </UFormField>
          
          <UFormField label="Teléfono" name="phone">
            <UInput v-model="form.phone" />
          </UFormField>
          
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" />
          </UFormField>
          
          <UFormField label="Website" name="website" class="md:col-span-2">
            <UInput v-model="form.website" />
          </UFormField>
        </div>
        
        <UFormField label="Misión" name="mission">
          <UTextarea v-model="form.mission" :rows="3" />
        </UFormField>
        
        <UFormField label="Visión" name="vision">
          <UTextarea v-model="form.vision" :rows="3" />
        </UFormField>
        
        <UFormField label="Historia" name="history">
          <UTextarea v-model="form.history" :rows="3" />
        </UFormField>
        
        <UFormField label="Valores" name="values">
          <UTextarea v-model="form.values" :rows="2" />
        </UFormField>
        
        <UFormField label="URL del Logo" name="logoUrl">
          <UInput v-model="form.logoUrl" placeholder="/images/logo.png" />
        </UFormField>
        
        <UButton type="submit" :loading="loading">
          Guardar Cambios
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>