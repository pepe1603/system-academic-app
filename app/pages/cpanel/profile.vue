<script setup lang="ts">
import type { EnrichedProfile } from '~/composables/useProfile'

definePageMeta({
  layout: 'c-panel'
})

useSeoMeta({
  title: 'Mi Perfil - Panel de Control'
})

const toast = useToast()
const { user } = useAuth()
const { profile, loading, error, fetchMyProfile, updateMyProfile } = useProfile()

const activeTab = ref('personal')
const saving = ref(false)
const originalProfileData = ref<EnrichedProfile | null>(null)

const profileForm = ref({
  firstName: '',
  lastName: '',
  curp: '',
  rfc: '',
  phone: '',
  secondaryPhone: '',
  birthDate: '',
  gender: '',
  institutionalEmail: '',
  secondaryEmail: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  profilePictureUrl: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const hasChanges = computed(() => {
  if (!originalProfileData.value) return false
  
  const orig = originalProfileData.value
  const form = profileForm.value
  
  return (
    form.firstName !== (orig.firstName || '') ||
    form.lastName !== (orig.lastName || '') ||
    form.phone !== (orig.phone || '') ||
    form.secondaryPhone !== (orig.secondaryPhone || '') ||
    form.birthDate !== (orig.birthDate || '') ||
    form.gender !== (orig.gender || '') ||
    form.institutionalEmail !== (orig.institutionalEmail || '') ||
    form.secondaryEmail !== (orig.secondaryEmail || '') ||
    form.address !== (orig.address || '') ||
    form.city !== (orig.city || '') ||
    form.state !== (orig.state || '') ||
    form.postalCode !== (orig.postalCode || '') ||
    form.profilePictureUrl !== (orig.profilePictureUrl || '')
  )
})

const isProfileEmpty = computed(() => {
  const d = originalProfileData.value
  if (!d) return true
  return !d.firstName && !d.lastName && !d.curp && !d.phone && !d.institutionalEmail
})

const discardChanges = () => {
  if (originalProfileData.value) {
    loadProfileData(originalProfileData.value)
    toast.add({ title: 'Cambios descartados', color: 'neutral' })
  }
}

onMounted(async () => {
  const data = await fetchMyProfile()
  if (data) {
    originalProfileData.value = data
    loadProfileData(data)
  } else {
    loadEmptyProfile()
  }
})

const loadProfileData = (data: EnrichedProfile) => {
  profileForm.value = {
    firstName: data.firstName || user.value?.username?.split(' ')[0] || '',
    lastName: data.lastName || user.value?.username?.split(' ').slice(1).join(' ') || '',
    curp: data.curp || '',
    rfc: data.rfc || '',
    phone: data.phone || '',
    secondaryPhone: data.secondaryPhone || '',
    birthDate: data.birthDate || '',
    gender: data.gender || '',
    institutionalEmail: data.institutionalEmail || user.value?.email || '',
    secondaryEmail: data.secondaryEmail || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    postalCode: data.postalCode || '',
    profilePictureUrl: data.profilePictureUrl || ''
  }
}

const loadEmptyProfile = () => {
  profileForm.value = {
    firstName: '',
    lastName: '',
    curp: '',
    rfc: '',
    phone: '',
    secondaryPhone: '',
    birthDate: '',
    gender: '',
    institutionalEmail: user.value?.email || '',
    secondaryEmail: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  }
}

const saveProfile = async () => {
  saving.value = true
  const success = await updateMyProfile(profileForm.value)
  saving.value = false
  if (success) {
    toast.add({ title: 'Perfil actualizado correctamente', color: 'success' })
    if (profile.value) {
      originalProfileData.value = { ...profile.value }
    }
  } else {
    toast.add({ title: 'Error al actualizar el perfil', color: 'error' })
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({ title: 'Las contraseñas no coinciden', color: 'error' })
    return
  }
  toast.add({ title: 'Funcionalidad de cambio de contraseña pendiente', color: 'info' })
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

const getGenderLabel = (gender: string): string => {
  const labels: Record<string, string> = {
    M: 'Masculino',
    F: 'Femenino',
    O: 'Otro'
  }
  return labels[gender] || gender
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Mi Perfil</h1>
        <p class="text-muted-foreground">Gestiona tu información personal</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1">
        <UCard>
          <div class="text-center">
            <UAvatar
              :src="profile?.profilePictureUrl ? `http://localhost:8080${profile.profilePictureUrl}` : `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.firstName || user?.username || 'U'}`"
              size="2xl"
              class="mx-auto mb-4"
            />
            <h3 class="text-lg font-bold">{{ profileForm.firstName || user?.username }} {{ profileForm.lastName }}</h3>
            <p class="text-sm text-muted-foreground">{{ profileForm.institutionalEmail || user?.email }}</p>
            <div class="flex flex-wrap justify-center gap-1 mt-2">
              <UBadge v-for="role in user?.roles" :key="role" :color="getRoleBadgeColor(role)" variant="soft">
                {{ getRoleLabel(role) }}
              </UBadge>
            </div>
          </div>

          <USeparator class="my-4" />

          <nav class="space-y-1">
            <button
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
              :class="activeTab === 'personal' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'"
              @click="activeTab = 'personal'"
            >
              <UIcon name="i-lucide-user" class="size-4" />
              Datos Personales
            </button>
            <button
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
              :class="activeTab === 'contact' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'"
              @click="activeTab = 'contact'"
            >
              <UIcon name="i-lucide-mail" class="size-4" />
              Contacto
            </button>
            <button
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
              :class="activeTab === 'address' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'"
              @click="activeTab = 'address'"
            >
              <UIcon name="i-lucide-map-pin" class="size-4" />
              Dirección
            </button>
            <button
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
              :class="activeTab === 'security' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'"
              @click="activeTab = 'security'"
            >
              <UIcon name="i-lucide-lock" class="size-4" />
              Seguridad
            </button>
          </nav>

          <div v-if="profile?.studentInfo" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm font-medium text-blue-800">Información de Estudiante</p>
            <p class="text-xs text-blue-600 mt-1">
              Matrícula: {{ profile.studentInfo.enrollmentNumber }}
            </p>
          </div>

          <div v-if="profile?.teacherInfo" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm font-medium text-green-800">Información de Profesor</p>
            <p class="text-xs text-green-600 mt-1">
              No. Empleado: {{ profile.teacherInfo.employeeNumber }}
            </p>
          </div>
        </UCard>
      </div>

      <div class="lg:col-span-3">
        <UAlert v-if="loading" color="info" variant="soft" class="mb-4" description="Cargando perfil..." />
        <UAlert v-if="error" color="error" variant="soft" class="mb-4" :description="error" />
        <UAlert v-if="isProfileEmpty && !loading && !error" color="warning" variant="soft" class="mb-4" icon="i-lucide-user-plus">
          <template #title>Perfil incompleto</template>
          <template #description>Completa tu perfil para que otros usuarios puedan identificarte. Los campos disponibles han sido pre-llenados con tu información de usuario.</template>
        </UAlert>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold">
                  <template v-if="activeTab === 'personal'">Datos Personales</template>
                  <template v-else-if="activeTab === 'contact'">Información de Contacto</template>
                  <template v-else-if="activeTab === 'address'">Dirección</template>
                  <template v-else-if="activeTab === 'security'">Seguridad</template>
                </h2>
                <UBadge v-if="hasChanges" color="warning" variant="soft" class="animate-pulse">
                  <UIcon name="i-lucide-circle-dot" class="size-3 mr-1" />
                  Cambios pendientes
                </UBadge>
                <UBadge v-else-if="!loading && originalProfileData && !isProfileEmpty" color="success" variant="soft">
                  <UIcon name="i-lucide-check" class="size-3 mr-1" />
                  Sin cambios
                </UBadge>
                <UBadge v-else-if="!loading && originalProfileData && isProfileEmpty" color="neutral" variant="soft">
                  <UIcon name="i-lucide-user-x" class="size-3 mr-1" />
                  Perfil incompleto
                </UBadge>
              </div>
              <div class="flex items-center gap-2" v-if="activeTab !== 'security'">
                <UButton 
                  v-if="hasChanges" 
                  @click="discardChanges" 
                  variant="outline" 
                  size="sm" 
                  color="neutral"
                  icon="i-lucide-undo-2"
                >
                  Descartar
                </UButton>
                <UButton 
                  @click="saveProfile" 
                  :loading="saving" 
                  size="sm" 
                  icon="i-lucide-save"
                  :disabled="!hasChanges"
                >
                  Guardar
                </UButton>
              </div>
            </div>
          </template>

          <div v-if="activeTab === 'personal'" class="space-y-4">
            <UAlert color="info" variant="soft" icon="i-lucide-info" class="mb-4">
              <template #title>Campos del registro académico</template>
              <template #description>La CURP y RFC se vinculan automáticamente con tu registro académico (estudiante o profesor). Estos campos no son editables.</template>
            </UAlert>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nombre(s)" name="firstName">
                <UInput v-model="profileForm.firstName" placeholder="Nombre" />
              </UFormField>
              <UFormField label="Apellidos" name="lastName">
                <UInput v-model="profileForm.lastName" placeholder="Apellidos" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="CURP" name="curp" description="Vincular con registro académico">
                <UInput 
                  v-model="profileForm.curp" 
                  placeholder="Clave Única de Registro de Población"
                  disabled
                  class="bg-muted/30"
                >
                  <template #leading>
                    <UIcon v-if="profileForm.curp" name="i-lucide-check-circle" class="text-green-500" />
                    <UIcon v-else name="i-lucide-x-circle" class="text-muted-foreground" />
                  </template>
                </UInput>
                <template #hint>
                  <span v-if="profileForm.curp" class="text-green-600 text-xs">Vinculado con registro académico</span>
                  <span v-else class="text-amber-600 text-xs">Sin vincular - Contacta a Control Escolar</span>
                </template>
              </UFormField>
              <UFormField label="RFC" name="rfc" description="Vincular con registro de profesor">
                <UInput 
                  v-model="profileForm.rfc" 
                  placeholder="Registro Federal de Contribuyentes"
                  disabled
                  class="bg-muted/30"
                >
                  <template #leading>
                    <UIcon v-if="profileForm.rfc" name="i-lucide-check-circle" class="text-green-500" />
                    <UIcon v-else name="i-lucide-x-circle" class="text-muted-foreground" />
                  </template>
                </UInput>
                <template #hint>
                  <span v-if="user?.roles?.includes('TEACHER') && !profileForm.rfc" class="text-amber-600 text-xs">Requerido para profesores</span>
                  <span v-else-if="profileForm.rfc" class="text-green-600 text-xs">Válido</span>
                </template>
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Fecha de nacimiento" name="birthDate">
                <UInput v-model="profileForm.birthDate" type="date" />
              </UFormField>
              <UFormField label="Género" name="gender">
                <USelect
                  v-model="profileForm.gender"
                  :items="[
                    { label: 'Masculino', value: 'M' },
                    { label: 'Femenino', value: 'F' },
                    { label: 'Otro', value: 'O' }
                  ]"
                  placeholder="Seleccionar"
                />
              </UFormField>
            </div>

            <div v-if="profileForm.gender" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-sm">
                <span class="text-muted-foreground">Género seleccionado:</span>
                <span class="font-medium ml-2">{{ getGenderLabel(profileForm.gender) }}</span>
              </p>
            </div>
          </div>

          <div v-if="activeTab === 'contact'" class="space-y-4">
            <div class="p-4 bg-muted/30 rounded-lg border">
              <div class="flex items-center gap-4">
                <UAvatar
                  :src="profileForm.profilePictureUrl ? profileForm.profilePictureUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.firstName || 'U'}`"
                  size="lg"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium">URL de foto de perfil</p>
                  <p class="text-xs text-muted-foreground mb-2">Próximamente: Subir foto directamente. Por ahora, pega una URL de imagen.</p>
                  <UInput 
                    v-model="profileForm.profilePictureUrl" 
                    placeholder="https://ejemplo.com/foto.jpg"
                    size="sm"
                    icon="i-lucide-link"
                  />
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Teléfono principal" name="phone">
                <UInput v-model="profileForm.phone" placeholder="Teléfono" icon="i-lucide-phone" />
              </UFormField>
              <UFormField label="Teléfono secundario" name="secondaryPhone">
                <UInput v-model="profileForm.secondaryPhone" placeholder="Teléfono secundario" icon="i-lucide-phone" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Email institucional" name="institutionalEmail">
                <UInput v-model="profileForm.institutionalEmail" type="email" placeholder="Email institucional" icon="i-lucide-mail" />
              </UFormField>
              <UFormField label="Email secundario" name="secondaryEmail">
                <UInput v-model="profileForm.secondaryEmail" type="email" placeholder="Email secundario" icon="i-lucide-mail" />
              </UFormField>
            </div>
          </div>

          <div v-else-if="activeTab === 'address'" class="space-y-4">
            <UFormField label="Dirección completa" name="address">
              <UInput v-model="profileForm.address" placeholder="Calle, número, colonia" icon="i-lucide-map-pin" />
            </UFormField>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Ciudad" name="city">
                <UInput v-model="profileForm.city" placeholder="Ciudad" />
              </UFormField>
              <UFormField label="Estado" name="state">
                <UInput v-model="profileForm.state" placeholder="Estado" />
              </UFormField>
              <UFormField label="Código postal" name="postalCode">
                <UInput v-model="profileForm.postalCode" placeholder="CP" />
              </UFormField>
            </div>

            <div v-if="profileForm.city || profileForm.state" class="p-3 bg-muted/50 rounded-lg">
              <p class="text-sm">
                <span class="text-muted-foreground">Dirección completa:</span>
                <span class="font-medium ml-2">
                  {{ profileForm.address }}, {{ profileForm.city }}, {{ profileForm.state }} {{ profileForm.postalCode }}
                </span>
              </p>
            </div>
          </div>

          <div v-else-if="activeTab === 'security'" class="space-y-6">
            <UAlert color="info" variant="soft" icon="i-lucide-info">
              <template #title>Cambiar contraseña</template>
              <template #description>Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña.</template>
            </UAlert>

            <div class="space-y-4 max-w-md">
              <UFormField label="Contraseña actual" name="currentPassword">
                <UInput v-model="passwordForm.currentPassword" type="password" placeholder="Contraseña actual" icon="i-lucide-lock" />
              </UFormField>

              <UFormField label="Nueva contraseña" name="newPassword">
                <UInput v-model="passwordForm.newPassword" type="password" placeholder="Nueva contraseña" icon="i-lucide-lock" />
              </UFormField>

              <UFormField label="Confirmar nueva contraseña" name="confirmPassword">
                <UInput v-model="passwordForm.confirmPassword" type="password" placeholder="Confirmar contraseña" icon="i-lucide-lock" />
              </UFormField>

              <UButton @click="changePassword" icon="i-lucide-key">
                Cambiar contraseña
              </UButton>
            </div>

            <USeparator />

            <div>
              <h3 class="text-sm font-medium mb-3">Sesiones activas</h3>
              <UAlert color="warning" variant="soft">
                <template #description>La funcionalidad de gestión de sesiones estará disponible próximamente.</template>
              </UAlert>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>