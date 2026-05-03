<script lang="ts" setup>
interface Props {
  title?: string
  mode?: 'create' | 'edit'
  user?: any
  availableRoles?: { label: string; value: string }[]
}

const props = defineProps<Props>()

const form = reactive({
  username: '',
  email: '',
  password: '',
  roles: [] as string[],
  isActive: true,
  mustChangePassword: false
})

watchEffect(() => {
  if (props.mode === 'edit' && props.user) {
    form.roles = [...props.user.roles]
    form.isActive = props.user.isActive
    form.mustChangePassword = props.user.mustChangePassword
  }
})

const emit = defineEmits<{
  close: [value: any]
}>()

const handleSubmit = () => {
  emit('close', { ...form })
}

const handleCancel = () => {
  emit('close', null)
}
</script>

<template>
  <UModal :title="title" @close="handleCancel">
    <UForm :state="form" class="space-y-4" @submit="handleSubmit">
      <template v-if="mode === 'create'">
        <UFormField label="Usuario" name="username" required>
          <UInput v-model="form.username" placeholder="Nombre de usuario" />
        </UFormField>
        
        <UFormField label="Correo electrónico" name="email" required>
          <UInput v-model="form.email" type="email" placeholder="correo@ejemplo.com" />
        </UFormField>
        
        <UFormField label="Contraseña" name="password" required>
          <UInput v-model="form.password" type="password" placeholder="Contraseña inicial" />
        </UFormField>
      </template>

      <template v-if="mode === 'edit' && user">
        <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <UAvatar :src="`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`" />
          <div>
            <p class="font-semibold">{{ user.username }}</p>
            <p class="text-sm text-muted-foreground">{{ user.email }}</p>
          </div>
        </div>
      </template>
      
      <UFormField label="Roles" name="roles">
        <USelect
          v-model="form.roles"
          :items="availableRoles"
          multiple
          placeholder="Seleccionar roles"
        />
      </UFormField>
      
      <template v-if="mode === 'edit'">
        <UFormField label="Estado" name="isActive">
          <div class="flex items-center gap-3">
            <USwitch v-model="form.isActive" />
            <span :class="form.isActive ? 'text-green-600' : 'text-red-600'">
              {{ form.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </UFormField>
        
        <UFormField label="Cambio de contraseña" name="mustChangePassword">
          <div class="flex items-center gap-3">
            <USwitch v-model="form.mustChangePassword" />
            <span :class="form.mustChangePassword ? 'text-amber-600' : 'text-muted-foreground'">
              {{ form.mustChangePassword ? 'Debe cambiar contraseña' : 'No requiere cambio' }}
            </span>
          </div>
        </UFormField>
      </template>
    </UForm>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="handleCancel">
          Cancelar
        </UButton>
        <UButton type="submit" @click="handleSubmit">
          {{ mode === 'create' ? 'Crear' : 'Guardar' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
