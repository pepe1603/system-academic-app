<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { User } from '~/composables/useUsers'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Usuarios - Panel de Control'
})

const toast = useToast()
const confirm = useConfirmDialog()

type ViewMode = 'create' | 'view' | 'edit' | null

const viewMode = ref<ViewMode>(null)
const selectedUser = ref<User | null>(null)

const { users, loading, error, totalElements, currentPage, totalPages, fetchUsers, getUser, createUser, updateUser, deleteUser } = useUsers()

const availableRoles = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Profesor', value: 'TEACHER' },
  { label: 'Estudiante', value: 'STUDENT' },
  { label: 'Control Escolar', value: 'CONTROL_ESCOLAR' },
  { label: 'Director', value: 'DIRECTOR' }
]

onMounted(() => {
  fetchUsers(0, 5)
})

const handlePageChange = (page: number) => {
  fetchUsers(page - 1, 5)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getRoleBadgeColor = (role: string): 'error' | 'info' | 'success' | 'warning' | 'primary' | 'neutral' => {
  const colors: Record<string, 'error' | 'info' | 'success' | 'warning' | 'primary' | 'neutral'> = {
    ADMIN: 'error',
    TEACHER: 'info',
    STUDENT: 'success',
    CONTROL_ESCOLAR: 'warning',
    DIRECTOR: 'primary'
  }
  return colors[role] || 'neutral'
}

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    DIRECTOR: 'Director',
    CONTROL_ESCOLAR: 'Control Escolar',
    TEACHER: 'Profesor',
    STUDENT: 'Estudiante'
  }
  return labels[role] || role
}

