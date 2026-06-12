<script setup lang="ts">
const items = [
  {
    label: 'Iniciar Sesión',
    to: '/auth/login',
    icon: 'i-lucide-log-in'
  },
  {
    label: 'Registrarse',
    to: '/auth/register',
    icon: 'i-lucide-user-plus'
  }
]
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-graduation-cap" class="w-8 h-8 text-primary-500" />
          <span class="font-bold text-xl">Sistema Académico</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton to="/portal" variant="ghost" color="secondary" icon="i-lucide-school">
          Portal Público
        </UButton>
        <UColorModeButton />
        <div class="flex items-center gap-1">
          <UButton
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            color="primary"
            variant="ghost"
          >
            {{ item.label }}
          </UButton>
        </div>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Sistema Académico. Todos los derechos reservados.
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
