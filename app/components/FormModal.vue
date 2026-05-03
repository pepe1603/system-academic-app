<script lang="ts" setup>
interface FormModalProps {
  title?: string
  description?: string
  confirmLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info' | 'neutral'
}

const props = withDefaults(defineProps<FormModalProps>(), {
  confirmLabel: 'Guardar',
  confirmColor: 'primary'
})

const emits = defineEmits<{
  close: [value: any]
  confirm: []
}>()
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="true"
    :ui="{ footer: 'justify-end' }"
  >
    <slot />

    <template #footer>
      <UButton color="neutral" variant="outline" @click="emits('close', null)">
        Cancelar
      </UButton>
      <UButton :color="confirmColor" @click="emits('confirm')">
        {{ confirmLabel }}
      </UButton>
    </template>
  </UModal>
</template>
