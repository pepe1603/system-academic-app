<script setup lang="ts">
useSeoMeta({
  title: 'Usuarios - Panel de Control'
})

definePageMeta({
  layout: 'c-panel'
})

const { users, loading, error, totalElements, currentPage, totalPages, fetchUsers, deleteUser } = useUsers()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<any>(null)

const form = ref({
  email: '',
  curp: '',
  roles: [] as string[]
})

const page = ref(0)
const pageSize = ref(20)

onMounted(() => {
  fetchUsers(page.value, pageSize.value)
})

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchUsers(newPage, pageSize.value)
}

const openCreate = () => {
  form.value = { email: '', curp: '', roles: [] }
  showCreateModal.value = true
}

const handleCreate = async () => {
  const { createUser } = useUsers()
  try {
    await createUser({
      email: form.value.email,
      curp: form.value.curp || undefined,
      roles: form.value.roles.length > 0 ? form.value.roles : undefined
    })
    showCreateModal.value = false
    fetchUsers(page.value, pageSize.value)
  } catch (e) {
    // Error manejado en composable
  }
}

const openEdit = (user: any) => {
  selectedUser.value = { ...user }
  showEditModal.value = true
}

const handleEdit = async () => {
  const { updateUser } = useUsers()
  try {
    await updateUser(selectedUser.value.id, {
      isActive: selectedUser.value.isActive,
      roles: selectedUser.value.roles,
      mustChangePassword: selectedUser.value.mustChangePassword
    })
    showEditModal.value = false
    fetchUsers(page.value, pageSize.value)
  } catch (e) {
    // Error manejador en composable
  }
}

const confirmDelete = (user: any) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (selectedUser.value) {
    await deleteUser(selectedUser.value.id)
    showDeleteModal.value = false
    fetchUsers(page.value, pageSize.value)
  }
}

const toggleRole = (role: string) => {
  const idx = form.value.roles.indexOf(role)
  if (idx === -1) {
    form.value.roles.push(role)
  } else {
    form.value.roles.splice(idx, 1)
  }
}

const roleOptions = [
  { label: 'Estudiante', value: 'STUDENT' },
  { label: 'Profesor', value: 'TEACHER' },
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Control Escolar', value: 'CONTROL_ESCOLAR' },
  { label: 'Director', value: 'DIRECTOR' }
]
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold">Usuarios</h1>
        <p class="text-muted-foreground">{{ totalElements }} usuarios en total</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreate">Agregar Usuario</UButton>
    </div>

    <UAlert v-if="error" color="error" variant="soft" class="mb-4">
      {{ error }}
    </UAlert>

    <UCard>
      <UTable :columns="[
        { id: 'username', key: 'username', label: 'Usuario' },
        { id: 'email', key: 'email', label: 'Email' },
        { id: 'roles', key: 'roles', label: 'Roles' },
        { id: 'isActive', key: 'isActive', label: 'Estado' },
        { id: 'actions', key: 'actions', label: '' }
      ]" :rows="users" :loading="loading">
        <template #username-row="{ row }">
          <div class="font-medium">{{ row.username }}</div>
        </template>
        
        <template #email-row="{ row }">
          <div class="text-muted-foreground">{{ row.email }}</div>
        </template>
        
        <template #roles-row="{ row }">
          <div class="flex gap-1">
            <UBadge v-for="role in row.roles" :key="role" variant="secondary" color="gray">
              {{ role }}
            </UBadge>
          </div>
        </template>
        
        <template #isActive-row="{ row }">
          <UBadge :color="row.isActive ? 'green' : 'red'">
            {{ row.isActive ? 'Activo' : 'Inactivo' }}
          </UBadge>
        </template>
        
        <template #actions-row="{ row }">
          <div class="flex gap-2">
            <UButton variant="ghost" size="sm" icon="i-lucide-pencil" @click="openEdit(row)" />
            <UButton variant="ghost" size="sm" color="error" icon="i-lucide-trash" @click="confirmDelete(row)" />
          </div>
        </template>
      </UTable>
      
      <div v-if="totalPages > 1" class="flex justify-center mt-4">
        <UPagination :page="currentPage + 1" :total="totalPages" @change="handlePageChange" />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model="showCreateModal" title="Crear Usuario">
      <UForm @submit.prevent="handleCreate" class="space-y-4">
        <UFormField label="Email" name="email">
          <UInput v-model="form.email" type="email" placeholder="email@institucion.edu" required />
        </UFormField>
        
        <UFormField label="CURP (opcional)" name="curp">
          <UInput v-model="form.curp" placeholder="XAXX010101HNEXXXX18" :maxlength="18" />
        </UFormField>
        
        <UFormField label="Roles" name="roles">
          <div class="flex flex-wrap gap-2">
            <UCheckbox
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :checked="form.roles.includes(role.value)"
              @update:checked="toggleRole(role.value)"
            />
          </div>
        </UFormField>
        
        <UButton type="submit" block>Crear Usuario</UButton>
      </UForm>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model="showEditModal" title="Editar Usuario">
      <UForm v-if="selectedUser" @submit.prevent="handleEdit" class="space-y-4">
        <div class="text-lg font-semibold mb-4">{{ selectedUser.username }}</div>
        
        <UFormField label="Roles" name="roles">
          <div class="flex flex-wrap gap-2">
            <UCheckbox
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :checked="selectedUser.roles?.includes(role.value)"
              @update:checked="(checked: boolean) => {
                if (!selectedUser.roles) selectedUser.roles = []
                if (checked) {
                  selectedUser.roles.push(role.value)
                } else {
                  const idx = selectedUser.roles.indexOf(role.value)
                  if (idx > -1) selectedUser.roles.splice(idx, 1)
                }
              }"
            />
          </div>
        </UFormField>
        
        <UFormField label="Estado" name="isActive">
          <USwitch v-model="selectedUser.isActive" />
          <span class="ml-2">{{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}</span>
        </UFormField>
        
        <UFormField label="Cambiar contraseña" name="mustChangePassword">
          <USwitch v-model="selectedUser.mustChangePassword" />
          <span class="ml-2">{{ selectedUser.mustChangePassword ? 'Sí' : 'No' }}</span>
        </UFormField>
        
        <UButton type="submit" block>Guardar Cambios</UButton>
      </UForm>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model="showDeleteModal" title="Eliminar Usuario">
      <div v-if="selectedUser" class="space-y-4">
        <p>¿Estás seguro de eliminar al usuario <strong>{{ selectedUser.username }}</strong>?</p>
        <p class="text-sm text-muted-foreground">Esta acción desactiva el usuario pero no elimina sus datos.</p>
        
        <div class="flex gap-2">
          <UButton variant="ghost" @click="showDeleteModal = false">Cancelar</UButton>
          <UButton color="error" @click="handleDelete">Eliminar</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>