const getRoleDescription = (role: string): string => {
  const descriptions: Record<string, string> = {
    ADMIN: 'Acceso total al panel de control. Puede gestionar usuarios, configuraciones y todos los módulos del sistema.',
    DIRECTOR: 'Gestión académica integral. Acceso a reportes de rendimiento escolar y estadísticas generales.',
    CONTROL_ESCOLAR: 'Control de inscripciones, gestión de grupos, control de escolaridad y historial académico.',
    TEACHER: 'Gestión de grupos asignados, captura de calificaciones y asistencia.',
    STUDENT: 'Acceso al portal de estudiante para consultar calificaciones, horarios y avisos.'
  }
  return descriptions[role] || 'Sin descripción'
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const closePanel = () => {
  viewMode.value = null
  selectedUser.value = null
}

const openCreate = () => {
  selectedUser.value = null
  viewMode.value = 'create'
}

const openView = async (user: User) => {
  selectedUser.value = await getUser(user.id)
  viewMode.value = 'view'
}

const openEdit = async (user: User) => {
  const fetchedUser = await getUser(user.id)
  selectedUser.value = fetchedUser
  editForm.roles = [...(fetchedUser?.roles || [])]
  editForm.isActive = fetchedUser?.isActive ?? true
  editForm.mustChangePassword = fetchedUser?.mustChangePassword ?? false
  editForm.curp = fetchedUser?.curp || ''
  viewMode.value = 'edit'
}

const copyUserId = async (id: string) => {
  const success = await copyToClipboard(id)
  if (success) {
    toast.add({ title: 'ID copiado', description: 'El ID se copió al portapapeles', color: 'success', icon: 'i-lucide-check' })
  }
}

const createForm = reactive({
  username: '',
  email: '',
  password: '',
  curp: '',
  roles: [] as string[]
})

const editForm = reactive({
  roles: [] as string[],
  isActive: true,
  mustChangePassword: false,
  curp: ''
})

const submitting = ref(false)

const handleCreateUser = async () => {
  submitting.value = true
  const data: any = {
    username: createForm.username,
    email: createForm.email,
    password: createForm.password,
    roles: createForm.roles
  }
  if (createForm.curp) data.curp = createForm.curp
  const result = await createUser(data)
  submitting.value = false
  
  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    createForm.username = ''
    createForm.email = ''
    createForm.password = ''
    createForm.curp = ''
    createForm.roles = []
    closePanel()
    fetchUsers(currentPage.value, 5)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleUpdateUser = async () => {
  if (!selectedUser.value) return
  
  submitting.value = true
  const result = await updateUser(selectedUser.value.id, {
    roles: editForm.roles,
    isActive: editForm.isActive,
    mustChangePassword: editForm.mustChangePassword,
    curp: editForm.curp || undefined
  })
  submitting.value = false
  
  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    closePanel()
    fetchUsers(currentPage.value, 5)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleToggleActive = async (user: User) => {
  const result = await updateUser(user.id, { isActive: !user.isActive })
  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    fetchUsers(currentPage.value, 5)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleForcePassword = async (user: User) => {
  const result = await updateUser(user.id, { mustChangePassword: true })
  if (result.success) {
    toast.add({ title: result.message, color: 'success' })
    fetchUsers(currentPage.value, 5)
  } else {
    toast.add({ title: result.message, color: 'error' })
  }
}

const handleDelete = async (user: User) => {
  const confirmed = await confirm({
    title: 'Eliminar usuario',
    description: `¿Estás seguro de eliminar a ${user.username}?`
  })
  if (confirmed) {
    const result = await deleteUser(user.id)
    if (result.success) {
      toast.add({ title: result.message, color: 'success' })
      fetchUsers(currentPage.value, 5)
    } else {
      toast.add({ title: result.message, color: 'error' })
    }
  }
}

const getUserActions = (user: User): DropdownMenuItem[][] => {
  return [
    [
      {
        label: 'Ver detalles',
        icon: 'i-lucide-eye',
        onSelect: () => openView(user)
      },
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        onSelect: () => openEdit(user)
      }
    ],
    [
      {
        label: user.isActive ? 'Desactivar' : 'Activar',
        icon: user.isActive ? 'i-lucide-power-off' : 'i-lucide-power',
        onSelect: () => handleToggleActive(user)
      },
      {
        label: 'Forzar cambio contraseña',
        icon: 'i-lucide-key',
        onSelect: () => handleForcePassword(user)
      }
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => handleDelete(user)
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Usuarios</h1>
        <p class="text-muted-foreground">{{ totalElements }} usuarios</p>
      </div>
      <UButton @click="openCreate" icon="i-lucide-plus">
        Nuevo Usuario
      </UButton>
    </div>

    <UAlert v-if="loading" color="info" variant="soft" class="mb-4" description="Cargando..." />
    <UAlert v-if="error" color="error" variant="soft" class="mb-4" :description="error" />

    <div v-if="viewMode === null" class="bg-background border rounded-lg p-6">
      <UAlert color="neutral" variant="soft" class="mb-4" icon="i-lucide-info">
        <template #title>Guía de acciones</template>
        <template #description>
          <div class="space-y-1 text-sm">
            <p class="flex items-center gap-2">
              <UIcon name="i-lucide-key" class="text-amber-500 size-4" />
              Indica que el usuario debe cambiar su contraseña
            </p>
            <p class="flex items-center gap-2">
              <UIcon name="i-lucide-copy" class="size-4" />
              Copiar ID del usuario
            </p>
          </div>
        </template>
      </UAlert>

      <UPageList divide>
        <UPageCard v-for="user in users" :key="user.id" variant="ghost">
          <template #header>
            <div class="flex items-center gap-4 w-full">
              <UChip :color="user.isActive ? 'success' : 'error'" :show="user.isActive" inset>
                <UAvatar :src="`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`" size="2xl" />
              </UChip>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-lg truncate">{{ user.username }}</span>
                  <UTooltip v-if="user.mustChangePassword" text="Debe cambiar contraseña">
                    <UIcon size="lg" name="i-lucide-key" class="text-amber-500" />
                  </UTooltip>
                </div>
                <p class="text-sm text-muted-foreground truncate">{{ user.email }}</p>
              </div>
            </div>
          </template>

          <template #body>
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="role in user.roles" :key="role" :color="getRoleBadgeColor(role)" variant="soft" size="sm">
                  {{ role }}
                </UBadge>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex gap-4 text-xs text-muted-foreground">
                  <span>{{ formatDate(user.createdAt) }}</span>
                  <span v-if="user.isVerified" class="text-green-600 font-medium">✓</span>
                </div>

                <div class="flex gap-2">
                  <UTooltip text="Copiar ID">
                    <UButton size="xs" variant="ghost" @click="copyUserId(user.id)">
                      <UIcon name="i-lucide-copy" class="size-3" />
                    </UButton>
                  </UTooltip>

                  <UDropdownMenu :items="getUserActions(user)">
                    <UButton size="xs" variant="ghost">
                      <UIcon name="i-lucide-more-horizontal" class="size-3" />
                    </UButton>
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </template>
        </UPageCard>
      </UPageList>

      <div class="flex items-center justify-center">
        <UPagination 
          :page="currentPage + 1" 
          :total="totalElements" 
          :page-size="5"
          :items-per-page="5"
          @change="handlePageChange" 
        />
      </div>

      <div v-if="totalElements > 0" class="text-center text-sm text-muted-foreground mt-2">
        Mostrando {{ users.length }} de {{ totalElements }} usuarios · Página {{ currentPage + 1 }}/{{ totalPages }}
      </div>
    </div>

    <div v-if="viewMode !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="w-full max-w-xl">
        <UCard class="shadow-2xl">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon :name="viewMode === 'create' ? 'i-lucide-user-plus' : viewMode === 'view' ? 'i-lucide-user' : 'i-lucide-pencil'" class="size-5" />
                <span class="font-semibold">
                  {{ viewMode === 'create' ? 'Crear Usuario' : viewMode === 'view' ? `Usuario: ${selectedUser?.username}` : `Editar: ${selectedUser?.username}` }}
                </span>
              </div>
              <UButton size="xs" variant="ghost" @click="closePanel">
                <UIcon name="i-lucide-x" class="size-4" />
              </UButton>
            </div>
          </template>

        <div v-if="viewMode === 'create'" class="space-y-4">
          <UAlert color="info" variant="soft" icon="i-lucide-info">
            <template #title>Credenciales iniciales</template>
            <template #description>El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.</template>
          </UAlert>

          <UForm :state="createForm" class="space-y-4" @submit="handleCreateUser">
            <UFormField label="Nombre de usuario" name="username" required>
              <UInput v-model="createForm.username" placeholder="Ingresa el nombre de usuario" icon="i-lucide-user" />
            </UFormField>

            <UFormField label="Correo electrónico" name="email" required>
              <UInput v-model="createForm.email" type="email" placeholder="correo@ejemplo.com" icon="i-lucide-mail" />
            </UFormField>

            <UFormField label="Contraseña inicial" name="password" required>
              <UInput v-model="createForm.password" type="password" placeholder="Contraseña provisional" icon="i-lucide-lock" />
            </UFormField>

            <UAccordion :items="[{ label: 'Vincular con registro académico (CURP)', slot: 'curp-vinculation' }]">
              <template #curp-vinculation>
                <div class="space-y-4 py-2">
                  <p class="text-sm text-muted-foreground">
                    Opcionalmente puedes vincular este usuario con un registro académico existente proporcionando su CURP.
                  </p>
                  <UFormField label="CURP" name="curp" description="Clave única de registro de población">
                    <UInput v-model="createForm.curp" placeholder="Ingresa la CURP del usuario" icon="i-lucide-id-card" />
                  </UFormField>
                  <UAlert color="warning" variant="soft" icon="i-lucide-alert-triangle">
                    <template #description>
                      <div class="space-y-1 text-sm">
                        <p>• La CURP vincula al usuario con un registro académico existente.</p>
                        <p>• Si la CURP ya está asociada a otro usuario, no podrá ser reutilizada.</p>
                        <p>• <strong>No modifiques</strong> usuarios con CURP sin consultar con Control Escolar.</p>
                      </div>
                    </template>
                  </UAlert>
                </div>
              </template>
            </UAccordion>

            <UAlert color="info" variant="soft" icon="i-lucide-info">
              <template #title>Credenciales y seguridad</template>
              <template #description>
                <div class="space-y-1 text-sm">
                  <p>• El usuario deberá cambiar su contraseña temporal al iniciar sesión por primera vez.</p>
                  <p>• La contraseña temporal será enviada al correo electrónico del usuario.</p>
                  <p>• Los usuarios inactivos <strong>no podrán iniciar sesión</strong> en el sistema.</p>
                  <p>• Se recomienda usar contraseñas temporales seguras (mínimo 8 caracteres).</p>
                </div>
              </template>
            </UAlert>

            <UFormField label="Roles" name="roles">
              <USelect v-model="createForm.roles" :items="availableRoles" multiple placeholder="Selecciona los roles" icon="i-lucide-shield" />
            </UFormField>
          </UForm>
        </div>

        <div v-else-if="viewMode === 'view' && selectedUser" class="space-y-4">
          <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <UChip :color="selectedUser.isActive ? 'success' : 'error'" :show="selectedUser.isActive" inset>
              <UAvatar :src="`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.username}`" size="2xl" />
            </UChip>
            <div>
              <h3 class="text-xl font-bold flex items-center gap-2">
                {{ selectedUser.username }}
                <UTooltip v-if="selectedUser.mustChangePassword" text="Debe cambiar contraseña">
                  <UIcon name="i-lucide-key" class="text-amber-500 size-5" />
                </UTooltip>
              </h3>
              <p class="text-muted-foreground">{{ selectedUser.email }}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <UBadge :color="selectedUser.isActive ? 'success' : 'error'" variant="soft">
                  {{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
                <UBadge :color="selectedUser.isVerified ? 'info' : 'warning'" variant="soft">
                  {{ selectedUser.isVerified ? 'Verificado' : 'Pendiente de verificación' }}
                </UBadge>
                <UBadge v-if="selectedUser.curp" color="primary" variant="soft">
                  CURP: {{ selectedUser.curp }}
                </UBadge>
                <UBadge v-else color="neutral" variant="soft">
                  Sin CURP
                </UBadge>
              </div>
            </div>
          </div>

          <UDivider />

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-hash" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">ID</p>
                <p class="font-mono text-sm">{{ selectedUser.id }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UIcon name="i-lucide-calendar" class="size-5 text-muted-foreground" />
              <div>
                <p class="text-xs text-muted-foreground uppercase">Creado</p>
                <p class="text-sm">{{ formatDate(selectedUser.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium mb-2">Roles asignados</p>
            <div class="space-y-3">
              <div v-for="role in selectedUser.roles" :key="role" class="flex items-start gap-3 p-4 border rounded-lg">
                <UBadge :color="getRoleBadgeColor(role)" variant="solid" size="sm" class="mt-1">{{ role }}</UBadge>
                <div>
                  <p class="font-medium text-sm">{{ getRoleLabel(role) }}</p>
                  <p class="text-xs text-muted-foreground">{{ getRoleDescription(role) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="viewMode === 'edit' && selectedUser" class="space-y-4">
          <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <UChip :color="selectedUser.isActive ? 'success' : 'error'" :show="selectedUser.isActive" inset>
              <UAvatar :src="`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.username}`" size="2xl" />
            </UChip>
            <div>
              <h3 class="text-xl font-bold flex items-center gap-2">
                {{ selectedUser.username }}
                <UTooltip v-if="selectedUser.mustChangePassword" text="Debe cambiar contraseña">
                  <UIcon name="i-lucide-key" class="text-amber-500 size-5" />
                </UTooltip>
              </h3>
              <p class="text-sm text-muted-foreground">{{ selectedUser.email }}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <UBadge :color="selectedUser.isActive ? 'success' : 'error'" variant="soft">
                  {{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
                <UBadge :color="selectedUser.isVerified ? 'info' : 'warning'" variant="soft">
                  {{ selectedUser.isVerified ? 'Verificado' : 'Pendiente de verificación' }}
                </UBadge>
                <UBadge v-if="selectedUser.curp" color="primary" variant="soft">
                  CURP: {{ selectedUser.curp }}
                </UBadge>
                <UBadge v-else color="neutral" variant="soft">
                  Sin CURP
                </UBadge>
              </div>
            </div>
          </div>

          <USeparator />

          <UAccordion :items="[{ label: 'Vincular/modificar CURP (opcional)', slot: 'curp-edit' }]">
            <template #curp-edit>
              <div class="space-y-4 py-2">
                <UFormField label="CURP" name="editCurp" description="Clave única de registro de población">
                  <UInput 
                    v-model="editForm.curp"
                    placeholder="Ingresa o modifica la CURP" 
                    icon="i-lucide-id-card" 
                  />
                </UFormField>
                <UAlert color="warning" variant="soft" icon="i-lucide-alert-triangle">
                  <template #description>
                    <div class="space-y-1 text-sm">
                      <p>• Modificar la CURP puede afectar el vínculo con el registro académico.</p>
                      <p>• <strong>No modifiques</strong> la CURP sin consultar con Control Escolar.</p>
                    </div>
                  </template>
                </UAlert>
              </div>
            </template>
          </UAccordion>

          <div v-if="selectedUser.curp">
            <UAccordion :items="[{ label: 'Información de registro académico actual', slot: 'curp-info' }]">
              <template #curp-info>
                <div class="space-y-3 py-2">
                  <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <UIcon name="i-lucide-id-card" class="size-5 text-primary" />
                    <div>
                      <p class="text-xs text-muted-foreground uppercase">CURP Vinculada</p>
                      <p class="font-mono font-medium">{{ selectedUser.curp }}</p>
                    </div>
                  </div>
                  <UAlert color="warning" variant="soft" icon="i-lucide-alert-triangle">
                    <template #description>
                      <div class="space-y-1 text-sm">
                        <p>• Este usuario tiene CURP vinculada a su registro académico.</p>
                        <p>• <strong>No modifiques</strong> sus roles o estado sin consultar con Control Escolar.</p>
                        <p>• Cambios incorrectos pueden afectar el acceso a calificaciones, grupos y horarios.</p>
                      </div>
                    </template>
                  </UAlert>
                </div>
              </template>
            </UAccordion>
          </div>

          <UForm :state="editForm" class="space-y-4" @submit="handleUpdateUser">
            <UFormField label="Roles" name="roles" description="Selecciona los roles asignados">
              <USelect v-model="editForm.roles" :items="availableRoles" multiple placeholder="Selecciona los roles" icon="i-lucide-shield" />
            </UFormField>

            <UFormField label="Estado" name="isActive" description="Controla si el usuario puede iniciar sesión">
              <div class="flex items-center gap-3">
                <USwitch v-model="editForm.isActive" />
                <span :class="editForm.isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                  {{ editForm.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </UFormField>

            <UFormField label="Cambio de contraseña" name="mustChangePassword" description="Fuerza al usuario a cambiar su contraseña">
              <div class="flex items-center gap-3">
                <USwitch v-model="editForm.mustChangePassword" />
                <span :class="editForm.mustChangePassword ? 'text-amber-600 font-medium' : 'text-muted-foreground'">
                  {{ editForm.mustChangePassword ? 'Requerido' : 'No requerido' }}
                </span>
              </div>
            </UFormField>
          </UForm>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="closePanel">Cerrar</UButton>
            <UButton v-if="viewMode === 'create'" @click="handleCreateUser" :loading="submitting" icon="i-lucide-save">Crear</UButton>
            <UButton v-if="viewMode === 'edit'" @click="handleUpdateUser" :loading="submitting" icon="i-lucide-save">Guardar</UButton>
          </div>
        </template>
        </UCard>
      </div>
    </div>
  </div>
</template>