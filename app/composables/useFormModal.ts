import { FormModal } from '#components'

export interface FormModalOptions {
  title: string
  description?: string
  confirmLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info' | 'neutral'
  props?: Record<string, any>
}

export const useFormModal = () => {
  const overlay = useOverlay()

  const openFormModal = (options: FormModalOptions): Promise<boolean> => {
    const modal = overlay.create(FormModal, {
      destroyOnClose: true,
      props: {
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel,
        confirmColor: options.confirmColor
      }
    })

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(modal as any).onClose = (value: any) => {
        resolve(value)
      }
    })
  }

  return { openFormModal }
}
